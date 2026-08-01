# SharePoint + Salesforce Document Management Integration — Assessment Framework

**Domain:** M365 · SharePoint Online · Salesforce · Document Management · Integration
**Specialist:** M365 & Intune SA
**Use when:** A client uses both Salesforce and Microsoft 365/SharePoint and asks about connecting the two, wants to reduce Salesforce file storage costs, needs better document organization around CRM records, or asks about integrating SharePoint document libraries with Salesforce objects. Also use when a client asks Pete to assess whether a SharePoint-Salesforce integration tool is a good fit for their environment.

---

## Assessment Summary

A SharePoint-to-Salesforce document management integration is a strong fit for organizations that already use both platforms and want documents to live in SharePoint (for governance, collaboration, and cost control) while remaining accessible inside Salesforce workflows.

**Overall verdict:** Strong candidate for further evaluation — not an automatic purchase. Requires clear document architecture, permission design, and a scoped pilot before full deployment.

---

## What This Integration Does

Bridges two common business platforms:
- **Salesforce** = system of record for customer, sales, and operational data
- **SharePoint** = system of record for document storage, collaboration, and M365 content management

**Capabilities:**
- Link SharePoint folders and files to Salesforce records
- View SharePoint content from within Salesforce (no platform switching)
- Automate SharePoint folder creation when new Salesforce records are created
- Reduce Salesforce storage consumption by storing files in SharePoint instead
- Create consistent, searchable document structure tied to business records

---

## When It's a Good Fit

Recommend this integration pattern when the organization has **all or most** of the following:

| Characteristic | Why It Matters |
|---|---|
| Salesforce is a primary business platform | Users spend most of their day in Salesforce — document access should be in their workflow |
| SharePoint is already the standard document repository | Aligns with existing tools and user habits |
| Growing document volumes tied to CRM records | Moving storage to SharePoint avoids Salesforce storage cost pressure |
| Inconsistent folder structure today | Automated folder creation tied to Salesforce records improves consistency |
| Multiple teams need access to CRM-related files | SharePoint provides better collaboration + M365 integration than Salesforce native files |

---

## When It's a Weaker Fit

Flag these situations before recommending the integration:

- Organization does not use SharePoint in a structured way (no governance = integration just shifts the disorder)
- Salesforce users rarely need file access within CRM workflows
- Document permissions are extremely complex and cannot be cleanly mapped between platforms
- No ownership exists for SharePoint governance (integration requires someone to maintain it)
- Goal is full document management transformation — a broader content architecture exercise is needed first

---

## Best-Fit Use Cases by Team

| Team | Document Types |
|---|---|
| Sales | Proposals, quotes, contracts linked to Opportunities |
| Account Management | Customer-specific document sets linked to Accounts |
| Operations | Records tied to Cases or Projects |
| Marketing | Approved collateral linked to Salesforce campaigns/workflows |
| Service | Supporting documentation tied to customer service records |

---

## Where Caution Is Needed

### 1. Information Architecture Must Be Designed First
A poorly designed SharePoint structure integrated with Salesforce just moves document disorder from one platform to another. Before deployment, define:
- Where documents will live (which sites, libraries)
- How folders will be created (naming conventions, triggered by which Salesforce object)
- Who should have access to what
- Whether different Salesforce objects (Accounts, Opportunities, Cases) need different folder structures

### 2. Permissions Must Be Aligned
SharePoint permissions do not automatically mirror Salesforce permissions. Without planning:
- Users may see links to files they cannot open
- Governance becomes inconsistent across platforms
- External sharing settings in SharePoint may conflict with Salesforce record visibility

### 3. User Experience Must Be Validated
The integration's value depends entirely on how intuitive it is for the specific teams using it. Run a pilot before broad rollout.

### 4. Automation Scope Should Start Small
It is easy to overcomplicate folder creation, file routing, and record-based automation. Best implementations begin with 2–3 high-value use cases and expand over time. Salesforce Flow can be used for automation but requires careful scoping.

### 5. Licensing and Support
Review commercial model, feature limits, vendor support responsiveness, and long-term maintainability before committing to an integration tool.

---

## Recommended Validation Exercise (before purchase/deployment)

Run a short structured validation covering these five areas:

**1. Business use cases**
- Which Salesforce objects need document integration? (Accounts? Opportunities? Cases?)
- What specific business process problem is being solved?

**2. SharePoint destination design**
- Which sites and libraries should hold the content?
- What folder structure is required per object type?

**3. Permissions model**
- Who needs access in Salesforce?
- Who needs access in SharePoint?
- How do these maps overlap, conflict, or need to be reconciled?

**4. Automation opportunities**
- Which record-triggered folder creation scenarios are worth automating first?
- What is the trigger (record creation, stage change, record type)?

**5. Pilot validation**
- Test the user experience with a small set of records (10–20) and users (5–10) before broader rollout
- Validate: folder creation, file linking, SharePoint access from within Salesforce, permission behavior

---

## Benefits Summary (if implemented correctly)

- Lower Salesforce storage consumption and cost pressure
- More consistent file and folder organization across CRM records
- Easier user access to relevant documents without leaving Salesforce
- Better integration with the broader Microsoft 365 ecosystem
- Improved collaboration on documents with SharePoint co-authoring
- More scalable long-term document management for CRM-related workflows
- Automation opportunities through Salesforce Flow

**Benefits are most significant** when the organization has already standardized on Microsoft 365 and wants to extend that investment into CRM document workflows.

---

## Pete's Delivery Notes

- **This assessment type is a pre-sales tool, not a deployment SOW** — use it to build trust and demonstrate structured thinking before the client commits to any purchase. It positions Pete as an advisor, not a vendor.
- **The permission mapping conversation is where most integrations fail** — SharePoint has inheritance-based permissions, Salesforce has role-based permissions. They don't map cleanly. Spend disproportionate time on this in the validation exercise.
- **Don't let the client overbuild automation on day one** — Salesforce Flow-triggered folder creation sounds simple but becomes complex fast when you add conditions for different object types, record owners, or department-specific structures. Start with one object, one folder template, validate, then expand.
- **SharePoint governance is a prerequisite, not a parallel workstream** — if the client's SharePoint is already a mess (flat libraries, inconsistent naming, no owner), the integration will make it worse, not better. Address governance first or scope it as part of the same engagement.
- **The strongest version of this solution** is when SharePoint is the client's established document platform and Salesforce is their established CRM — the integration adds convenience without changing either platform's role. If either platform is immature, the integration delivers less value.
- **Natural follow-on engagements:** SharePoint information architecture design, SharePoint governance policy, Salesforce Flow automation, M365 Copilot for document summarization within Salesforce workflows.
