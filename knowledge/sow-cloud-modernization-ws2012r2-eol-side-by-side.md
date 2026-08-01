# Cloud Infrastructure Modernization — Windows Server 2012 R2 EOL Side-by-Side Migration

**Domain:** Azure Infrastructure · Windows Server · Migration · SQL Server · Remote Desktop Services · File Services
**Specialist:** Azure SA / Windows Server SA
**Use when:** A client runs Windows Server 2012 R2 VMs that have reached end of life, wants to modernize to Windows Server 2022/2025 in the cloud, needs a side-by-side migration strategy, asks about cloud VM sizing for a multi-role server environment, or has legacy RDS/remote desktop infrastructure that needs replacing. Also use when a client has on-premises VMs they want to move to Azure without a direct lift-and-shift of old OS images.

---

## Engagement Profile

**Type:** Side-by-side cloud modernization — legacy on-prem VMs → new cloud VMs (Windows Server 2022/2025)
**Source:** On-premises virtualization platform (Windows Server 2012 R2 VMs — EOL)
**Target:** Public cloud (Azure) — clean new VMs, no legacy OS carry-forward
**Strategy:** Side-by-side (new VMs built clean, workloads migrated, legacy powered off after validation)
**Workloads:** Database (SQL), document/app server, 2x remote session hosts, file server, utility/app servers
**Estimated monthly cloud cost:** ~$2,510/month (compute) + ~$525/month (storage + backup) = **~$3,035/month total**
**Professional services:** Per approved project estimate (infrastructure engineering + PMO)

---

## When to Recommend This Pattern

Recommend cloud modernization via side-by-side migration when a client:
- Runs Windows Server 2012 R2 (EOL July 2023 — no security patches without ESU)
- Has on-premises VMs they want to move to cloud without modernizing hardware
- Cannot tolerate in-place OS upgrades due to application compatibility risk
- Has an existing Azure subscription with virtual network and cloud-hosted domain controllers already in place
- Has third-party LOB application vendors who need to perform their own application migration steps
- Wants a clean long-term foundation (no legacy OS baggage carried forward to cloud)

**Key qualifying questions:**
- "Are you running Windows Server 2012 or 2012 R2 anywhere in your environment?"
- "Do you have active ESU (Extended Security Updates) coverage for those servers, or are they unpatched?"
- "Do you already have an Azure subscription with networking and Active Directory set up?"
- "What applications run on those servers, and do the vendors support Windows Server 2022 or 2025?"
- "Are your application vendors able to perform the application migration themselves, or is that expected to be in IT scope?"

**Critical prerequisite:** Cloud foundation (subscription, VNet, cloud-hosted domain controllers, site-to-site VPN) must be operational before project start. This SOW does not include building the Azure foundation — scope that separately if it doesn't exist.

---

## Solution Architecture

### Migration Strategy — Side-by-Side (not lift-and-shift, not in-place upgrade)

| Approach | Risk | Result |
|---|---|---|
| **In-place upgrade** (2012 R2 → 2022) | High — application compatibility, failed upgrades | Legacy config/issues carried forward |
| **Lift-and-shift** (copy VM image to cloud) | Medium — old OS in cloud, still EOL | No modernization benefit |
| **Side-by-side** ✅ | Low — legacy environment stays live during build | Clean new OS, no legacy baggage |

**Side-by-side approach:**
1. New cloud VMs provisioned clean on Windows Server 2022/2025
2. Infrastructure, data, and services migrated to new VMs
3. Legacy on-premises VMs remain live during build, testing, and validation
4. Production cutover only after target environment fully validated
5. Legacy VMs powered off after 7 days of clean production operation

### Workload Inventory & Cloud VM Sizing

| Role | VM Size | Specs | Est. Monthly Cost |
|---|---|---|---|
| Database Server | General-purpose | 4 vCPU / 32 GB | $372 |
| Document / Application Server | Compute-optimized | 8 vCPU / 32 GB | $526 |
| Remote Session Host 1 | General-purpose | 4 vCPU / 16 GB | $263 |
| Remote Session Host 2 | General-purpose | 4 vCPU / 16 GB | $263 |
| File Server | General-purpose | 4 vCPU / 16 GB | $263 |
| Utility / Application Server | General-purpose | 2 vCPU / 8 GB | $131 |
| Monitoring / App Servers (x2) | Small general-purpose | 2 vCPU / 8 GB each | $263 |
| Storage + Backup | 2.5 TB premium + backup vault | Zone-redundant | $525 |
| **Total** | | | **~$2,606–$3,035/month** |

**Reserved capacity savings:**
- 1-year commitment: ~40% savings on compute
- 3-year commitment: ~60% savings on compute
- Always present reservation options — for a ~$2,500/month compute bill, 1-year reserved saves ~$1,000/month

### Storage & Backup

| Component | Detail | Redundancy | Est. Monthly |
|---|---|---|---|
| Managed Storage | 2.5 TB premium provisioned | Zone-redundant | ~$315 |
| Backup Services | 8 protected instances + vault | Zone-redundant | ~$210 |
| **Subtotal** | | | **~$525/month** |

---

## Scope of Services (included)

**Discovery & Planning:**
- Technical discovery of current environment
- Inventory: SQL databases, service accounts, application dependencies, server roles
- Confirm new VM inventory and workload placement

**Cloud VM Provisioning:**
- Deploy required VMs in approved Azure region
- Configure base OS (Windows Server 2022 / 2025)
- Prepare instances for workload migration

**Identity & Domain Integration:**
- Join all new VMs to existing directory environment
- Validate communication with cloud-hosted domain controllers
- Configure Group Policy processing for new OS versions

**Database Infrastructure:**
- Deploy clean modern SQL platform on designated target server
- Restore/migrate production SQL data with integrity validation
- Update internal application connection references and DNS

**Remote Session Hosts:**
- Deploy and configure 2 new remote session host servers
- Configure remote access environment for secure user connectivity
- Replace legacy RDS infrastructure

**File Services Migration:**
- Migrate file shares and data from legacy file server
- Preserve NTFS permissions, folder structure, file metadata using replication tooling

**Testing & Validation:**
- Infrastructure validation for new server environment
- Network communication and routing validation
- Support user acceptance testing for migrated services
- Delta synchronization before final cutover

**Final Cutover:**
- Final data sync during approved maintenance window
- Production cutover support
- Power down legacy on-premises VMs after successful cutover
- As-built documentation delivery

---

## Out of Scope

- Migration of on-premises domain controllers
- Migration of physical host hardware
- Application upgrades, migrations, or configuration — **application vendor responsibility**
- Modification of application source code
- Software vendor consulting fees or support costs
- End-user workstation support or printer troubleshooting
- Business process validation beyond infrastructure readiness testing
- Broader enterprise network redesign beyond what supports new cloud workloads
- Unrelated cloud governance, security, or compliance projects

**Critical scoping note — application vendor boundary:**
The IT provider's responsibility is to prepare and validate the cloud infrastructure platform. All application-layer migration, configuration, and testing is the application vendor's responsibility. This boundary must be clearly defined in writing before project start — scope disputes at this boundary are the most common source of project overruns in this engagement type.

---

## Key Assumptions

- Site-to-site VPN between client site and Azure is already operational
- Cloud-hosted directory controllers are healthy, synchronized, and capable of supporting new workloads
- Azure subscription, networking, and identity architecture already exist and are suitable
- All LOB/third-party application migration handled by software vendors with active support agreements
- Client provides all administrative access, credentials, licensing, and decision-making support
- Client coordinates vendor engagement and provides timely vendor access
- Legacy environment remains live until cutover is fully validated (no early decommission)

---

## Risks

- **Application vendor responsiveness** is the #1 schedule risk — if vendors are slow to migrate their applications, the infrastructure is ready but production cutover is blocked. Set vendor milestone dates at kickoff.
- **Application compatibility with Windows Server 2022/2025** — validate with all vendors before project start. Some legacy LOB applications explicitly support only specific Windows Server versions.
- **Cloud pricing changes** — Azure pricing can change between planning and deployment. Lock in estimates with a reservation analysis before budget approval.
- **Final data volumes** — storage growth between sizing and cutover may require VM or storage adjustments. Build 20–30% headroom into initial storage sizing.
- **DNS and identity dependencies** — name resolution, DNS suffix search order, and Kerberos authentication behavior can differ between on-prem-joined and cloud-joined VMs. Test thoroughly before cutover.
- **Rollback dependency** — the legacy environment must remain intact until the 7-day post-cutover validation period is complete. Do not decommission on-prem VMs early.

---

## Acceptance Criteria

1. New cloud VMs provisioned and domain-joined to directory environment
2. Windows Server 2022/2025 deployed on all target servers
3. Production SQL data and file data migrated with integrity validation
4. New remote session host environment operational
5. Users access applications and services through new cloud infrastructure (subject to vendor-completed application migration)
6. Legacy on-premises VMs powered off for **7 consecutive days** without requiring rollback
7. As-built documentation delivered

---

## Cost Conversation Framework (for client presentations)

**On-premises comparison:**
- Windows Server 2012 R2 hardware refresh cost + new server licensing + setup services
- vs. cloud monthly OpEx with no hardware refresh cycle, built-in redundancy, and zone-redundant backup

**Risk framing:**
> "Windows Server 2012 R2 is no longer receiving security patches unless you're paying for Extended Security Updates, which run approximately $0.10–0.20/vCPU/hour for year 3. At that point, you're paying to keep insecure servers running. Modernizing to cloud eliminates that exposure and gives you a supportable, patchable platform going forward."

**Reserved instance framing:**
> "If we commit to a 1-year reserved instance model, your monthly compute cost drops by approximately 40%. On a $2,500 compute bill, that's roughly $1,000/month saved — the reservation pays for itself in professional services within a few months."

---

## Pete's Delivery Notes

- **The 7-day post-cutover validation gate is non-negotiable** — don't power off legacy VMs until 7 clean days in production. This is the rollback window. Clients who want to decommission immediately to save costs are taking a real risk — hold the line on this.
- **Application vendor coordination starts at kickoff, not at cutover** — get vendor contacts, support case numbers, and migration commitments in week 1. Discovering at cutover that a vendor "needs 4 weeks to migrate their application" collapses the timeline.
- **DNS cutover is the highest-risk moment** — when you update DNS to point to the new cloud server IPs, everything that was hardcoded to old IPs breaks simultaneously. Audit application config files, connection strings, and GPO references for hardcoded IPs before cutover.
- **File migration tooling matters** — Robocopy with `/COPYALL /MIR /SEC` is the baseline for NTFS permission preservation. For large datasets (multi-TB), use a delta-sync approach (initial copy weeks before cutover, delta sync at cutover) to minimize the maintenance window.
- **Remote session host deployment order** — deploy both RDS hosts before migrating users. Single-host RDS is a single point of failure; always validate load balancing between the two hosts before go-live.
- **As-built documentation is a trust asset** — deliver it within 5 business days of cutover. Clients who receive clean, accurate as-built documentation at project close reference it for years and associate that quality with Pete.
