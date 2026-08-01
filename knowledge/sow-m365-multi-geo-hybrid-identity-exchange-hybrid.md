# Microsoft 365 Multi-Geo, Hybrid Identity & Exchange Hybrid Enablement

**Domain:** M365 · Entra ID · Exchange Hybrid · Active Directory · Hybrid Identity · Multi-Geo
**Specialist:** M365 & Intune SA / Windows Server SA
**Use when:** A client operates across multiple geographic regions and needs data residency controls, asks about Microsoft 365 Multi-Geo, needs Exchange Hybrid configured, wants to synchronize multiple on-premises Active Directory environments to a single M365 tenant, needs Password Hash Sync or Seamless SSO, or has regulatory data residency requirements across regions. Also use when a multinational client asks about hybrid identity architecture, staged mailbox migration preparation, or Entra Connect deployment.

---

## Engagement Profile

**Type:** Two-phase hybrid infrastructure enablement — Multi-Geo + Hybrid Identity + Exchange Hybrid foundation (mailbox migration client-led, separately scoped)
**Source:** Multiple on-premises Active Directory forests + on-premises Exchange across multiple regions
**Target:** Single Microsoft 365 tenant with Multi-Geo, Entra Connect, and Exchange Hybrid
**Geographies:** 1 primary geo + 2 satellite geos (scales to additional satellite geos)
**Duration:** Scoped per complexity — reference engagement: 160–180 hours
**Billing model:** Fixed-fee or time-and-materials professional services (licensing client-procured separately)

---

## When to Recommend This Pattern

Recommend Multi-Geo + Exchange Hybrid when a client:
- Operates in multiple countries with data residency or sovereignty requirements (GDPR, regional regulations)
- Has employees whose data must physically reside in a specific geographic region (EU, APAC, US, etc.)
- Has multiple on-premises Active Directory forests or domains that need to synchronize to a single M365 tenant
- Is on-premises Exchange and wants to move to Exchange Online in a phased, coexistence model
- Needs cross-premises free/busy calendar sharing during a staged migration
- Has regulatory or audit requirements requiring documented proof of data location per user

**Key qualifying questions:**
- "Do you have regulatory requirements that specify where user data must be stored geographically?"
- "How many countries do you operate in, and do you have local IT infrastructure in each?"
- "Do you have multiple Active Directory forests or a single forest across regions?"
- "Are you on-premises Exchange today, and do you want to migrate mailboxes to Exchange Online?"
- "Do you have Microsoft 365 Multi-Geo licensing? It requires a minimum of 250 seats and is add-on licensed."
- "What is your target for mailbox migration — client-led or do you want our team to execute it?"

**Multi-Geo licensing note:** Microsoft 365 Multi-Geo is not included in standard M365 plans. It requires an add-on license (Multi-Geo Capabilities) on top of an eligible base plan (E3, E5, Business Premium). Minimum 250 seats. Always confirm licensing before scoping.

---

## Solution Architecture

### Identity Architecture — Hybrid with Entra Connect
- Multiple on-premises Active Directory forests/domains synchronized into a single Microsoft 365 tenant
- Microsoft Entra Connect deployed in active/passive HA mode
- **Password Hash Synchronization (PHS):** Hash of password hash synchronized — enables cloud authentication without ADFS; provides breach detection via Entra ID Identity Protection
- **Seamless Single Sign-On (SSO):** Domain-joined devices authenticate silently to M365 without password prompts
- **Password Writeback:** Password changes made in Entra ID (self-service or admin reset) written back to on-premises AD — enables cloud-based SSPR with on-premises enforcement
- OU-based synchronization filtering — only approved objects synchronized, not entire forest
- Multi-forest or multi-directory configuration as required by client AD topology

### Multi-Geo Tenant Architecture
- Primary geo: client's home region (e.g. EU, US, APAC)
- Satellite geo A: secondary region (e.g. UK, APAC, LATAM)
- Satellite geo B: additional region as required
- Workloads participating in geo mapping: Exchange Online mailboxes, OneDrive for Business, SharePoint Online, Teams file storage
- **Preferred Data Location (PDL):** Attribute set on each user object (in on-premises AD, synchronized to Entra ID) that determines which geo their data resides in
- PDL routing is automatic — once set correctly on the user object and synchronized, Exchange Online and OneDrive provision in the correct geo without manual intervention
- Default geo applies to users without PDL set

### Exchange Hybrid Architecture
- Hybrid Configuration Wizard (HCW) deployed
- OAuth-based authentication between on-premises Exchange and Exchange Online
- Exchange Online Hybrid Modern Authentication enabled
- Cross-premises free/busy, calendar sharing, and mail tips enabled during coexistence
- Mail flow termination: inbound mail routed through Microsoft 365 (MX records point to Exchange Online Protection)
- Outbound mail flow configured from Exchange Online
- Connectors configured for on-premises ↔ cloud coexistence
- Mailbox migration destination determined automatically by PDL attribute — no manual per-mailbox geo selection required

---

## Project Phases

### Phase 1 — Multi-Geo Tenant Preparation

**Activities:**
- Validate M365 tenant for Multi-Geo readiness (licensing, tenant age, existing configuration)
- Identify all geographic locations to be enabled
- Configure primary geography and approved satellite geographies
- Assist client with confirming required M365 and Multi-Geo licensing
- Configure default geo mappings for Exchange, OneDrive, and SharePoint
- Document PDL structure and attribute mapping plan
- Document geo-mapping logic and expected mailbox placement behavior

**Deliverables:**
- Multi-Geo activation across all approved regions
- PDL attribute mapping plan (which AD attribute → PDL value → geo assignment)
- Documentation of geo-mapping logic and placement behavior

### Phase 2 — Hybrid Identity Preparation

**Activities — AD Assessment:**
- Review and document AD forest and domain structure across all participating regions
- Validate UPN, sAMAccountName, proxyAddresses, and required identity attributes
- Identify synchronization scope (users, groups, contacts)
- Identify identity conflicts, duplicate objects, and mismatched attributes
- Prepare or validate PDL attribute definitions for correct geo routing
- Validate DNS, required ports, and connectivity prerequisites for Entra Connect

**Activities — Entra Connect Deployment:**
- Deploy Microsoft Entra Connect with PHS, Seamless SSO, Password Writeback
- Configure multi-forest/multi-directory synchronization as required
- Apply OU-based filtering for approved synchronization scope
- Execute initial synchronization and validate identity object sync
- Confirm correct PDL population and expected geo assignment

**Deliverables:**
- Entra Connect installed and configured
- Active Directory to Entra ID synchronization validated across all approved regions
- SSO and Password Writeback validated

### Phase 3 — Exchange Hybrid Configuration and Mail Flow

**Activities — Exchange Assessment:**
- Document and validate Exchange topology across participating regions
- Review anti-spam/transport rules, connectors, DNS, certificates, mail-routing dependencies
- Evaluate current mail-routing paths, identify changes required for M365 cloud termination

**Activities — Hybrid Configuration:**
- Run Hybrid Configuration Wizard
- Configure OAuth authentication and Hybrid Modern Authentication
- Enable cross-premises free/busy, calendar sharing, mail tips
- Transition inbound MX routing to Microsoft 365
- Configure outbound mail flow from Exchange Online
- Implement connectors for on-premises ↔ cloud coexistence
- Validate hybrid mail flow, coexistence, and transport security
- Validate Multi-Geo mailbox placement logic (PDL → geo routing)

**Deliverables:**
- Functional Exchange Hybrid environment
- Centralized M365 mail flow (MX → Exchange Online Protection)
- Validated mailbox placement logic for Multi-Geo routing

### Phase 4 — Mailbox Migration (Client-Led — Out of Scope)

Mailbox migration execution is **outside scope** of this SOW. Client is responsible for:
- Migrating mailboxes from on-premises Exchange to Exchange Online
- Validating mailbox data completeness post-migration
- Recreating forwarding settings, delegations, and mailbox permissions
- Migrating contacts, guest objects, distribution groups, mail-enabled groups
- Public folder migration (if applicable)

**Optional add-on:** Mailbox migration professional services available on time-and-materials via separate change order.

---

## Effort Estimate

| Workstream | Estimated Hours |
|---|---|
| Multi-Geo tenant preparation and PDL design | 20–25 |
| AD assessment and identity attribute remediation | 25–30 |
| Entra Connect deployment and validation | 20–25 |
| Exchange topology assessment | 15–20 |
| Exchange Hybrid configuration and HCW | 30–35 |
| Mail flow reconfiguration and validation | 20–25 |
| Baseline security hardening (CA, MFA, Secure Score) | 15–20 |
| Documentation and project management | 15–20 |
| **Total** | **160–180 hours** |

---

## Key Assumptions

- All on-premises AD and Exchange environments are healthy, stable, and in a supported state before hybrid work begins
- Client owns all required licensing: M365, Multi-Geo add-on, Entra ID security subscriptions, Exchange hybrid prerequisites
- Network connectivity, firewall rules, routing, ports, and bandwidth for hybrid identity and Exchange Hybrid are available and client-managed
- Client provides accurate user, group, and regional location data including PDL mappings
- Work performed remotely unless otherwise agreed
- Client performs required client software updates (Outlook, Office, OS) for coexistence and modern auth
- All mailbox data resides on supported Exchange platforms meeting Microsoft migration prerequisites

---

## Out of Scope

- End-user workstation support
- Non-Microsoft email security or archiving systems
- PST migration services
- Microsoft Sentinel deployment
- SharePoint data restructuring beyond governance-related work
- Custom Power Automate workflows
- Intune or endpoint management (unless explicitly added)
- Line-of-business application integrations
- Network redesign, firewall engineering, or WAN optimization
- Custom scripts unless previously approved
- Litigation support or eDiscovery
- End-user training
- Microsoft licensing procurement
- Mailbox migration execution, permission recreation, public folder migration, post-cutover user support (unless separately scoped)

---

## Acceptance Criteria

Project substantially complete when:
1. M365 tenant prepared for Multi-Geo across approved geographies
2. PDL mapping model documented and validated
3. Entra Connect installed, configured, and synchronizing correctly
4. SSO and Password Writeback enabled and validated
5. Exchange Hybrid configured and validated
6. Inbound and outbound mail flow through M365 established
7. Baseline Conditional Access and security controls applied
8. Implementation documentation delivered

Mailbox migration completion is **not** part of acceptance criteria for this SOW.

---

## Risks

- **Identity inconsistencies across directories:** UPN mismatches, duplicate proxyAddresses, and missing attributes across multiple AD forests can delay synchronization readiness significantly. AD attribute remediation is often the longest Phase 2 task — audit thoroughly before committing to timeline.
- **Unhealthy Exchange infrastructure:** Exchange Hybrid requires the on-premises Exchange environment to be healthy and supported. Legacy Exchange versions (2010, 2013) have limited hybrid support. Validate Exchange version and patch level in Phase 3 assessment before HCW.
- **Multi-Geo licensing gaps:** Multi-Geo requires an add-on license on eligible M365 plans. If licensing isn't in place, Multi-Geo activation cannot proceed. Confirm license availability at project kickoff — procurement delays have cascaded into 4-week project delays.
- **PDL mapping accuracy:** Incorrect PDL values result in mailboxes provisioning in the wrong geo. This is difficult to reverse post-migration. Validate PDL data carefully before Entra Connect sync and before any mailbox migration begins.
- **Network/DNS/certificate issues:** Exchange Hybrid is sensitive to certificate configuration (must be a public CA cert, correct SANs), DNS internal/external split, and firewall port availability (443, 25, 587). Document all prerequisites and validate before HCW.
- **Client-led migration dependency:** The foundation this engagement builds is designed to support client-led mailbox migration. If the client's migration team is underprepared or under-resourced, the technical foundation may be ready but migration execution stalls. Offer the migration services add-on proactively.
- **Mailbox geo reassignment:** Once a mailbox is provisioned in a geo, moving it to a different geo (PDL change) requires a mailbox move operation — it's not automatic. Set this expectation clearly so the client invests in getting PDL right before migration begins.

---

## PDL Attribute Design — Key Decisions

The Preferred Data Location attribute is the cornerstone of a Multi-Geo deployment. These decisions must be made before Entra Connect sync:

**1. Where does PDL originate?**
- On-premises AD attribute (recommended) — set on user objects in AD, sync'd to Entra ID
- Manual assignment in Entra ID (manageable for small user counts, impractical at scale)
- Scripted population based on AD OU, country attribute, or other identifier

**2. Supported PDL values (examples):**
- EUR (European Union)
- GBR (United Kingdom)
- AUS (Australia)
- JPN (Japan)
- USA (United States)
- CAN (Canada)

Full list of supported geos defined by Microsoft — validate supported values for the client's required regions before design.

**3. Default geo behavior:**
- Users without PDL set provision in the tenant's default geo
- Establish a policy for handling new users and ensure PDL is set before mailbox creation

---

## Exchange Hybrid — Critical Technical Prerequisites

Validate all of these before running HCW — failures discovered mid-HCW require starting over:

| Prerequisite | Requirement |
|---|---|
| Exchange version | 2016 CU21+ or 2019 CU10+ recommended; 2013 CU23 minimum |
| Certificate | Public CA certificate with correct SANs (autodiscover, mail namespace) |
| DNS | Internal and external autodiscover DNS resolving correctly |
| Firewall ports | 443 (HTTPS), 25 (SMTP), 587 (outbound) open to M365 endpoints |
| Hybrid agent | Modern Hybrid Agent (preferred) or traditional HCW — choose before starting |
| Admin accounts | Global Admin + Exchange Organization Admin for HCW execution |
| OAuth prerequisites | Entra Connect synchronized before OAuth configuration |

---

## Value Proposition for Multinational Clients

**Data residency without operational complexity:**
> "Multi-Geo lets you tell Microsoft exactly where each user's data lives — EU employees' mailboxes stay in the EU, APAC employees' data stays in APAC — without running separate tenants. One admin center, one security policy, one Teams environment. Compliance without fragmentation."

**Exchange Hybrid as a bridge, not a permanent state:**
> "Exchange Hybrid is a coexistence platform, not a destination. We build it to give you a stable bridge for your migration to Exchange Online — with full calendar sharing, free/busy, and mail flow coexistence during the transition. Once migration is complete, the hybrid components can be retired."

**Phased approach risk reduction:**
> "We establish the foundation — identity, Multi-Geo, mail flow — and validate it before any mailboxes move. Your team then migrates at the pace that suits the business. No big-bang cutover, no dependency on a single weekend to get everything right."

---

## Pete's Delivery Notes

- **AD attribute remediation is where projects get stuck** — budget 30–40% of the hybrid identity phase for finding and fixing AD attribute issues (duplicate UPNs, missing proxyAddresses, conflicting SIDs, objects that shouldn't sync). Clients always underestimate this. Run IdFix and the Entra Connect prerequisite checker early and share the report with the client at kickoff so they understand the scope.
- **PDL must be right before any mailbox migrates** — a mailbox provisioned in the wrong geo requires a move operation to correct. This is disruptive and time-consuming at scale. Validate PDL values on a sample of users from each region before enabling sync, and validate again before any mailbox migration begins.
- **HCW is sensitive — run it in the right sequence** — Entra Connect sync must be complete before HCW OAuth configuration. DNS and certificates must be validated before HCW. The HCW itself can run in minutes when prerequisites are right, or fail repeatedly when they're not. Document the validation steps as a pre-HCW checklist.
- **Modern Hybrid Agent vs traditional HCW** — the Modern Hybrid Agent (no inbound firewall ports required) is the right choice for most modern deployments. Traditional HCW requires inbound SMTP from M365 to on-premises. Confirm firewall architecture before choosing the hybrid approach.
- **Phase 4 follow-on is the natural next engagement** — this SOW delivers the platform. The mailbox migration is the next logical SOW. Present the migration scope and timeline at Phase 3 completion — the client is already committed to the direction and the infrastructure is in place. This is the easiest follow-on sale in M365 work.
- **Document the PDL design as a living document** — as the organization adds employees in new geographies, someone needs to know how PDL is assigned and what value to use. The PDL mapping document delivered at project close becomes the operational reference for years. Write it clearly enough that HR or IT can follow it without your help.
