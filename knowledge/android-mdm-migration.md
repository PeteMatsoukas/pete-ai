# Android MDM Migration — Workspace ONE to Intune

## Branding
Call it "M365 Mobile Upgrade" — sounds like an improvement, not a disruption.

## Approach
Side-load method — no factory reset required. Use Android Enterprise Work Profile.

## Phase 1 — Intune Preparation
- Build Intune config profiles for Android Enterprise
- Create MAM (Mobile Application Management) policies
- Set up Dynamic Groups for phased rollout

## Phase 2 — Migration Execution
- Enterprise Wipe Workspace ONE (removes only corporate data, not personal)
- Install Company Portal app on devices
- Enroll into M365/Intune via Company Portal

## Phase 3 — Enforcement
- Conditional Access policy blocks email access until device is enrolled and compliant
- Forces stragglers to complete migration — no email = no delay

## Key Details
- No factory reset — users keep personal apps, photos, data
- Work Profile separates corporate and personal data
- MAM policies protect company data inside managed apps (Outlook, Teams, OneDrive)
- Dynamic Groups allow phased rollout (pilot → department → full org)
