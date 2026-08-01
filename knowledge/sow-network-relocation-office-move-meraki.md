# Network Infrastructure Relocation — Office Move Assessment & Implementation

**Domain:** Networking · Physical Infrastructure · Wireless · Switching · Project Management
**Specialist:** Network SA
**Use when:** A client is planning an office move and needs to relocate network infrastructure, asks about wireless AP placement for a new site, needs switching capacity planning for a new office, or wants a relocation assessment and implementation SOW. Also use as a template for scoping office move engagements.

---

## Engagement Profile

**Type:** Office relocation — network infrastructure assessment + move support
**Environment:** Meraki stack (MX firewall + MS switching + MR wireless)
**Existing hardware:** 1x MX75 firewall, 1x MS130-48P switch, 7x MR36 APs
**Hardware model:** HaaS (Hardware-as-a-Service) arrangement
**Estimated effort:** 10 hours Tier-2 engineering + 3 hours PMO
**Estimated cost:** ~$3,400 (planning-level — confirmed after final scoping)
**Duration:** Single-phase engagement (pre-move assessment + move day execution)

---

## When to Recommend This Engagement Type

Recommend a network relocation assessment when a client:
- Is planning an office move in the next 30–90 days
- Has managed network infrastructure (firewall, switches, APs) that needs to be relocated
- Hasn't engaged a low-voltage vendor yet (Pete coordinates the handoff)
- Needs wireless coverage planning for the new floor plan
- Has uncertainty about switch count, AP count, or cabling requirements
- Is on a HaaS model and may need additional devices for the new site

**Key qualifying questions:**
- "Do you have a floor plan for the new space?"
- "Do you know how many network drops you'll need?"
- "Are you keeping your existing networking equipment or replacing it?"
- "Have you already engaged a low-voltage / cabling vendor?"
- "What's your target move date?"
- "Are you on a HaaS model or do you own your equipment?"

---

## Site Planning Framework

### Wireless Coverage Planning

| AP Count | Coverage Level | When to Use |
|---|---|---|
| 7 APs (minimum) | Acceptable basic coverage | Tight budget, simple layout, low user density |
| **9 APs (recommended)** | **Strong coverage + capacity** | **Standard recommendation for most office environments** |

**Factors that determine final AP count:**
- Final office layout and wall/ceiling construction (concrete, drywall, glass all behave differently)
- User density and device count per area
- Conference room coverage requirements
- Expected wireless device mix (laptops, mobile, IoT, printers)
- Low-voltage and power drop availability at AP locations

**Always validate AP placement in the field** — a floor plan estimate is a starting point, not a final design. Coverage holes discovered after installation are expensive to fix.

### Cabling / Drop Count Estimation Method

Use this framework for planning-level estimates:

1. Count potential workstation locations from floor plan
2. Add AP locations (1 drop per AP)
3. Add conference room drops (minimum 2 per room — AV + network)
4. Add printer/copier locations
5. Buffer 10–15% for adds/moves in first 6 months

**Example from this engagement:**
- 88 workstation drop locations identified
- 9 AP locations identified
- **Total estimated cable runs: 97**

### Switching Capacity Planning

| Patching Strategy | Estimated Switch Count |
|---|---|
| Single-drop per location, all active | Minimum 2 switches |
| Dual-drop per location, all active | Up to 4 switches |

**Final switch count depends on:**
- Actual cable count confirmed from low-voltage drawings
- Whether all runs must be active on day one or some left dark
- PoE requirements (APs, IP phones, cameras all require PoE ports)
- Uplink/stacking requirements between switches

**Switching recommendation:** Always overspec by 1 switch on larger sites — a 48-port switch that's 90% utilized on move day leaves no headroom for growth or troubleshooting isolation.

---

## Facility Readiness Checklist (confirm before implementation)

| Item | Requirement |
|---|---|
| **ISP/carrier** | Client coordinates circuit relocation/installation — not provider scope |
| **Power** | Standard 120V — NEMA 5-15 or NEMA 5-20 receptacles |
| **Rack** | 45U 2-post floor rack OR 18U+ wall mount; 24" depth preferred, 20" minimum |
| **UPS** | New right-sized UPS recommended (see UPS section below) |
| **Low-voltage** | Separate vendor engaged for cabling, AP mounting, patch panel work |
| **Physical readiness** | Rack space, power, and cooling confirmed before implementation date |

### UPS Replacement Guidance

Replace the existing UPS when any of the following apply:
- Oversized for the new equipment load (carrying cost without benefit)
- Requires a non-standard outlet type (complicates deployment)
- Aging beyond preferred lifecycle (typically 3–5 years for battery reliability)

**Recommended spec for standard SMB network stack:**
- 1500VA rackmount UPS
- Network monitoring card (SNMP alerts for power events)
- Environmental/temperature probe (optional but recommended for enclosed IDF/MDF closets)

---

## Scope of Services

### IT/MSP Provider Scope
- Break down existing network equipment at current location
- Transport retained hardware to new site
- Rack firewall and switching equipment at new location
- Configure and provision new switches (if required)
- Configure and provision access points in new locations
- Install and rack new UPS and additional network hardware
- Validate switching, firewall, and wireless functionality
- Post-move testing and basic operational verification

### Low-Voltage Vendor Scope (coordinated by provider, not executed)
- Unmount existing APs from current location
- Mount APs at new location (7 standard + up to 2 additional)
- Complete required low-voltage cabling and physical mounting work
- Cable certification or labeling if required

**Important:** Define the low-voltage/IT split clearly in writing before move day. Disputes about who patches what cable or who mounts what AP create move-day delays. The standard split: low-voltage vendor handles physical cabling and mounting; IT provider handles configuration and validation.

---

## Effort Estimate

| Task | Estimated Hours |
|---|---|
| Break down network equipment at current site | 2 |
| Rack retained equipment at new site | 2 |
| Program new switches and APs | 2 |
| Rack new equipment (UPS, additional switches) | 2–3 |
| Testing and validation | 1 |
| PMO / coordination | 3 |
| **Total Tier-2 Engineering** | **10 hours** |
| **Total PMO** | **3 hours** |

---

## Recommended Parts List (planning-level)

### UPS
- 1x 1500VA rackmount UPS
- 1x network monitoring card
- 1x environmental/temperature probe
- Required monitoring and sensor cables

### Additional APs (if 9-AP design selected)
- 2x wireless access points (matching existing model or compatible)
- 2x corresponding licenses/subscriptions

### Additional Switches (depending on patching strategy)
- 2–4x 48-port PoE switches
- 2–4x corresponding switch licenses/subscriptions
- Required DAC/uplink interconnect cabling
- Copper SFP modules where needed

### Patch Cables
- Bulk patch cable packs (workstation and patch panel terminations)
- Color-coded patch cables for AP identification

---

## Out of Scope

- Audiovisual design, installation, or relocation
- Full low-voltage cabling installation and cable certification (low-voltage vendor)
- Electrical work
- ISP installation charges or carrier scheduling management
- Furniture coordination or construction coordination
- Patch panel design or MDF/IDF redesign beyond move-related scope
- Workstation moves or end-user desk setup
- After-hours work unless specifically approved
- Broader network architecture redesign beyond the relocation scope

---

## Risks

- **Cable count changes:** Planning estimates from floor plans are approximate — final count from low-voltage drawings may differ materially. Don't order switches until cable count is confirmed.
- **Carrier timing:** ISP circuit relocation timelines are outside provider control. If the new circuit isn't live on move day, the client has no internet. Confirm carrier order date and target activation date at kickoff.
- **Low-voltage scope creep:** Cabling work often expands once field validation begins. Get a fixed-price low-voltage quote with a defined change order process.
- **HaaS model impact:** If the client needs additional APs or switches and is on HaaS, those additions may require a new HaaS agreement or conversion to owned equipment. Clarify this before quoting.
- **Physical site readiness:** Rack, power, and cooling not ready on move day = delayed installation. This is the most common source of move-day overruns. Confirm facility readiness 1 week before move.
- **AV systems:** If the client has AV equipment (conference room screens, sound systems) that also needs to move, this requires a separate AV vendor and scope. Don't assume it's included.

## Acceptance Criteria

1. Retained network equipment relocated and installed at new site
2. Approved new hardware installed and connected
3. Switching and firewall services operational
4. Wireless APs mounted and functioning
5. Post-move connectivity testing completed
6. Client confirms relocated network is available for business use

---

## Next Steps to Finalize (use this checklist for every relocation engagement)

- [ ] Confirm final floor plan and electrical/low-voltage drawings
- [ ] Confirm expected number of live drops and patching strategy (single vs. dual drop)
- [ ] Confirm HaaS vs. owned equipment model for any additions
- [ ] Confirm final AP count (7 minimum or 9 recommended)
- [ ] Obtain low-voltage vendor quote for AP relocation and cabling
- [ ] Validate rack, power, and UPS requirements at new site
- [ ] Confirm ISP circuit relocation order placed and target activation date
- [ ] Complete final engineering review and convert planning estimate to final quote

---

## Pete's Delivery Notes

- **Planning-level vs. final quote:** Always label relocation estimates as "planning-level" until low-voltage drawings and final cable counts are confirmed. Clients who see a number assume it's fixed — manage this expectation explicitly.
- **Move day coordination is the hardest part:** The IT team, low-voltage vendor, mover, and client facilities contact all need to be coordinated. Assign a single point of contact on the client side and get a confirmed move schedule in writing at least 2 weeks before.
- **Test everything before the client's first business day at the new site** — moving infrastructure is always an opportunity for configurations to break. Schedule a pre-opening validation window (afternoon/evening before go-live day) so issues can be resolved without business impact.
- **The AP count conversation is a value conversation, not a cost conversation** — frame 9 APs vs. 7 APs as "strong coverage for how you'll actually use the space" vs. "minimum acceptable." Most clients choose 9 once they understand the difference in conference room and open-plan performance.
- **Always get the low-voltage vendor engaged before finalizing the IT quote** — their cabling plan determines the switch count, which is often the largest variable in the hardware estimate. Quoting switches before the cable count is confirmed leads to scope changes.
