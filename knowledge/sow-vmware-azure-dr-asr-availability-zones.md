# VMware-to-Azure Disaster Recovery — ASR Replication with Availability Zones

**Domain:** Azure Infrastructure · Disaster Recovery · VMware · Azure Site Recovery · Network Security
**Specialist:** Azure SA / VMware SA / Network SA
**Use when:** A client wants to retire a physical DR datacenter and replace it with Azure-based DR, asks about VMware-to-Azure migration or replication, wants Azure Site Recovery (ASR) configured, needs zone-redundant DR architecture, or is planning a phased cloud DR strategy where Phase 1 is DR and Phase 2 is production migration.

---

## Engagement Profile

**Type:** Phase 1 of a multi-phase IT strategy — Azure DR establishment (production migration in Phase 2)
**Source environment:** VMware on-premises (primary datacenter)
**Target environment:** Azure Central US with Availability Zones
**Replication tool:** Azure Site Recovery (ASR) with ASR agents on VMware hosts
**Security:** Zone-redundant virtual firewall + management appliances in Azure
**Duration:** 4 weeks
**Billing model:** One-time professional services (Tier-II + Tier-III hours) + ongoing Azure monthly cost (per estimate workbook)

---

## When to Recommend This Pattern

Recommend VMware-to-Azure DR when a client:
- Runs production workloads on VMware on-premises and has a physical secondary DR datacenter
- Wants to eliminate the cost and complexity of maintaining a physical DR site
- Is ready to leverage Azure for DR before committing to full cloud migration
- Needs RPO/RTO guarantees with automated failover capability
- Wants zone-redundant protection (3 datacenters within one Azure region)
- Is on a phased cloud journey (DR first, production migration later)

**Key qualifying questions:**
- "Do you have a secondary DR datacenter today, and what does it cost you to maintain it?"
- "What is your current RTO/RPO if your primary site goes down?"
- "Are you running VMware vSphere in your primary datacenter?"
- "Do you have an Azure subscription already, or would we need to establish one?"
- "Is your goal to eventually migrate production to Azure, or keep it on-prem long term?"

**Ideal client profile:**
- VMware-based primary datacenter (vSphere 6.7 or later — confirm compatibility)
- Physical DR site they want to retire (cost reduction + modernization driver)
- Active Azure subscription (or willing to establish one)
- 4–8 week implementation window acceptable
- IT strategy that includes eventual production cloud migration (positions Phase 2 SOW naturally)

---

## Solution Architecture

### Azure Foundation (Hub-Spoke Topology)
- Azure subscription + resource groups + identity governance + baseline policies
- Hub virtual network + spoke virtual networks
- Site-to-site VPN between on-premises primary datacenter and Azure DR region
- Remote client VPN for authorized user access during failover
- Routing tables and NSGs for controlled communication between on-prem and Azure

### Azure Availability Zones
- All DR resources deployed across 3 Availability Zones within Azure Central US
- Zone redundancy protects against datacenter-level failures within the Azure region
- Recovery VMs provisioned in zone-redundant configuration via ASR recovery plans

### Azure Site Recovery (ASR) — VMware to Azure
- ASR agents installed on VMware hosts at on-premises primary site
- Replication policies configured with agreed RPO targets
- Recovery plans configured with defined RTO objectives
- Recovery Services Vault in Azure Central US
- All critical VMs replicated and validated

### Security — Zone-Redundant Virtual Firewall
- Virtual firewall appliance + management appliance deployed in Azure DR environment
- Zone-redundant deployment (survives Availability Zone failure)
- NSGs applied for protected communication between Azure and on-premises
- Firewall provides controlled DR network edge during failover operations

### Connectivity During Failover
- Site-to-site VPN supports office-to-Azure connectivity during declared DR
- Client VPN supports remote user access to DR environment
- Recovery VMs accessible through protected Azure network after failover

---

## Project Phases & Timeline (4 weeks)

| Week | Milestone | Key Activities |
|---|---|---|
| Week 1 | Azure Foundation Build | Azure subscription, resource groups, governance policies, networking (hub-spoke, VNets, routing tables) |
| Week 2 | Security & Connectivity | Zone-redundant virtual firewall deployment, VPN connectivity between Azure and on-prem VMware |
| Week 3 | ASR Configuration & Replication | Register VMware hosts in ASR, replication policies, initial sync for all scoped VMs |
| Week 4 | Failover Testing & Sign-off | Planned failover test, RTO/RPO validation, final DR runbook, test report, client acceptance |

---

## Deliverables

| Deliverable | Description |
|---|---|
| Azure Foundation | Resource groups, networking, governance, and policy configuration |
| ASR Configuration Report | Detailed replication settings and per-VM verification |
| Firewall/Security Deployment Guide | Architecture and configuration for zone-redundant deployment |
| DR Test Report | Planned failover results, RTO/RPO outcomes, optimization recommendations |
| DR Operations Runbook | Step-by-step restoration and failback procedures |
| Knowledge Transfer | Sessions with client IT team covering DR operations |

---

## Scope of Services (included)

- Azure subscription setup, resource group creation, identity governance, baseline policies
- Hub-spoke virtual network design and deployment
- Site-to-site VPN + remote client VPN configuration
- NSG and routing table configuration
- Zone-redundant virtual firewall + management appliance deployment
- ASR agent installation and registration on VMware hosts
- Replication policy configuration (RPO/RTO targets)
- Initial replication seeding for all critical VMs
- Recovery plan creation and configuration
- Planned failover test execution and documentation
- DR runbook and architecture diagrams
- Knowledge transfer sessions

---

## Out of Scope (Phase 2 SOW or separate engagement)

- Production workload migration to Azure (Phase 2)
- Backup implementation beyond ASR DR replication (Phase 2)
- Integration with third-party DR orchestration tools
- End-user or workstation-level recovery testing
- Non-VMware platform integration (Hyper-V, physical servers, etc.)

**Important positioning note:** This is Phase 1 of a defined 2-phase IT strategy. Always position the Phase 2 production migration SOW during Phase 1 kickoff — the client has already committed to the Azure journey. Phase 1 is the beachhead.

---

## Key Assumptions

- Client has active Azure subscriptions and required licenses before project starts
- On-premises VMware environment is accessible to provider for ASR agent installation
- VMware version is compatible with ASR (validate during discovery — incompatible versions require patching before ASR setup)
- Required site-to-site networking bandwidth is available and stable for initial replication seeding
- Client provides administrative credentials for both on-premises VMware and Azure environments
- All work during standard business hours unless otherwise approved
- Azure region resource availability (Central US) confirmed before project start

---

## Risks to Flag in Client Conversations

- **Initial replication seeding bandwidth:** Large VMs or slow WAN links can make initial seeding take days or weeks — schedule this carefully and set expectations on the first week's timeline
- **VMware version compatibility:** ASR has minimum vSphere version requirements — validate early; incompatible versions add a patching phase before replication can start
- **Azure subscription limits / quotas:** New Azure subscriptions have default vCPU quotas that may need raising before recovery VMs can be provisioned — request increases early in Week 1
- **Azure region resource constraints:** Availability Zone capacity is generally reliable but confirm before committing to a region
- **Third-party network provider coordination:** Site-to-site VPN establishment often requires coordination with the client's ISP or network provider — this can add days of delay
- **RPO realism:** ASR RPO is typically 30 seconds for VMware workloads under normal conditions, but WAN congestion and change rates affect actual RPO — set realistic expectations

---

## Value Proposition by Audience

**For the CIO:**
> "Rather than spending on hardware refresh, power, cooling, and co-location for a physical DR site, you move your DR capability to Azure — where you only pay for what you actually need during a disaster. Phase 1 gives you a validated cloud DR site in 4 weeks. Phase 2, when you're ready, migrates production."

**For the CFO:**
> "Your current physical DR site has fixed costs whether you use it or not. Azure DR is consumption-based — the replicated VMs sit dormant until a disaster, then scale up only when needed. Compare your current DR annual cost against the Azure monthly DR estimate."

**vs. maintaining a physical DR site:**
- Eliminates hardware refresh cycles at DR site
- Eliminates co-location or second-site facilities costs
- Azure Availability Zones provide better geographic redundancy than most on-prem DR sites
- Automated failover vs. manual physical DR procedures
- Faster failover (ASR recovery plans automate VM startup sequence)

**vs. doing nothing:**
- Physical DR sites require ongoing investment; without modernization they become liabilities
- A DR site that hasn't been tested recently is not a DR site — it's a hope
- Azure DR includes mandatory test failover as part of Phase 1 acceptance

---

## Professional Services Effort Breakdown

| Tier | Hours | Scope |
|---|---|---|
| Tier-II (Standard) | 87 hours | On-prem + cloud environment preparation, standard networking in Azure, standard ASR/replication deployment, proof-of-concept planning assist |
| Tier-III (Advanced) | 30 hours | Advanced Azure networking (hub-spoke, zone-redundant firewall), advanced ASR components (recovery plans, automation runbooks, workflows), official DR documentation and runbook |
| **Total** | **117 hours** | Full Phase 1 engagement |

---

## Acceptance Criteria

Phase 1 complete when:
1. All in-scope VMware workloads replicating to Azure via ASR — verified
2. Virtual firewall + management appliances operational across Azure Availability Zones
3. Planned failover test executed, verified, and documented
4. Client signs off on DR readiness validation report

---

## Pete's Delivery Notes

- **Phase 2 conversation starts in Week 2, not after Phase 1 ends:** Once the Azure foundation is built and the client sees it working, that's the moment to introduce the Phase 2 production migration scope. Don't wait for Phase 1 closeout — you'll lose momentum.
- **Test failover is non-negotiable:** ASR has a test failover mode that spins up VMs in an isolated network without affecting replication. Always run this in Week 4 — it's the only way to truly validate DR readiness. A DR environment that has never been tested is not a DR environment.
- **Recovery plan sequencing matters:** Document the VM startup order in the recovery plan carefully. Applications that depend on domain controllers, DNS, or database servers will fail if those aren't up first. Validate the sequence during the test failover, not during a real disaster.
- **Replication seeding scheduling:** Start the initial ASR replication sync in Week 3 during low-traffic hours (evenings/nights if possible). Large VMs can saturate WAN links. Coordinate with the client's network team before enabling replication.
- **Runbook quality is what clients remember:** The DR Operations Runbook is the deliverable the client will reference during an actual disaster, often without Pete present. Make it explicit, step-by-step, and tested. It's also the best reference document for positioning ongoing managed DR services.
- **Azure quota requests on Day 1:** Check and request Azure subscription quota increases (vCPUs, public IPs, etc.) in Week 1, not Week 3. Quota approvals can take 24–72 hours and will block VM provisioning if left late.
