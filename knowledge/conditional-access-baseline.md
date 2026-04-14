# Conditional Access Baseline — Graph API Deployment

## Golden Rules
- Always deploy in Report-Only mode first (7-14 days minimum)
- Always exclude Break-Glass accounts from every policy
- Use naming convention: CA001, CA002, etc. for consistency

## Baseline Policies

### CA001: Block Legacy Authentication (all users)
- Blocks IMAP, POP3, SMTP AUTH, EWS, and other legacy protocols
- These bypass MFA entirely — the #1 attack vector for credential spray

### CA002: Require MFA for All Users
- Applies to all cloud apps
- Exclude Break-Glass accounts
- Use Microsoft Authenticator push or FIDO2 keys

### CA003: Require Phishing-Resistant MFA for Admins (CIS Level 2)
- Targets all admin roles (Global Admin, Exchange Admin, Security Admin, etc.)
- Requires FIDO2 security key or Windows Hello for Business
- Password + SMS is not sufficient for admin accounts

### CA004: Require MFA for Medium + High Sign-in Risk
- Requires Entra ID P2 licensing
- Uses Identity Protection risk signals
- Triggers MFA challenge on suspicious sign-ins (impossible travel, anonymous IP, etc.)

### CA005: Require Compliant Device or App Protection Policy (mobile)
- For mobile devices: require either Intune compliance or MAM app protection
- Blocks unmanaged devices from accessing corporate data
- Users on personal phones can still use Outlook with app protection (no full enrollment needed)

## Deployment via Graph API
- Export policies as JSON for version control
- Deploy via Microsoft Graph PowerShell or Graph API
- Always test in Report-Only, review Sign-in logs, then flip to On
