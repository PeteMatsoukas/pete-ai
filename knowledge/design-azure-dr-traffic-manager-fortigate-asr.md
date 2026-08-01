# Azure Cross-Region DR — ASR Replication, Traffic Manager DNS Failover & HA Networking

**Domain:** Azure Infrastructure · Disaster Recovery · Networking · Azure Site Recovery · Traffic Manager
**Specialist:** Azure SA / Network SA
**Use when:** A client needs detailed DR architecture design for Azure-to-Azure cross-region replication, asks about Traffic Manager failover strategies, needs guidance on FortiGate + Application Gateway DR staging, or wants to understand the trade-offs between Active-Active vs. Warm-Standby DR models. This is the technical design companion to the multi-region ASR engagement.

---

## Architecture Overview

Replication via ASR over HTTPS keeps traffic off VNet peering and VPN circuits, enabling identical IP addressing in the DR region without routing conflicts. Azure Traffic Manager (ATM) operates as the global DNS-level traffic control layer.

### Traffic Flow by Tier

**Web Tier (internet-facing):**
```
Internet → Azure Traffic Manager → Application Gateway (WAF) → Web/App Servers
```

**Client VPN Traffic:**
```
Remote Users → DNS (e.g. vpn.[CLIENT].example) → Traffic Manager → FortiGate → VNets
```

**Application / Database Tier:**
- Managed via ASR for VM replication with defined failover/failback plan and startup order
- SQL Always On Availability Groups recommended for application-consistent SQL replication

**Identity Tier:**
- Domain Controllers configured Active-Active across both regions
- One or two new DC/DNS VMs (B-series sizing) in dedicated subnet in DR region
- Ensures local DNS resolution and domain authentication are always available in DR site — critical for client VPN and application authentication during failover

**Connectivity Tier:**
- FortiGate-VM02 pre-deployed in DR region with synchronized configuration
- Application Gateway WAF v2 pre-provisioned in DR region (disabled in Traffic Manager until failover)
- Both staged and ready — eliminates licensing/boot delays during actual failover

---

## Traffic Manager — Global Load Balancing Options

| Option | ATM Strategy | Description | Best For |
|---|---|---|---|
| Active-Active | Performance | Routes users to lowest-latency region. Both sites serve traffic simultaneously. | Globally distributed users; requires application-level sync (SQL Always On) |
| **Warm-Standby** | **Priority** | **Region A = P1, Region B = P2. Traffic shifts only on primary region failure or manual disable.** | **Recommended. Cost-effective — DR VMs stay off until ASR triggers.** |
| Multi-Value | High Availability | ATM returns multiple IPs; client browser selects. | Active-Active where all services are always online in both regions |

**Pete's recommendation:** Warm-Standby (Priority routing) for most clients. It keeps DR costs low (VMs off at rest), avoids application-level sync complexity, and provides clear manual control over failover timing. Active-Active is only warranted if the client has globally distributed users and already runs SQL Always On — effectively its own separate project.

---

## DR Failover Execution — Manual Gate Design

The design uses a manual gate to prevent DNS flapping and protect data integrity during failover. This is intentional — automated failover on a false positive health alert can cause data loss if SQL isn't fully committed.

### Manual Failover Sequence

**Step 1 — Trigger ASR**
Initiate ASR failover to hydrate VMs in the DR region. VMs boot in the defined startup order (identity tier first, then database tier, then application tier, then web tier).

**Step 2 — Verify Application Health**
- Confirm SQL databases are online and accessible
- Confirm DR Application Gateway is passing backend health checks
- Do not flip Traffic Manager until both are confirmed

**Step 3 — Flip the Switch**
```powershell
# Disable primary region endpoint
Disable-AzTrafficManagerEndpoint -Name "Primary-Endpoint" -ProfileName "ATM-Profile" -ResourceGroupName "RG-Name" -Type AzureEndpoints

# Enable DR region endpoint
Enable-AzTrafficManagerEndpoint -Name "DR-Endpoint" -ProfileName "ATM-Profile" -ResourceGroupName "RG-Name" -Type AzureEndpoints
```

**Step 4 — DNS Propagation**
Within 30–60 seconds (based on TTL), all client-facing DNS names route to DR region. Traffic Manager health probes confirm DR endpoints are healthy before serving traffic.

### Manual Failback Warning
Failback to primary is high-risk. Never flip Traffic Manager back until SQL data is **fully re-synchronized** to the primary region. Data written to DR SQL during the failover period must replicate back before failback. Always verify replication lag before executing failback.

### Automation for Speed (reduce human error)
Wrap the manual sequence above in Azure PowerShell scripts for use during high-stress outages:
- Automate ASR failover initiation
- Toggle ATM endpoint states (`Enable-AzTrafficManagerEndpoint` / `Disable-AzTrafficManagerEndpoint`)
- Update DNS records programmatically
- Deliver these scripts as a runbook — stored, tested, and handed over at project close

---

## Design Details by Component

### A. Client VPN — FortiGate
- Remote users connect to a DNS name (e.g. `vpn.[CLIENT].example`) not directly to an IP
- Traffic Manager probes FortiGate appliances via TCP 443 for health
- DR FortiGate **pre-deployed with synchronized configuration** — avoids licensing and boot delays that would occur if relying on ASR to recover the firewall VM
- This is the most important pre-deployment decision: the firewall must exist before the DR event, not be created during it

### B. Application Gateway WAF v2
- Central US Application Gateway pre-provisioned as a regional service
- Remains in **Disabled** state in Traffic Manager profile during normal operations
- Enabled only when manual failover gate is executed
- Pre-provisioned = no provisioning delay during an actual DR event

### C. Site-to-Site Connectivity
- HQ firewall maintains a secondary S2S tunnel to the Central US FortiGate (always configured, kept as standby)
- **BGP preferred** for automatic route advertisement during failover
- Without BGP: manual route weight adjustment at HQ firewall required during DR — adds human steps and risk

### D. Storage — Azure Files
- Configured with Geo-Redundant Storage (GRS)
- Supports automatic or manual failover across regions
- Application data and shared files available in DR region without additional migration step

### E. SQL Server — Two Approaches

| Approach | Consistency | Complexity | Cost |
|---|---|---|---|
| **SQL Always On AG** | Application-consistent — prevents corruption | High — separate project scope | Higher SQL licensing |
| ASR VM replication | Crash-consistent — some corruption risk on failover | Low — included in standard ASR scope | Standard ASR cost |

**Recommendation:** SQL Always On is technically superior but is effectively its own project — requires specific SQL licensing (Enterprise or equivalent), Always On configuration, witness setup, and ongoing management. For clients where budget and simplicity are priorities, ASR crash-consistent replication of SQL VMs is acceptable if the client accepts the data consistency risk and validates SQL post-failover before restoring user access.

---

## Implementation Roadmap (Core Components)

| Phase | Activity |
|---|---|
| Networking | Deploy DR VNet, subnets, NSGs; establish S2S VPN to HQ |
| Identity | Deploy B-series DC/DNS VM in DR region; consider reserved instance pricing |
| Replication | Enable ASR over HTTPS for all critical app and web servers |
| Traffic Management | Create ATM profiles for FortiGate and Application Gateway endpoints |
| Test Drills | Isolated sandbox test failovers — validate client VPN and web app functionality without disrupting production |

---

## Key Design Decisions to Make with Client

Before any deployment begins, the following decisions must be confirmed:

1. **Warm-Standby vs. Active-Active?** (Recommended: Warm-Standby for cost and simplicity)
2. **SQL Always On or ASR crash-consistent?** (Depends on SQL license tier and data consistency tolerance)
3. **Automated vs. manual failover gate?** (Recommended: manual gate with scripted execution)
4. **BGP or static routing at HQ firewall?** (BGP strongly preferred)
5. **FortiGate licensing model — BYOL or PAYG?** (BYOL requires license transfer lead time)
6. **DC count in DR region — 1 or 2?** (2 recommended for AD redundancy during DR)

---

## Risks

- **DNS TTL during failover:** If TTL is set too high (e.g. 3600s), Traffic Manager switching takes up to 60 minutes to fully propagate. Set TTL to 60–300 seconds before any DR test or live failover.
- **SQL failback data loss:** The highest-risk moment in any DR execution is failback. SQL data written to DR during the outage must be committed back to primary before Traffic Manager is switched. Skipping this step causes data loss.
- **FortiGate boot time if not pre-deployed:** If the firewall VM is ASR-replicated rather than pre-staged, boot + license activation during a real disaster adds 15–30 minutes to RTO. Always pre-deploy.
- **Application Gateway health check failures:** If backend VMs aren't fully booted when the Application Gateway starts probing, the probe fails and Traffic Manager won't switch. Define startup order in recovery plan to ensure backends are ready before gateway health checks execute.
- **Identity not available locally in DR:** If no DC exists in the DR region, every authentication request crosses the WAN to the primary site — which may be down during a real DR event. Always deploy at least one DC in the DR region.

---

## Pete's Delivery Notes

- **Pre-stage everything that can be pre-staged** — FortiGate, Application Gateway, domain controller, and Traffic Manager profiles should all exist before a DR event, not be created during one. The goal is to make failover a configuration toggle, not a build project.
- **The manual gate is a feature, not a limitation** — frame it to clients as deliberate protection against data loss from false-positive failover triggers. Automated failover sounds better but carries real risk for stateful applications.
- **SQL Always On conversation needs to happen early** — if the client has SQL Server Enterprise licensing already, Always On is the right answer and should be scoped separately. If they're on Standard licensing, clarify the limitation and document the accepted risk of crash-consistent SQL replication.
- **Test drill in an isolated subnet before any real failover** — ASR's test failover feature spins VMs in an isolated network without interrupting replication. Run this in every engagement before sign-off. A DR environment that has never been tested is not a DR environment.
- **Deliver the PowerShell failover scripts as a named deliverable** — name them, document them, and include them in the runbook. Clients who receive working, documented automation scripts see significantly higher value from the engagement.
