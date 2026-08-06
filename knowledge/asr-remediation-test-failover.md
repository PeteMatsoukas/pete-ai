# Azure Site Recovery — Remediation & Test Failover Drill Plan

**Author:** Pete Matsoukas | TechByPete
**Category:** Azure / Disaster Recovery / VMware
**Related project scope:** Task #4 — Failover Testing and Validation
**Last updated:** August 2026

---

## Executive Summary

This runbook covers the end-to-end approach for validating an Azure Site Recovery (ASR) deployment where on-premises VMware VMs are replicated to an Azure Recovery Services Vault. It is written from a real customer engagement covering **14 protected VMs** where **3 VMs currently show replication issues** that must be resolved before test failover drills can begin.

The engagement follows a **remediation-first** approach:

1. Diagnose and resolve every replication health issue
2. Confirm all VMs in DR scope show `Healthy` status with green replication
3. Then — and only then — execute tiered test failover drills in an isolated Azure network
4. Validate each VM boots, is accessible, and its applications/roles work
5. Clean up and deliver a DR readiness report

This document is intended both as a client-ready deliverable narrative and as a hands-on operator playbook.

---

## Project Scope Context

The overall engagement covers five technical tasks. This runbook lives inside Task 4b.

| Task | Title | Status | Description |
|------|-------|--------|-------------|
| Task 2 | Azure Foundation Setup | Complete | Subscription, resource groups, hub-spoke networking, S2S & client VPNs |
| Task 3 | Security Deployment | Complete | Cisco FTDv/FMCv firewalls, NSGs, routing controls Azure ↔ on-prem |
| Task 4a | ASR Configuration | Complete | ASR replication from VMware to Azure, recovery plans, replication policies |
| **Task 4b** | **Remediation & Failover Testing** | **In Progress** | Resolve replication issues, then DR failover drill for all 14 VMs |
| Task 5 | Deliverables & Documentation | Upcoming | Architecture diagrams, test reports, operational runbooks, knowledge transfer |

---

## VM Inventory & Replication Status

The customer environment consists of 14 protected VMs replicating from VMware to Azure Central US region.

### Summary

| Metric | Count |
|--------|-------|
| Total VMs | 14 |
| Healthy | 11 |
| Critical — Resync Required | 2 |
| Protection Failed | 1 |

### Full Inventory

| Server Name | Role | Replication Health | Status | Target Config |
|-------------|------|-------------------|--------|---------------|
| SHEGDC01 | Domain Controller | Healthy | Protected | OK |
| SHEGDC02 | Domain Controller | Healthy | Protected | OK |
| SHABDC02 | Domain Controller | Healthy | Protected | OK |
| SHEGSQL04 | SQL Server | Healthy | Protected | OK |
| SHEGSAGE01 | Sage ERP / Accounting | Healthy | Protected | OK |
| SHEGIIS13 | IIS Web Server | Healthy | Protected | OK |
| SHEGIIS08 | IIS Web Server | Healthy | Protected | OK |
| SHEGIIS11 | IIS Web Server | Healthy | Protected | OK |
| SHRMFS01 | File Server | Healthy | Protected | OK |
| SHEGPFLX | Print Management | Healthy | Protected | OK |
| SHEGUTIL01 | Utility Server | Healthy | Protected | OK |
| **SHEGCTX01** | **Citrix Server** | **Critical** | **Protected** | **OK** |
| **SHEGSQL05** | **SQL Server** | **Critical** | **Protected** | **OK** |
| **SHABNESSUS** | **Nessus Scanner** | **Critical** | **Protection couldn't be enabled** | **OK** |

---

## Current Replication Issues — Detailed Analysis

Three VMs must be remediated before any test failover can proceed. Below is the exact error message from the ASR blade for each, what it means technically, and the likely root cause.

### 1. SHEGCTX01 (Citrix Server)

**Error message:**

```
"Recent crash consistent recovery point not available;
 Recent app consistent recovery point not available"
```

- **Replication Health:** Critical
- **Failover Health:** Warning
- **Status:** Protected (infrastructure is intact)

**What it means:**
ASR has failed to generate fresh recovery points within the target RPO window. Replication is behind schedule — the last usable snapshot is stale, so the VM cannot be failed over reliably. The Mobility Service agent is likely struggling to keep up with disk change tracking.

**Likely root cause:**
Mobility Service agent health issue, network latency to the process server, or high I/O on Citrix user profile disks.

---

### 2. SHEGSQL05 (SQL Server)

**Error message:**

```
"Data change rate beyond supported limits;
 Recent crash consistent recovery point not available"
```

- **Replication Health:** Critical
- **Failover Health:** Warning
- **Status:** Protected

**What it means:**
The VM is generating disk writes faster than ASR can replicate them to Azure. SQL transaction logs, tempdb activity, and data file writes exceed the churn rate that a single Mobility Service agent can handle. As a result, ASR cannot produce timely recovery points.

**Likely root cause:**
SQL write I/O > 10 MB/s per disk sustained, or > 25 MB/s aggregate — exceeds ASR churn limits for VMware.

**ASR Churn Limits Reference:**

| Metric | Limit per Disk | Aggregate per VM |
|--------|----------------|------------------|
| Sustained write throughput | ~10 MB/s | ~25 MB/s |
| Peak burst (short duration) | ~15 MB/s | ~54 MB/s |

If a workload exceeds these limits consistently, ASR classifies the VM as "data change rate beyond supported limits" and stops producing recovery points until the churn drops.

---

### 3. SHABNESSUS (Nessus Vulnerability Scanner)

**Error message:**

```
"Enable replication failed"
```

- **Replication Health:** Critical
- **Failover Health:** — (no health data)
- **Status:** Protection couldn't be enabled

**What it means:**
The initial `Enable Replication` job failed — this VM never began replicating and has no recovery points at all. Common causes are Mobility Service agent push-install failure, unsupported OS/disk config, or credential problems on the source VM.

**Likely root cause:**
Mobility Service agent failed to install (Linux-based Nessus appliance may have incompatible OS, or push-install credentials failed).

---

## Remediation Plan

All replication issues will be resolved and confirmed healthy before any test failover is initiated. The gate is: **no test failovers until all VMs in confirmed DR scope show Healthy replication with green status.**

---

### Remediation for SHEGCTX01

**Diagnostic path:**
`Portal → Recovery Services Vault → Replicated Items → SHEGCTX01 → Errors → view detailed replication events`

**Expected finding:** Mobility Service heartbeat failures, agent version drift, or process server → Azure upload lag.

**Step-by-step:**

1. **Verify Mobility Service on SHEGCTX01**
   Log into VM → `services.msc` → confirm `InMage Scout Application Service` is Running. Check `C:\ProgramData\ASR\agent\logs` for errors.

2. **Check Process Server health & connectivity**
   Portal → Site Recovery infrastructure → Configuration Servers → Process Servers → verify green heartbeat, CPU/memory/free space healthy.

3. **Restart Mobility Service on the VM**
   ```powershell
   Restart-Service InMage*
   ```
   Wait 5 minutes — ASR should attempt to re-establish the replication stream automatically.

4. **If still failing: trigger Resynchronize**
   Portal → Replicated Items → SHEGCTX01 → **Resynchronize** (top toolbar) → confirm. This forces a fresh delta baseline from the source.

5. **Monitor resync job to completion**
   Site Recovery Jobs blade → track progress. Duration depends on VM size — expect 1-4 hours for a typical Citrix server. Health flips to `Healthy` when done.

6. **Validate fresh recovery points appear**
   Replicated Items → SHEGCTX01 → Latest Recovery Points → confirm both crash-consistent (every 5 min) and app-consistent (hourly) points are current.

---

### Remediation for SHEGSQL05

**The specific challenge here is churn rate exceedance**, which requires different treatment than a simple resync.

**Step-by-step:**

1. **Measure current disk churn on SHEGSQL05**
   Run perfmon: `Logical Disk → Disk Write Bytes/sec` on each drive. Identify which disk exceeds 10 MB/s sustained.

   Alternative with PowerShell:
   ```powershell
   Get-Counter '\LogicalDisk(*)\Disk Write Bytes/sec' -Continuous -SampleInterval 5
   ```

2. **Reduce SQL write load if possible**
   Review non-critical jobs, index rebuilds, backup schedules. Coordinate with DBA to defer heavy write operations during the resync window. Move maintenance jobs (DBCC CHECKDB, index maintenance) outside the drill window.

3. **Consider excluding tempdb from replication**
   If tempdb is on a separate disk, disable replication on that disk in ASR policy — tempdb is recreated on failover anyway, so protecting it wastes bandwidth and pushes the VM over churn limits.

   Portal → Replicated Items → SHEGSQL05 → Compute and Network → Disks → toggle replication off for tempdb disk.

4. **Resynchronize + monitor**
   Trigger Resync from portal → monitor job → validate fresh recovery points appear once churn is under control.

**Long-term consideration:** If SQL05 continues to exceed churn limits even after tempdb exclusion, consider:
- Splitting the VM across multiple mobility service instances (not typically possible on the same VM)
- Using SQL Always On Availability Group to a separate DR VM instead of ASR
- Documenting an accepted higher RPO for this specific workload

---

### Remediation for SHABNESSUS

**Step-by-step:**

1. **Confirm DR requirement with customer**
   Vulnerability scanners are often redeployable from image — may be excluded from DR scope entirely, saving effort and cost. Ask: *"If Nessus is unavailable during a DR event, how long until you'd redeploy it, and does that meet your operational needs?"*

2. **If DR is required — check OS compatibility & prerequisites**
   Verify OS is in [ASR support matrix](https://learn.microsoft.com/azure/site-recovery/vmware-physical-azure-support-matrix). Confirm root/admin access, sufficient free space in `/tmp` or `C:\`, PowerShell/Python present.

3. **Review 'Enable replication' job log**
   Portal → Site Recovery Jobs → find the failed job → view detailed error. Common causes:
   - Agent push credential failure
   - Firewall blocking process server → source VM (TCP 135, 445, WMI)
   - Unsupported disk layout (dynamic disks, LVM edge cases)
   - Missing prerequisites on source (VMware Tools not current, etc.)

4. **Retry Enable Replication with fix**
   Correct the identified issue → Configuration Server → re-run Enable Replication → monitor initial replication (IR) to completion. IR can take several hours for large VMs — track progress in Site Recovery Jobs.

---

### Remediation Gate

> **No test failovers will be initiated until all VMs (in confirmed DR scope) show Healthy replication with green status.**

This is a hard gate. Attempting a test failover on a VM with stale or missing recovery points wastes cycles and produces unreliable validation results.

---

## What Is a Test Failover?

Once remediation is complete, the test failover drill can begin. A test failover is a **non-disruptive drill** that validates the DR plan without impacting production.

### Key benefits

- **Zero production impact** — Test VMs spin up in an isolated Azure VNet with no connectivity to on-premises or production systems
- **Boot validation** — Confirms each VM starts successfully, OS loads, and RDP login is accessible
- **Replication continues** — On-premises VMware VMs keep replicating normally during the entire drill
- **Full cleanup** — After validation, all test resources are deleted via ASR cleanup, leaving no residual Azure cost

### Why it matters

Replication alone gives a false sense of readiness. Healthy replication status only proves data is flowing to Azure — it does not prove that VMs can actually boot, be authenticated to, or serve their workloads once failed over. A test failover is the only way to prove recoverability end-to-end.

---

## Pre-Drill Checklist

### Our Team Responsibilities

- [ ] Complete remediation — all VMs in DR scope showing Healthy
- [ ] Verify recovery points on all VMs (recent crash-consistent and app-consistent)
- [ ] Create isolated test virtual network in Azure (`vnet-asr-dr-test`)
- [ ] Configure NSG rules on test subnet (RDP 3389 from authorized IPs only)
- [ ] Prepare boot validation procedure
- [ ] Define test failover execution order (see tiered plan below)
- [ ] Document expected test cost estimate

### Customer Responsibilities

- [ ] Confirm whether SHABNESSUS needs DR protection (may be excluded)
- [ ] Confirm final DR VM scope (13 or 14 VMs)
- [ ] Provide local admin credentials for each VM
- [ ] Approve the test failover maintenance window
- [ ] Identify key apps/roles to validate per VM (AD DS, SQL, Sage, Citrix, IIS, file shares, print queues)
- [ ] Designate a point of contact during the drill (Teams/phone)
- [ ] Review and approve Azure test cost estimate

---

## Test Failover Execution Order

Once all VMs show Healthy replication, the drill executes in tiered order — dependencies first, dependents last.

### Tier 1: Domain Controllers
**VMs:** SHEGDC01, SHEGDC02, SHABDC02
**Rationale:** Identity foundation — must come up first. Even in isolation, DCs need to boot cleanly and AD DS services must load.

### Tier 2: Database Servers
**VMs:** SHEGSQL04, SHEGSQL05 (post-fix)
**Rationale:** SQL Servers — app tier depends on database availability.

### Tier 3: Application Servers
**VMs:** SHEGSAGE01, SHEGCTX01 (post-fix)
**Rationale:** Sage ERP + Citrix — core business systems.

### Tier 4: Web Servers
**VMs:** SHEGIIS13, SHEGIIS08, SHEGIIS11
**Rationale:** IIS web apps — may depend on SQL backend.

### Tier 5: Infrastructure
**VMs:** SHRMFS01, SHEGPFLX, SHEGUTIL01, SHABNESSUS* (*if confirmed for DR)
**Rationale:** File server, print management, utility, scanner — last tier.

**Note:** Post-fix VMs (SHEGSQL05, SHEGCTX01, SHABNESSUS) are drilled alongside healthy VMs in their respective tiers in one pass, once all show Healthy status.

---

## DR Drill Failover Sequence — Visual Reference

```
PHASE 1: IDENTITY & CORE       →  PHASE 2: DATABASE LAYER
Establish AD, DNS, & Auth.         Initialize DB Services
[OK] SHABDC02                      [OK] SHEGSQL04
[OK] SHEGDC01                      [OK-Post-Fix] SHEGSQL05
[OK] SHEGDC02

                                   ↓

PHASE 4: FILES & SERVICES      ←  PHASE 3: APPLICATION & WEB
Bring up remaining systems         Start Apps & Frontends
[OK] SHRMFS01                      [OK] SHEGIIS08, IIS11, IIS13
[OK] SHEGUTIL01                    [OK] SHEGPFLX, SHEGSAGE01
[OK-Post-Fix] SHABNESSUS           [OK-Post-Fix] SHEGCTX01

Legend:
[OK]          Healthy — Azure Site Recovery status
[OK-Post-Fix] Health Restored — validation confirmed for drill
```

Sequence validated with isolated test network (`vnet-asr-dr-test`). Critical VMs status: Remediation confirmed.

---

## Test Failover Process — Step by Step

### Steps 1-3: Provisioning

**Step 1 — Select VM & Recovery Point** *(Our Team)*
In the Recovery Services Vault, navigate to the replicated item. Select the target VM and choose the most recent crash-consistent or app-consistent recovery point.

**Step 2 — Initiate Test Failover** *(Our Team)*
Click **Test Failover** on the replicated item. Select the isolated test VNet (no production connectivity). Azure provisions a test VM from the recovery point.

**Step 3 — Wait for VM Provisioning** *(Our Team)*
ASR creates the test VM, attaches disks, configures networking in the isolated VNet. Typically 5-15 minutes per VM depending on disk size.

### Steps 4-6: Validation & Cleanup

**Step 4 — Validate VM Boot & OS Login** *(Joint — Our Team + Customer)*
Connect via RDP. Verify Windows boots to desktop, check Event Viewer for critical errors, confirm hostname and IP in the isolated VNet.

**Step 5 — Validate Applications & Roles** *(Joint — Our Team + Customer)*
Confirm key services — AD DS/DNS on DCs, SQL on SHEGSQL04/05, Sage on SHEGSAGE01, Citrix on SHEGCTX01, IIS sites, file shares.

**Step 6 — Cleanup Test Failover** *(Our Team)*
Initiate **Cleanup test failover** in ASR. Deletes test VM, disks, and NICs. Replication remains active and unaffected.

---

## Technical Deep Dive — Azure Portal Walkthrough

### A. Navigate to Recovery Services Vault
`Portal → Recovery Services Vaults → [Vault Name] → Replicated Items`
Replicated Items blade shows all 14 VMs with replication health, status, and recovery point timestamps.

### B. Select the Target VM
`Replicated Items → [VM Name] → Overview blade`
Review replication health (must be Healthy / green), latest recovery point age, RPO, and target config.

### C. Click 'Test Failover'
`Overview blade → Test Failover button (top toolbar)`
Opens the Test Failover config pane. No production resources are touched — read-only until you confirm.

### D. Select Recovery Point
`Test Failover pane → Recovery Point dropdown`

- **Latest processed** — Crash-consistent, lowest RTO (~5 min)
- **Latest app-consistent** — VSS flush, guarantees app integrity (~10 min RTO) — **recommended for DCs, SQL, Sage, Citrix, IIS**
- **Custom / Point-in-Time** — Specific historical point (variable RTO) — for rollback testing

### E. Select Isolated Test Network
`Test Failover pane → Azure virtual network → vnet-asr-dr-test`

**Critical:** dedicated test VNet with no peering, VPN, or ExpressRoute. Zero production impact.

### F. Confirm & Monitor Job
`Click OK → Site Recovery Jobs blade`
ASR provisions test VM (disk attach, NIC config). Monitor in real time. Expected: 5-15 min per VM.

Repeat steps A–F for each VM in the tier, following the execution order.

---

## Recovery Point Options Explained

| Type | RTO | Description | Use for |
|------|-----|-------------|---------|
| **Latest Processed** | ~5 min (Lowest) | Most recent point processed by ASR. Crash-consistent — equivalent to a power-off snapshot. Fast, no app-level guarantee. | File servers, utility, print VMs |
| **Latest App-Consistent** | ~10 min (Low) | Most recent app-consistent point. VSS flush ensures transactions are committed. Database and application integrity guaranteed. | DCs, SQL, Sage, Citrix, IIS |
| **Custom / Point-in-Time** | Variable | A specific historical recovery point. Useful for testing rollback scenarios or validating a known-good state. | Specific test scenarios only |

**Recommendation:** Latest App-Consistent for all database and application VMs — crash-consistent for infrastructure VMs.

---

## Isolated Test Network Architecture

| Property | Value |
|----------|-------|
| VNet Name | `vnet-asr-dr-test` |
| Region | Azure Central US (same as target) |
| Address Space | Dedicated — non-overlapping CIDR |
| Subnet | `snet-dr-test` (test VMs land here) |
| VPN / ExpressRoute | None — fully isolated |
| VNet Peering | None — no connectivity to production |
| NSG (Inbound) | RDP (3389) from authorized IPs only |
| NSG (Outbound) | Internet allowed for activation/updates |
| Public IP | Temporary PIP per VM (or use Azure Bastion) |
| DNS | Azure-provided (isolated from on-prem DNS) |

**Why isolation matters:**
If the test VNet had connectivity to production, the test DCs would create AD replication conflicts with production DCs, IIS servers would try to connect to production SQL databases, and test file servers might attempt DFS namespace registration. Full isolation prevents all of these failure modes.

---

## Post-Boot VM Validation — What We Check Inside Each VM

### Step 1: Connect to Test VM

- `Azure Portal → Virtual Machines → [test-VM] → Connect → RDP`
  Download RDP file (or use Bastion if deployed)
- Login with customer-provided **local admin credentials**
  Domain login will fail in isolation — local accounts only
- If RDP fails: check NSG → confirm port 3389 → verify PIP attached
  Fallback: Azure Serial Console for boot diagnostics

### Step 2: OS & System Health

- `hostname` → verify correct server name persisted
  Confirms VM identity survived replication
- `ipconfig /all` → confirm NIC attached, IP assigned by Azure DHCP
  DNS will point to Azure DNS (168.63.129.16) — expected
- `eventvwr.msc` → System & App logs → filter Critical/Error last 1hr
  Ignore domain trust errors (expected in isolation)
- `services.msc` → verify key services running (not stopped/disabled)
  Watch for failed starts due to missing dependencies

### Step 3: Role-Specific Validation

**Domain Controllers (SHEGDC01, SHEGDC02, SHABDC02):**
```cmd
dcdiag /s:localhost
```
Verify NTDS, DNS Server, Netlogon services running. Partner errors are expected in isolation.

**SQL Server (SHEGSQL04, SHEGSQL05):**
Open SSMS → connect to `localhost` → verify databases online, not suspect. Check SQL Server Agent, DB engine, SSRS if applicable.

**IIS Web Servers (SHEGIIS08, SHEGIIS11, SHEGIIS13):**
```cmd
iisreset /status
```
IIS Admin + W3SVC services must be running. Browse `http://localhost`. Sites may error on DB connection (isolated) — IIS itself must load.

**Citrix Server (SHEGCTX01):**
Verify Citrix services started, Delivery Controller reachable. Full session test unlikely in isolation — service layer validation only.

**Sage ERP (SHEGSAGE01):**
Verify Sage services started, application folder/data files intact. Full app test may need SQL — validate service layer.

**File Server (SHRMFS01):**
```cmd
net share
```
Confirm shares exist, browse test path. Verify NTFS permissions. DFS namespaces will be broken in isolation — expected.

---

## Validation & Acceptance Criteria

Each VM must pass all applicable checks to be marked as DR-validated.

### OS & Boot
- [ ] VM powers on in expected time
- [ ] Windows boots to login screen
- [ ] RDP connection succeeds
- [ ] Correct hostname assigned
- [ ] No critical Event Viewer errors

### Network & Identity
- [ ] NIC attached and has IP
- [ ] DNS resolution in test VNet
- [ ] Domain trust errors expected (isolated environment)
- [ ] Firewall rules functional

### Applications & Roles
- [ ] AD DS / DNS on DC VMs
- [ ] SQL on SHEGSQL04 and SHEGSQL05
- [ ] Sage on SHEGSAGE01
- [ ] Citrix on SHEGCTX01
- [ ] IIS sites on web servers
- [ ] Shares on SHRMFS01
- [ ] Customer sign-off per VM

---

## Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **1. Remediation** | Days 1-2 | Resolve SHEGCTX01 + SHEGSQL05 resync. Troubleshoot SHABNESSUS enablement. Confirm all VMs Healthy. |
| **2. Preparation** | Days 2-3 | Credential collection, test VNet provisioning, cost estimate approval, pre-drill checklist completion. |
| **3. Test Failover — All 14 VMs** | Days 4-5 | Execute per tier: DCs → SQL → Citrix/Sage → IIS → File/Print/Utility. Validate boot + login per VM. |
| **4. Validation & Reporting** | Days 5-6 | Customer validates apps/roles on each test VM. Joint sign-off. Cleanup all test resources. Deliver DR report. |

**Estimated total duration:** 5-6 business days
**Production downtime:** Zero

---

## Immediate Action Items

| # | Action | Owner |
|---|--------|-------|
| 1 | Our team begins remediation of SHEGCTX01, SHEGSQL05, and SHABNESSUS immediately | Our Team |
| 2 | Customer to confirm whether SHABNESSUS (Nessus) requires DR protection | Customer |
| 3 | Customer to provide VM credentials and application validation checklist | Customer |
| 4 | Agree on maintenance window for the test failover drill (post-remediation) | Joint |
| 5 | Our team provisions isolated test VNet and completes pre-drill checks | Our Team |
| 6 | Execute test failovers for all 14 VMs, validate, deliver DR readiness report | Our Team |

---

## Ongoing Operational Recommendations

Once the initial drill is complete and DR readiness is validated, the following practices should become standard:

- **Quarterly DR drills** — Run a full test failover every 3 months. Rotate the recovery point selected (latest, 24hr old, 7 days old) to validate longer retention.
- **Monthly replication health review** — Review replication health monthly. Any VM showing warnings gets remediated before it becomes critical.
- **RPO/RTO reporting** — Monthly report showing actual RPO/RTO achieved per VM against SLA targets.
- **Churn monitoring for high-write VMs** — SHEGSQL05 (and any similar high-I/O workloads) should be monitored continuously so the customer catches churn-limit exceedance before it stalls replication.
- **Recovery plan versioning** — Any change to production VM inventory (new servers, decommissioned, role changes) triggers a review of the ASR recovery plan.

---

## References

- [Azure Site Recovery documentation](https://learn.microsoft.com/azure/site-recovery/)
- [VMware to Azure support matrix](https://learn.microsoft.com/azure/site-recovery/vmware-physical-azure-support-matrix)
- [ASR test failover overview](https://learn.microsoft.com/azure/site-recovery/site-recovery-test-failover-to-azure)
- [Troubleshoot replication issues in ASR](https://learn.microsoft.com/azure/site-recovery/vmware-azure-troubleshoot-replication)
- [Recovery point types (crash vs app-consistent)](https://learn.microsoft.com/azure/site-recovery/vmware-azure-multi-vm-consistency)

---

*Published on TechByPete — real-world Azure and hybrid infrastructure runbooks from the field.*
