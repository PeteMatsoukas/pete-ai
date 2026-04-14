# Hyper-V Bulk VLAN Assignment — PowerShell Approach

## Rule
Never use the GUI for 200+ VMs. PowerShell is the only sane approach.

## Steps
1. Export CSV from vCenter (PowerCLI) or manually create: columns VMName, VLANID
2. Import-Csv in PowerShell, validate paths with Test-Path, cast VLANID to [int]
3. Get-VMNetworkAdapter per VM
4. Set-VMNetworkAdapterVlan -Access -VlanId for each adapter
5. Wrap each VM operation in try/catch for error isolation
6. No reboot required — VLAN changes apply live

## Sample Script Structure
```powershell
$vms = Import-Csv "C:\VLANAssignments.csv"
foreach ($vm in $vms) {
    try {
        $vlanId = [int]$vm.VLANID
        $adapter = Get-VMNetworkAdapter -VMName $vm.VMName
        Set-VMNetworkAdapterVlan -VMNetworkAdapter $adapter -Access -VlanId $vlanId
        Write-Host "SUCCESS: $($vm.VMName) -> VLAN $vlanId"
    } catch {
        Write-Warning "FAILED: $($vm.VMName) - $_"
    }
}
```

## Key Notes
- Always test on 2-3 VMs first before running the full batch
- If migrating from VMware, export the VLAN assignments via PowerCLI first
- Changes are immediate — no reboot, no downtime
- Use try/catch per VM so one failure doesn't stop the entire batch
