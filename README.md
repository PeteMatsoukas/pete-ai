# How to Add Knowledge to Your AI Agent

Drop `.md` (Markdown) files into this `/knowledge` folder. The agent automatically searches them during conversations.

## File Naming
Use descriptive names: `azure-migration-sow-acme-corp.md`, `zero-trust-assessment-template.md`, `training-plan-az104.md`

## File Format
Each file should have:
- A `# Title` at the top
- Clear sections with `##` headings
- Technical details, pricing, timelines — anything you want the agent to reference

## What to Add
- Past SOWs (remove client-sensitive info)
- Assessment reports
- Training plans you've delivered
- Technical playbooks
- Pricing templates
- Blog posts
- Proposal templates

## How It Works
When a user asks a question, the agent searches all files in this folder for relevant keywords. Matching content is injected into the conversation context automatically. The more documents you add, the smarter the agent gets — with no prompt size limits.
