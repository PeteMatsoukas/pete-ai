# M365 Licensing Assessment & Security Posture Recommendations — Mid-Size Organization

**Domain:** M365 · Entra ID · Intune · Security Posture · SASE · Conditional Access
**Specialist:** M365 & Intune SA / M365 Security SA
**Use when:** A client asks about M365 licensing optimization, moving from basic MDM to Intune, improving Entra ID / Conditional Access posture, DKIM/DMARC email authentication hardening, replacing legacy VPN with SASE/ZTNA, or needs a security assessment starting point for an M365 tenant. Also relevant for HIPAA or regulated-industry clients needing M365 compliance alignment.

---

## Engagement Profile

**Type:** M365 licensing review + security posture assessment + strategic recommendations
**Environment size:** ~140 users, ~133 Windows devices, mid-size organization
**Compliance driver:** HIPAA and data privacy/confidentiality regulations
**Current state:** M365 E3 primary licensing, basic MDM, weak Conditional Access, low Secure Score
**Outcome:** Prioritized roadmap for licensing optimization, Intune migration, Entra ID hardening, SASE adoption

---

## Current State Baseline (use as assessment template for similar clients)

### Microsoft 365 Licensing
| License | Count | Notes |
|---|---|---|
| Microsoft 365 E3 | ~120 | Primary workforce license |
| Office 365 E3 | ~15 | Older SKU — assess consolidation to M365 E3 |
| Visio Plan 1 | 2 | Specialty license — confirm active use |
| Defender for Office 365 Plan 1 | Add-on | Separate purchase — not included in M365 E3 |
| Defender for Endpoint Plan 1 | Included | Bundled in M365 E3 with active connector |

**Licensing hygiene note:** Organizations at this size frequently have orphaned licenses (departed employees, unused service accounts, duplicate SKUs). Always audit before renewal — savings are common.

### Device & Identity
- ~130 Windows devices joined to Microsoft Entra ID
- Enrolled in **Microsoft 365 built-in MDM** (not Intune) — basic management only
- Defender for Endpoint enabled and included with M365 E3

### Email Security
| Control | Status |
|---|---|
| Mimecast (email defense + backup) | ✅ In use |
| SPF | ✅ Configured correctly |
| DKIM | ❌ Not enabled |
| DMARC | ⚠️ Enabled but misaligned — SPF/DKIM not aligned |

**Critical finding:** DMARC without DKIM alignment is partially effective at best. Attackers can still spoof the domain in scenarios where DKIM signing is not validated. DKIM must be enabled and aligned with DMARC for full email authentication protection.

### Security Posture
- Entra ID Secure Score: **low**
- Conditional Access policies: **in place but weak** — do not align with current security/compliance standards
- No Intune — device compliance status cannot gate M365 access
- No SASE/ZTNA — remote workers use legacy client VPN

---

## Prioritized Recommendations

### Priority 1 — License Audit & Consolidation (quick win, immediate cost impact)

**Action:** Audit all M365 user accounts, service accounts, and assigned licenses. Remove or reassign licenses for:
- Departed employees
- Shared mailboxes that don't require user licenses
- Duplicate or redundant SKU assignments (Office 365 E3 vs. M365 E3)
- Specialty licenses (Visio) with no confirmed active users

**Outcome:** Reduces monthly licensing spend, improves tenant hygiene, removes attack surface from orphaned accounts.

**Pete's note:** Run a license utilization report via Microsoft 365 Admin Center → Reports → Usage before the renewal date. Clients frequently discover 10–20% unused licenses on first audit.

---

### Priority 2 — Replace Built-in MDM with Microsoft Intune (high impact on security posture)

**Current state:** Microsoft 365 built-in MDM provides basic device management:
- Remote wipe
- Passcode enforcement
- Encryption requirement
- Basic app installation

**Why this is insufficient:**
The most critical missing capability is **Conditional Access integration**. With built-in MDM, M365 access cannot be gated on whether a device is compliant, managed, or company-issued. A non-compliant personal device with a valid credential gets the same access as a fully managed corporate device.

**What Intune adds:**
| Capability | Built-in MDM | Intune |
|---|---|---|
| Remote wipe | ✅ | ✅ |
| Passcode + encryption | ✅ | ✅ |
| Device compliance policies | ❌ | ✅ |
| Conditional Access integration | ❌ | ✅ |
| Mobile Application Management (MAM) | ❌ | ✅ |
| App protection for BYOD | ❌ | ✅ |
| Configuration profiles (Wi-Fi, VPN, certs) | ❌ | ✅ |
| Endpoint security policies | ❌ | ✅ |

**Implement both MDM and MAM:**
- **MDM:** Company-owned Windows devices — full device management, compliance enforcement, Conditional Access gate
- **MAM without enrollment (MAM-WE):** Employee-owned (BYOD) mobile devices — protect corporate data in M365 apps without enrolling the personal device

**Licensing:** Intune is included in Microsoft 365 E3 (via the EMS E3 component) — **no additional license cost** if the client is already on M365 E3. This is commonly unknown and should be highlighted as a zero-cost capability upgrade.

---

### Priority 3 — DKIM + DMARC Alignment (quick win, critical for email security)

**Current gap:** DMARC is enabled but DKIM is not configured. This means:
- Outbound emails lack a cryptographic DKIM signature
- DMARC p=reject/quarantine may not function as intended against spoofing
- Mimecast protects inbound email but outbound authentication is incomplete

**Action:**
1. Enable DKIM signing in Microsoft 365 Admin Center → Security → Email Authentication
2. Publish DKIM CNAME records in public DNS (two records per domain)
3. Verify DMARC alignment after DKIM propagates (48–72 hours)
4. Consider tightening DMARC policy from `p=none` to `p=quarantine` then `p=reject` in phases

**Time to implement:** 1–2 hours configuration + 48–72 hours DNS propagation. One of the highest-impact, lowest-effort security improvements available in any M365 tenant.

---

### Priority 4 — Entra ID & M365 Security Hardening Initiative (most impactful, most effort)

**Current state:** Low Secure Score, weak Conditional Access policies, no structured hardening in place.

**For HIPAA-regulated clients this is not optional** — Conditional Access, MFA, and device compliance enforcement are baseline technical safeguards expected under HIPAA's Security Rule.

**Hardening scope should cover:**

**Identity controls:**
- MFA enforced for all users (not just admins)
- Phishing-resistant MFA for privileged accounts (FIDO2 or certificate-based)
- Block legacy authentication protocols (SMTP AUTH, IMAP, POP3 — these bypass MFA)
- Privileged Identity Management (PIM) for admin role activation (requires Entra ID P2)

**Conditional Access policies (structured baseline):**
- Require MFA for all users
- Require compliant device for access to M365 apps (requires Intune — see Priority 2)
- Block access from unknown/high-risk locations
- Block legacy authentication
- Require MFA for admin portal access
- Sign-in risk and user risk policies (requires Entra ID P2 / Identity Protection)

**Secure Score targets:**
- Audit current Secure Score and document baseline
- Prioritize controls by score impact and implementation effort
- Target 80%+ Secure Score as a medium-term goal
- Use Secure Score recommended actions as the implementation backlog

**Reference:** See `reference-m365-entra-hardening-2026.md` for the full 12-item hardening checklist, Conditional Access template categories, and the 3-pillar framework.

---

### Priority 5 — Replace Legacy Client VPN with SASE/ZTNA (strategic, longer-term)

**Current state:** Remote workers use a traditional client VPN. Traditional VPN provides network-level access — once connected, users are on the corporate network with broad lateral movement potential.

**Recommended direction: SASE (Secure Access Service Edge)**

SASE combines the following into a cloud-native security service:
| Component | Function |
|---|---|
| SD-WAN | Optimized, policy-based connectivity to cloud and branch |
| FWaaS (Firewall as a Service) | Cloud-delivered next-gen firewall for all traffic |
| ZTNA (Zero Trust Network Access) | Application-level access based on identity + device posture, not network trust |
| CASB | Cloud application visibility and control |
| SWG | Secure web gateway for internet traffic |

**Why SASE over VPN:**
- VPN grants broad network access — ZTNA grants access only to specific applications
- VPN performance degrades with cloud-hosted resources (hairpinning) — SASE routes directly
- VPN client management is high overhead — SASE agents are lightweight and cloud-managed
- VPN gives no visibility into what users do once connected — SASE provides full traffic inspection

**Positioning:** This is a strategic initiative, not a quick win. Scope as a separate engagement after Intune and Entra ID hardening are in place — device compliance and identity are prerequisites for effective ZTNA policy enforcement.

---

## Recommended Implementation Sequence

| Phase | Action | Effort | Impact |
|---|---|---|---|
| 1 | License audit + account cleanup | Low | Medium — cost + hygiene |
| 2 | DKIM + DMARC alignment | Very Low | High — email security |
| 3 | Intune MDM/MAM deployment | Medium | Very High — device compliance gate |
| 4 | Entra ID + M365 hardening (CA, MFA, Secure Score) | Medium-High | Very High — posture + HIPAA |
| 5 | SASE/ZTNA migration | High | Very High — strategic, long-term |

---

## HIPAA Alignment Notes

For regulated clients (healthcare, dental, financial), frame the security recommendations as **required technical safeguards**, not optional improvements:

- **MFA for all users:** Required under HIPAA Access Control and Authentication standards
- **Conditional Access with device compliance:** Required under HIPAA Workstation Use and Security standards
- **Audit logging:** Required under HIPAA Audit Controls — ensure M365 audit log is enabled and retention configured
- **DKIM/DMARC:** Required under HIPAA Transmission Security for email containing PHI
- **Encryption at rest and in transit:** Confirm M365 encryption settings and device encryption via Intune BitLocker policy
- **Incident response readiness:** Defender for Endpoint + Defender for Office 365 Plan 1 (already licensed) provides detection capability — ensure alerts are reviewed and responded to

**Key message for regulated clients:** A low Secure Score is not just a technical weakness — it is a compliance gap that creates regulatory liability. Remediation is not optional; it is a business requirement.

---

## Pete's Delivery Notes

- **Lead with the license audit** — it's the fastest win and often pays for part of the engagement. Clients love seeing immediate cost savings.
- **Intune is free in M365 E3** — say this clearly and early. Clients who think Intune costs extra often delay the decision. It's already in their license.
- **DKIM takes 10 minutes to configure and 48 hours to propagate** — do this in the first session. It's the highest-impact smallest-effort fix in any M365 engagement.
- **Conditional Access before Intune deployment is a mistake** — if you require compliant devices in CA before Intune is enrolled and policies are applied, you'll lock everyone out. Sequence matters: Intune enrollment → compliance policies → CA enforcement.
- **HIPAA clients need written evidence** — document every security control implemented, when it was implemented, and what it protects against. This is not just good practice; it's what they need for a HIPAA audit.
- **SASE is a C-level conversation, not an IT conversation** — position it as a strategic security investment that eliminates VPN overhead and reduces breach risk. Bring business risk framing, not technical specs.
