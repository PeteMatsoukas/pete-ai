# Case Study — Local AD Decommission + Check Point Harmony SASE Modernization

## Project Summary
Final phase of cloud-first journey. 40 Hybrid Joined devices still tethered to 2 on-prem DCs. Legacy VPN for remote users. Goal: go fully cloud-native. Fee: $12,700 fixed. Timeline: 5 weeks.

## Critical Rule
NEVER just unjoin from AD — it breaks user profiles. Must use migration tooling.

## Phase I — Dependency Remediation (the prep work most people skip)
- DNS: migrate internal DNS records (printers, legacy apps) to Harmony SASE DNS proxy
- Data: verify OneDrive KFM is 100% synced — no data in local AD-based home drives
- Service accounts: audit any local services using AD accounts, migrate to cloud-native or Entra ID Managed Identities
- Group Policy audit: document all GPOs currently applied, map to equivalent Intune policies

## Phase II — Check Point Harmony Connect SASE
- Replace legacy VPN entirely — provides "Virtual Office" experience
- Tenant setup in Harmony Connect cloud dashboard
- Push agent to all 40 machines via Intune (Required install)
- Deploy Harmony Connector (lightweight VM) for secure access to any remaining on-prem resources (NAS, specialized DB, file shares) without traditional VPN
- All DNS resolution goes through SASE — local DNS servers no longer needed

## Phase III — Identity Transformation (the critical phase)
- Profile migration using ForensiT User Profile Wizard — converts Hybrid profile to Cloud-Only Entra ID profile without data loss
- Disjoin machines from local domain
- Verify Entra ID Join only (dsregcmd /status: AzureAdJoined: YES, DomainJoined: NO)
- Configure Windows Hello for Business — users log in with M365 UPN (user@firm.com)

## Phase IV — DC Decommission
- Remove 40 computer objects from local AD
- Disable Microsoft Entra Connect (sync no longer needed — cloud is authoritative)
- Power down and retire 2 Domain Controllers
- Update documentation and emergency procedures

## Pricing
- $12,700 fixed ($3,500 dependency resolution + $4,200 SASE setup + $5,000 workstation transformation)
- Recurring: Harmony Connect SASE ~$10-15/user/mo (~$600/mo for 40 users)
- Timeline: 5 weeks (Week 1-2: dependency audit + SASE build, Week 3: pilot 5 users, Week 4: batch migrate 35, Week 5: DC decommission + sign-off)

## Key Lesson
The dependency remediation phase is where most AD decommission projects fail. People rush to unjoin without checking DNS records, service accounts, GPO dependencies, and data sync status. Spend the time upfront — it saves you from a 2 AM emergency call when someone cannot print or access a legacy app. ForensiT is essential for profile migration — without it, users lose their desktop, favorites, and app settings.
