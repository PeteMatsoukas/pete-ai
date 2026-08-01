# Server Consolidation — Physical Workstations to Hyper-V on Dell PowerEdge

**Domain:** Windows Server · Virtualization · Infrastructure · Hyper-V
**Specialist:** Windows Server SA / VMware SA
**Use when:** A client wants to consolidate physical desktop-class systems or workstations into virtual machines, asks about Hyper-V deployment on a new server, wants to migrate legacy line-of-business applications to a virtualized platform, or needs to clean up shelf-based or ad-hoc physical infrastructure into a proper rack-mounted server. Also relevant when a client runs SQL Server Express, payroll, accounting, or tax software on aging workstations that need a more supportable platform.

---

## Engagement Profile

**Type:** Physical-to-virtual (P2V) consolidation — 2 workstations → 2 VMs on new Hyper-V host
**Source:** 2 standalone Windows 10 desktop-class systems on shelving (non-rack)
**Target:** Dell PowerEdge R660 1U rack server running Microsoft Hyper-V
**Applications:** Payroll/accounting (SQL Server Express, EFTPS), tax/LOB software suite
**OS target:** Windows 11 or Windows Server (pending application compatibility validation)
**Effort:** 32 hours Tier-II engineering + 4 hours PMO
**Hardware:** Dell PowerEdge R660 1U (final spec per approved hardware quote)
**Licensing:** Windows Server (host) + Windows 11 Pro x2 (if guest design confirmed)

---

## When to Recommend This Pattern

Recommend physical-to-virtual consolidation when a client:
- Runs business-critical applications on desktop-class hardware (workstations, mini PCs, NUCs)
- Has shelf-based or non-rack systems in a server room or IT closet
- Wants to reduce hardware footprint, improve supportability, and simplify backup
- Is approaching end-of-life on Windows 10 and needs a migration path
- Runs legacy LOB applications (payroll, accounting, tax, ERP) that need isolation but don't justify separate physical servers
- Has a rack environment with available 1U space
- Wants to improve disaster recovery readiness (VMs are easier to back up and restore than physical systems)

**Key qualifying questions:**
- "Are any of your business-critical applications running on desktop PCs or workstations instead of proper servers?"
- "How would you recover if one of those PCs failed today?"
- "Do you have a rack environment we could install a server into?"
- "Have you confirmed with your application vendor that the software is supported on Windows 11 or Windows Server?"
- "Do you have active support agreements with your application vendors?"

---

## Current Environment — Reference Profile

| System | Role | CPU | RAM | Storage | Applications |
|---|---|---|---|---|---|
| Workload System 1 | Payroll / accounting | 4 physical / 8 logical cores | 16 GB | 1 TB | SQL Server Express 2014, accounting app components, EFTPS batch processing client |
| Workload System 2 | Tax / LOB | 8 physical / 16 logical cores | 16 GB | 500 GB | Tax preparation / LOB software suite |

**Environment also includes:** Existing 10G-capable switch for host connectivity integration.

**Physical situation:** Both systems on shelving — not rack-mounted. This is a common SMB pattern where systems were added ad-hoc without a proper server platform.

---

## Proposed Virtual Machine Design

| VM | Purpose | vCPU | RAM | Storage | Target OS |
|---|---|---|---|---|---|
| Payroll-VM | Payroll / accounting workload | 8 cores | 16 GB | 1 TB | Windows 11 (pending compatibility validation) |
| LOB-VM | Tax / LOB workload | 8 cores | 16 GB | 500 GB | Windows 11 or Windows Server (pending validation) |

**OS target determination:** Final OS is confirmed after application vendor compatibility validation — not before. Never assume Windows 11 compatibility for legacy LOB/tax/payroll software without vendor confirmation.

---

## Scope of Services (included)

**Discovery & Planning:**
- Review source systems and application dependencies
- Confirm migration approach (P2V conversion vs. clean-build VM)
- Validate storage, compute, and network requirements
- Compatibility validation based on vendor-provided information

**Server Deployment:**
- Install and configure Dell PowerEdge R660
- Install and configure Microsoft Hyper-V
- Configure base host settings for production readiness

**VM Build & Migration:**
- Create virtual machines per approved design
- Migrate or convert physical systems to VM (P2V or clean build)
- Allocate CPU, memory, storage per design
- Configure guest OS per validated target state

**OS Upgrade:**
- Upgrade guest OS from Windows 10 to Windows 11 where supported and approved
- Deploy alternative supported OS if compatibility findings require it

**Networking:**
- Configure host connectivity to existing 10G switch
- Configure Hyper-V virtual networking (Switch Embedded Teaming where applicable)
- Validate LAN connectivity for host and all guest VMs

**Physical / Rack Work:**
- Install R660 into existing rack environment
- Remove shelf-based source systems from active production placement
- Improve cabling organization

**Testing & Validation:**
- Validate VM boot and basic operation
- Validate application functionality at basic operational level (with client participation)
- Validate network connectivity (host, VMs, LAN)

**Documentation:**
- VM configuration
- Storage allocation
- Network connectivity
- High-level deployed architecture

---

## Effort Estimate

| Service Category | Estimated Hours |
|---|---|
| Tier-II Engineering | 32 |
| Project Management / Coordination | 4 |
| **Total** | **36 hours** |

---

## Hardware & Licensing

| Item | Notes |
|---|---|
| Dell PowerEdge R660 1U | Final spec per approved hardware quote |
| Windows Server licensing | For Hyper-V host and/or guest OS as required |
| Windows 11 Professional x2 | If approved design uses Windows 11 guests |

---

## P2V vs. Clean-Build — Decision Guide

| Approach | When to Use | Trade-offs |
|---|---|---|
| **P2V conversion** | Application is complex to reinstall, no clean install media, time-critical | Faster; carries over any existing issues/bloat from source OS |
| **Clean-build VM** | Application vendor supports fresh install, Windows 10 → Windows 11 upgrade desired | Cleaner result; requires application reinstall + data migration; more time |

**Pete's recommendation:** Default to P2V for legacy LOB/payroll/tax applications where reinstallation risk is high. Propose clean-build only when the application vendor explicitly supports it and the client can tolerate longer downtime. Confirm migration approach per workload before project start — don't assume both use the same method.

---

## Key Assumptions

- Client obtains application vendor confirmation for Windows 11/Server compatibility before project execution
- Active software support agreements in place for all affected applications
- Client provides all installers, licenses, product keys, media, credentials, and vendor contacts
- Rack environment has sufficient physical space, power, and cooling for the R660
- Existing LAN switch is functional and supports intended host connectivity
- Work performed during agreed business hours or maintenance windows
- Backup changes for new host and VMs reviewed during implementation — new VMs may require new backup configuration (not assumed to be in existing backup scope)

---

## Out of Scope

- Third-party software vendor troubleshooting beyond initial compatibility testing
- Remediation of unsupported or incompatible applications (vendor responsibility)
- Software vendor professional services or escalation fees
- Disposal or physical asset disposition of legacy desktop systems
- After-hours work unless specifically approved
- Backup platform redesign beyond adding new host/VMs
- End-user training beyond basic handoff validation
- Unrelated server, domain, or application modernization work

---

## Risks

- **Legacy application compatibility:** SQL Server Express 2014, EFTPS, and tax/payroll software often have strict OS compatibility requirements. Windows 11 or Server support is not guaranteed — always validate with vendors before committing to the OS target.
- **P2V conversion risk:** Some applications (especially those with hardware-bound licensing, dongle activation, or machine-name dependencies) can break during P2V conversion. Test activation and functionality in the VM before decommissioning the source.
- **SQL Server Express 2014 EOL:** SQL Server Express 2014 reached end of extended support in July 2024. If it's running on the migrated VM, it's an unsupported component — document this risk and flag it to the client.
- **Backup gap:** If VMs are newly created rather than converted, they won't be in the existing backup scope automatically. Confirm backup configuration is updated as part of handover.
- **Licensing procurement timing:** Hardware and Windows Server licensing procurement can add 1–2 weeks before project start. Confirm procurement path early.
- **Rack readiness:** Confirm physical space, power circuit availability, and cable management before scheduling installation. Rack surprises on implementation day are common.

---

## Acceptance Criteria

1. Dell PowerEdge R660 installed and configured as Hyper-V host
2. Both workloads migrated or rebuilt as approved VMs
3. Target guest OS deployed and validated per approved design
4. VMs operational and accessible on client network
5. Basic application validation completed with client participation
6. Server integrated into rack environment
7. High-level documentation delivered

**Note:** Application-specific business process validation (payroll runs, tax processing, EFTPS submissions) remains the client's and application vendor's responsibility — not included in IT provider acceptance criteria.

---

## Next Steps to Finalize

- [ ] Confirm final R660 hardware specification and approve quote
- [ ] Validate OS support with all relevant software vendors (payroll, accounting, tax)
- [ ] Confirm migration approach per workload (P2V vs. clean-build)
- [ ] Confirm backup requirements for new host and VMs
- [ ] Finalize project schedule and maintenance window
- [ ] Approve final quote and procurement list

---

## Pete's Delivery Notes

- **Application vendor confirmation is a hard prerequisite — not optional** — commit to the OS target only after written confirmation from the payroll and tax software vendors. These application categories are notorious for strict compatibility requirements and delayed support for new Windows versions.
- **SQL Server Express 2014 is end of life** — flag this to the client at kickoff. The migration is a good moment to discuss upgrading to a supported SQL version. It doesn't have to be in this SOW, but it should be on the roadmap.
- **Test activation before decommissioning the source systems** — especially for applications with machine-specific licensing (common in payroll and tax software). Confirm the application activates correctly in the VM, processes a test transaction, and connects to any required external services (EFTPS) before declaring success.
- **Backup must be explicitly scoped** — new VMs are not in any existing backup job unless someone adds them. This is the most common post-project support call: "my backup report shows the new server isn't being backed up." Add VM backup configuration to the handover checklist.
- **The rack cleanup is a visible win** — clients notice when the shelf-based "stack of old computers" disappears and a clean 1U server takes its place. Photograph before and after — it's a good case study visual.
- **Clean-build is better long-term, P2V is lower-risk short-term** — if the client can tolerate the application reinstall effort and the vendor supports it, a clean-build VM on Windows 11 is a stronger foundation than carrying over a P2V of a Windows 10 system with years of accumulated state.
