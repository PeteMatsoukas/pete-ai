# Microsoft 365 Copilot Deployment for Law Firms — Solutions Architecture Guide

## Case Context

A US-based law firm client using Microsoft 365 Business (Basic and Standard licenses, ~55 users) requested guidance on deploying Copilot AI while ensuring attorney-client privilege and confidentiality compliance. The client's primary concern was whether Copilot could operate in a "closed system" without sharing private information externally.

---

## Key Clarification: Consumer Copilot vs. Microsoft 365 Copilot Business

### Consumer Copilot (Free — Built into Windows & Edge)

- Pre-installed on Windows 11 devices and Microsoft Edge
- Routes queries through the **public cloud**
- Has **no tenant-level security boundaries** or compliance controls
- **Cannot be configured** to meet attorney-client privilege requirements
- Should be **disabled via policy** across all devices in a legal environment immediately
- Not suitable for any work involving confidential, privileged, or regulated data

### Microsoft 365 Copilot Business (Add-on License)

- Per-user add-on license that works on top of existing M365 Business plans (Basic, Standard, Premium)
- **No upgrade to Enterprise (E3/E5) is required**
- Operates **entirely within the organization's Microsoft 365 tenant**
- Data stays within the tenant boundary and is not shared externally
- Does **not** train Microsoft's AI models on organizational data
- Respects existing permissions across SharePoint, OneDrive, Exchange, and Teams
- Can be further secured with Sensitivity Labels (Microsoft Purview)
- This is the "closed system" that legal environments require

### Licensing (as of mid-2025)

- **SKU:** Microsoft 365 Copilot Business [New Commerce Experience]
- **Price:** ~$22.05/user/month (1-year commitment, monthly billing)
- **Note:** This is distinct from the Enterprise SKU "Microsoft 365 Copilot [New Commerce Experience]" (~$26.46–$31.50/user/month), which requires E3/E5 plans
- Microsoft offers trial periods for the Business SKU, useful for pilot group validation

### Pricing Example (55 users)

- 55 users × $22.05/user/month = **$1,212.75/month** ($14,553.00/year)
- Not all users may need Copilot — recommend identifying high-value roles (attorneys, paralegals, key administrative staff) first

---

## Why Licensing Alone Is Not Enough

Copilot respects existing M365 permissions — it will **surface any content a user already has access to**. In most SMB law firms, SharePoint permissions are flat or overly permissive. This means Copilot becomes a supercharged search engine that could expose overshared content across the organization.

**For a law firm**, if an attorney working on Client A's matter has inadvertent access to Client B's documents in SharePoint, Copilot will surface Client B's content in responses. This is an ethical and compliance violation that must be addressed **before** Copilot is enabled.

---

## Required Scope of Work — Pre-Copilot Deployment

### 1. SharePoint Permissions Audit & Remediation

- Review current SharePoint site and document library permissions
- Enforce **matter-level isolation** — each attorney/staff member should only access cases they are assigned to
- Identify and remediate oversharing: "Everyone except external users" groups, broken inheritance, broad site-level permissions
- Restructure SharePoint sites around matters/clients if not already organized that way

### 2. Sensitivity Labels via Microsoft Purview

- Implement document classification labels: **Confidential**, **Attorney-Client Privileged**, **Internal**
- Labels travel with the document and enforce protections (prevent forwarding, printing, unauthorized access)
- Protections persist even if a file is accidentally shared outside its intended audience
- **Licensing note:** Sensitivity Labels require at minimum M365 Business Premium or the Purview Suite add-on for Business plans

### 3. Copilot Access Scoping

- Configure **Restricted SharePoint Search** to control what content Copilot can index and reference per user
- Apply Copilot-specific scoping controls as a second layer on top of the permissions cleanup
- Validate that Copilot responses do not surface cross-matter content

### 4. Disable Consumer Copilot

- Deploy policy (Intune, GPO, or registry) across all devices to block the free consumer-grade Copilot
- This should be done **immediately**, regardless of the Copilot Business deployment timeline
- Prevents any risk of attorneys using the public-cloud Copilot for work-related queries

### 5. Phased Copilot Rollout

- **Phase 1 — Pilot:** Assign trial licenses to a small group (5–10 users), validate all compliance controls
- **Phase 2 — Validation:** Test Copilot responses across SharePoint, OneDrive, Exchange, Teams to confirm matter isolation
- **Phase 3 — Expansion:** Roll out paid licenses to remaining users once controls are confirmed

---

## Discovery Questions for the Client

Before scoping the engagement, the following information is needed:

1. Of the total licensed users, how many should be in the initial pilot group?
2. How are matters/cases currently organized in SharePoint? (Dedicated sites per matter, shared folders, flat structure)
3. Are any document classification, Sensitivity Labels, or Data Loss Prevention (DLP) policies currently in use?
4. What M365 Business plan are users on? (Basic vs. Standard vs. Premium — affects Purview/Sensitivity Label availability)
5. Are devices managed via Intune or another MDM? (Affects how consumer Copilot is disabled)

---

## Recommended Approach for Client Communication

- **Lead with reassurance:** The closed-system behavior they want exists — it just requires the correct product (M365 Copilot Business, not the free consumer Copilot)
- **Clarify the misconception gently:** The free Copilot on their devices is not configurable for compliance — no amount of permissions work fixes it
- **Emphasize that Enterprise is not required:** This is a common concern — the Business add-on works on their current plans
- **Position the permissions work as essential, not optional:** Frame it as protecting them from ethical violations, not as an upsell
- **Recommend phased rollout with trial:** De-risks the commitment and builds confidence before firm-wide licensing spend

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                 Microsoft 365 Tenant                │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  SharePoint   │  │   OneDrive   │  │ Exchange  │ │
│  │  (Matter-     │  │  (Per-user)  │  │  Online   │ │
│  │  isolated     │  │              │  │           │ │
│  │  sites)       │  │              │  │           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │       │
│         ▼                 ▼                ▼       │
│  ┌─────────────────────────────────────────────┐   │
│  │         Microsoft 365 Copilot Business      │   │
│  │   (Respects permissions + Sensitivity Labels)│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           Microsoft Purview                  │   │
│  │   Sensitivity Labels / DLP / Compliance      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ALL DATA STAYS WITHIN TENANT BOUNDARY              │
│  NO EXTERNAL SHARING — NO MODEL TRAINING            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BLOCKED: Consumer Copilot (Windows/Edge)           │
│  ✗ Public cloud — no tenant boundary                │
│  ✗ Disabled via Intune/GPO policy                   │
└─────────────────────────────────────────────────────┘
```

---

## Tags

`Microsoft 365 Copilot` `Law Firm` `Attorney-Client Privilege` `SharePoint Permissions` `Sensitivity Labels` `Microsoft Purview` `Compliance` `Phased Rollout` `SMB` `M365 Business`

---

*Prepared by Pete Matsoukas — Senior IT Solutions Architect, EMPIST / TechByPete*
