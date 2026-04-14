# Archive Storage Pricing Comparison (April 2026, 3 TB)

## Monthly and 3-Year TCO

| Solution | Monthly Cost | 3-Year Total | Notes |
|---|---|---|---|
| Azure Blob Cold | ~$12/month | ~$432 | Cheapest option, API access only, no SMB/NFS mount |
| Wasabi Hot Storage | ~$20.97/month | ~$755 | Zero egress fees, S3-compatible, good for backup targets |
| Azure Files Cool | ~$45/month | ~$1,620 | SMB mapped drive, easiest UX for end users, mounts like a network share |
| SharePoint Archive | ~$150/month | ~$5,400 | Full compliance + search + retention policies, most expensive |

## Key Advice
Always present the 3-year TCO view — it changes the conversation. A $12/month vs $150/month decision looks different when framed as $432 vs $5,400 over 3 years.

## Recommendations by Use Case
- **Pure cold backup (API access OK):** Azure Blob Cold — cheapest by far
- **Backup target with frequent retrieval:** Wasabi — zero egress makes it predictable
- **Users need to browse files via File Explorer:** Azure Files Cool — SMB mapped drive
- **Compliance, eDiscovery, legal hold:** SharePoint Archive — only option with full Microsoft compliance stack
