# Case Study — Windows Hybrid-Join Intune Enrollment (40 Devices)

## Project Summary
Scenario: 40 company-owned Windows devices, Hybrid Azure AD Joined (AD DS + Entra ID synced via Entra Connect). No MDM in place — needed centralized management, compliance, and security baselines. Fee: $3,500 fixed. Timeline: 2 weeks.

## Approach
GPO-triggered auto-enrollment — zero-touch, no re-imaging, no user action, no SCCM dependency. Fastest path because Entra ID Hybrid Join is already done.

## Phase I — Tenant Readiness (Day 1-2)
- Confirm Intune is set as MDM Authority
- Configure MDM User Scope in Entra ID (pilot group or All)
- Validate EnterpriseRegistration and EnterpriseEnrollment DNS CNAMEs
- Verify Hybrid Join status on all 40 devices: dsregcmd /status (AzureAdJoined: YES + DomainJoined: YES)

## Phase II — GPO Engineering (Day 3-5)
- Create GPO: Computer Config > Admin Templates > Windows Components > MDM > Enable automatic MDM enrollment using default Microsoft Entra credentials
- Credential Selection: User Credentials (populates Primary User for asset tracking)
- Link GPO to target OU containing the 40 machines
- gpupdate /force or wait for next policy cycle
- Devices auto-enroll into Intune — no hands-on-keyboard

## Phase III — Compliance & Configuration Profiles (Day 5-10)
- Compliance Policy: BitLocker (XTS-AES 256-bit), Firewall status, Antivirus signatures, Minimum OS Build
- Configuration Profiles (recommended): Wi-Fi profiles, OneDrive KFM (Known Folder Move), Edge browser security settings

## Requirements
- OS: Windows 10/11 Pro, Enterprise, or Education (Home not supported)
- Network: Corporate domain connectivity (or VPN) for GPO
- Permissions: Domain Admin for GPO, Intune/Global Admin for tenant
- Licensing: Each user needs Intune Plan 1 — included in M365 Business Premium ($22/user/mo) or M365 E3/E5

## Assumptions
- All 40 devices visible in Entra admin center as Hybrid Joined
- Network allows communication to Microsoft MDM endpoints

## Exclusions
- Hardware remediation or corrupted OS
- Non-Windows devices (iOS, Android, macOS)
- On-prem software packaging / app deployment

## Pricing
- Implementation fee: $3,500 (fixed) — environment audit, GPO creation, compliance policy setup, verification
- Recurring licensing: 40x M365 Business Premium at $22/user/mo = $880/month
- Timeline: 2 weeks, minimal disruption

## Key Lesson
GPO auto-enrollment is the fastest path for Hybrid Joined devices. No SCCM co-management needed, no Autopilot re-provisioning, no user interaction. If Entra Connect sync is healthy and Hybrid Join is confirmed, you can have 40 devices enrolled in under a week. This is a 2-week engagement, not a 2-month one.
