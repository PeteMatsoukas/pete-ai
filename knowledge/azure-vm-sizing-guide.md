# Azure VM Sizing Guide — SMB Recommendations

## Common Workload Sizing

### Domain Controller / AD DS
- Recommended: Standard_B2s (2 vCPU, 4 GB RAM)
- Cost: ~$30/month (Pay-as-you-go, East US)
- Notes: Lightweight workload. B-series burstable is perfect. No need for D-series unless also running DNS/DHCP for 500+ users.

### File Server (SMB/DFS)
- Small (< 50 users): Standard_B2ms (2 vCPU, 8 GB RAM) + Premium SSD P20 (512 GB)
- Medium (50-200 users): Standard_D2s_v5 (2 vCPU, 8 GB RAM) + Premium SSD P30 (1 TB)
- Large (200+ users): Consider Azure Files Premium instead of IaaS

### SQL Server
- Small (< 50 concurrent): Standard_D4s_v5 (4 vCPU, 16 GB RAM)
- Medium: Standard_E4s_v5 (4 vCPU, 32 GB RAM) — memory-optimized
- Always use Premium SSD or Ultra Disk for SQL data/log drives
- Enable Azure Hybrid Benefit if client has SQL SA — saves ~55%

### RDS Session Host
- Per host: Standard_D4s_v5 (4 vCPU, 16 GB RAM)
- Rule of thumb: 10-15 light users per host, 5-8 heavy users
- Use Proximity Placement Groups for multi-host deployments

## Cost Optimization Tips
- Always check Azure Hybrid Benefit eligibility (Windows Server + SQL)
- Reserved Instances (1-year): ~30% savings. 3-year: ~50% savings
- Use Azure Advisor weekly for right-sizing recommendations
- Tag everything: Environment, Owner, CostCenter, Project
- Set budget alerts at 75% and 90% thresholds
