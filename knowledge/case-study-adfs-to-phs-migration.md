# ADFS Decommission — Migrating from AD FS to Password Hash Synchronization (PHS)

## Scenario
Client has on-premises AD FS servers handling M365 authentication through Entra Connect sync with a federated domain. Goal: decommission the ADFS infrastructure entirely by switching to Password Hash Synchronization (PHS) with Managed authentication.

## Why Migrate Away from ADFS
- ADFS is a single point of failure for M365 authentication — if ADFS goes down, nobody can sign in
- On-prem infrastructure to maintain, patch, and secure (certificates, WAP servers, load balancers)
- PHS with Seamless SSO gives the same user experience with zero on-prem dependency
- Microsoft's recommended authentication method for M365 is PHS — ADFS is legacy
- Enables Conditional Access and Identity Protection features that work better with cloud-native auth

## Pre-Migration Checklist
- **Verify Entra Connect:** Confirm Entra Connect (formerly Azure AD Connect) is installed and healthy. The sync service account must have "Replicate Directory Changes" permissions in Active Directory.
- **Backup everything:** Document the current ADFS configuration, relying party trusts, claim rules, and Entra Connect settings. Export ADFS config for rollback if needed.
- **Enable PHS early:** Enable Password Hash Synchronization in the Entra Connect wizard BEFORE switching authentication. Let hashes sync for at least 24-48 hours so all user password hashes are in Entra ID before you cut over. Password sync runs every 2 minutes once enabled.
- **CRITICAL — Password Policy:** Set the M365 org password policy to NEVER EXPIRE. This is mandatory because PHS syncs the on-prem password hash — if cloud passwords expire independently, users get locked out. Requirements: passwords must be strong, and MFA MUST be enabled for ALL users in M365 before proceeding.
- **Verify MFA:** Ensure all users have MFA registered and working BEFORE the cutover. After ADFS removal, MFA is handled by Entra ID — if users haven't registered, they'll be locked out.
- **Identify ADFS relying party trusts:** List all applications using ADFS for authentication (not just M365). Each one needs to be migrated to Entra ID or another IdP before ADFS decommission.
- **Communication plan:** Notify users that their sign-in experience may briefly change. With Seamless SSO enabled, most users won't notice any difference.

## Migration Steps

### Step 1 — Enable PHS in Entra Connect
- Launch the Entra Connect wizard on the sync server
- Select **Configure** → **Change user sign-in**
- Choose **Password Hash Synchronization**
- Optionally check "Do not configure" if you want to enable manually later — but generally enable it here
- Let it sync for 24-48 hours before proceeding

### Step 2 — Enable Seamless SSO (Recommended)
- In the same Entra Connect wizard, enable **Seamless Single Sign-On**
- This provides transparent SSO for domain-joined machines on the corporate network
- Users won't see any login prompts when accessing M365 from corporate devices
- Requires a computer account (AZUREADSSOACC) in on-prem AD — the wizard creates this automatically

### Step 3 — Convert Domain from Federated to Managed
The wizard will prompt you to switch the domain. Alternatively, use PowerShell for more control:

```powershell
# Install the Microsoft Graph module (if not already installed)
Install-Module Microsoft.Graph -Scope CurrentUser

# Connect with required permissions
Connect-MgGraph -Scopes "Domain.ReadWrite.All"

# Import the specific module
Import-Module Microsoft.Graph.Identity.DirectoryManagement

# Set domain to managed authentication (disables federation/ADFS)
Update-MgDomain -DomainId "yourdomain.com" -AuthenticationType "Managed"

# Verify the change
Get-MgDomain -DomainId "yourdomain.com" | Select-Object Id, AuthenticationType
```

**Important:** Replace "yourdomain.com" with the actual domain name. This command instantly switches all users on that domain from ADFS to PHS authentication.

### Step 4 — Verify Everything Works
- Test sign-in with multiple user accounts (different roles, different locations)
- Test MFA prompts are working correctly
- Test Seamless SSO from domain-joined devices
- Check Entra ID Sign-in logs for any authentication failures
- Verify password sync is current: check the Entra Connect sync status

### Step 5 — Decommission ADFS
Only after successful verification:
- Disable the ADFS service on all ADFS servers
- Remove the WAP (Web Application Proxy) servers if present
- Remove ADFS DNS records (sts.yourdomain.com, adfs.yourdomain.com)
- Remove the ADFS relying party trust entries
- Power down and retire the ADFS servers
- Remove the ADFS server role from any remaining servers
- Update documentation and emergency procedures

## Post-Migration Tasks
- **Update applications:** Any apps that were using ADFS relying party trusts must be migrated to authenticate directly with Microsoft Entra ID (Enterprise Applications)
- **Remove ADFS references:** Clean up any GPOs, scripts, or documentation that reference ADFS endpoints
- **Monitor sign-in logs:** Watch Entra ID sign-in logs closely for 2 weeks after migration for any authentication failures
- **Update Conditional Access:** With cloud-native auth, you can now fully leverage Conditional Access policies, Identity Protection, and risk-based sign-in policies
- **Disable Entra Connect federation features:** In the Entra Connect wizard, verify federation is no longer configured

## Rollback Plan
If something goes wrong, you can revert by running:
```powershell
Update-MgDomain -DomainId "yourdomain.com" -AuthenticationType "Federated"
```
This switches back to ADFS immediately — but only works while ADFS servers are still running. This is why we don't decommission ADFS until everything is verified.

## Pricing Guidance
- **Simple migration (single domain, M365 only):** $4,500 — 2 weeks
- **Complex migration (multiple domains, third-party apps on ADFS):** $8,000-12,000 — 3-5 weeks
- **Licensing:** No additional licensing required — PHS is included in all Entra Connect editions
- **Cost savings:** Decommissioning ADFS saves on-prem server costs, certificate renewals, and reduces attack surface

## Key Lessons
- Always enable PHS and let it sync for 24-48 hours BEFORE converting the domain. If you convert first, users with unsynced password hashes will be locked out.
- The password policy change to "never expire" is non-negotiable. Without it, cloud passwords will expire independently of on-prem passwords and cause lockouts.
- MFA must be enabled and registered for ALL users before cutover. ADFS MFA and Entra ID MFA are different systems — users need to be registered in Entra ID MFA.
- Seamless SSO is optional but strongly recommended — it makes the transition invisible to users on domain-joined machines.
- Don't rush the ADFS decommission. Keep ADFS running (but idle) for 2-4 weeks after migration as a safety net. Only power down after you've confirmed zero authentication traffic hitting ADFS.
- This migration is one of the highest-impact, lowest-risk modernization projects you can do. It removes on-prem infrastructure, improves security posture, and enables cloud-native identity features — all with minimal user disruption.
