# Network Infrastructure Assessment — SonicWall + Netgear + Aruba Instant On

**Domain:** Networking · Firewall · VPN · Wireless · Switching · Security
**Specialist:** Network SA
**Use when:** A client asks for a network assessment, wants to review firewall hygiene, needs VPN hardening recommendations, is considering switching platform modernization, or has a SonicWall + Netgear + Aruba Instant On environment. Also use as a reference for structuring network assessment deliverables and findings reports.

---

## Engagement Profile

**Type:** Network infrastructure assessment (not a deployment SOW — assessment and recommendations)
**Environment size:** SMB — single site, no S2S VPN, SSL VPN for remote access
**Firewall:** SonicWall TZ570
**Switching:** Multiple Netgear gigabit switches (48-port + 8-port)
**Wireless:** Aruba Instant On (cloud-managed)
**Internet:** Business-class fiber ~300 Mbps
**Remote access:** SSL VPN (local auth + RADIUS — RADIUS currently down)
**Overall status:** Functional and stable — no emergency, but targeted remediation needed

---

## When to Recommend a Network Assessment

Recommend a network assessment engagement when a client:
- Has not had a formal network review in 12+ months
- Is experiencing intermittent connectivity, VPN, or wireless issues
- Is planning a security hardening initiative or compliance audit (HIPAA, ISO, etc.)
- Is considering switching platform or firewall replacement
- Has grown beyond their original network design (more users, more sites, more devices)
- Has had IT staff turnover and lacks documentation of the current environment
- Is preparing for cyber insurance renewal (insurers increasingly ask about MFA on VPN, firewall hygiene)

**Assessment deliverable structure** (use this as a template):
1. Executive Summary (non-technical — overall verdict + top 3 priorities)
2. Current Environment Overview (platform-by-platform inventory)
3. Key Findings (numbered, each with risk explanation + recommendation)
4. Security Observations (focused summary of highest-risk items)
5. Infrastructure Inventory (clean list of all identified components)
6. Recommended Next Steps (prioritized 1–4)

---

## Current Environment — Reference Inventory

| Component | Platform | Status |
|---|---|---|
| Firewall | SonicWall TZ570 | Active, firmware current, cloud backup enabled |
| Internet | Business fiber ~300 Mbps | Adequate for current operations |
| Switching | Multiple Netgear gigabit (48-port + 8-port) | Functional, SMB-grade |
| Wireless | Aruba Instant On (cloud portal) | Acceptable for standard office use |
| Remote access | SSL VPN (SonicWall) | Active — local auth in use, RADIUS down |
| UPS | Managed UPS | Present, no centralized monitoring |
| S2S VPN | None | No site-to-site tunnels identified |

---

## Key Findings & Recommendations

### Finding 1 — Firewall Rule and NAT Cleanup (Priority 1 — Security)

**Risk:** Unused inbound rules and NAT entries referencing inactive systems increase attack surface and complicate administration. Legacy published services are a common ransomware entry point.

**Recommendation:**
- Full review of all inbound firewall rules, NAT policies, and published services
- Remove any rule or NAT entry where the referenced internal host is confirmed inactive
- Document remaining rules with business justification (owner, purpose, last-reviewed date)
- Implement a rule review cadence (minimum annually)

**Pete's note:** This is almost always the highest-ROI firewall task in an SMB environment. It costs nothing except review time and immediately reduces attack surface. It also exposes forgotten published services that the client often didn't know were still open.

---

### Finding 2 — VPN Authentication Hardening (Priority 1 — Security)

**Risk:** RADIUS authentication is showing as down. Local user accounts are being used for VPN access. Local-only VPN accounts are difficult to audit, don't benefit from centralized identity lifecycle management, and cannot enforce MFA through the identity provider.

**Current state:** SSL VPN active, RADIUS unhealthy, local auth fallback in use.

**Recommendation:**
- Restore RADIUS authentication or replace with SSO-compatible centralized identity
- Eliminate local-only VPN user accounts where possible
- Implement MFA for all remote VPN access (DUO, Microsoft Entra MFA, or equivalent)
- Consider ZTNA/SASE as a longer-term VPN replacement (see network modernization below)

**Pete's note:** MFA on VPN is now a baseline cyber insurance requirement. Clients who lack it face premium increases or coverage denial. Frame this as a business risk, not just a security recommendation — it lands better with decision-makers.

---

### Finding 3 — Switching Platform Modernization (Priority 2 — Medium Term)

**Risk:** Netgear SMB switches lack enterprise-grade visibility, consistent CLI/API management, centralized configuration, and meaningful lifecycle support. Not an emergency if currently stable, but a medium-term liability.

**Recommendation:** Plan phased replacement with enterprise-grade switching. Options by use case:

| Option | Best When |
|---|---|
| **Cisco Meraki** | Client wants cloud-managed, full-stack visibility, easy multi-site management |
| **FortiSwitch** | Client is standardizing on FortiGate security stack (single-pane-of-glass with FortiManager) |
| **HPE/Aruba Instant On 1930** | Budget is primary constraint, wireless already on Aruba |

**Pete's note:** Lead with FortiSwitch if the client already has or is moving to FortiGate — the integration value (unified SD-Branch management, automated VLAN/security policy from FortiGate) is a genuine differentiator and drives FortiGate firewall replacement conversation naturally.

---

### Finding 4 — Wireless Platform (Priority 3 — Monitor)

**Current state:** Aruba Instant On — cloud-managed, acceptable for standard office wireless.

**Recommendation:** No immediate replacement needed unless any of the following apply:
- Known coverage gaps or dead zones
- Performance complaints from users
- Poor roaming behavior between APs
- Inability to segment guest, corporate, and IoT traffic
- HIPAA or compliance requirements for wireless segmentation

**If replacement is warranted:** Aruba Instant On 1930-series switches pair well with the existing Aruba wireless platform. FortiAP is the natural choice if standardizing on a full FortiGate security stack.

---

### Finding 5 — Monitoring (Priority 4 — Visibility)

**Current state:** Managed UPS present but no centralized monitoring. No network monitoring platform identified.

**Recommendation:** Evaluate local monitoring for UPS and network devices:
- PRTG Network Monitor (strong SMB fit, supports SNMP, UPS, switches, servers)
- FortiManager/FortiAnalyzer if moving to FortiGate stack
- Auvik (MSP-friendly, agentless, good for network device discovery and topology mapping)

**Pete's note:** Monitoring conversations are also a natural entry point for managed services discussions — once a client sees their network on a dashboard, they often ask "who watches this?"

---

## Security Summary — The Two Most Impactful Items

If a client can only do two things from this assessment:

1. **Remove obsolete firewall/NAT rules** — reduces attack surface immediately, zero cost
2. **Add MFA to VPN access** — blocks the #1 remote access attack vector, often required for cyber insurance

Both can be completed without hardware replacement or significant budget. Frame these as the minimum security baseline before any other infrastructure conversation.

---

## DKIM/DMARC Email Security Note

*(Applicable when email security is in scope alongside network assessment)*

If email protection is reviewed as part of the same engagement:
- **SPF:** Validate and confirm all sending sources are included
- **DKIM:** Enable if not configured — DMARC alignment requires DKIM or SPF alignment; without both, DMARC enforcement is incomplete
- **DMARC:** Configured without full SPF/DKIM alignment = enforcement gap. Move from `p=none` to `p=quarantine` then `p=reject` once alignment is confirmed

---

## Recommended Next Steps (Prioritized)

| Priority | Action | Urgency |
|---|---|---|
| 1 | Review and remove unused NAT rules and inbound firewall rules | Immediate |
| 1 | Restore centralized VPN auth (RADIUS) + implement MFA on VPN | Immediate |
| 2 | Assess switch health, lifecycle status; develop phased replacement roadmap | 3–6 months |
| 3 | Evaluate local monitoring (PRTG or equivalent) for UPS and network devices | 6–12 months |

---

## Upsell/Follow-On Engagement Triggers from This Assessment

| Finding | Natural Follow-On Engagement |
|---|---|
| RADIUS down + local VPN auth | VPN hardening project (RADIUS restore, MFA deployment, or ZTNA/SASE) |
| Weak Conditional Access + low Secure Score | M365/Entra ID hardening initiative |
| Netgear switching — SMB-grade | Switching refresh project (FortiSwitch, Meraki, or Aruba) |
| No monitoring | Managed monitoring service or PRTG deployment |
| Aruba Instant On wireless — limited segmentation | Wireless redesign if compliance (HIPAA) requires network segmentation |
| No S2S VPN | SD-WAN or site-to-site VPN project if multi-site growth is planned |

---

## Pete's Delivery Notes

- **Assessment deliverables set the tone for the entire relationship** — a well-structured, honest assessment report with prioritized findings builds more trust than any sales pitch. Lead with findings that benefit the client, not findings that maximize scope.
- **"Functional but not ideal" framing** is the right tone for findings like the Netgear switches — don't create panic about something that isn't actually failing, but do give the client a clear view of where they're exposed.
- **Always confirm RADIUS before concluding the assessment** — RADIUS "showing as down" could mean misconfiguration, expired certificate, NPS service stopped, or a firewall rule blocking UDP 1812/1813. Diagnose before recommending replacement.
- **MFA on VPN is the one finding that almost always converts to a project** — frame it around cyber insurance, compliance, and the credential-stuffing attack trend. Most clients act on this finding within 30 days.
- **Document everything you find, not just the problems** — a clean inventory of switches, APs, UPS, and firewall rules is itself valuable to a client that doesn't have documentation. It's also your baseline for future work.
