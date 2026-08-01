// TechByPete AI Agent — Security Assessment API
// Handles: SSL/TLS grading, M365 Tenant ID lookup, DNS record inspection
// Called by: index.js when security assessment intent is detected
// Data is returned as structured JSON, then sent to /api/chat for Claude to interpret

export const config = { maxDuration: 55 }; // Vercel Hobby 60s limit — leave 5s buffer

/* ─── Rate limiting (reuse pattern from chat.js) ─────────────────────────── */
const ipTimestamps = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const times = (ipTimestamps.get(ip) || []).filter(t => now - t < 60000);
  if (times.length >= 10) return true; // max 10 security scans per minute per IP
  times.push(now);
  ipTimestamps.set(ip, times);
  return false;
}

/* ─── SSL Labs (asynchronous — use fromCache to stay within 60s timeout) ─── */
async function assessSSL(domain) {
  try {
    // Try cached result first (instant response)
    const cacheUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&all=done`;
    const cacheRes = await fetch(cacheUrl, {
      headers: { "User-Agent": "TechByPete-SecurityScanner/1.0" }
    });

    if (!cacheRes.ok) {
      throw new Error(`SSL Labs API returned ${cacheRes.status}`);
    }

    const data = await cacheRes.json();

    // If status is READY we have full results
    if (data.status === "READY") {
      return {
        source: "SSL Labs",
        sourceUrl: `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`,
        domain: data.host,
        status: "complete",
        grade: data.endpoints?.[0]?.grade || "N/A",
        ipAddress: data.endpoints?.[0]?.ipAddress || "N/A",
        hasWarnings: data.endpoints?.[0]?.hasWarnings || false,
        isExceptional: data.endpoints?.[0]?.isExceptional || false,
        protocols: data.endpoints?.[0]?.details?.protocols?.map(p => `${p.name} ${p.version}`) || [],
        vulnerabilities: {
          heartbleed: data.endpoints?.[0]?.details?.heartbleed || false,
          poodle: data.endpoints?.[0]?.details?.poodle || false,
          freak: data.endpoints?.[0]?.details?.freak || false,
          logjam: data.endpoints?.[0]?.details?.logjam || false,
          drown: data.endpoints?.[0]?.details?.drownVulnerable || false,
          beast: data.endpoints?.[0]?.details?.vulnBeast || false,
          ticketbleed: data.endpoints?.[0]?.details?.ticketbleed === 2 || false,
          robot: data.endpoints?.[0]?.details?.bleichenbacher === 2 || false,
        },
        certExpiry: data.endpoints?.[0]?.details?.cert?.notAfter
          ? new Date(data.endpoints[0].details.cert.notAfter).toLocaleDateString("en-GB")
          : "N/A",
        certIssuer: data.endpoints?.[0]?.details?.cert?.issuerSubject || "N/A",
        certSubject: data.endpoints?.[0]?.details?.cert?.subject || "N/A",
        hsts: data.endpoints?.[0]?.details?.hstsPolicy?.status === "present",
        forwardSecrecy: data.endpoints?.[0]?.details?.forwardSecrecy || 0,
        supportsRC4: data.endpoints?.[0]?.details?.supportsRc4 || false,
      };
    }

    // Status is IN_PROGRESS or DNS — trigger scan and return pending
    if (data.status === "DNS" || data.status === "IN_PROGRESS") {
      // Trigger a fresh scan in background (fire and forget)
      fetch(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&startNew=on`, {
        headers: { "User-Agent": "TechByPete-SecurityScanner/1.0" }
      }).catch(() => {});

      return {
        source: "SSL Labs",
        sourceUrl: `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`,
        domain,
        status: "pending",
        message: `SSL Labs is scanning ${domain}. A fresh scan has been initiated — it typically takes 60–90 seconds. Please check the full report directly: https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`,
      };
    }

    // STATUS = ERROR or unexpected
    return {
      source: "SSL Labs",
      sourceUrl: `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`,
      domain,
      status: "error",
      message: data.statusMessage || "SSL Labs could not assess this domain.",
    };

  } catch (err) {
    return {
      source: "SSL Labs",
      domain,
      status: "error",
      message: `SSL Labs assessment failed: ${err.message}`,
    };
  }
}

/* ─── Microsoft 365 / Entra ID Tenant Lookup ─────────────────────────────── */
async function assessM365Tenant(domain) {
  try {
    const results = {};

    // 1. Get Tenant ID + Tenant Name via OpenID config
    const oidcUrl = `https://login.microsoftonline.com/${encodeURIComponent(domain)}/.well-known/openid-configuration`;
    const oidcRes = await fetch(oidcUrl);
    if (oidcRes.ok) {
      const oidc = await oidcRes.json();
      const tenantId = oidc.issuer?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || null;
      results.tenantId = tenantId;
      results.tokenEndpoint = oidc.token_endpoint || null;
      results.issuer = oidc.issuer || null;
    }

    // 2. Check if domain is registered in M365 (federation endpoint)
    const fedUrl = `https://login.microsoftonline.com/getuserrealm.srf?login=test@${encodeURIComponent(domain)}&json=1`;
    const fedRes = await fetch(fedUrl);
    if (fedRes.ok) {
      const fed = await fedRes.json();
      results.namespaceType = fed.NameSpaceType || "Unknown"; // "Managed" or "Federated"
      results.cloudInstanceName = fed.CloudInstanceName || null;
      results.federationBrandName = fed.FederationBrandName || null;
      results.isFederated = fed.NameSpaceType === "Federated";
      results.isManaged = fed.NameSpaceType === "Managed";
      results.domainRegistered = fed.NameSpaceType !== "Unknown";
    }

    // 3. Check MX records to determine email platform
    const mxRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    if (mxRes.ok) {
      const mx = await mxRes.json();
      const mxRecords = mx.Answer?.map(r => r.data) || [];
      results.mxRecords = mxRecords;
      results.emailPlatform = mxRecords.some(r => r.includes("mail.protection.outlook.com"))
        ? "Microsoft 365 (Exchange Online)"
        : mxRecords.some(r => r.includes("google"))
          ? "Google Workspace"
          : mxRecords.length > 0 ? "Other/Self-hosted" : "Not configured";
    }

    return {
      source: "Microsoft OpenID + DNS",
      sourceUrl: `https://whatismytenantid.cloud/`,
      domain,
      status: "complete",
      ...results,
    };

  } catch (err) {
    return {
      source: "Microsoft OpenID",
      domain,
      status: "error",
      message: `Tenant lookup failed: ${err.message}`,
    };
  }
}

/* ─── DNS Full Inspection ────────────────────────────────────────────────── */
async function assessDNS(domain) {
  try {
    const recordTypes = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA", "CAA"];
    const results = {};

    // Fetch all record types in parallel
    await Promise.all(recordTypes.map(async (type) => {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
        if (res.ok) {
          const data = await res.json();
          results[type] = data.Answer?.map(r => ({ ttl: r.TTL, data: r.data })) || [];
        }
      } catch (_) {
        results[type] = [];
      }
    }));

    // Parse email security records from TXT
    const txtRecords = results.TXT?.map(r => r.data) || [];
    const spf = txtRecords.find(r => r.startsWith('"v=spf1') || r.startsWith('v=spf1'));
    const dmarc = results["DMARC"] || [];
    const dmarcTxt = await fetch(`https://dns.google/resolve?name=_dmarc.${encodeURIComponent(domain)}&type=TXT`);
    const dmarcData = dmarcTxt.ok ? await dmarcTxt.json() : null;
    const dmarcRecord = dmarcData?.Answer?.map(r => r.data)?.[0] || null;

    // Parse DMARC policy
    let dmarcPolicy = null;
    if (dmarcRecord) {
      const pMatch = dmarcRecord.match(/p=([^;]+)/i);
      dmarcPolicy = pMatch?.[1] || "none";
    }

    // Check DKIM for common selectors
    const dkimSelectors = ["selector1", "selector2", "google", "k1", "dkim", "default", "mail"];
    const dkimResults = await Promise.all(
      dkimSelectors.map(async (sel) => {
        try {
          const r = await fetch(`https://dns.google/resolve?name=${sel}._domainkey.${encodeURIComponent(domain)}&type=TXT`);
          if (r.ok) {
            const d = await r.json();
            if (d.Answer?.length > 0) return { selector: sel, record: d.Answer[0].data };
          }
        } catch (_) {}
        return null;
      })
    );
    const dkimFound = dkimResults.filter(Boolean);

    return {
      source: "Google DNS API",
      sourceUrl: `https://www.securedomainscore.com/`,
      domain,
      status: "complete",
      records: results,
      emailSecurity: {
        spf: spf || null,
        spfConfigured: !!spf,
        dkim: dkimFound.length > 0 ? dkimFound : null,
        dkimConfigured: dkimFound.length > 0,
        dkimSelectorsFound: dkimFound.map(d => d.selector),
        dmarc: dmarcRecord || null,
        dmarcConfigured: !!dmarcRecord,
        dmarcPolicy: dmarcPolicy,
        dmarcEnforced: dmarcPolicy === "quarantine" || dmarcPolicy === "reject",
      },
    };

  } catch (err) {
    return {
      source: "Google DNS API",
      domain,
      status: "error",
      message: `DNS assessment failed: ${err.message}`,
    };
  }
}

/* ─── Intent Detection ───────────────────────────────────────────────────── */
function detectAssessmentType(message) {
  const lower = message.toLowerCase();

  // Extract domain from message
  const domainMatch = message.match(/\b([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/);
  const domain = domainMatch?.[0]?.replace(/^www\./, "") || null;

  const types = [];
  if (/ssl|tls|certificate|cert|https|grade|secure.*site|site.*secure/.test(lower)) types.push("ssl");
  if (/tenant|entra|m365|microsoft 365|azure ad|aad|tenant.?id|office 365/.test(lower)) types.push("m365");
  if (/dns|mx record|spf|dkim|dmarc|nameserver|ns record|mail record|email.*record|domain.*record|lookup/.test(lower)) types.push("dns");
  if (/security.*score|domain.*score|score.*domain|assess.*domain|domain.*assess|check.*domain|scan.*domain/.test(lower)) {
    // Full assessment — run all three
    types.push("ssl", "dns");
    if (!types.includes("m365")) types.push("m365");
  }

  return { types: [...new Set(types)], domain };
}

/* ─── Main Handler ───────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  const { message, domain: explicitDomain, types: explicitTypes } = req.body || {};
  if (!message && !explicitDomain) {
    return res.status(400).json({ error: "message or domain is required" });
  }

  // Detect what to assess
  const { types, domain: detectedDomain } = message
    ? detectAssessmentType(message)
    : { types: explicitTypes || [], domain: explicitDomain };

  const domain = explicitDomain || detectedDomain;

  if (!domain) {
    return res.status(400).json({
      error: "no_domain",
      message: "I couldn't find a domain name in your request. Please specify the domain you want me to assess, for example: 'Check the SSL certificate for techbypete.com'",
    });
  }

  if (types.length === 0) {
    return res.status(400).json({
      error: "no_type",
      message: `I detected the domain '${domain}' but I'm not sure what type of assessment you want. Try: 'Check the SSL certificate for ${domain}', 'Look up the DNS records for ${domain}', or 'Find the M365 tenant ID for ${domain}'`,
    });
  }

  // Run assessments in parallel
  const assessmentPromises = {};
  if (types.includes("ssl")) assessmentPromises.ssl = assessSSL(domain);
  if (types.includes("m365")) assessmentPromises.m365 = assessM365Tenant(domain);
  if (types.includes("dns")) assessmentPromises.dns = assessDNS(domain);

  const keys = Object.keys(assessmentPromises);
  const values = await Promise.all(Object.values(assessmentPromises));
  const results = {};
  keys.forEach((k, i) => { results[k] = values[i]; });

  return res.status(200).json({
    domain,
    assessments: results,
    requestedTypes: types,
    timestamp: new Date().toISOString(),
  });
}
