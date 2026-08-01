# Email Migration — Personal Gmail Accounts to Google Workspace or Microsoft 365

**Domain:** M365 · Google Workspace · Email Migration · Identity · Security
**Specialist:** M365 & Intune SA
**Use when:** A client uses personal Gmail accounts for business and wants to migrate to a managed Google Workspace or Microsoft 365 tenant, asks about migrating small mailbox sets (1–10 accounts) from consumer Gmail to a business email platform, needs DNS configuration for email (SPF/DKIM/DMARC), or wants MFA enabled on new business email accounts. Also use when a client is formalizing their IT infrastructure from a startup/informal model to a managed business environment.

---

## Engagement Profile

**Type:** Consumer Gmail → business email platform migration (manual archive method)
**Source:** Personal Gmail accounts (consumer — not Google Workspace)
**Target:** Google Workspace Business OR Microsoft 365 (client selects)
**Mailbox count:** 5 (scales linearly — use this as a per-mailbox effort benchmark)
**Migration method:** Manual archive export/import (no direct API migration — personal Gmail limitation)
**Duration:** 8 business days
**Effort:** ~48–56 hours
**Pricing model:** Hourly professional services rate (subscription licensing billed separately)

---

## When to Recommend This Engagement

Recommend this when a client:
- Uses personal Gmail (not Google Workspace) for business email — common in startups, sole traders, small family businesses
- Needs to look professional (custom domain email instead of @gmail.com)
- Has compliance, security, or insurance requirements that personal email cannot meet
- Wants centralized admin control (password resets, mailbox access, device management)
- Is growing and needs consistent email for new hires
- Has received a cyber insurance questionnaire asking about MFA on email accounts

**Key qualifying questions:**
- "Are you using personal Gmail accounts for business today?"
- "Do you have a domain (e.g. yourbusiness.com) or do you need one?"
- "Do you need to keep historical emails from your existing Gmail accounts?"
- "How many users need business email?"
- "Do you already have a preference for Google Workspace or Microsoft 365?"

**Platform decision guidance:**

| Client Profile | Recommended Platform |
|---|---|
| Already uses Google Docs, Drive, Sheets heavily | Google Workspace |
| Already uses Microsoft Office, Teams, or Azure | Microsoft 365 |
| Needs full Microsoft 365 security stack (Defender, Intune, Entra ID, Conditional Access) | Microsoft 365 |
| Pure email + basic collaboration, budget-conscious | Google Workspace Starter |
| Needs to integrate with broader M365 hardening initiative | Microsoft 365 |

---

## Why Manual Archive Migration (not a tool-based migration)

Personal Gmail accounts do not support the same API access or administrative controls available in managed Google Workspace or Microsoft 365 tenants. Standard migration tools (IMAP, tenant-to-tenant, PowerShell) require managed account access that personal Gmail does not provide.

**Manual archive method:**
1. Full local export of each Gmail mailbox (Google Takeout or IMAP download)
2. Create archive files (.mbox, .pst, or equivalent)
3. Import into new Google Workspace or Microsoft 365 mailboxes
4. Validate folder structure, labels, contacts, and content

**Limitation to set expectations on:**
- Gmail labels and consumer category structures may not map perfectly into Google Workspace or Microsoft 365 folder structures
- Some Gmail-specific metadata (stars, category tabs, social/promotions labels) may not translate cleanly
- Deleted or inaccessible source content cannot be recovered as part of this engagement

---

## Project Schedule (8 business days)

| Day | Phase | Activities |
|---|---|---|
| Day 1 | Setup & Provisioning | Domain verification, tenant creation, mailbox provisioning, license assignment |
| Days 2–4 | Data Extraction | Manual export of 5 Gmail mailboxes into archive files |
| Days 5–7 | Data Restoration | Upload and import archive data into new platform mailboxes |
| Day 8 | Security & Handover | MFA activation, DNS finalization, admin access handoff, user orientation |

**Schedule dependency:** Access to all 5 Gmail accounts and DNS management portal must be available on Day 1. Delays in access or platform selection push all subsequent phases.

---

## Scope of Services (included)

**Tenant Setup:**
- Create and configure new Google Workspace or Microsoft 365 tenant
- Domain ownership verification
- Provision 5 user mailboxes
- Assign required licenses

**Data Export:**
- Full local export of 5 personal Gmail mailboxes
- Archive file creation for migration processing
- Preserve mailbox content to extent supported by source environment

**Data Import:**
- Import archived data into new platform mailboxes
- Synchronize historical email into target platform
- Validate restored data is accessible

**Data Verification:**
- Cross-reference mailbox structure between source and target
- Verify folder hierarchy and item population at operational level
- Document any import exceptions

**Security Configuration:**
- Enable MFA for all 5 user accounts
- Configure SPF record
- Configure DKIM
- Support production mail-flow DNS readiness

**Handover:**
- Admin console access and credentials
- Basic platform orientation for client
- Project handoff documentation

---

## Out of Scope

- Remediation of corrupted mailbox data or damaged archive files
- Recovery of deleted or inaccessible source content
- End-user workstation configuration beyond basic mail access validation
- Mobile device setup and support
- Advanced mail security beyond baseline MFA + SPF/DKIM (Defender for Office 365, DLP, retention policies — scope separately)
- Email signature standardization
- Third-party application integration with the new platform
- Long-term tenant administration after project handoff
- Subscription licensing fees (billed separately by Microsoft or Google)
- Domain registration or renewal costs

---

## Effort & Pricing Framework

| Component | Detail |
|---|---|
| Estimated hours | 48–56 hours (approx. 52 hours typical) |
| Duration | 8 business days |
| Billing model | Hourly professional services rate (excl. VAT) |
| Licensing | Billed separately — not included in professional services |

**Per-mailbox effort benchmark:** ~10 hours per mailbox for a 5-mailbox engagement (planning, export, import, validation, security config, handoff amortized across all accounts). This ratio compresses slightly at scale (10+ mailboxes) due to setup overhead being fixed.

**Pricing note for client conversations:** The professional services fee covers migration labor only. Google Workspace and Microsoft 365 subscription costs are ongoing monthly/annual fees paid directly to the platform provider. Always quote these separately and clearly to avoid confusion at invoice.

---

## DNS Configuration Checklist

Complete these DNS records as part of every email migration — not optional:

| Record | Purpose | Priority |
|---|---|---|
| **MX** | Routes inbound email to the new platform | Critical — do first |
| **SPF** | Authorizes sending servers (prevents spoofing) | Critical |
| **DKIM** | Cryptographic email signing (authenticity) | Critical |
| **DMARC** | Policy enforcement for SPF/DKIM failures | Strongly recommended |
| **Autodiscover/Autoconfig** | Client autoconfiguration (Outlook, mobile) | Recommended |

**DNS propagation timing:** MX record TTL should be lowered to 300 seconds (5 min) 24–48 hours before cutover. After cutover, raise back to 3600 seconds. This minimizes the window where email could route to the old platform.

**MFA note for client conversations:** MFA is not encryption — it's an access control that requires a second factor (mobile app, SMS, hardware key) to verify identity. It protects accounts even when passwords are compromised, reused, or phished. Frame it as the single most important security action they can take on day one.

---

## Key Assumptions

- Full access to all 5 source Gmail accounts provided at project start
- Source accounts are in a healthy state suitable for export
- Target platform (Google Workspace or Microsoft 365) selected before implementation begins
- Required licenses purchased and available at time of provisioning
- Domain is eligible for use with selected platform (no prior unmanaged mail configuration conflicts)
- Domain registrar/DNS access available when needed
- Client has authority to approve and implement DNS changes

---

## Risks

- **Mailbox size:** Large mailboxes (50GB+) take significantly longer to export and import. Audit mailbox sizes before quoting — adjust hours accordingly.
- **Gmail label complexity:** Clients who have heavily organized Gmail with custom labels, filters, and category tabs will see some structural differences post-migration. Set expectations clearly before migration begins.
- **DNS propagation:** After MX cutover, some email may route to the old Gmail accounts for up to 48 hours depending on sending server TTL caching. Monitor both old and new mailboxes during the cutover window.
- **Platform selection delay:** If the client can't decide between Google Workspace and Microsoft 365, the project can't start provisioning. Get this decision made at contract signing, not at kickoff.
- **Licensing delays:** Google Workspace and Microsoft 365 licenses are generally available immediately via credit card. Delays are rare but can affect Day 1 provisioning.
- **Corrupted source data:** Archive exports from personal Gmail can occasionally produce corrupted or incomplete .mbox files for very old emails. Document exceptions and exclude from scope — recovery of corrupted source data is out of scope.

---

## Google Workspace vs. Microsoft 365 — Quick Comparison for Clients

| Factor | Google Workspace | Microsoft 365 |
|---|---|---|
| Email | Gmail (business) | Outlook / Exchange Online |
| Collaboration | Google Docs/Sheets/Slides/Meet | Teams, SharePoint, OneDrive, Office Apps |
| Security stack | Google Workspace Security | Defender, Intune, Entra ID, Conditional Access |
| Admin experience | Google Admin Console | Microsoft 365 Admin Center + Entra |
| Mobile | Google ecosystem | Microsoft ecosystem |
| Best follow-on Pete engagements | Google Workspace hardening, Drive governance | M365 hardening, Intune MDM, Entra ID CA, Defender |
| Starting price | ~€6–12/user/month | ~€6–22/user/month depending on plan |

**Pete's default recommendation:** Microsoft 365 Business Premium for any client who needs security controls (MFA, Conditional Access, Defender, Intune MDM). Google Workspace for clients who are deeply invested in the Google ecosystem and don't need the Microsoft security stack.

---

## Pete's Delivery Notes

- **This engagement type is a relationship opener** — small businesses migrating from personal Gmail to a managed platform are at the start of their IT maturity journey. Every item in scope leads to a follow-on: M365 hardening, Intune, Defender, SharePoint, Teams. Treat it as the first chapter, not a one-off project.
- **Platform decision must happen before contract signing** — provisioning, licensing, and DNS configuration are completely different between Google Workspace and Microsoft 365. Don't start work without a confirmed platform choice in writing.
- **Export the biggest mailboxes first** — if one user has 40GB and the others have 5GB each, the large mailbox drives the timeline. Start Day 2 with the largest export running and work smaller ones in parallel.
- **Always lower MX TTL 48 hours before cutover** — this is the single step most people forget and the source of "I'm not receiving emails" calls on cutover day. Put it in the project checklist explicitly.
- **Deliver a simple 1-page admin guide at handover** — cover: how to add a new user, how to reset a password, how to check MFA status, where to find billing. Clients who receive this don't call for the basics. Clients who don't call constantly.
- **DMARC should be set to p=none at go-live, then moved to p=quarantine and p=reject over 30–60 days** — never set p=reject on day one without monitoring the DMARC reports first. Legitimate senders that aren't in SPF will get blocked.
