# Case Study — Intune Automated App Deployment (Win32 + Dynamic Groups)

## Project Summary
Post-enrollment, devices have no standardized software. Need a "Gold Standard" app bundle that deploys to existing fleet AND automatically to any future device. Fee: $2,500 fixed. Combined with enrollment: $5,300 total. Timeline: 3 weeks.

## Strategy: "Store-First & Win32-Wrapped"
- Use Win32 App Model (not LOB) for complex logic, custom detection, and "Required" install intent
- Dynamic Device Groups auto-target any managed Windows device — current and future
- Enterprise App Catalog for automated third-party patching (Chrome, Adobe)

## Phase I — App Inventory & Packaging
- Identify "Core 5" apps (Office 365, Chrome, Adobe, Zoom, VPN client)
- Convert installers to .intunewin format using Microsoft Win32 Content Prep Tool
- Write PowerShell detection scripts per app — prevents "Install Loop" where Intune tries to reinstall existing software
- Example detection: Check registry for app version, check file path existence

## Phase II — Dynamic Group Engineering
- Create Entra Dynamic Device Group: PRD-Windows-Managed-All
- Query: (device.deviceManagementAppId -eq "0000000a-0000-0000-c000-000000000000") targets only Intune-managed Windows devices
- Any new machine joining the tenant is automatically scoped for apps

## Phase III — Deployment
- Assign all apps as "Required" to the dynamic group
- Configure BITS (Background Intelligent Transfer Service) for bandwidth control during rollout
- Stagger deployment: pilot 3 machines, then full fleet

## Phase IV — Enrollment Status Page (ESP)
- Block desktop access for new machines until Core App Bundle is fully installed
- Ensures new employees cannot reach desktop without security tools and Office

## Pricing
- $2,500 fixed (packaging + groups + ESP). Combined with enrollment: $5,300 total.
- Timeline: 3 weeks (Week 1: packaging, Week 2: pilot, Week 3: production rollout)

## Key Lesson
The Win32 app model with custom detection logic is non-negotiable for production deployments. Simple LOB installers cause install loops and lack version checking. Dynamic groups are what make this "set and forget" — you build it once and every future device gets the full stack automatically.
