# Case Study — Intune Security Hardening + CIS Compliance + Conditional Access (Third-Party EDR: SentinelOne/Huntress)

## Project Summary
Devices enrolled and apps deployed but zero security baselines, zero compliance enforcement, zero Zero Trust. Client runs SentinelOne + Huntress EDR (NOT Defender for Endpoint). Fee: $6,500 fixed. Timeline: 3 weeks.

## Challenge
Intune does not natively report health of third-party EDRs. Without custom compliance, a device with disabled SentinelOne would still show "Compliant" — critical gap.

## Phase I — Advanced Compliance Policy
- Minimum OS build: Windows 11 23H2 (block end-of-life versions)
- Patch level: must be current within 7-day grace period
- BitLocker: mandatory XTS-AES 256-bit encryption, require TPM 2.0
- Secure Boot + Code Integrity enabled at UEFI level
- Password policy: minimum length, complexity, max inactivity lockout (CIS aligned)

## Phase II — Custom EDR Compliance (the differentiator)
- PowerShell Discovery Script deployed via Intune, runs every 8 hours:
  - Checks SentinelOne service status (Running/Stopped) + agent version
  - Checks Huntress agent status + communication health
- JSON Compliance Definition uploaded to Intune:
  - If SentinelOneActive: False OR HuntressActive: False => device instantly Non-Compliant
- This is the ONLY way to integrate third-party EDR health into Intune compliance

## Phase III — CIS Level 1 OS Hardening (300+ settings via Settings Catalog)
- Disable legacy protocols: LLMNR, NetBIOS over TCP/IP, SMBv1
- Enforce UAC to always notify on secure desktop
- Disable risky services: Remote Registry, Xbox services on corporate devices
- Harden Edge: disable password saving, enforce HTTPS-only
- Account protection: disable convenience PIN, enforce Windows Hello for Business
- Defender for Endpoint settings set to "Not Configured" to avoid conflicts with SentinelOne

## Phase IV — Conditional Access (Zero Trust gate)
- Policy: All Users accessing All Cloud Apps (Outlook, Teams, SharePoint) must have Compliant device
- Block legacy authentication (IMAP/POP3) — bypasses MFA and compliance
- Deploy in Report-Only mode first (7-14 days) then enforce
- Effect: disabled SentinelOne => Non-Compliant => blocked from email/Teams immediately

## Pricing
- $6,500 fixed ($2,200 compliance + $1,800 EDR scripting + $2,500 CIS/CA)
- Timeline: 3 weeks (Week 1: policy design + script dev, Week 2: deploy in audit mode, Week 3: enforce)

## Key Lesson
Custom compliance scripts are the only way to close the third-party EDR gap in Intune. Most implementations miss this entirely — they deploy SentinelOne but never verify it is actually running. The PowerShell + JSON approach gives you real-time health tracking with automatic enforcement via Conditional Access.
