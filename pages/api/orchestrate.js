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
   SECTION-LEVEL RAG — shared knowledge retrieval
   Lets each specialist pull relevant sections from Pete's full SOW library,
   not just their single hardcoded specialist file.
   ============================================ */
const STOP_WORDS = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","can","shall","to","of","in","for","on","with","at","by","from","as","into","about","between","through","during","before","after","above","below","up","down","out","off","over","under","that","this","these","those","it","its","i","we","you","they","he","she","my","our","your","their","what","how","when","where","which","who","whom","why","not","no","nor","if","or","and","but","so","than","too","very","just","also","like","need","want","help","please","me","us"]);

let _chunkCache = null;
let _chunkCacheTime = 0;
const CHUNK_CACHE_TTL = 5 * 60 * 1000;

function estimateTokens(str) { return Math.ceil(str.length / 4); }
function kwOf(text) { return text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w)); }

function loadAllChunks() {
  const now = Date.now();
  if (_chunkCache && (now - _chunkCacheTime) < CHUNK_CACHE_TTL) return _chunkCache;
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = path.join(process.cwd(), "knowledge");
    if (!fs.existsSync(dir)) { _chunkCache = []; _chunkCacheTime = now; return _chunkCache; }
    /* Only search SOW/reference/assessment/design files — NOT the specialist-*.md
       files (those are loaded directly by their owning specialist). */
    const files = fs.readdirSync(dir).filter(f =>
      f.endsWith(".md") && f !== "README.md" && !f.startsWith("specialist-"));
    const chunks = [];
    for (const f of files) {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      const docTitle = content.match(/^#\s+(.+)/m)?.[1] || f.replace(".md", "");
      const firstH2 = content.search(/^##\s+/m);
      const preamble = firstH2 > 0 ? content.slice(0, firstH2).trim() : content.trim();
      chunks.push({ file: f, docTitle, header: "Overview", text: preamble, kw: kwOf(preamble + " " + preamble) });
      if (firstH2 >= 0) {
        const parts = content.slice(firstH2).split(/^##\s+/m).filter(Boolean);
        for (const p of parts) {
          const nl = p.indexOf("\n");
          const header = (nl >= 0 ? p.slice(0, nl) : p).trim();
          const body = (nl >= 0 ? p.slice(nl + 1) : "").trim();
          if (body) chunks.push({ file: f, docTitle, header, text: `## ${header}\n${body}`, kw: kwOf(header + " " + header + " " + header + " " + body) });
        }
      }
    }
    _chunkCache = chunks; _chunkCacheTime = now;
    return chunks;
  } catch (e) { console.warn("Orchestrator RAG error:", e.message); _chunkCache = []; _chunkCacheTime = now; return _chunkCache; }
}

/* Search the SOW library for sections relevant to a specialist's domain + the user query.
   domainKeywords biases retrieval toward this specialist's area. */
function searchSOWSections(userQuery, domainKeywords, opts = {}) {
  const maxChunks = opts.maxChunks || 4;
  const tokenBudget = opts.tokenBudget || 2500; /* per-specialist budget — kept tight */
  const chunks = loadAllChunks();
  if (chunks.length === 0) return "";

  const qWords = kwOf(userQuery + " " + domainKeywords.join(" "));
  if (qWords.length === 0) return "";
  const qSet = new Set(qWords);
  /* Domain keywords get extra weight so an Azure specialist pulls Azure SOWs */
  const domainSet = new Set(domainKeywords.flatMap(k => kwOf(k)));

  const scored = chunks.map(c => {
    let freq = 0, distinct = 0;
    const seen = new Set();
    for (const w of c.kw) {
      if (qSet.has(w)) {
        freq += domainSet.has(w) ? 2 : 1; /* domain term matches count double */
        if (!seen.has(w)) { seen.add(w); distinct++; }
      }
    }
    return { ...c, score: freq + distinct * 5 };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) return "";
  const topScore = scored[0].score;
  const threshold = Math.max(topScore * 0.2, 3);
  const relevant = scored.filter(c => c.score >= threshold);

  const picked = [];
  let usedTokens = 0;
  const perDoc = {};
  for (const c of relevant) {
    if (picked.length >= maxChunks) break;
    const t = estimateTokens(c.text);
    if (usedTokens + t > tokenBudget) continue;
    perDoc[c.file] = perDoc[c.file] || 0;
    if (perDoc[c.file] >= 2) continue;
    picked.push(c); perDoc[c.file]++; usedTokens += t;
  }
  if (picked.length === 0) return "";

  const byDoc = {};
  for (const c of picked) { (byDoc[c.docTitle] = byDoc[c.docTitle] || []).push(c.text); }
  return "\n\n## RELEVANT PAST ENGAGEMENTS (Pete's real SOW experience)\nApply these real methodologies, pricing ranges, and lessons from Pete's actual past projects:\n\n" +
    Object.entries(byDoc).map(([t, texts]) => `### From: ${t}\n\n${texts.join("\n\n")}`).join("\n\n---\n\n");
}


function detectSpecialists(query) {
  const lower = query.toLowerCase();
  const scored = Object.entries(SPECIALISTS).map(([key, spec]) => {
    let score = 0;
    for (const kw of spec.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    return { key, spec, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  const complexityMarkers = ["migrate", "deploy", "design", "architect", "plan", "sow", "statement of work", "solution", "project", "complete", "end-to-end", "full"];
  const isComplex = complexityMarkers.some(m => lower.includes(m));

  if (scored.length >= 2) return scored.slice(0, 3);
  if (scored.length === 1 && isComplex) return scored;
  return [];
}

function loadSpecialistKnowledge(filename) {
  try {
    const fs = require("fs");
    const path = require("path");
    const filepath = path.join(process.cwd(), "knowledge", filename);
    if (!fs.existsSync(filepath)) return "";
    return fs.readFileSync(filepath, "utf-8");
  } catch { return ""; }
}

async function callSpecialist(specialist, userQuery) {
  const knowledge = loadSpecialistKnowledge(specialist.spec.file);
  /* Pull relevant sections from Pete's real SOW library, biased to this
     specialist's domain — so the Azure specialist sees real Azure SOWs, etc. */
  const sowSections = searchSOWSections(userQuery, specialist.spec.keywords || []);

  const systemPrompt = `${specialist.spec.prompt}

## YOUR KNOWLEDGE BASE
${knowledge}
${sowSections}

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
[Concrete pricing range and timeline — use real ranges from Pete's past engagements above where relevant]

**Dependencies on other domains:**
[What other specialists need to coordinate with you]

Be focused. 400-600 words max. Do NOT try to cover domains outside your expertise. Reference the real SOW methodologies and pricing naturally as your own experience — never mention a knowledge base or database.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
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
  return data.content?.map(b => b.text || "").join("") || "";
}

async function assembleSolution(userQuery, specialistOutputs) {
  const systemPrompt = `You are Pete Matsoukas — lead IT Solutions Architect. Your team of specialists has analyzed a client request and provided their domain-specific sections. Your job is to:

1. **Lead with executive summary** — 2-3 sentences capturing the solution in business terms
2. **Include a PROFESSIONAL ARCHITECTURE DIAGRAM** — Generate an Azure/Microsoft-style Mermaid.js flowchart. Use:
   - FontAwesome icons (fa:fa-cloud, fa:fa-server, fa:fa-shield, fa:fa-database, fa:fa-users, fa:fa-lock, fa:fa-network-wired)
   - Emojis for service branding (☁️ Azure, 🏢 on-prem, 🛡️ security, 🔐 identity, 💾 storage, 📧 M365)
   - classDef color-coding: azure fill:#0078d4 / security fill:#d13438 / identity fill:#7719aa / storage fill:#00bcf2 / onprem fill:#505050 / m365 fill:#d83b01
   - Subgraphs with descriptive headers including CIDR blocks or SKU details
   - Specific technical details in node labels (SKUs, IP ranges, protocols)
   - classes applied to all nodes using: class NodeName cloud / security / etc.

Format:
\`\`\`mermaid
flowchart TB
    [Azure-style diagram with FontAwesome icons, subgraphs, classDef colors]
\`\`\`

3. **Present each specialist's analysis** — use their outputs verbatim, just organize them logically
4. **Dependency Timeline** — merge all timelines into a unified project plan with clear dependencies between domains
5. **Total Investment** — sum pricing from all specialists, show breakdown by domain
6. **Next Steps** — 3 concrete actions the client should take
7. **Close with Pete's signature CTA** — offer to generate full SOW or book a 30-min scoping call

Speak in Pete's voice — confident, direct, experienced. You're the lead architect — the specialists worked FOR you. Own the solution.

The architecture diagram is critical — it must look like an enterprise Microsoft architect drew it. Apply classDef styling to EVERY node.`;

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
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
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
   SECURITY
   ============================================ */
const ipTracker = new Map();

const ALLOWED_ORIGINS = [
  "https://ask.techbypete.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function isAllowedOrigin(req) {
  const origin = req.headers["origin"] || req.headers["referer"] || "";
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

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
  if (!ua || ua.length < 20) return true;
  const botPatterns = [
    "bot", "crawler", "spider", "scraper",
    "curl/", "wget/", "python-requests", "python-urllib",
    "httpie", "postman", "insomnia", "go-http-client",
    "java/", "okhttp", "axios", "node-fetch",
    "libwww-perl", "lwp-", "mechanize",
  ];
  if (botPatterns.some(p => ua.includes(p))) return true;
  const hasBrowserSignal = ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("firefox") || ua.includes("edge");
  return !hasBrowserSignal;
}

/* ============================================
   CONFIG
   ============================================ */
export const config = {
  api: { responseLimit: false },
  maxDuration: 60,
};

/* ============================================
   HANDLER
   ============================================ */
export default async function handler(req, res) {

  /* --- Origin Validation --- */
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method !== "POST") return res.status(405).end();

  /* --- Bot Detection --- */
  if (isBot(req)) return res.status(403).json({ error: "Access denied" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Missing messages" });

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  const userQuery = typeof lastUserMsg?.content === "string" ? lastUserMsg.content :
    (Array.isArray(lastUserMsg?.content) ? lastUserMsg.content.find(p => p.type === "text")?.text : "") || "";

  if (!userQuery || userQuery.length > 3000) {
    return res.status(400).json({ error: "Invalid query" });
  }

  /* --- Rate Limiting --- */
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const rateRecord = getRateLimit(ip);
  if (rateRecord.hits.length >= 10) {
    return res.status(429).json({ error: "rate_limited", message: "Multi-specialist analysis has a lower rate limit. Please wait a few minutes." });
  }
  rateRecord.hits.push(Date.now());
  rateRecord.dailyHits++;

  /* --- Detect Specialists --- */
  const specialists = detectSpecialists(userQuery);

  if (specialists.length === 0) {
    return res.status(200).json({ error: "no_specialists", message: "This question doesn't require multi-specialist analysis. Try the regular chat." });
  }

  /* --- SSE Setup --- */
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Content-Encoding": "none",
  });
  res.flushHeaders();

  res.write(": connected\n\n");
  if (typeof res.flush === "function") res.flush();

  const send = (type, data) => {
    res.write("data: " + JSON.stringify({ type, ...data }) + "\n\n");
    if (typeof res.flush === "function") res.flush();
  };

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

    /* Step 3: Assemble final solution (streamed) */
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
