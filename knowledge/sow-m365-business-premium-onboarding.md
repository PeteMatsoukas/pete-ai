# Microsoft 365 Business Premium Onboarding — New Tenant, Identity, Security & Device Management

**Domain:** M365 · Entra ID · Intune · Defender · Exchange Online · SharePoint · Teams
**Specialist:** M365 & Intune SA / M365 Security SA
**Use when:** A client is setting up Microsoft 365 for the first time, migrating from Google Workspace or another platform to M365 Business Premium, asks about M365 Business Premium onboarding, needs Intune MDM/MAM deployment, wants Entra ID Conditional Access configured, or is an SMB looking for a fully managed M365 security baseline. Also use when a client asks what's included in M365 Business Premium and whether it's the right license for them.

---

## Engagement Profile

**Type:** Greenfield M365 Business Premium tenant setup + security hardening + device management
**License:** Microsoft 365 Business Premium (includes Entra ID P1, Intune, Defender for Business, Defender for Office 365 P1)
**User count:** SMB — typically 10–300 users (this pattern scales linearly)
**Source environment:** No prior M365 tenant, or migration from Google Workspace / standalone Exchange
**Duration:** 4–6 weeks
**Billing model:** One-time professional services + ongoing M365 Business Premium subscription (per user/month, client's Microsoft agreement)

---

## Why M365 Business Premium (not E3 or Business Standard)

Use this comparison when a client asks why they need Business Premium vs. a cheaper M365 plan:

| Capability | Business Basic | Business Standard | **Business Premium** |
|---|---|---|---|
| Exchange Online | ✅ | ✅ | ✅ |
| Teams, SharePoint, OneDrive | ✅ | ✅ | ✅ |
| Desktop Office Apps | ❌ | ✅ | ✅ |
| Intune MDM/MAM | ❌ | ❌ | ✅ |
| Entra ID P1 (Conditional Access) | ❌ | ❌ | ✅ |
| Defender for Business | ❌ | ❌ | ✅ |
| Defender for Office 365 P1 | ❌ | ❌ | ✅ |
| Azure AD Password Protection | ❌ | ❌ | ✅ |
| **Price (approx.)** | ~€6/user/mo | ~€12/user/mo | **~€22/user/mo** |

**Pete's framing for the price conversation:**
> "Business Premium is the minimum license level that gives you a complete security stack — Conditional Access, device management, and threat protection. Business Standard gives you the productivity apps but leaves you exposed on security. For any organization that handles client data, financial records, or operates in a regulated industry, Business Premium is the right answer. The €10/user/month difference is the cost of not getting hacked."

---

## When to Recommend This Engagement

Recommend M365 Business Premium onboarding when a client:
- Has no current Microsoft 365 tenant (greenfield)
- Is moving from Google Workspace and needs equivalent Microsoft capabilities
- Is on M365 Business Basic or Standard and needs to upgrade their security posture
- Has recently experienced a security incident (phishing, BEC, ransomware) and needs to harden quickly
- Is approaching a cyber insurance renewal that requires MFA and device management
- Has remote or hybrid workers needing secure access to corporate resources
- Is in a regulated industry (healthcare, finance, legal) requiring baseline compliance controls

**Key qualifying questions:**
- "Do you currently have Microsoft 365, and if so, which plan?"
- "Do you have devices that access company data — laptops, phones, tablets?"
- "Do you have a cyber insurance policy, and have they asked about MFA or device management?"
- "Are your users cloud-only or do you have an on-premises Active Directory?"
- "Do you use any line-of-business applications that authenticate with Microsoft?"

---

## Solution Architecture

### Identity Layer — Entra ID
- Tenant creation and domain verification
- User provisioning and licensing
- Entra ID Password Protection (ban common passwords)
- Self-Service Password Reset (SSPR)
- Multi-Factor Authentication (MFA) — Microsoft Authenticator app
- Conditional Access policies:
  - Require MFA for all users
  - Block legacy authentication protocols
  - Require compliant device for access to corporate resources
  - Require MFA for Azure management
  - Block sign-ins from high-risk countries (named locations)
- Entra ID Identity Protection (risk-based CA) — requires P2 or E5

### Productivity Layer — M365 Apps
- Exchange Online mailbox provisioning
- Teams configuration (policies, channels, external access)
- SharePoint Online site provisioning
- OneDrive for Business configuration
- Microsoft 365 Apps deployment to devices via Intune

### Device Management Layer — Intune
- Intune tenant configuration
- Windows Autopilot enrollment (for new/wiped devices)
- Manual enrollment for existing Windows devices
- iOS/Android enrollment (MAM or MDM depending on ownership model)
- Compliance policies (PIN, encryption, OS version requirements)
- Configuration profiles (BitLocker, Windows Update rings, Edge settings)
- App protection policies (MAM — protect corporate data on personal devices)
- Microsoft 365 Apps deployment via Intune

### Security Layer — Defender
- Defender for Business configuration (endpoint protection for Windows devices)
- Defender for Office 365 P1:
  - Anti-phishing policies (impersonation protection, mailbox intelligence)
  - Safe Links (URL rewriting and scanning)
  - Safe Attachments (sandboxed attachment scanning)
  - Anti-malware and anti-spam baseline policies
- Microsoft Secure Score review and prioritized improvement plan
- Attack simulation training (optional — awareness program)

### Email Security Layer
- SPF record configuration
- DKIM signing enabled
- DMARC record deployed (p=none initially, roadmap to p=reject)
- MX record cutover (if migrating from another platform)
- Email encryption for sensitive communications (OME)

---

## Project Phases & Timeline (4–6 weeks)

| Phase | Weeks | Key Activities |
|---|---|---|
| Discovery & Design | 1 | Inventory current environment, document requirements, design identity model (cloud-only vs hybrid), define device ownership policy, confirm licensing |
| Tenant Build & Identity | 1–2 | Create tenant, verify domain, provision users, configure MFA, deploy Conditional Access baseline, configure SSPR |
| Productivity Configuration | 2–3 | Exchange Online setup, Teams policies, SharePoint provisioning, OneDrive configuration |
| Security Baseline | 2–3 | Defender for Business onboarding, Defender for Office 365 policies, Secure Score review, SPF/DKIM/DMARC |
| Device Management | 3–5 | Intune configuration, Autopilot/enrollment, compliance policies, configuration profiles, app deployment |
| Testing & Pilot | 4–5 | Pilot group validation (5–10 users), device enrollment testing, CA policy testing, application access validation |
| Cutover & Go-Live | 5–6 | MX cutover (if applicable), full user rollout, communication, helpdesk readiness |
| Hypercare | 6+ | Post-go-live support, issue resolution, admin training, documentation handover |

---

## Scope of Services (included)

**Tenant & Identity:**
- M365 tenant creation and domain verification
- User provisioning and license assignment
- MFA deployment (Microsoft Authenticator)
- Conditional Access policy baseline (6–8 policies)
- SSPR configuration
- Entra ID Password Protection

**Exchange & Collaboration:**
- Exchange Online configuration
- Teams baseline policies
- SharePoint Online configuration
- OneDrive for Business configuration
- Email migration support (if applicable — scope separately for large migrations)

**Security:**
- Defender for Business configuration
- Defender for Office 365 P1 policy configuration (anti-phishing, Safe Links, Safe Attachments)
- SPF, DKIM, DMARC configuration
- Microsoft Secure Score baseline review and top-10 improvement actions

**Device Management:**
- Intune tenant configuration
- Windows device enrollment (Autopilot or manual)
- Mobile device enrollment (iOS/Android)
- Compliance policy configuration
- Configuration profile deployment
- App protection policy (MAM) for personal devices
- Microsoft 365 Apps deployment via Intune

**Testing & Handover:**
- Pilot group migration and validation
- Admin training session (up to 2 hours)
- M365 Admin Center and Intune admin orientation
- As-built documentation
- Security posture summary report (Secure Score + implemented controls)

---

## Out of Scope

- On-premises Active Directory setup or Entra Connect hybrid identity (separate engagement)
- Legacy application integration with Entra ID (SAML/OAuth — scoped separately)
- Advanced Compliance features (Purview DLP, retention policies, eDiscovery — E3/E5 territory)
- Custom Power Platform development (Power Apps, Power Automate)
- Telephony/Teams Phone (requires separate licensing and scoping)
- Physical device procurement
- End-user training beyond admin orientation
- Ongoing managed services post-go-live

---

## Key Assumptions

- Client purchases M365 Business Premium licenses before project start
- Cloud-only identity (no on-premises AD) unless hybrid is explicitly scoped
- Devices are Windows 10/11 Pro or higher (Home edition cannot be enrolled in Intune)
- iOS/Android devices meet minimum OS version requirements for Intune enrollment
- Client has administrative access to domain registrar for DNS changes
- Client communicates migration/enrollment schedule to all users
- Personal device enrollment uses MAM (app protection only) unless client explicitly opts for MDM on personal devices

---

## Device Ownership Model — Decision Guide

This decision must be made in the design phase — it affects Intune configuration significantly:

| Scenario | Recommended Approach |
|---|---|
| Company-owned Windows laptops | Intune MDM + Autopilot enrollment |
| Existing company Windows devices | Intune MDM + manual enrollment or Autopilot reset |
| Employee-owned phones (BYOD) | MAM only (app protection, no device wipe capability) |
| Company-owned phones | Intune MDM (full device management) |
| Company-owned iPads/tablets | Intune MDM |

**MAM vs MDM key distinction for client conversations:**
- **MDM (Mobile Device Management):** Full device control — can wipe the entire device, enforce encryption, control settings. Appropriate for company-owned devices.
- **MAM (Mobile Application Management):** Controls only the corporate apps and data — can wipe only corporate data, not the entire device. Appropriate for personal devices (BYOD).

Never enroll personal devices in MDM without explicit written consent from the user — it gives the organization the ability to wipe their personal phone.

---

## Conditional Access Policy Baseline (6 core policies)

Deploy these in report-only mode first, monitor for 1–2 weeks, then enable:

| Policy | What it does |
|---|---|
| Require MFA for all users | Every sign-in requires a second factor |
| Block legacy authentication | Blocks SMTP, POP3, IMAP, basic auth — prevents MFA bypass |
| Require compliant device for M365 | Only Intune-enrolled compliant devices can access corporate apps |
| Require MFA for Azure management | Protects admin portals |
| Block sign-ins from high-risk locations | Named locations — exclude home country/countries, block the rest |
| Secure security info registration | MFA registration itself requires a trusted location or existing MFA |

**Always exclude break-glass accounts** from all CA policies — create 2 emergency access accounts with strong passwords stored securely, excluded from all CA, and monitor their usage via alerts.

---

## Risks

- **CA policy too restrictive at go-live:** If "require compliant device" is enabled before all devices are enrolled in Intune, users get locked out. Always enroll devices before enabling compliance-based CA policies. Use report-only mode during rollout.
- **Windows Home edition:** Cannot enroll in Intune. If the client has Windows Home devices, they must upgrade to Pro (cheap via Microsoft) before Intune enrollment.
- **BYOD resistance:** Some users resist enrolling personal phones in any form of management. MAM-only approach addresses this — but must be communicated clearly that MAM only touches corporate apps, not the device.
- **MFA registration friction:** Users who don't register MFA before CA policies are enforced get locked out. Run a structured MFA registration campaign (2-week window, communications, helpdesk support) before enabling enforcement.
- **Legacy applications:** Line-of-business apps that use basic authentication (username + password only, no MFA) break when legacy auth is blocked. Identify these in discovery — they need to be updated or replaced before the legacy auth block is enabled.
- **DMARC p=reject timing:** Enabling DMARC enforcement too early (before all legitimate sending sources are in SPF and DKIM) causes legitimate emails to be rejected. Always start with p=none, review aggregate reports for 30–60 days, then move to p=quarantine, then p=reject.

---

## Microsoft Secure Score — Top Actions for Business Premium Tenants

After onboarding, these typically represent the highest-impact Secure Score improvements available on Business Premium licensing:

1. Require MFA for all users (Conditional Access)
2. Block legacy authentication
3. Enable self-service password reset
4. Enable Entra ID Password Protection
5. Enable Safe Links and Safe Attachments policies
6. Enable anti-phishing policies with impersonation protection
7. Enable Defender for Business on all Windows endpoints
8. Configure BitLocker on all Windows devices (via Intune)
9. Enable audit logging
10. Configure alert policies for suspicious activity

A fully configured Business Premium tenant typically achieves 60–75% Secure Score — significantly higher than a default M365 tenant (typically 30–40%).

---

## Pete's Delivery Notes

- **Conditional Access is the most impactful and most dangerous configuration in this engagement** — done right, it locks down the environment. Done wrong, it locks out the users. Always deploy in report-only mode first, validate for 1–2 weeks, then enable. Never enable compliance-based CA before all devices are enrolled.
- **MFA registration before enforcement is non-negotiable** — run a structured 2-week MFA registration campaign before enabling CA policies. Every user must be registered before enforcement. Use the Entra ID MFA registration report to verify 100% registration before enabling.
- **The Intune device ownership conversation must happen at kickoff** — once devices are enrolled in MDM, the organization can wipe them. This has HR/legal/BYOD policy implications that the client's leadership must decide on, not IT. Don't start enrollment until this is documented and approved.
- **Defender for Business is a hidden gem in Business Premium** — most clients don't know it's included and are paying for third-party antivirus. Onboarding their Windows devices to Defender for Business (via Intune) gives them enterprise-grade EDR at no additional cost. Lead with this — it's a concrete cost-saving win.
- **SPF/DKIM/DMARC in that order, always** — configure SPF first, then DKIM, then DMARC at p=none. Never rush to p=reject. A misconfigured DMARC at p=reject can block legitimate business email and is extremely difficult to diagnose while it's happening.
- **Admin training is a revenue opportunity** — a 2-hour admin orientation is in scope, but most clients need more. Offer a follow-on M365 Admin training engagement (4–8 hours) covering day-to-day operations: adding users, managing Intune, reading Defender alerts, understanding Secure Score. This keeps the client capable and positions Pete as the trusted advisor.
- **Document the break-glass accounts at handover** — two emergency access accounts excluded from all CA, strong passwords in a secure location (not in M365), usage alerts configured. This is the one thing clients forget to ask about and the first thing they need during a real lockout incident.
