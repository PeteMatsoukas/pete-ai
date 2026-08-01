# File Share to SharePoint Online Migration — Estimate & Delivery Framework

**Domain:** M365 · SharePoint Online · File Migration · Information Architecture
**Specialist:** M365 & Intune SA
**Use when:** A client wants to migrate on-premises file shares (department or shared drives) to SharePoint Online, asks about SharePoint site/library design, wants to understand migration effort and phasing, or is asking about intranet buildout on SharePoint.

---

## Engagement Profile

**Type:** File share to SharePoint Online migration (two data sets + optional intranet)
**Migration tool:** SharePoint migration tooling (e.g., ShareGate, SPMT, or equivalent)
**Phasing:** Initial migration → client validation → delta (go-live) migration
**Optional add-on:** SharePoint intranet buildout (home page, global navigation, department site buildouts)

---

## Data Scope Reference (use as benchmark for similar engagements)

| Data Set | Size | File Count |
|---|---|---|
| Department Files | 3.1 TB | 1.7 million files |
| Shared Files | 5.2 TB | 900K files |
| **Total** | **8.3 TB** | **~2.6 million files** |

**Sizing notes for quoting similar engagements:**
- High file count (1.7M) with moderate size (3.1 TB) = many small files. Migration tools handle small files slowly — expect longer run times per TB than a lower-count dataset.
- Lower file count (900K) with higher size (5.2 TB) = larger average file size. Faster per-file processing but more bandwidth-sensitive.
- Always assess file count AND size — file count drives migration duration more than raw TB in most SharePoint migration tools.

---

## Effort Estimate by Workstream

### Department Files — 26 hours total (provider) + customer validation

| Task | Hours | Who | Notes |
|---|---|---|---|
| Design & Security Discussion | 2 | Joint (customer + provider) | Define new sites, libraries, permissions structure |
| Create Sites + Libraries | 4 | Provider | Build target SharePoint structure |
| Initial Migration | 12 | Provider | Bulk migration run |
| Validate Migration | — | **Customer** | Confirm design, files, permissions — customer gate |
| Go-Live Communication + Schedule | 1 | Joint | Coordinate cutover timing with business |
| Final Delta Migration | 8 | Provider | Delta sync of changes since initial migration |
| Post Go-Live Support | 4 | Provider | Issue resolution, permission fixes, user questions |

### Shared Files — 23 hours total (provider) + customer validation

| Task | Hours | Who | Notes |
|---|---|---|---|
| Design & Security Discussion | 2 | Joint | Define new sites, libraries, permissions structure |
| Create Sites + Libraries | 2 | Provider | Shared file target structure (typically simpler than dept) |
| Initial Migration | 8 | Provider | Bulk migration run |
| Validate Migration | — | **Customer** | Customer gate — must not skip |
| Go-Live Communication + Schedule | 1 | Joint | Coordinate cutover timing |
| Final Delta Migration | 8 | Provider | Delta sync |
| Post Go-Live Support | 4 | Provider | Issue resolution |

### Optional: Admin/Owner Training — 2 hours
- Training on managing new SharePoint sites, libraries, and permissions
- Recommended for any client without existing SharePoint admin experience
- Delivered after go-live, not before

### Optional: Intranet Buildout — 18 hours

| Task | Hours | Notes |
|---|---|---|
| Design Discussions | 4 | Requirements, structure, branding decisions |
| Home Page | 4 | Modern SharePoint home page build |
| Global Navigation | 2 | Links to internal/external sites, hub navigation |
| Department Site Buildouts | 8 | HR and IT sites as starting point; expand per scope |

**Total optional intranet: 18 hours** — typically scoped as a separate engagement or add-on after migration stabilizes.

---

## Total Effort Summary

| Workstream | Provider Hours |
|---|---|
| Department Files migration | 26 |
| Shared Files migration | 23 |
| Admin/Owner Training (optional) | 2 |
| Intranet buildout (optional) | 18 |
| **Core migration total** | **49 hours** |
| **With all optional items** | **69 hours** |

---

## Delivery Methodology

### Two-Phase Migration Model (always recommend this)
Never do a single-pass cutover for large file shares. The correct pattern:

**Phase 1 — Initial migration (bulk)**
- Run migration tool to copy all files to SharePoint target
- No user disruption — source file share remains live
- Client validates: structure looks right, permissions correct, key files accessible

**Phase 2 — Delta migration (go-live)**
- Run delta sync to capture changes made since initial migration
- Schedule during low-activity window (evening/weekend)
- Cut over users to SharePoint immediately after delta completes
- Keep source read-only for 2–4 weeks as fallback

**Why this pattern matters:**
- Validation before cutover catches structural/permission design errors without user impact
- Delta migration minimizes data loss window (only changes since initial sync are at risk)
- Read-only source provides safety net during user adoption period

### Customer Validation Gate (non-negotiable)
The validation step between initial and final migration is a **customer-owned gate** — not a provider task. Make this explicit in the SOW and kickoff. The project cannot proceed to go-live until the client confirms:
1. SharePoint structure matches agreed design
2. Permissions are correct for all user groups
3. Sample files from each department/library are accessible and intact
4. No missing folders or unexpected content

---

## Information Architecture Decisions (cover in design session)

These decisions must be made in the design discussion before any sites are created:

**Site structure:**
- One site per department vs. shared site with multiple libraries vs. hub site model
- Flat library vs. folder hierarchy (recommendation: minimize nested folders in SharePoint)
- Naming conventions for sites, libraries, and folders

**Permissions model:**
- SharePoint groups vs. M365 groups vs. Entra ID security groups
- Inheritance vs. unique permissions (unique permissions at folder level = management overhead)
- External sharing requirements (off by default — needs explicit decision)

**Content types and metadata:**
- Will the client use metadata columns for filtering/searching? (adds setup effort but improves findability)
- Are there compliance requirements for retention labels?

**OneDrive vs. SharePoint:**
- Department shared content → SharePoint
- Personal/individual content → OneDrive (out of scope for this engagement type)

---

## Risks to Flag

- **File path length:** SharePoint has a 400-character URL limit. Files with deep folder nesting and long names in the source share may fail to migrate. Run a pre-migration scan to identify these before go-live.
- **File count drives timeline, not just size:** 1.7 million files will take longer than 3.1 TB suggests. Set migration window expectations accordingly.
- **Permissions complexity:** NTFS permissions on file shares rarely map cleanly to SharePoint permission groups. Simplifying the permission model during design saves significant post-migration support effort.
- **Special characters in file/folder names:** SharePoint rejects certain characters (`# % & * : < > ? \ { | } ~ `). Migration tools flag these — plan remediation before go-live.
- **Client validation delays:** If the client is slow to validate after initial migration, the delta window grows and go-live is delayed. Set a clear validation deadline (recommend 5 business days maximum).
- **User adoption:** Migration success ≠ adoption success. Users who don't understand SharePoint navigation will revert to emailing files. Pair with training and a clear "old share is read-only" communication.

---

## Pete's Delivery Notes

- Run a pre-migration scan (most tools have this) before quoting final hours — file path issues, permission complexity, and special characters can add significant remediation effort that isn't in a standard estimate
- Design and security discussion is the most important session — get the right people in the room (IT + department heads + any compliance/legal stakeholders). Decisions made here ripple through the entire engagement.
- Don't build intranet at the same time as migration — clients change their mind about intranet design constantly; keep it as a separate follow-on engagement to protect the migration timeline
- Post go-live support hours go fast — permission issues and "I can't find my files" calls are guaranteed in week 1; save those 4 hours for real issues, not questions that should be handled by the training session
- Always quote admin/owner training — clients who don't get training become dependent on the provider for every permission change and site modification indefinitely
