# Case Study — SQL Server Failover Cluster Business Continuity Testing

## Project Summary
Client has an existing Windows Server Failover Cluster (WSFC) hosting SQL Server (FCI or Always On AG). Needs formal proof that HA works — zero or minimal service interruption during node failure.

## Phase I — Pre-Test Health Check (before you touch anything)
- Run Failover Cluster Validation Wizard (exclude storage impact tests if cluster is online/production)
- Inspect Windows Event Logs + SQL Server Error Logs for red flags: intermittent heartbeat loss, disk latency spikes, quorum warnings
- Verify Quorum Witness: Disk Witness or Cloud/File Share Witness online, votes assigned correctly
- Document current owner node, resource groups, and dependencies

## Phase II — Functional Failover Testing (simulates maintenance)
- Manual Node Move: move SQL Cluster Role from Node A to Node B via Failover Cluster Manager
- Measure freeze time: run a continuous connection loop script against the SQL instance during the move
- SPN & DNS Validation: verify Virtual Network Name (VNN) updates correctly in DNS, Kerberos auth persists
- Application reconnection: confirm apps using MultiSubnetFailover=True reconnect without manual intervention
- Move back to original node — repeat measurement

## Phase III — Resilience (Hard) Testing (simulates real failures)
- CRITICAL: take full tail-log backup + VM-level snapshot before this phase
- Must be done during a maintenance window
- Test 1: Stop ClusSvc (Cluster Service) on active node — triggers immediate failover
- Test 2: Disconnect heartbeat NIC — tests split-brain handling
- Test 3: Hard reboot (non-graceful restart) of active node
- Monitor and record behavior for each test

## Success Criteria
| Component | Target |
|---|---|
| Failover Duration | SQL services online on partner node within <30 seconds |
| Storage Persistence | Shared disks (CSV or Physical Disk) mount instantly on target node |
| IP/DNS Resolution | Cluster Virtual IP responds to pings within 2-3 seconds |
| App Reconnection | Apps with MultiSubnetFailover=True reconnect without manual intervention |

## Prerequisites
- Full tail-log backup + VM snapshot before Phase III
- Scheduled maintenance window for all testing
- Admin rights: Windows nodes, SQL Instance, Active Directory (DNS/computer object permissions)

## Deliverable: Cluster Validation & Resilience Report
1. Failover Timing Logs — exact duration of service unavailability per test
2. Configuration Gap Analysis — recommendations for tuning HealthCheckTimeout, FailureConditionLevel, LeaseTimeout
3. Formal HA Sign-off Document — confirmation that environment meets defined high availability requirements

## Key Lesson
If testing Always On AG instead of FCI, always monitor the Redo Queue size on secondaries. A large redo queue means significantly longer failover — SQL must finish processing those transaction logs before the secondary becomes primary. Also: never skip the pre-test health check. Clusters that look fine in the GUI can have intermittent heartbeat loss buried in the event logs — running a hard failover on those is asking for a split-brain disaster.
