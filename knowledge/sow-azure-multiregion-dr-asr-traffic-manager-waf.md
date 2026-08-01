# Automated Multi-Region Azure DR — ASR with IP Parity, Traffic Manager & WAF

**Domain:** Azure Infrastructure · Disaster Recovery · Azure Site Recovery · Networking · Security
**Specialist:** Azure SA / Network SA / Windows Server SA
**Use when:** A client runs production workloads in Azure (not on-premises) and needs a secondary passive DR region, asks about cross-region ASR replication, wants IP parity between primary and DR regions, needs Traffic Manager + Application Gateway WAF for automated traffic failover, or has tiered workloads with defined RTO/RPO targets by criticality.

---

## Engagement Profile

**Type:** Azure-to-Azure multi-region DR (active primary → passive standby)
**Primary region:** Azure North Central US (production)
**DR region:** Azure Central US (standby)
**Workloads:** 17 VMs across 3 criticality tiers
**Replication:** Azure Site Recovery (ASR) — continuous over HTTPS port 443
**Traffic steering:** Azure Traffic Manager + Application Gateway WAF v2
**Security:** FortiGate NVA in zone-redundant DR configuration
**Automation:** PowerShell-driven deployment and recovery plans
**Duration:** 6–8 weeks
**Billing:** Fixed-fee professional services + Azure monthly recurring (~$1,895/month)

---

## When to Recommend This Pattern

Recommend Azure-to-Azure multi-region DR when a client:
- Runs production workloads in Azure already (not on-premises — this is not VMware-to-Azure)
- Has no secondary DR region and relies on single-region Azure availability
- Has defined RTO/RPO requirements by workload criticality
- Runs SQL Server workloads requiring transactional consistency during failover
- Uses FortiGate NVA as their Azure network security layer
- Needs automated traffic failover (Traffic Manager) without manual DNS changes
- Wants IP parity (same IP schema) between primary and DR — eliminates application reconfiguration during failover

**Key qualifying questions:**
- "If your Azure North Central US region went down today, what would happen to your business?"
- "Do you have any DR capability in Azure today, or is everything in one region?"
- "What are your RTO/RPO requirements for your most critical systems?"
- "Do you run SQL Server in Azure? Are your databases transactionally linked?"
- "Are you using Traffic Manager or Application Gateway WAF today?"

---

## Workload Inventory & Criticality Tiers

| Tier | RTO | RPO | Scope |
|---|---|---|---|
| P1 — Mission Critical | ≤ 4 hours | ≤ 1 hour | FortiGate, primary DC, all database servers, web/app servers |
| P2 — High Priority | ≤ 8 hours | ≤ 2 hours | Image/file servers, backup DC, utility, monitoring, public web, print |
| P3 — Standard | ≤ 8 hours | ≤ 12 hours | Admin, jump box, internal web |

**VM count:** 17 total — 8 P1, 6 P2, 3 P3

**Auto stop/start policy:**
- P1: Always on — no auto stop
- P2/P3: Scheduled auto stop/start where applicable (cost optimization for non-critical standby VMs)

**VM sizing reference (use for similar engagements):**
- FortiGate NVA: Standard_F2s
- Domain Controllers: Standard_D2as_v4
- Primary/Financial DBs: Standard_E8s_v3 / Standard_E4s_v3
- Web/App servers: Standard_D2s_v3 to Standard_D4s_v3
- Monitoring/Utility: Standard_E4s_v3 / Standard_D2s_v3

---

## Solution Architecture

### Primary Region (Active — North Central US)
- Production VNet with defined CIDR block
- Application Gateway WAF v2 (ingress + WAF protection)
- Traffic Manager (primary endpoint)
- FortiGate NVA (network security + VPN)
- Domain Controllers (DC1 + DC2)
- SQL Servers with AlwaysOn Availability Groups
- Web / App / Utility workloads

### DR Region (Standby — Central US)
- DR VNet with **identical IP schema** (IP parity — same CIDR, same subnets)
- FortiGate NVA (standby)
- Secondary Domain Controller (always-on for AD sync)
- Application Gateway WAF v2 (standby ingress)
- Traffic Manager DR endpoint
- ASR-replicated standby VMs (warm standby, powered off until failover)
- Hot-standby SQL (Database1, Database2 — multi-VM consistency group)
- Isolated test-failover subnet (non-disruptive DR testing)

### Replication
- Continuous ASR replication over HTTPS port 443
- Microsoft backbone network routing (not over public internet)
- RPO: < 1 minute (architecture target)
- RTO: ~1 hour (simulated failover target)
- Crash-consistent replication for all VMs
- Multi-VM consistency groups for SQL tier (ensures transactional integrity)

### Traffic Steering During Failover
- Traffic Manager automatically routes to DR endpoint when primary health probe fails
- No manual DNS changes required during failover
- Application Gateway WAF v2 in DR region handles ingress after Traffic Manager switch

### IP Parity Design Principle
All DR VMs boot with same private IP addresses as production. This eliminates application-level reconfiguration (hardcoded IPs, connection strings, firewall rules) during failover. Critical for complex multi-tier applications.

---

## Technical Execution Stages

### Stage 1 — Design & Logic Verification (Week 1)
- Final audit of all VMs, OS versions, disk churn rates — ASR compatibility validation
- PowerShell environment setup (Az module, secure tenant connectivity)
- Dependency mapping: recovery set grouping by tier (SQL tier must heartbeat before app tier starts)

### Stage 2 — Infrastructure Foundation (Weeks 2–3)
- Deploy DR VNets, subnets, NSGs via PowerShell (identical IP schema to primary)
- Deploy Recovery Services Vault + GRS-enabled storage accounts
- Deploy FortiGate NVA into DR VNet
- Provision and join DR domain controllers; verify AD Sites and Services health

### Stage 3 — Replication & Traffic Steering (Weeks 4–5)
- Enable ASR replication for all 17 VMs via scripted enrollment
- Deploy Traffic Manager with priority routing
- Deploy Application Gateway WAF v2 in Central US
- Assign secondary App Gateway public IP to Traffic Manager DR endpoint

### Stage 4 — Validation & Non-Disruptive Testing (Weeks 6–7)
- Multi-VM consistency drills for SQL tier (Database1, Database2, Database3)
- Web-to-database connectivity validation using internal IPs (confirms IP parity working)
- PowerShell recovery plan automation health check (no manual steps required)
- Isolated test failovers using ASR test-failover subnet

### Stage 5 — Operational Readiness & Handover (Week 8)
- Finalize DR runbook
- Deliver PowerShell library (.ps1 and .psm1 modules) for build and recovery
- Final sync check + one week hyper-care monitoring

---

## Azure Monthly Cost Breakdown (~$1,895/month recurring)

| Category | Component | Est. Monthly |
|---|---|---|
| Compute (always-on) | FortiGate NVA + 2x Domain Controllers | $215 |
| ASR Licensing | $25/VM × 17 VMs | $425 |
| Replication cache storage | ~500 GB HDD/SSD buffer | $45 |
| SQL ASR protection | 3 DB VMs with consistency group overhead | $185 |
| Managed disks at rest | ~12 TB DR disk snapshot storage | $295 |
| Networking | App Gateway WAF v2 + Traffic Manager + 1.5 TB egress | $485 |
| Azure Files (GRS) | 5 TB geo-redundant shared storage | $245 |
| **Total** | | **~$1,895/month** |

**Key cost drivers to explain to clients:**
- ASR licensing is the most controllable cost — $25/VM/month. Only protect what genuinely needs DR.
- Application Gateway WAF v2 ($360/month) is the largest single networking cost — fixed cost regardless of traffic volume at the DR standby site.
- Managed disks at rest are often underestimated — 12 TB of DR snapshot storage adds up.
- ASR fees are waived by Microsoft for the first 31 days — useful for project cost timing.

---

## Responsibility Matrix

| Task | Provider | Client |
|---|---|---|
| PowerShell automation development | ✓ | |
| DR infrastructure deployment | ✓ | |
| Azure access and permissions | | ✓ |
| ASR configuration | ✓ | |
| Application testing | | ✓ |
| Failover drills | ✓ | ✓ |
| Runbook documentation | ✓ | |
| DNS changes | ✓ | ✓ |

---

## Project Acceptance Criteria

1. All 17 VMs show healthy ASR replication status for **7 consecutive days**
2. Simulated failover completes with all VMs booted and accessible within **4 hours** (P1 RTO)
3. Users can authenticate against DR domain controllers during test failover (identity persistence)
4. Application backend links function using original production IP schema (IP parity validated)

---

## Risks to Flag

- **Disk churn rates:** High-churn VMs (databases, busy web servers) require larger replication cache and more bandwidth. Audit churn rates in Stage 1 — high churn can increase storage costs and affect achievable RPO.
- **ASR compatibility:** Validate OS versions and VMware/Azure VM configurations against ASR support matrix before committing to scope. Some older OS versions require updates before enrollment.
- **SQL multi-VM consistency:** Multi-VM consistency groups in ASR have specific configuration requirements. SQL Always On AG nodes must be in the same consistency group — validate AlwaysOn configuration before Stage 3.
- **IP parity complexity:** Identical IP schema between regions requires careful NSG, routing table, and DNS design. Mistakes here cause connectivity failures during test failover that are hard to diagnose.
- **Application Gateway WAF v2 cost:** At ~$360/month for the standby instance, clients often ask if this can be eliminated. It cannot if automated failover is required — Traffic Manager needs a healthy endpoint to switch to.
- **FortiGate licensing model:** Confirm BYOL vs. PAYG licensing decision before deployment. BYOL requires existing FortiGate license transfer which has lead time.

---

## Pete's Delivery Notes

- **PowerShell-driven deployment is non-negotiable for an engagement this size** — 17 VMs, cross-region networking, ASR enrollment, and recovery plans cannot be reliably managed through the portal alone. The .ps1/.psm1 library delivered at handover is also a client asset — it becomes their recovery automation.
- **IP parity is what separates a real DR solution from a hope** — without it, every application with a hardcoded IP or connection string needs manual reconfiguration during failover. Design IP parity in from day one.
- **Dependency mapping in Stage 1 is the most important technical task** — if the SQL tier isn't heartbeating before the application tier starts, the failover will appear to succeed but apps won't function. Document the recovery set order explicitly.
- **Never skip the 7-day ASR health check before finalizing acceptance** — replication can appear healthy and then degrade within days due to storage throttling, churn spikes, or network fluctuations. The 7-day window catches these.
- **Hyper-care week is a selling point, not a cost** — position it to the client as included in the engagement, not as extra. It's when real-world issues surface post-handover and quick resolution builds long-term trust.
- **The PowerShell library handover creates stickiness** — clients who receive documented, working recovery automation stay with the provider who built it. Offer to maintain and update it as part of ongoing managed services.
