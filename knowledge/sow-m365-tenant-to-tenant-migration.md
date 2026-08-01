# Microsoft 365 Tenant-to-Tenant Migration — Full Suite with Identity, Data & Security

**Domain:** M365 · Exchange Online · SharePoint · OneDrive · Teams · Entra ID · Intune · Defender
**Specialist:** M365 & Intune SA / M365 Security SA
**Use when:** A client needs to migrate from one Microsoft 365 tenant to another (merger, acquisition, rebranding, divestiture, MSP onboarding), asks about tenant-to-tenant migration, needs to move Exchange mailboxes, SharePoint/OneDrive data, Teams, and Entra ID identities between tenants, or wants to consolidate M365 environments. Also use when a client asks about cross-tenant migration tools or Microsoft's native cross-tenant migration capabilities.

---

## Engagement Profile

**Type:** Full Microsoft 365 tenant-to-tenant migration
**Source:** Existing M365 tenant (legacy)
**Target:** New M365 tenant (destination)
**Scope:** Exchange Online, SharePoint Online, OneDrive for Business, Microsoft Teams, Entra ID identities, Intune device management, Defender security policies
**User count:** ~50 users (scales — use as per-user benchmark)
**Migration tool:** Third-party migration platform (e.g. BitTitan MigrationWiz, Quest On Demand, Cloudiway, or equivalent)
**Duration:** 6–8 weeks
**Billing model:** One-time professional services + migration tool licensing (per-seat, billed separately)

---

## When to Recommend This Pattern

Recommend a tenant-to-tenant migration when a client:
- Is being acquired by or merging with another organization that uses a different M365 tenant
- Is rebranding and needs to change their primary domain and tenant identity
- Is leaving an MSP-managed tenant and needs their own standalone tenant
- Has a subsidiary that needs to be separated into its own tenant (divestiture)
- Is consolidating multiple M365 tenants into one
- Has outgrown a shared tenant arrangement

**Key qualifying questions:**
- "Are you currently on your own M365 tenant, or is it managed under someone else's tenant?"
- "What is driving the migration — acquisition, rebrand, divestiture, or MSP change?"
- "How many licensed users need to be migrated?"
- "Do you use Teams heavily? Teams migration is the most complex component."
- "Do you have devices enrolled in Intune that need to move?"
- "What is your target go-live date, and are there any hard deadline constraints?"

**Ideal client profile:**
- 20–500 users (below 20 users, manual migration may be more cost-effective than tooling)
- Active use of Exchange, SharePoint, and OneDrive
- Entra ID as identity provider (cloud-only or hybrid)
- Willing to accept a cutover migration approach with a defined maintenance window

---

## Solution Architecture

### Identity Migration (Entra ID)
- Provision new user accounts in destination tenant
- Establish identity mapping between source and destination users
- Configure UPN (User Principal Name) and email aliases in destination
- Assign licenses in destination tenant before migration cutover
- Decommission source accounts post-cutover after validation period

### Email Migration (Exchange Online)
- Pre-stage mailbox data to destination using migration tool (batch migration)
- Configure MX record cutover to destination tenant on go-live
- Migrate shared mailboxes, distribution groups, and mail-enabled security groups
- Migrate contacts and calendar data
- Configure mail flow rules, transport rules, and connectors in destination
- Maintain mail coexistence (forwarding) between tenants during migration window

### SharePoint & OneDrive Migration
- Map source document libraries and personal drives to destination structure
- Pre-stage content migration (initial pass — weeks before cutover)
- Delta migration at cutover (catch up on changes since initial pass)
- Preserve folder structure and file metadata where tool supports it
- Migrate SharePoint site permissions and sharing configurations

### Microsoft Teams Migration
- Recreate Teams, channels, and membership in destination tenant
- Migrate Teams channel messages and files where tool supports it (note: full fidelity Teams chat migration has limitations — see risks)
- Migrate Teams shared channels and external collaboration configurations
- Reconfigure Teams policies and meeting settings in destination

### Device Management (Intune)
- Enroll devices in destination tenant Intune environment
- Deploy configuration profiles, compliance policies, and app protection policies
- Handle device re-enrollment (Autopilot re-registration or manual re-enrollment)
- Migrate managed app configurations to destination

### Security Policies (Defender)
- Recreate Defender for Office 365 policies (anti-phishing, Safe Links, Safe Attachments)
- Migrate Conditional Access policies to destination Entra ID
- Recreate MFA configurations and named locations
- Configure Defender for Endpoint onboarding in destination tenant
- Validate security posture in destination before decommissioning source

---

## Project Phases & Timeline (6–8 weeks)

| Phase | Weeks | Key Activities |
|---|---|---|
| Discovery & Planning | 1–2 | Inventory source tenant, document all services in use, identify dependencies, define user batches, confirm tool licensing, establish destination tenant |
| Destination Tenant Build | 2–3 | Provision destination tenant, configure domains, set up Entra ID, apply baseline security policies (CA, MFA, Defender), configure Exchange connectors for coexistence |
| Identity Provisioning | 3–4 | Create all user accounts in destination, assign licenses, configure UPNs, establish source-to-destination identity mapping |
| Pre-Stage Migration | 3–6 | Initial mailbox pre-staging, SharePoint/OneDrive initial copy, Teams recreation in destination — run in background, no user impact |
| User Acceptance Testing | 5–6 | Pilot group (5–10 users) fully migrated and validated, application testing, VPN/connectivity validation, Intune enrollment testing |
| Cutover Weekend | 6–7 | Final delta sync, MX record cutover, DNS changes, SharePoint/OneDrive final sync, Intune device re-enrollment, user communication |
| Post-Migration Stabilization | 7–8 | Hypercare period, issue resolution, source tenant decommission, license cleanup, documentation |

---

## Scope of Services (included)

**Discovery & Assessment:**
- Source tenant inventory (users, licenses, mailbox sizes, SharePoint sites, Teams, Intune policies, Defender policies)
- Dependency identification (line-of-business app integrations, OAuth apps, service accounts)
- Migration tool configuration and testing
- Migration runbook development

**Destination Tenant Build:**
- Domain verification and DNS configuration
- Entra ID baseline configuration
- Exchange Online connector configuration (coexistence/mail flow)
- Baseline Conditional Access and MFA policy deployment
- Defender for Office 365 baseline policy configuration

**Identity & Licensing:**
- User account provisioning in destination
- License assignment
- UPN and email alias configuration
- Group recreation (M365 Groups, security groups, distribution lists)

**Mailbox Migration:**
- Exchange Online mailbox migration (all users)
- Shared mailbox migration
- Distribution group and mail-enabled security group recreation
- Contact migration
- MX record cutover at go-live

**SharePoint & OneDrive:**
- SharePoint site migration (agreed scope)
- OneDrive for Business migration (all users)
- Permission mapping and recreation

**Teams:**
- Teams and channel recreation in destination
- Teams membership migration
- Teams files migration (via SharePoint migration)
- Teams policy configuration in destination

**Intune & Devices:**
- Intune baseline policy recreation in destination
- Device re-enrollment support
- Autopilot profile migration where applicable

**Security:**
- Conditional Access policy migration
- Defender for Office 365 policy recreation
- MFA reconfiguration
- Post-migration security validation

**Cutover & Hypercare:**
- Cutover weekend execution support
- Post-migration issue resolution (2-week hypercare)
- Source tenant decommission guidance
- As-built documentation

---

## Out of Scope

- Third-party application reconfiguration (OAuth apps, line-of-business integrations — client/vendor responsibility)
- Legacy on-premises Exchange or AD migration (separate engagement)
- Physical device replacement or hardware procurement
- End-user training beyond basic orientation
- Custom Teams app or Power Platform migration
- SharePoint customizations (custom code, Power Apps, Power Automate flows)
- Litigation hold or eDiscovery data exports
- Archive mailbox migration (unless explicitly scoped)
- Source tenant license management after cutover

---

## Key Assumptions

- Destination tenant is a new or clean M365 tenant (not an existing production tenant with users)
- Client has administrative access to both source and destination tenants throughout the project
- Migration tool licensing procured before pre-staging begins
- All third-party application vendors contacted by client for reconfiguration coordination
- Devices can be re-enrolled in Intune (Autopilot or manual) — no hard dependency on source tenant enrollment
- Client communicates migration schedule to all affected users
- Cutover occurs during an approved maintenance window (typically Friday evening to Monday morning)
- Archive mailboxes excluded unless explicitly included in scope

---

## Risks

- **Teams migration fidelity:** No tool provides 100% Teams chat history migration. Channel messages can be migrated with some tools but with metadata limitations. Private chats (1:1 and group chats) generally cannot be migrated — they remain accessible in the source tenant for a retention period. Set this expectation explicitly with the client before contract signing.
- **Third-party app breakage at cutover:** Any application using OAuth tokens tied to source tenant user identities will break at cutover. Client must coordinate with all application vendors before go-live. This is the #1 source of post-cutover escalations.
- **Large mailboxes:** Mailboxes over 50GB significantly extend pre-staging time and cutover delta sync duration. Audit mailbox sizes in discovery and flag outliers.
- **SharePoint customizations:** Power Apps, Power Automate flows, and custom SharePoint solutions do not migrate with content — they must be rebuilt. Identify these in discovery.
- **Intune device re-enrollment:** Devices must be unenrolled from source tenant and re-enrolled in destination. This requires physical or remote access to each device. For large deployments, coordinate a phased device re-enrollment plan.
- **License availability:** Destination tenant must have sufficient licenses assigned before migration pre-staging begins. Procurement delays block the project.
- **Domain ownership transfer:** The primary domain (e.g. company.com) cannot exist in two tenants simultaneously. It must be removed from the source tenant before being added to the destination. This creates a brief window where the domain is unverified — plan for this in the cutover window.
- **Conditional Access disruption:** If CA policies in the destination are too restrictive at go-live, users may be locked out on day one. Test CA policies with the pilot group before cutover weekend.

---

## Effort Estimate

| Workstream | Estimated Hours |
|---|---|
| Discovery, planning, and runbook | 16 |
| Destination tenant build + security baseline | 20 |
| Identity provisioning and license assignment | 8 |
| Migration tool configuration and testing | 8 |
| Pre-stage migration (mailbox, SharePoint, OneDrive, Teams) | 24 |
| Pilot migration and validation | 8 |
| Cutover execution | 16 |
| Post-migration hypercare and documentation | 12 |
| **Total** | **~112 hours** |

**Per-user benchmark:** ~2.2 hours/user for a 50-user migration. This ratio compresses for larger migrations (economies of scale in batch processing and tooling).

---

## Pricing Framework

| Component | Billing Model |
|---|---|
| Professional services | Hourly or fixed-fee (per approved estimate) |
| Migration tool licensing | Per-seat per-product (Exchange, SharePoint/OneDrive, Teams billed separately by most vendors) |
| Destination tenant licensing | Client's Microsoft agreement (not included in services fee) |
| Source tenant licenses | Client manages wind-down post-cutover |

**Migration tool cost benchmark (per user, one-time):**
- Exchange migration: ~$15–25/mailbox
- SharePoint/OneDrive: ~$15–20/user
- Teams: ~$15–20/user (if supported by chosen tool)
- Total tooling: ~$45–65/user for full suite

---

## Acceptance Criteria

Migration substantially complete when:
1. All users can log in to destination tenant with new credentials
2. Email is flowing to destination tenant (MX records cutover confirmed)
3. Mailbox data accessible in destination (pre-staged content verified by pilot users)
4. SharePoint and OneDrive content accessible in destination
5. Teams accessible in destination with correct membership
6. Intune devices enrolled in destination tenant
7. Conditional Access and MFA functioning in destination
8. Source tenant mail forwarding to destination (for any missed emails during propagation window)
9. Hypercare period completed with no outstanding critical issues
10. As-built documentation delivered

---

## Pete's Delivery Notes

- **Domain removal from source is the point of no return** — once the primary domain is removed from the source tenant and added to the destination, there is no easy rollback. Make sure everything is validated in the destination before executing this step. Never do this before the pilot is signed off.
- **Teams chat is the conversation killer** — be upfront about Teams private chat migration limitations before the client signs. "We can't migrate your Teams chat history" discovered at go-live is a trust-destroying surprise. State it clearly in the SOW and repeat it at kickoff.
- **Pre-stage early and repeatedly** — run the initial mailbox pre-stage as early as possible (week 3 ideally). Large mailboxes can take days to pre-stage. The earlier you start, the smaller your cutover delta sync window, which directly controls how long the cutover maintenance window needs to be.
- **Pilot group is not optional** — always migrate 5–10 users fully 1–2 weeks before the full cutover. Real users in a real destination environment surface issues (broken apps, CA policy problems, Intune enrollment failures) that testing never does.
- **Third-party app inventory is the most important discovery task** — ask the client to list every application that users sign into with their Microsoft credentials. Every single one of those will break at cutover. This list drives the vendor coordination workstream that is entirely the client's responsibility — but if it's not done, it becomes your problem at 2am on cutover night.
- **Source tenant decommission is a separate conversation** — don't include source tenant license cancellation in the project scope. Some clients want to keep the source active for 30–90 days for audit/reference purposes. Others want it gone immediately. Clarify this at kickoff and keep it out of the cutover weekend scope.
- **Hypercare week is where the relationship is won or lost** — the volume of "I can't find my files," "my app doesn't work," and "my email signature is gone" tickets in week 1 post-migration is predictable. Staff it appropriately and respond fast. Clients who have a smooth hypercare experience become long-term clients.
