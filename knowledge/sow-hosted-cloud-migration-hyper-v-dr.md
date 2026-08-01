# Hosted Cloud Migration — Hyper-V Workloads to Provider Datacenter + DR Replication

**Domain:** Infrastructure Migration · Hosted Cloud · Disaster Recovery · Virtual Firewall · VPN
**Specialist:** Azure SA / VMware SA / Network SA / Veeam SA
**Use when:** A client asks about migrating on-premises Hyper-V VMs to a hosted/private cloud, avoiding on-prem hardware refresh, setting up cloud-hosted DR replication, or deploying a virtual firewall for hosted workloads. Also relevant when clients want a CapEx-to-OpEx shift for server infrastructure or a provider-managed alternative to hyperscale cloud (Azure/AWS).

---

## Engagement Profile

**Type:** Lift-and-shift migration + hosted DR replication
**Scope:** 5 VMs (1 from Site A, 4 from Site B) migrated to provider-owned hosted cloud datacenter
**DR:** Primary-to-secondary datacenter replication of designated production VMs
**Security:** Virtual next-generation firewall appliance + site-to-site VPN + client VPN
**Duration:** 30–45 calendar days
**Billing model:** One-time professional services fee + monthly subscription for hosted infrastructure resources + 3-year firewall license subscriptions

---

## When to Recommend This Pattern

Recommend a hosted private cloud migration (over on-prem hardware refresh or hyperscale public cloud) when the client has:
- Aging on-premises Hyper-V or VMware infrastructure due for hardware refresh
- Branch/office-based servers that are single points of failure
- No internal IT capacity to manage on-premises infrastructure
- A preference for CapEx avoidance (monthly OpEx model preferred)
- A need for geographically separate DR without building a second physical site
- Sensitivity to hyperscale cloud complexity, cost unpredictability, or support model concerns
- 3–20 VMs in scope (smaller footprints especially suited to hosted private cloud vs Azure IaaS)

---

## Solution Architecture

### Production Hosting
- All in-scope VMs migrated to provider-owned primary datacenter
- Provider allocates CPU, RAM, and storage per agreed sizing
- Resources are adjustable (scale up/down) as business needs change
- High availability at physical infrastructure layer (provider responsibility)
- No customer investment in new on-premises hardware

### Disaster Recovery
- Designated production VMs replicated from primary datacenter to secondary DR datacenter
- Backup and replication tooling used for replication (e.g., Veeam)
- Geographic separation between production and DR — single-site cloud risk eliminated
- Standby replicas power on in DR site during declared disaster
- DR failover procedures documented and validated at high level

### Security and Connectivity
- Virtual NGFW appliance deployed in primary hosted environment
- Site-to-site VPN from client office locations to hosted cloud
- Remote-access client VPN for authorized remote users
- Corresponding DR firewall/VPN for failover connectivity (if in scope)
- Centralized security policy management through virtual appliance

### Migration Method
- **Lift-and-shift only** — no application redesign, no OS upgrades
- Backup and replication tooling performs the migration (e.g., Veeam)
- Source: on-premises Hyper-V hosts at two office locations
- Target: provider-hosted VMware or equivalent hypervisor platform
- Cutover: scheduled maintenance windows to minimize business disruption

---

## Project Phases & Timeline (30–45 days)

| Phase | Days | Key Activities |
|---|---|---|
| Discovery & Initiation | 1–5 | Kickoff, VM inventory, dependency review, migration prerequisites, DR scope confirmation |
| Environment Preparation | 6–10 | Provision hosted cloud resources, compute/storage allocation, network preparation |
| Security & Connectivity | 11–15 | Deploy virtual firewall, configure S2S VPN, configure client VPN |
| Migration Execution | 16–24 | Replication/restore of workloads, VM boot validation, connectivity tests |
| Production Cutover | 25–32 | Cutover during maintenance windows, service validation, office/remote connectivity |
| DR Replication | 30–40 | Provision DR resources, configure replication, seed, validate replica health |
| Final Validation & Handover | 40–45 | Final checks, completion summary, transition to support |

---

## Scope of Services (included)

- Project planning, discovery, and prerequisites review
- Hosted cloud environment provisioning (compute, memory, storage)
- Virtual NGFW appliance deployment and base policy configuration
- Site-to-site VPN and client VPN configuration
- Lift-and-shift migration of all in-scope VMs using backup/replication tooling
- Production cutover during agreed maintenance windows
- DR replication configuration to secondary datacenter
- DR replica seeding, health validation, and recovery-readiness check
- High-level implementation completion summary
- Transition to normal support operations

---

## Out of Scope (billable via change order if needed)

- Application upgrades or OS upgrades beyond lift-and-shift
- Active Directory redesign or domain restructuring
- Application refactoring for cloud-native architecture
- End-user workstation migration
- Office LAN or WAN circuit work
- Remediation of unhealthy or unsupported source systems
- Advanced DR orchestration, runbook automation, or formal DR program development
- Compliance consulting or audit preparation
- Decommissioning of on-premises hardware
- Live disaster declaration management or actual failover execution

---

## Key Assumptions

- Client confirms final VM list and DR-designated workload list before work begins
- All in-scope VMs are in a healthy, supportable state
- Current recoverable backups exist prior to migration
- Adequate WAN/internet connectivity exists for migration traffic and ongoing production access
- Required maintenance windows will be approved by client
- Application and OS licensing provided by client (unless explicitly included)
- VPN endpoint readiness and on-premises firewall coordination available as needed

---

## Risks to Flag in Client Conversations

- Application compatibility post-migration (validate in hosted environment before cutover)
- Hard-coded IP/path dependencies in migrated applications requiring remediation
- WAN/internet bandwidth affecting migration speed and ongoing performance
- DR replication intervals dependent on available bandwidth and workload change rate
- Source system issues or undocumented dependencies can add timeline risk
- Actual disaster recovery failover timelines vary by workload count, data currency, and system condition
- Application-level HA is client responsibility — hosted platform covers infrastructure HA only

---

## Value Proposition Talking Points

**vs. On-premises hardware refresh:**
- Eliminates large upfront CapEx (server hardware, storage, warranties, deployment)
- Eliminates future refresh cycles for these workloads
- Converts to predictable monthly OpEx
- Provides geographically separate DR not possible with branch-based hosting
- Faster infrastructure adjustments without procurement delays

**vs. Hyperscale public cloud (Azure/AWS):**
- More responsive support model — direct coordination with provider, no third-party escalation
- Faster environment changes — provider controls the infrastructure stack
- More predictable cost model — no egress fees, no consumption surprises
- Better fit for clients with 3–20 VMs who don't need hyperscale scale or services

**Executive summary framing:**
> "Rather than investing in hardware that depreciates immediately, you get a monthly service that can grow with you, with a geographically separate DR copy of your critical servers — and no hardware to manage, refresh, or replace."

---

## Billing Structure

| Component | Billing Model |
|---|---|
| Hosted cloud infrastructure (CPU, RAM, storage) | Monthly subscription |
| Production virtual firewall license | 3-year subscription |
| DR virtual firewall license | 3-year subscription (if DR firewall in scope) |
| Remote VPN client (IPsec) | No additional license required |
| Professional services | One-time project fee |

---

## Acceptance Criteria

Project considered substantially complete when:
1. All 5 VMs migrated and accessible in hosted production environment
2. Core business services functioning post-migration
3. Office and/or remote-user VPN connectivity functional
4. Designated VMs replicating successfully to secondary DR datacenter
5. DR readiness validation completed
6. Client confirms critical service validation
7. Environment transitioned to normal support operations

---

## Pete's Delivery Notes

- Always confirm VM health before migration — migrating broken VMs creates support calls immediately after cutover
- Treat the maintenance window as sacred — cutover failures outside agreed windows damage trust significantly
- Seed DR replication during the migration phase, not after — avoids adding timeline risk at the end of the project
- Validate VPN from actual client office devices, not just server-to-server pings — end-user experience is what gets signed off
- Document DR readiness outcome clearly — clients often confuse "replication is running" with "we can fail over" — set the right expectation in the handover summary
