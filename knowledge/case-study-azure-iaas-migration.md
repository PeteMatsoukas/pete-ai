# Case Study — Azure IaaS Cloud Migration (Lean Native)

## Project Summary
Approach: No NVA — lean native Azure. Migrated from on-prem Hyper-V to Azure IaaS using Azure Migrate. Timeline: 4 weeks.

## Architecture
- Azure Migrate for Hyper-V to Azure VM migration (V2V)
- Azure VPN Gateway: Site-to-Site + Point-to-Site with Entra ID SAML + MFA
- Security: NSGs only (no Azure Firewall — cost-optimized for small environments)
- Replaced AD CS two-tier PKI with public TLS certificates (simplified management)
- Replaced RADIUS WiFi authentication with WPA2-PSK (simplified for small office)

## Design Decisions
- No NVA (Network Virtual Appliance) — lean native approach keeps costs low
- NSGs provide sufficient segmentation for this environment size
- Azure Firewall was evaluated but rejected — $900+/month for a small fleet is not justified
- P2S VPN with Entra ID SAML gives remote users MFA-protected access without a client VPN app

## Key Lesson
Not every migration needs Azure Firewall and NVAs. For small-to-medium environments (under 50 VMs), NSGs with proper rules provide adequate segmentation at a fraction of the cost. Save the budget for where it matters — monitoring, backup, and DR.
