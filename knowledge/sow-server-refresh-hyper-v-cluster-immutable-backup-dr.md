# Server Refresh, Hyper-V Cluster, Immutable Backup & Cloud DR — Multi-Site Engagement

**Domain:** Infrastructure · Virtualization · Backup & Recovery · Disaster Recovery · Network
**Specialist:** Windows Server SA / VMware SA / Veeam SA / Network SA
**Use when:** A client asks about refreshing aging on-premises server hardware, building a Hyper-V failover cluster, implementing immutable backup storage, setting up cloud DR replication, or repurposing legacy servers as backup infrastructure. Also use when a client has a mix of branch office (small, single-server) and main office (multi-VM, clustered) requirements in the same engagement.

---

## Engagement Profile

**Type:** Multi-workstream — hardware refresh + cluster build + backup modernization + cloud DR
**Sites:** Two locations (branch office + main office)
**Scope:**
- Branch (Site A): single physical server refresh + repurposed legacy server as local backup
- Main office (Site B): 2-node Hyper-V failover cluster + external all-flash shared storage + repurposed legacy server as hardened immutable backup repository + cloud DR replication
**DR:** On-premises-to-hosted-cloud VM replication + virtual NGFW at DR site
**Duration:** 40–60 calendar days
**Billing model:** One-time professional services (per-site workbooks) + hardware/licensing procurement + 3-year DR firewall subscription + monthly hosted DR resource subscription

---

## When to Recommend This Pattern

Recommend this engagement type when a client has:
- Aging Hyper-V or physical server hardware at one or more sites approaching end of life
- A single Hyper-V host running multiple production VMs (single point of failure — critical risk)
- No immutable local backup storage (ransomware exposure)
- Existing off-site backup but no standby VM replicas for rapid DR failover
- A branch office with a simple workload that doesn't justify a full cluster
- Legacy hardware that can be repurposed rather than scrapped (cost-effective resilience)
- A desire to improve business continuity without fully moving to hyperscale cloud

**Key qualifying questions:**
- "How many VMs are running on your Hyper-V host, and what happens if that host fails?"
- "Do you have immutable backup copies that can survive a ransomware attack?"
- "How long would it take to recover your servers if your entire site went offline?"
- "Are you planning to replace any server hardware in the next 12 months?"

---

## Solution Architecture Overview

### Site A — Branch Office (simplified physical design)
- **New:** Standalone physical server running required services directly on OS (no unnecessary Hyper-V layer)
- **Rationale:** Single-VM Hyper-V model adds complexity without benefit for a small branch workload
- **Recovery:** Repurposed legacy server rebuilt as dedicated local backup server
  - Protects new physical production server with local backups
  - In catastrophic hardware loss scenario: restore/convert workload to VM and run on backup server locally
  - Minimizes branch outage without waiting for replacement hardware
- **Cloud DR:** Not in scope for Site A (standalone physical server — not a virtualized workload)

### Site B — Main Office (clustered, resilient design)
- **New compute:** 2-node Hyper-V failover cluster on new current-generation physical servers
- **New storage:** External all-flash shared storage array with redundant controllers and power
- **Networking:** Dual high-speed LAN per host + dual high-speed iSCSI per host
- **HA:** Hypervisor-level VM failover on surviving node during host hardware failure
- **Backup:** Repurposed legacy server rebuilt as hardened immutable backup repository
- **Cloud DR:** Designated VMs replicated to hosted cloud platform; virtual NGFW at DR site

### Cloud DR Environment
- Virtual NGFW appliance deployed at hosted cloud DR site (protected network edge)
- Provides security policy enforcement + VPN termination for DR operations
- Site-to-site VPN and/or client VPN connectivity during failover
- Standby VM replicas power on in hosted cloud during declared disaster
- More recovery-ready than backup-restore-only approach

---

## Migration Scope

### Site A Services Migrated to New Physical Server
- Active Directory Domain Services (AD DS)
- DNS
- Print services + printer configurations
- File shares + permissions + access paths
- Accounting application and related dependencies

### Site B VMs Migrated to New Hyper-V Cluster
- All existing VMs from legacy single-host Hyper-V
- Mix of Windows Server 2022 (majority) and Windows Server 2019 (one VM)
- Lift-and-shift only — no OS upgrades or application redesign

### Post-Migration Legacy Hardware Repurposing
| Legacy Server | New Role |
|---|---|
| Site A legacy Hyper-V host | Dedicated local backup server |
| Site B legacy Hyper-V host | Hardened immutable backup repository |

---

## Project Phases & Timeline (40–60 days)

| Phase | Days | Key Activities |
|---|---|---|
| Discovery & Planning | 1–10 | Kickoff, inventory, dependency review, confirm backup/DR scope, VM list, cutover sequence |
| Solution Validation & Detailed Planning | 4–10 | Finalize hardware specs, confirm DR replication scope, VPN/firewall prerequisites |
| Hardware Preparation | 8–20 | Stage/validate new hardware, firmware, OS deployment prep |
| Site A Server Deployment | 15–25 | Install new server, migrate AD/DNS/file/print/app, cutover |
| Site A Backup Server Config | 22–30 | Rebuild legacy as backup server, configure jobs, validate local recovery |
| Site B Cluster & Storage Deployment | 18–35 | Install/configure both hosts + storage array, LAN/iSCSI networking, build cluster |
| Site B VM Migration & Cutover | 30–42 | Lift-and-shift VMs to cluster, validate, production cutover |
| Site B Hardened Repository | 38–46 | Rebuild legacy as immutable repo, configure backup jobs, validate |
| Cloud DR + Virtual Firewall | 40–52 | Deploy DR NGFW, configure VPN, set up replication, seed replicas |
| Final Validation & Handover | 52–60 | Cluster failover test, backup validation, DR readiness, completion summary |

---

## Scope of Services (included)

**Site A:**
- New physical server install, OS config, storage, LAN
- AD DS / DNS role migration
- File + print services migration
- Accounting application migration
- Production cutover + legacy decommission
- Legacy server rebuild as local backup server
- Backup job configuration + local recovery validation

**Site B:**
- 2x new Hyper-V host rack/install/configure
- External shared storage array deploy/configure
- Dual LAN + dual iSCSI connectivity per host
- Hyper-V failover cluster creation and validation
- Lift-and-shift VM migration from legacy host
- VM boot/network/app validation post-migration
- Basic clustered failover validation
- Production cutover during approved maintenance window
- Legacy server repurposing as hardened backup repository
- Immutable backup repository configuration
- Backup job/copy-job configuration to repository
- Immutable restore point validation

**Cloud DR:**
- Virtual NGFW deployment in hosted cloud DR environment
- DR network/security edge configuration
- VPN termination configuration
- VM replication configuration for designated Site B VMs
- Initial synchronization/seeding
- Replica health and replication job validation
- DR-site connectivity and VPN validation

---

## Out of Scope (billable via change order)

- OS upgrades for migrated VMs
- Application upgrades or database repair (accounting app or any LOB app)
- WAN, core firewall, or network redesign beyond what's required for the solution
- Active Directory redesign or domain restructuring
- End-user workstation remediation
- Printer replacement or print environment redesign
- Advanced DR orchestration, runbook development, or guaranteed RTO/RPO commitments
- Backup retention expansion beyond agreed repository capacity
- Business impact analysis or formal DR program development
- Full user acceptance testing in DR failover condition
- Office A cloud replication (physical server workload — not a virtualized VM in this design)
- Cross-site stretched clustering
- Cloud failover execution during an actual disaster (handled under separate incident response)
- Remediation of repurposed hardware if found unsuitable

---

## Key Assumptions

- Backup licensing may require expansion to cover new hosts and physical server (confirm before project start)
- Both repurposed legacy servers must pass hardware suitability review before rebuilding
- Active hardware support coverage for Site B repurposed server must be confirmed or procured by client
- All in-scope servers are in a healthy, supportable state prior to migration
- Current complete backups exist for all servers before migration begins
- Accounting application migration requirements and version compatibility validated before cutover
- Required switching infrastructure (for high-speed LAN + iSCSI) already in place at Site B
- Rack space, power, cabling, and optics available for new Site B hardware
- Adequate WAN bandwidth for cloud DR replication traffic
- Hosted cloud DR target resources available and sized per agreed replication scope
- Existing off-site backup service to hosted cloud remains in place (not replaced by this engagement)
- Client approves final hardware configurations and maintenance windows
- All licensing (Microsoft, backup, firewall, cloud) provided by client or explicitly quoted separately

---

## Risks to Flag in Client Conversations

- **Accounting application sensitivity:** Validate carefully — accounting apps can break on server moves; involve vendor if needed
- **Windows Server 2019 VM at Site B:** Validate compatibility with Windows Server 2025 Hyper-V hosts before migration
- **Site A remains single-server:** Local HA is not provided — recovery through backup server, not instant failover. Set expectation correctly.
- **Site A recovery performance:** Running physical server workload as VM on backup server may perform differently than native hardware — set this expectation clearly
- **Repurposed hardware suitability:** Both legacy servers must pass hardware health check — have a contingency if either fails
- **Immutable repo effectiveness depends on correct hardening:** Access controls, repo isolation, and backup platform config must be implemented correctly
- **WAN bandwidth for replication:** Replication intervals are a function of bandwidth + change rate — set RPO expectations accordingly
- **DR failover dependencies:** Successful failover requires DNS, VPN, networking, and app dependencies to be correct — document this clearly
- **Cluster HA ≠ app HA:** Hyper-V clustering restarts VMs on surviving node, but doesn't guarantee instant availability — some VMs need time to boot and stabilize
- **Storage/network path configuration:** iSCSI and LAN paths must be correctly implemented to realize redundancy — test thoroughly before migration

---

## Value Proposition by Audience

**For the CIO / IT Director:**
> "You're currently one hardware failure away from losing all your Site B production servers simultaneously. This engagement replaces that risk with a clustered architecture, adds immutable backup protection against ransomware, and gives you a cloud failover option if your site goes completely offline."

**For the CFO:**
> "Rather than buying only new hardware that still has the same single-point-of-failure architecture, this engagement delivers production resilience, cyber recovery, and disaster recovery in one project. We're also repurposing your existing legacy servers rather than scrapping them — extracting additional value from assets you've already paid for."

**vs. doing only a hardware refresh:**
- Hardware refresh alone doesn't fix single-host failure domain at Site B
- Hardware refresh alone doesn't add immutable backup protection
- Hardware refresh alone doesn't provide cloud DR capability
- This engagement addresses all three gaps in one coordinated project

**vs. doing nothing:**
- Single Hyper-V host failure = all Site B VMs offline simultaneously
- No immutable backups = ransomware can delete all local recovery points
- Backup-only DR = hours or days to restore vs. minutes to power on replicated VMs

---

## Layered Protection Model (use this framing in proposals)

| Layer | Protection | Technology |
|---|---|---|
| Production HA | Host-level failover for Site B VMs | Hyper-V failover cluster |
| Local operational backup | Fast local restores + cyber resilience | Hardened immutable backup repository |
| Off-site backup | Geographic separation of backup data | Existing hosted cloud backup (retained) |
| Cloud DR | Rapid failover in site-loss scenario | VM replication to hosted cloud + NGFW |
| Site A local recovery | Branch recovery without replacement hardware wait | Repurposed backup server with VM recovery |

---

## Billing Structure

| Component | Billing Model |
|---|---|
| On-premises hardware (servers, storage array, optics/cabling) | One-time hardware quote |
| Windows Server OS licensing | Per-server quote |
| Backup platform licensing expansion | Per confirmed scope |
| DR virtual firewall license | 3-year subscription |
| Client VPN (IPsec) | No additional license (supported firmware) |
| Cloud DR hosted resources | Monthly subscription (per workload/resource block) |
| Professional services — Site A | One-time project fee (per services estimate) |
| Professional services — Site B | One-time project fee (per services estimate) |

---

## Acceptance Criteria

Project substantially complete when:
1. Site A services migrated and operational on new production server
2. Site A backup server operational and protecting production server with validated local recovery capability (including VM-based recovery test)
3. Site B VMs running on new Hyper-V cluster with shared storage
4. Basic Site B clustered failover validated
5. Site B hardened repository operational with immutable backup copies confirmed
6. Virtual NGFW deployed and operational in hosted cloud DR environment
7. DR-site VPN connectivity configured and validated
8. Designated Site B VMs replicating successfully to hosted cloud platform
9. Core business services accessible and functioning post-migration
10. Client confirms validation of critical services and protection functions
11. Legacy servers decommissioned or repurposed per approved design

---

## Pete's Delivery Notes

- **Sequence matters:** Get Site B cluster and storage stable before starting VM migrations — rushing this is where cluster engagements break
- **Accounting application:** Always involve the vendor or at minimum test in a sandbox before live cutover — this app type is notorious for license binding, hardcoded paths, and server-name dependencies
- **Immutable repository isolation:** The repo server must be separated from the production network properly — a repo that's accessible from a compromised production server is not truly hardened
- **Site A expectation setting:** Brief the client that Site A is still a single-server design — the backup server provides recovery, not instant HA. This is intentional and appropriate for branch size, but the client needs to understand the distinction
- **DR NGFW before replication:** Deploy and validate the virtual firewall and VPN before seeding replication — seeding through an unsecured network path is bad practice and may need to be redone
- **Hardware suitability check early:** Do the repurposed hardware health check in week 1, not week 6 — if either legacy server fails the check, you need time to procure a replacement without blowing the timeline
- **Document the DR readiness clearly:** State exactly what was validated (replication health, VPN connectivity, replica power-on test) and what is NOT guaranteed (application-level recovery, RTO, RPO) — this protects both Pete and the client
