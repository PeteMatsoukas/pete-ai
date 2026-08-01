# Azure Virtual Desktop (AVD) Deployment — Windows 11 Multi-Session + FortiGate + FSLogix

**Domain:** Azure Infrastructure · Virtual Desktop · Identity · Networking · Security
**Specialist:** Azure SA / Network SA / M365 & Intune SA
**Use when:** A client asks about Azure Virtual Desktop, VDI in Azure, remote desktop replacement, Work From Anywhere infrastructure, FSLogix profile management, or FortiGate-secured Azure environments with S2S VPN. Also use when a client needs to host an ERP/SQL application centrally and provide desktop access to distributed users.

---

## Engagement Profile

**Type:** AVD greenfield deployment + FortiGate security + S2S VPN + SQL/ERP optimization
**Region:** Azure West Europe
**Host pool type:** Pooled — Windows 11 Enterprise multi-session
**Identity model:** Azure AD Join or hybrid (AD Connect required for hybrid)
**Profile persistence:** FSLogix profile containers on Azure Files
**Security:** FortiGate virtual firewall + Conditional Access + MFA
**Connectivity:** S2S VPN (HQ to Azure) + client VPN (remote users via FortiGate)
**Duration estimate:** 48–64 hours total (32–40 systems + 16–24 networking)
**Billing model:** One-time professional services + FortiGate-VM 1-year UTP subscription license (1x, 2 CPU)

---

## When to Recommend This Pattern

Recommend AVD when a client:
- Has remote or distributed users who need access to a centralized Windows desktop or application
- Runs an ERP or line-of-business application that needs to be hosted centrally (not on each user's PC)
- Wants to eliminate thick client management (patching, imaging, hardware refresh cycles)
- Has poor performance accessing on-premises applications remotely (VPN latency, bandwidth)
- Needs to scale user count up/down without buying new hardware
- Is considering DaaS (Desktop as a Service) alternatives (Citrix, Parallels) — AVD is the Microsoft-native answer
- Already has Microsoft 365 E3/E5 or Windows E3/E5 licensing (AVD access rights are included)

**Key qualifying questions:**
- "How do your remote users currently access your ERP or business applications?"
- "How many users need desktop access, and are they always in the office or remote?"
- "Do you already have Microsoft 365 or Windows Enterprise licensing?"
- "Is your internet connection at HQ reliable enough to support cloud-hosted desktops?"
- "Do you have an on-premises Active Directory, or are you fully Azure AD?"

**Licensing note:** AVD user access rights are included with Microsoft 365 E3, E5, Business Premium, and Windows E3/E5. Always confirm the client has eligible licensing before scoping — this is often a free capability they don't know they have.

---

## Solution Architecture

### Azure Virtual Desktop Layer
- **Host Pool:** Pooled (multi-session) — multiple users share session host VMs; cost-efficient for task workers
- **Session Host:** Windows 11 Enterprise multi-session (1 VM initially, autoscaling optional)
- **Application Group:** Desktop application group (full desktop published)
- **Workspace:** AVD Workspace linked to App Groups — users access via Windows App client
- **User assignment:** Azure AD users/groups assigned to App Groups

### Profile Persistence — FSLogix
- FSLogix profile containers stored on Azure Files (or NetApp Files for higher performance)
- User profiles follow users across session hosts — sessions are stateless, profiles are persistent
- Microsoft 365 Apps included — Office roaming settings managed via FSLogix Office Container

### Identity & Access
- Azure AD Join (cloud-only) or hybrid (requires Azure AD Connect from on-premises AD)
- Conditional Access policies applied to AVD resource app
- MFA enforced for all AVD access
- Azure Monitor + Log Analytics + AVD Insights enabled for monitoring

### Networking
- AVD VNet with dedicated subnets (session hosts, management, gateway)
- DNS configured for AVD resource resolution
- FortiGate virtual firewall protecting all Azure resources
- S2S VPN between HQ and Azure (FortiGate-to-HQ firewall)
- Client VPN through FortiGate for remote users
- Secure traffic flow: HQ → S2S VPN → FortiGate → AVD session hosts

### SQL / ERP Optimization
- SQL/ERP server resources increased (vCPU, RAM, disk) as part of engagement
- SQL Server instance optimized (tempdb, memory settings, indexing, I/O configuration)
- Scoped separately from AVD deployment but delivered in same engagement

---

## Effort Estimate

| Workstream | Hours |
|---|---|
| Systems (AVD, FSLogix, SQL/ERP, identity, monitoring) | 32–40 |
| Networking (FortiGate, S2S VPN, client VPN, VNet, DNS) | 16–24 |
| **Total** | **48–64 hours** |

---

## Scope of Services (included)

**Azure Foundation:**
- Validate existing Azure subscription and tenant
- Configure resource groups, networking, permissions
- Confirm/configure Azure AD Connect if hybrid identity required

**Networking & Security:**
- Azure VNet and subnet configuration
- DNS configuration for AVD resources
- FortiGate virtual firewall deployment and configuration
- S2S VPN — HQ to Azure (FortiGate to HQ firewall)
- Client VPN for remote users via FortiGate
- Firewall policy configuration for AVD traffic flows

**AVD Deployment:**
- Host pool creation (pooled, Windows 11 Enterprise multi-session)
- Session host VM deployment (1 initially)
- Application Group creation (Desktop)
- Workspace creation and App Group registration
- Autoscaling policy configuration (if required)

**Profile & App Management:**
- FSLogix profile container implementation on Azure Files
- Microsoft 365 Apps for Enterprise installation and configuration

**Security & Monitoring:**
- Azure AD user/group assignment to App Groups
- Conditional Access + MFA policy configuration
- Azure Monitor, Log Analytics, AVD Insights enablement

**SQL/ERP:**
- SQL/ERP server resource increase
- SQL Server instance optimization

**Testing & Handover:**
- User connectivity validation (AVD client + web client)
- FSLogix profile persistence testing
- Application access and performance testing
- High-Level Design (HLD) with architecture diagram
- Deployment and administration guide
- Knowledge transfer workshop (up to 2 hours)

---

## Out of Scope

- ERP or business application installation/configuration (application vendor responsibility)
- Migration of existing desktops or applications beyond agreed scope (application vendor)
- Advanced IaC automation (ARM/Bicep/Terraform) unless separately scoped
- ISP circuit upgrade (client responsibility — must be completed before project start)

---

## Key Assumptions

- Client has active application vendor support for business applications running in AVD
- Client has required AVD and Microsoft 365 licensing (M365 E3/E5 or Windows E3/E5)
- Client provides Azure subscription access, permissions, and credentials
- ISP internet line at HQ upgraded to fast, reliable connection before project start
- Users connect via Windows App client only (not web browser or thin client)
- Hybrid identity (if required): Azure AD Connect already in place or scoped separately

---

## Acceptance Criteria

1. Users can access a published desktop via the AVD Workspace
2. Session host VM joined to directory and accessible
3. Conditional Access and MFA applied and enforced for AVD access
4. FSLogix profiles persist correctly across sessions
5. Microsoft 365 Apps accessible from within AVD session
6. FortiGate firewall deployed and operational
7. S2S VPN active and passing traffic between HQ and Azure
8. Remote users can connect via client VPN
9. Documentation and knowledge transfer completed

---

## Pooled vs. Personal Host Pool — Decision Guide

| | Pooled (multi-session) | Personal (single-session) |
|---|---|---|
| **Best for** | Task workers, call centers, light office users | Power users, developers, CAD/GIS users |
| **Cost** | Lower — VMs shared across users | Higher — one VM per user |
| **User experience** | Consistent, but shared resources | Dedicated resources, more control |
| **Profile management** | FSLogix required | FSLogix optional |
| **Application install** | Installed once for all users on host | Installed per VM |
| **This engagement** | ✅ Pooled | — |

Recommend starting with pooled unless users have specialized hardware or software requirements. Personal host pools are 2–3x more expensive for the same user count.

---

## FSLogix Profile Container — Key Points

- Profiles stored as .VHD/.VHDX files on Azure Files share
- User gets same profile regardless of which session host they land on
- Supports Office Container (Outlook cache, Teams state, OneNote) separately from Profile Container
- Azure Files recommended for most deployments; NetApp Files for high I/O or large profile workloads
- Sizing guidance: start with 30–50 GB per user profile allocation; adjust based on usage

---

## Risks

- **ISP bandwidth:** AVD quality is directly proportional to the user's internet connection quality. If HQ ISP is slow or unreliable, desktop experience suffers even if Azure infrastructure is perfect. This is the #1 user satisfaction risk.
- **Application compatibility:** Not all applications run cleanly in multi-session Windows 11. Test ERP/LOB applications before go-live — some require per-machine installation mode, registry changes, or vendor-specific AVD support.
- **FSLogix profile corruption:** If Azure Files is unavailable when a user logs in, FSLogix falls back to a temporary local profile. Users lose their session data. Ensure Azure Files is in a resilient configuration and monitor availability.
- **Autoscaling misconfiguration:** Aggressive autoscaling can shut down session hosts while users are logged in. Configure drain mode and session limits carefully before enabling autoscaling.
- **Conditional Access blocking AVD access:** CA policies that are too restrictive (e.g., requiring compliant devices) can lock users out of AVD. Test CA policies with a pilot user group before broad rollout.

---

## Pete's Delivery Notes

- **ISP upgrade is a client dependency, not a nice-to-have** — if the client's HQ internet is poor, AVD will be blamed regardless of how well Azure is configured. Make this a hard prerequisite and confirm it's done before the first user pilots.
- **Application vendor must be engaged early** — ERP applications in AVD often require vendor-specific installation modes (per-machine, not per-user), registry edits, or licensing server configuration. Don't scope AVD go-live until the application vendor confirms AVD support.
- **Pilot with 3–5 users before full rollout** — FSLogix, Conditional Access, and application compatibility issues all surface in a small pilot at low cost. Broad rollout without piloting is the single biggest source of AVD project failures.
- **FortiGate pre-deployment before AVD session host deployment** — session hosts must be able to reach Azure AD, DNS, and internet update servers during deployment. Have networking in place before spinning up session hosts.
- **Knowledge transfer quality matters** — AVD administration (adding session hosts, managing profiles, monitoring) is not intuitive. A 2-hour workshop isn't enough to fully train a new admin. Deliver the admin guide as a living document and offer follow-up sessions as an add-on.
- **Autoscaling is optional in scope but nearly always wanted** — if the client has variable user load (more users during business hours, fewer evenings/weekends), autoscaling pays back its configuration effort in Azure compute savings within weeks.
