// TechByPete AI Agent — Multi-Agent Orchestrator v1.0

/* ============================================
   SPECIALIST DEFINITIONS
   ============================================ */
const SPECIALISTS = {
  azure: {
    name: "Azure Solutions Architect",
    icon: "☁️",
    keywords: ["azure", "avd", "hub-spoke", "vnet", "expressroute", "bicep", "arm", "defender for cloud", "application gateway", "azure firewall", "site recovery", "asr", "azure migrate", "landing zone", "reserved instance", "savings plan", "hybrid benefit", "azure ad", "paas", "iaas"],
    file: "specialist-azure-sa.md",
    prompt: "You are the Azure Solutions Architect specialist working on behalf of Pete Matsoukas. Focus exclusively on Azure cloud architecture, migration, FinOps, and DR. Use specific VM SKUs, pricing estimates, and architecture patterns. Be concise but deep — produce the Azure-specific section of the unified solution."
  },
  "m365-security": {
    name: "M365 Security Architect",
    icon: "🔒",
    keywords: ["zero trust", "conditional access", "defender", "sentinel", "cis", "secure score", "mfa", "fido2", "phishing-resistant", "pim", "identity protection", "defender for endpoint", "defender for office", "mdca", "mdi", "entra id protection", "compliance", "dlp"],
    file: "specialist-m365-security-sa.md",
    prompt: "You are the Microsoft 365 Security specialist working on behalf of Pete Matsoukas. Focus exclusively on Zero Trust, Conditional Access, Defender suite, Sentinel, and compliance. Provide specific policy configurations, baseline recommendations, and security hardening steps."
  },
  "m365": {
    name: "M365 & Intune Architect",
    icon: "📧",
    keywords: ["m365", "office 365", "exchange", "teams", "sharepoint", "onedrive", "intune", "entra id", "entra connect", "autopilot", "compliance policy", "configuration profile", "licensing", "enrollment", "kfm", "tenant migration", "hybrid join"],
    file: "specialist-m365-sa.md",
    prompt: "You are the Microsoft 365 and Intune specialist working on behalf of Pete Matsoukas. Focus on Exchange, Teams, SharePoint, Intune enrollment, Entra ID, and M365 migrations. Provide specific licensing recommendations, enrollment methods, and migration approaches."
  },
  vmware: {
    name: "VMware Architect",
    icon: "🖥️",
    keywords: ["vmware", "vsphere", "esxi", "vcenter", "vsan", "vmotion", "drs", "ha cluster", "distributed switch", "hpe proliant", "dell poweredge", "primera", "powerstore", "pure storage", "broadcom", "v2v", "p2v"],
    file: "specialist-vmware-sa.md",
    prompt: "You are the VMware Solutions Architect specialist working on behalf of Pete Matsoukas. Focus on vSphere, vSAN, cluster design, and hardware recommendations. Provide specific host specs, sizing tables, and cluster architectures."
  },
  fortigate: {
    name: "FortiGate / Fortinet Architect",
    icon: "🛡️",
    keywords: ["fortigate", "fortinet", "fortimanager", "fortianalyzer", "sd-wan", "ipsec vpn", "ssl vpn", "ztna", "sase", "ngfw", "utm", "fortiguard", "forticlient", "firewall ha", "advpn"],
    file: "specialist-fortigate-sa.md",
    prompt: "You are the FortiGate Solutions Architect specialist working on behalf of Pete Matsoukas. Focus on FortiGate firewalls, SD-WAN, VPN/ZTNA, and security profiles. Recommend specific FortiGate models, HA configurations, and SD-WAN architectures."
  },
  veeam: {
    name: "Veeam Backup Architect",
    icon: "💾",
    keywords: ["veeam", "backup", "replication", "3-2-1", "immutable", "ransomware", "rpo", "rto", "surebackup", "instant recovery", "backup repository", "object lock", "m365 backup", "wasabi", "blob backup"],
    file: "specialist-veeam-sa.md",
    prompt: "You are the Veeam Backup specialist working on behalf of Pete Matsoukas. Focus on backup strategy, immutable repositories, DR replication, and M365 backup. Apply the 3-2-1-1-0 rule and recommend specific repository architectures."
  },
  network: {
    name: "Network Architect",
    icon: "🔗",
    keywords: ["cisco", "catalyst", "nexus", "unifi", "ubiquiti", "vlan", "stp", "ospf", "bgp", "hsrp", "802.1x", "radius", "wireless", "wifi", "site survey", "access point", "poe", "qos", "cabling"],
    file: "specialist-network-sa.md",
    prompt: "You are the Network Solutions Architect specialist working on behalf of Pete Matsoukas. Focus on switching, routing, wireless design, and network segmentation. Provide specific VLAN designs, AP placement, and infrastructure recommendations."
  },
  "windows-server": {
    name: "Windows Server Architect",
    icon: "🖥️",
    keywords: ["active directory", "ad ds", "domain controller", "group policy", "gpo", "wsfc", "failover cluster", "sql always on", "hyper-v", "s2d", "storage spaces", "adfs", "ad cs", "pki", "laps", "ntfs", "dns", "dhcp", "dfs"],
    file: "specialist-windows-server-sa.md",
    prompt: "You are the Windows Server specialist working on behalf of Pete Matsoukas. Focus on AD DS, clustering, SQL HA, Hyper-V, and on-prem infrastructure. Provide specific cluster configurations, GPO designs, and server hardening steps."
  }
};

/* ============================================
   ORCHESTRATOR LOGIC
   ============================================ */

/* Detect which specialists are needed based on user query */
function detectSpecialists(query) {
  const lower = query.toLowerCase();
  const scored = Object.entries(SPECIALISTS).map(([key, spec]) => {
    let score = 0;
    for (const kw of spec.keywords) {
      if (lower.includes(kw)) score += kw.length; /* longer keywords = more specific match */
    }
    return { key, spec, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  /* Multi-agent triggers: 2+ domains OR explicitly complex question */
  const complexityMarkers = ["migrate", "deploy", "design", "architect", "plan", "sow", "statement of work", "solution", "project", "complete", "end-to-end", "full"];
  const isComplex = complexityMarkers.some(m => lower.includes(m));

  /* Return top specialists — if only 1 matched, still use multi-agent if complex */
  if (scored.length >= 2) return scored.slice(0, 3); /* max 3 specialists to fit 60s Vercel timeout */
  if (scored.length === 1 && isComplex) return scored;
  return [];
}

/* Load specialist knowledge from file */
function loadSpecialistKnowledge(filename) {
  try {
    const fs = require("fs");
    const path = require("path");
    const filepath = path.join(process.cwd(), "knowledge", filename);
    if (!fs.existsSync(filepath)) return "";
    return fs.readFileSync(filepath, "utf-8");
  } catch { return ""; }
}

/* Call Anthropic API for a single specialist */
async function callSpecialist(specialist, userQuery, conversationHistory = []) {
  const knowledge = loadSpecialistKnowledge(specialist.spec.file);
  const systemPrompt = `${specialist.spec.prompt}

## YOUR KNOWLEDGE BASE
${knowledge}

## OUTPUT FORMAT
Provide a focused, concise analysis in your domain. Structure your response as:

### ${specialist.spec.icon} ${specialist.spec.name} — Analysis

**Scope of my domain in this request:**
[1-2 sentences on what falls under your expertise]

**Recommended approach:**
[3-5 bullet points with specific technical recommendations]

**Key technical details:**
[Specific products, configurations, sizing, commands, or architecture patterns]

**Estimated cost/timeline for my scope:**
[Concrete pricing range and timeline from your specialist knowledge]

**Dependencies on other domains:**
[What other specialists need to coordinate with you — e.g., "FortiGate VPN must be in place before Azure migration begins"]

Be focused. 400-600 words max. Do NOT try to cover domains outside your expertise.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userQuery }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Specialist ${specialist.key} failed: ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return text;
}

/* Final orchestrator call — Pete assembles all specialist outputs */
async function assembleSolution(userQuery, specialistOutputs) {
  const systemPrompt = `You are Pete Matsoukas — lead IT Solutions Architect. Your team of specialists has analyzed a client request and provided their domain-specific sections. Your job is to:

1. **Lead with executive summary** — 2-3 sentences capturing the solution in business terms
2. **Present each specialist's analysis** — use their outputs verbatim, just organize them logically
3. **Dependency Timeline** — merge all timelines into a unified project plan with clear dependencies between domains
4. **Total Investment** — sum pricing from all specialists, show breakdown by domain
5. **Next Steps** — 3 concrete actions the client should take
6. **Close with Pete's signature CTA** — offer to generate full SOW or book a 30-min scoping call

Speak in Pete's voice — confident, direct, experienced. You're the lead architect — the specialists worked FOR you. Own the solution.

Output should be comprehensive but not bloated. Use the specialist outputs as provided, don't duplicate their content.`;

  const userMessage = `**Original client request:** ${userQuery}

**Specialist analyses received:**

${specialistOutputs.map(o => o.output).join("\n\n---\n\n")}

Now assemble the unified solution for the client.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });

  if (!response.ok) {
    throw new Error("Assembly failed: " + (await response.text()));
  }
  return response;
}

/* ============================================
   SECURITY (Shared with /api/chat)
   ============================================ */
const ipTracker = new Map();

function getRateLimit(ip) {
  const now = Date.now();
  if (!ipTracker.has(ip)) ipTracker.set(ip, { hits: [], dailyHits: 0, dailyReset: now + 86400000 });
  const record = ipTracker.get(ip);
  if (now > record.dailyReset) { record.dailyHits = 0; record.dailyReset = now + 86400000; }
  record.hits = record.hits.filter(t => now - t < 3600000);
  return record;
}

function isBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  if (!ua || ua.length < 10) return true;
  return ["bot","crawler","spider","scraper","curl","wget","python-requests","httpie","postman","insomnia"].some(p => ua.includes(p));
}

export const config = {
  api: { responseLimit: false },
  maxDuration: 60, /* Vercel Hobby plan max */
};

/* ============================================
   HANDLER
   ============================================ */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (isBot(req)) return res.status(403).json({ error: "Access denied" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Missing messages" });

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const userQuery = typeof lastUserMsg?.content === "string" ? lastUserMsg.content :
    (Array.isArray(lastUserMsg?.content) ? lastUserMsg.content.find(p => p.type === "text")?.text : "") || "";

  if (!userQuery || userQuery.length > 3000) {
    return res.status(400).json({ error: "Invalid query" });
  }

  /* Rate limiting */
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const rateRecord = getRateLimit(ip);
  if (rateRecord.hits.length >= 10) { /* Stricter limit for multi-agent */
    return res.status(429).json({ error: "rate_limited", message: "Multi-specialist analysis has a lower rate limit. Please wait a few minutes." });
  }
  rateRecord.hits.push(Date.now());
  rateRecord.dailyHits++;

  /* Detect which specialists to consult */
  const specialists = detectSpecialists(userQuery);

  if (specialists.length === 0) {
    return res.status(200).json({ error: "no_specialists", message: "This question doesn't require multi-specialist analysis. Try the regular chat." });
  }

  /* Set up SSE — Vercel requires these headers and immediate flush */
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Content-Encoding": "none",
  });
  res.flushHeaders();

  /* Send immediate keepalive so Vercel opens the stream */
  res.write(": connected\n\n");
  if (typeof res.flush === "function") res.flush();

  const send = (type, data) => {
    res.write("data: " + JSON.stringify({ type, ...data }) + "\n\n");
    if (typeof res.flush === "function") res.flush();
  };

  /* Keepalive ping every 15s to prevent Vercel from closing the connection */
  const keepaliveInterval = setInterval(() => {
    try { res.write(": ping\n\n"); if (typeof res.flush === "function") res.flush(); } catch {}
  }, 15000);

  try {
    /* Step 1: Announce specialists */
    send("orchestrator_start", {
      specialists: specialists.map(s => ({ key: s.key, name: s.spec.name, icon: s.spec.icon }))
    });

    /* Step 2: Call all specialists in parallel */
    const specialistPromises = specialists.map(async (s) => {
      send("specialist_start", { key: s.key, name: s.spec.name, icon: s.spec.icon });
      try {
        const output = await callSpecialist(s, userQuery);
        send("specialist_complete", { key: s.key, name: s.spec.name, icon: s.spec.icon });
        return { key: s.key, output };
      } catch (err) {
        send("specialist_error", { key: s.key, name: s.spec.name, error: err.message });
        return { key: s.key, output: `### ${s.spec.icon} ${s.spec.name}\n\n*Analysis unavailable — specialist encountered an error.*` };
      }
    });

    const specialistOutputs = await Promise.all(specialistPromises);

    /* Step 3: Orchestrator assembles final solution (streamed) */
    send("assembly_start", { specialistCount: specialists.length });

    const assemblyResponse = await assembleSolution(userQuery, specialistOutputs);
    const reader = assemblyResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const evt = JSON.parse(jsonStr);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            send("content_block_delta", { delta: evt.delta });
          }
        } catch {}
      }
    }

    send("complete", {});
    clearInterval(keepaliveInterval);
    res.end();

  } catch (err) {
    console.error("Orchestrator error:", err);
    send("error", { message: err.message });
    clearInterval(keepaliveInterval);
    res.end();
  }
}