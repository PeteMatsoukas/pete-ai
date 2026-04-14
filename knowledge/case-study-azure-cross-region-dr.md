# Case Study — Azure Cross-Region Disaster Recovery

## Project Summary
Primary: North Central US. DR: Central US. Architecture: Azure Site Recovery + Traffic Manager + Application Gateway WAF v2 + FortiGate standby pair + secondary domain controller. Scope: 17 VMs replicated. Timeline: 8 weeks, 260 hours. Fee: $56,500 USD. Azure monthly run-rate: ~$1,980/month.

## Architecture
- Azure Site Recovery for VM replication (North Central US → Central US)
- Traffic Manager for DNS-based failover routing
- Application Gateway WAF v2 in both regions
- FortiGate HA pair (active in primary, standby in DR)
- Secondary domain controller in DR region
- 17 VMs replicated with RPO < 15 minutes

## Key Details
- Recovery Plans automated in ASR with pre/post scripts
- Failover testing performed quarterly without production impact
- FortiGate standby pair auto-activates on Traffic Manager health probe failure
- Application Gateway WAF v2 provides Layer 7 protection in both regions

## Pricing
- Professional services: $56,500 (260 hours over 8 weeks)
- Azure monthly run-rate: ~$1,980/month (DR resources in standby)
- Includes ASR replication, Traffic Manager, App Gateway, FortiGate licensing

## Key Lesson
Cross-region DR is not just about replication — it's about automated failover orchestration. Recovery Plans in ASR with scripted pre/post actions are what make the difference between a 4-hour manual failover and a 15-minute automated one.
