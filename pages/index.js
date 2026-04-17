// TechByPete AI Agent v2.5 — April 2026
import { useState, useRef, useEffect } from "react";

const CONTACT = {
  email: "p.matsoukas@techbypete.com",
  phone: "+306909596515",
  linkedin: "https://www.linkedin.com/in/panosmatsoukas/",
};

const CALENDLY_URL = "https://calendly.com/pilot3282/30min";
const MSAL_CLIENT_ID = "f3c437ef-398a-4964-bd1e-fbe2ba2782a6";

const LANG_OPTIONS = [
  {code:"en",label:"English",flag:"🇬🇧"},
  {code:"el",label:"Ελληνικά",flag:"🇬🇷"},
  {code:"de",label:"Deutsch",flag:"🇩🇪"},
  {code:"fr",label:"Français",flag:"🇫🇷"},
  {code:"es",label:"Español",flag:"🇪🇸"},
  {code:"it",label:"Italiano",flag:"🇮🇹"},
];

/* CSV Parser — extracts key metrics from Azure/M365 exports */
function parseCSVToSummary(csvText, filename) {
  const lines = csvText.split("\n").filter(l => l.trim());
  if (lines.length < 2) return "Uploaded CSV appears empty.";
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map(l => {
    const vals = l.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || l.split(",");
    return vals.map(v => v.trim().replace(/"/g, ""));
  });

  /* Detect Azure Cost export */
  const costCol = headers.findIndex(h => /cost|amount|pretax/i.test(h));
  const serviceCol = headers.findIndex(h => /meter.*category|service.*name|resource.*type/i.test(h));
  const resourceCol = headers.findIndex(h => /resource.*name|instance.*name/i.test(h));

  if (costCol !== -1) {
    let total = 0;
    const byService = {};
    rows.forEach(r => {
      const cost = parseFloat(r[costCol]) || 0;
      total += cost;
      const svc = (serviceCol !== -1 ? r[serviceCol] : "Unknown") || "Unknown";
      byService[svc] = (byService[svc] || 0) + cost;
    });
    const sorted = Object.entries(byService).sort((a,b) => b[1] - a[1]).slice(0, 10);
    let summary = "## Azure Cost Analysis (from uploaded CSV: " + filename + ")\n";
    summary += "**Total spend:** $" + total.toFixed(2) + "\n";
    summary += "**Total line items:** " + rows.length + "\n\n";
    summary += "**Top spending services:**\n";
    sorted.forEach(([svc, cost]) => {
      const pct = ((cost / total) * 100).toFixed(1);
      summary += "- **" + svc + ":** $" + cost.toFixed(2) + " (" + pct + "%)\n";
    });
    summary += "\nPlease analyze this Azure cost data. Identify optimization opportunities, orphaned resources, right-sizing recommendations, and potential savings from Reserved Instances or Azure Hybrid Benefit.";
    return summary;
  }

  /* Detect M365 licensing export */
  const licenseCol = headers.findIndex(h => /license|product|sku/i.test(h));
  const userCol = headers.findIndex(h => /user|display.*name|upn/i.test(h));
  if (licenseCol !== -1) {
    const licenses = {};
    rows.forEach(r => {
      const lic = (r[licenseCol] || "Unknown");
      licenses[lic] = (licenses[lic] || 0) + 1;
    });
    let summary = "## M365 License Analysis (from uploaded CSV: " + filename + ")\n";
    summary += "**Total users/assignments:** " + rows.length + "\n\n";
    summary += "**License distribution:**\n";
    Object.entries(licenses).sort((a,b) => b[1] - a[1]).forEach(([lic, count]) => {
      summary += "- **" + lic + ":** " + count + " assignments\n";
    });
    summary += "\nPlease analyze this licensing data. Identify over-provisioned licenses, users who could be downgraded, and cost optimization opportunities.";
    return summary;
  }

  /* Generic CSV — send headers + sample rows */
  let summary = "## Uploaded Data (CSV: " + filename + ")\n";
  summary += "**Columns:** " + headers.join(", ") + "\n";
  summary += "**Rows:** " + rows.length + "\n\n";
  summary += "**Sample data (first 5 rows):**\n";
  rows.slice(0, 5).forEach(r => { summary += "- " + r.join(" | ") + "\n"; });
  summary += "\nPlease analyze this data and provide insights.";
  return summary;
}

/* Analytics — tracks events to Vercel Analytics + console in dev */
function trackEvent(name, data = {}) {
  try {
    /* Vercel Web Analytics */
    if (window.va) window.va("event", { name, ...data });
    /* Future: PostHog, GA4, etc. */
    if (window.posthog) window.posthog.capture(name, data);
  } catch {}
}

const CERTS = [
  {l:"MCT",i:"🎓"},{l:"Azure Expert",i:"☁️"},{l:"MCP",i:"🏅"},
  {l:"5x VCP",i:"🖥️"},{l:"CCNA R&S",i:"🔗"},{l:"CCNA Sec",i:"🔒"},
  {l:"Dell",i:"💾"},{l:"HPE",i:"🗄️"},{l:"Fortinet FCP",i:"🛡️"},
  {l:"AZ-800",i:"📘"},{l:"AZ-801",i:"📗"},{l:"AZ-104",i:"📙"},
  {l:"MS-102",i:"📕"},{l:"MD-102",i:"📒"},{l:"VMware VCP",i:"🔵"},
];

const PROJECT_CARDS = [
  {q:"Audit my Azure spend — I'll upload my cost export CSV", icon:"🔍", desc:"Upload your Azure cost CSV for instant FinOps analysis"},
  {q:"Am I overpaying for M365 licenses? Let me upload my data", icon:"📊", desc:"Upload licensing CSV for optimization recommendations"},
  {q:"Rate my M365 security posture — ask me 5 questions", icon:"🛡️", desc:"Quick security assessment based on your answers"},
  {q:"My server room is outdated — assess and refresh it", icon:"🖥️", desc:"Hardware, networking & infrastructure modernisation"},
  {q:"We need Zero Trust security across M365 & Azure", icon:"🔒", desc:"Conditional Access, Defender, Sentinel & compliance"},
  {q:"We want to migrate our infrastructure to Azure", icon:"☁️", desc:"Lift-and-shift, hybrid cloud or full Azure migration"},
  {q:"Our Hyper-V or VMware cluster needs upgrading", icon:"⚙️", desc:"HPE, Dell hardware refresh & virtualisation design"},
  {q:"We need a secure, resilient network with SD-WAN", icon:"🔗", desc:"FortiGate, Cisco, Ubiquiti — HA firewall & SD-WAN"},
  {q:"We're overspending on Azure — help us reduce costs", icon:"💰", desc:"FinOps, right-sizing, savings plans & governance"},
  {q:"We need to migrate email and collaboration to M365", icon:"📧", desc:"Exchange, Teams, SharePoint, OneDrive & Intune"},
  {q:"We need to onboard Entra ID and deploy Intune", icon:"🪪", desc:"Identity modernisation, MDM, MAM & device compliance"},
  {q:"We need DR protection — on-premises to Azure", icon:"🔄", desc:"ASR replication, Recovery Plans & automated failover"},
];

const TRAINING_CARDS = [
  {q:"We need Microsoft Server & Azure training for our team", icon:"🎓", desc:"AZ-800, AZ-801, AZ-104 — delivered by certified MCT"},
  {q:"We need M365 & Intune training for our IT team", icon:"📚", desc:"MS-102, MD-102 — Microsoft 365 & endpoint management"},
  {q:"We need CCNA networking training for our engineers", icon:"🔗", desc:"CCNA R&S & Security — routing, switching, firewalls"},
  {q:"We need VMware vSphere training for our team", icon:"🔵", desc:"VMware VCP-level — virtualisation, vSAN, vMotion, HA/DRS"},
];

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "text/csv", "application/vnd.ms-excel",
];
const MAX_FILE_MB = 10;

function uid() { return Math.random().toString(36).slice(2, 9); }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function ContactCard({ onClose }) {
  return (
    <div style={{position:"fixed",bottom:90,right:16,zIndex:1000,background:"#0f1e35",border:"2px solid rgba(122,178,212,0.4)",borderRadius:20,padding:"24px 20px 20px",width:"min(320px, calc(100vw - 32px))",boxShadow:"0 12px 48px rgba(0,0,0,0.6)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase"}}>Get in Touch</span>
        <button onClick={onClose} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",fontSize:16,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <a href={"mailto:"+CONTACT.email} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.25)",borderRadius:12,padding:"12px 14px",textDecoration:"none"}}>
          <span style={{fontSize:20}}>✉️</span>
          <div>
            <div style={{fontSize:12,color:"#4a6a82",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Email</div>
            <div style={{fontSize:14,color:"#7ab2d4",fontWeight:700}}>{CONTACT.email}</div>
          </div>
        </a>
        <a href={"tel:"+CONTACT.phone} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.25)",borderRadius:12,padding:"12px 14px",textDecoration:"none"}}>
          <span style={{fontSize:20}}>📞</span>
          <div>
            <div style={{fontSize:12,color:"#4a6a82",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Phone / WhatsApp</div>
            <div style={{fontSize:14,color:"#7ab2d4",fontWeight:700}}>{CONTACT.phone}</div>
          </div>
        </a>
        <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:12,background:"rgba(0,119,181,0.1)",border:"1px solid rgba(0,119,181,0.3)",borderRadius:12,padding:"12px 14px",textDecoration:"none"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          <div>
            <div style={{fontSize:12,color:"#4a6a82",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>LinkedIn</div>
            <div style={{fontSize:14,color:"#0ea5e9",fontWeight:700}}>View Full Profile & CV</div>
          </div>
        </a>
      </div>
      <div style={{marginTop:12,padding:"12px 14px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:12,textAlign:"center"}}>
        <p style={{fontSize:14,color:"#7ab2d4",margin:0,lineHeight:1.6}}>📅 Mention <strong style={{color:"#38bdf8"}}>Teams call</strong> in your email and I will send you a meeting invite</p>
      </div>
    </div>
  );
}

function renderInline(text) {
  const parts = [], re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[0].startsWith("**")) parts.push(<strong key={k++} style={{color:"#e2e8f0",fontWeight:700}}>{m[0].slice(2,-2)}</strong>);
    else parts.push(<code key={k++} style={{background:"#0f1e35",color:"#7ab2d4",padding:"1px 6px",borderRadius:4,fontSize:13,fontFamily:"monospace"}}>{m[0].slice(1,-1)}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

function Msg({ content }) {
  const lines = content.split("\n"), els = []; let i = 0, k = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const code = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      els.push(<pre key={k++} style={{background:"#0f1e35",border:"1px solid rgba(122,178,212,0.2)",borderRadius:8,padding:"12px 14px",overflowX:"auto",fontFamily:"monospace",fontSize:14,color:"#7ab2d4",margin:"10px 0",lineHeight:1.6}}><code>{code.join("\n")}</code></pre>);
      i++; continue;
    }
    if (l.includes("|") && lines[i+1]?.match(/^\|?[\s\-|]+\|?$/)) {
      const hdrs = l.split("|").map(h=>h.trim()).filter(Boolean); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) { rows.push(lines[i].split("|").map(c=>c.trim()).filter(Boolean)); i++; }
      els.push(<div key={k++} style={{overflowX:"auto",margin:"12px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}><thead><tr>{hdrs.map((h,hi)=><th key={hi} style={{background:"rgba(122,178,212,0.1)",color:"#7ab2d4",padding:"7px 12px",textAlign:"left",borderBottom:"1px solid rgba(122,178,212,0.2)",fontWeight:600,fontSize:12,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,ri)=><tr key={ri} style={{borderBottom:"1px solid rgba(122,178,212,0.08)"}}>{r.map((c,ci)=><td key={ci} style={{padding:"7px 12px",color:"#cbd5e1",fontSize:14,background:ri%2===0?"transparent":"rgba(122,178,212,0.04)"}}>{renderInline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (l.startsWith("## ")) { els.push(<h3 key={k++} style={{color:"#7ab2d4",fontSize:16,fontWeight:700,margin:"14px 0 6px"}}>{l.slice(3)}</h3>); i++; continue; }
    if (l.startsWith("# "))  { els.push(<h2 key={k++} style={{color:"#a8c8e0",fontSize:18,fontWeight:700,margin:"16px 0 8px"}}>{l.slice(2)}</h2>); i++; continue; }
    if (l.startsWith("---")) { els.push(<hr key={k++} style={{border:"none",borderTop:"1px solid rgba(122,178,212,0.15)",margin:"12px 0"}}/>); i++; continue; }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      const it = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { it.push(lines[i].slice(2)); i++; }
      els.push(<ul key={k++} style={{margin:"6px 0",paddingLeft:18}}>{it.map((x,xi)=><li key={xi} style={{color:"#cbd5e1",fontSize:15,marginBottom:4,lineHeight:1.6}}>{renderInline(x)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const it = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { it.push(lines[i].replace(/^\d+\. /,"")); i++; }
      els.push(<ol key={k++} style={{margin:"6px 0",paddingLeft:18}}>{it.map((x,xi)=><li key={xi} style={{color:"#cbd5e1",fontSize:15,marginBottom:4,lineHeight:1.6}}>{renderInline(x)}</li>)}</ol>);
      continue;
    }
    if (l.trim() === "") { els.push(<div key={k++} style={{height:6}}/>); i++; continue; }
    els.push(<p key={k++} style={{color:"#cbd5e1",fontSize:15,lineHeight:1.7,margin:"4px 0"}}>{renderInline(l)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

function Dots() {
  return (
    <div style={{display:"flex",gap:5,padding:"12px 14px",alignItems:"center"}}>
      {[0,1,2].map(i => <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#7ab2d4",animation:"bounce 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
    </div>
  );
}

function FileChip({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.25)",borderRadius:10,padding:"6px 10px 6px 8px",maxWidth:260}}>
      {isImage && file.preview ? (
        <img src={file.preview} alt="" style={{width:28,height:28,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
      ) : (
        <span style={{fontSize:18,flexShrink:0}}>📄</span>
      )}
      <span style={{fontSize:13,color:"#7ab2d4",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{file.name}</span>
      <span style={{fontSize:11,color:"#3a5a72",flexShrink:0}}>{(file.size / 1024).toFixed(0)} KB</span>
      <button onClick={onRemove} style={{background:"none",border:"none",color:"#4a6a82",cursor:"pointer",fontSize:16,padding:0,lineHeight:1,flexShrink:0}}>×</button>
    </div>
  );
}

function isDocumentResponse(text) {
  if (!text) return false;
  return /^#\s+(Statement of Work|IT Assessment Report|Your Personalized)/m.test(text)
    || /^\*\*Your Personalized .+ Learning Path/m.test(text)
    || /^#\s+.*(Learning Path|Training Plan|Certification|Roadmap)/m.test(text);
}

function openDocumentPrint(markdownText) {
  /* Convert markdown to simple HTML */
  let html = markdownText
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  /* Wrap consecutive <li> in <ul> */
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  /* Convert markdown tables */
  html = html.replace(/^(\|.*\|)\n\|[\s\-|]+\|\n((?:\|.*\|\n?)*)/gm, (match, header, body) => {
    const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  /* Wrap remaining plain lines in <p> */
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (/^<[hH\d|ul|ol|li|table|thead|tbody|tr|td|th|hr]/.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  }).join('\n');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>TechByPete — Document</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1e293b;
    line-height: 1.7;
    padding: 48px 56px;
    max-width: 900px;
    margin: 0 auto;
    font-size: 13px;
  }
  @media print {
    body { padding: 24px 32px; }
    .no-print { display: none !important; }
  }
  h1 {
    font-size: 26px; font-weight: 700; color: #0f172a;
    border-bottom: 3px solid #0078d4; padding-bottom: 12px; margin-bottom: 20px;
  }
  h2 {
    font-size: 17px; font-weight: 700; color: #0078d4;
    margin: 28px 0 10px; padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  h3 { font-size: 14px; font-weight: 600; color: #334155; margin: 18px 0 8px; }
  p { margin: 6px 0; color: #334155; }
  strong { color: #0f172a; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 20px 0; }
  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 4px 0; color: #334155; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12.5px; }
  th { background: #f1f5f9; color: #0078d4; font-weight: 600; text-align: left;
       padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 11px;
       text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 8px 12px; border: 1px solid #e2e8f0; color: #334155; }
  tr:nth-child(even) td { background: #f8fafc; }
  .header { display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #0078d4; }
  .logo { font-size: 20px; font-weight: 700; color: #0078d4; letter-spacing: -0.02em; }
  .logo span { color: #64748b; font-weight: 400; font-size: 12px; display: block; }
  .contact { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #0078d4;
            font-size: 11px; color: #64748b; text-align: center; }
  .print-bar { background: #0078d4; color: white; padding: 12px 24px; text-align: center;
               font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 8px;
               margin-bottom: 24px; }
  .print-bar:hover { background: #005a9e; }
</style>
</head>
<body>
  <div class="no-print print-bar" onclick="window.print()">
    📄 Click here to save as PDF (or press Ctrl+P / Cmd+P)
  </div>
  <div class="header">
    <div class="logo">TechByPete<span>IT Solutions Architecture & Training</span></div>
    <div class="contact">
      Pete Matsoukas<br/>
      p.matsoukas@techbypete.com<br/>
      +30 690 959 6515<br/>
      techbypete.com · ask.techbypete.com
    </div>
  </div>
  ${html}
  <div class="footer">
    <strong>TechByPete</strong> · IT Solutions Architecture & Training · ask.techbypete.com<br/>
    This document was generated by the TechByPete AI Agent and should be reviewed before use as a binding agreement.
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) {
    win.document.write(fullHtml);
    win.document.close();
  } else {
    /* Fallback: download as HTML file */
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TechByPete-Document.html';
    a.click();
    URL.revokeObjectURL(url);
  }
}

function LeadCaptureModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !consent) return;
    const lead = { name: name.trim(), email: email.trim(), timestamp: new Date().toISOString() };
    /* Store lead locally */
    try {
      const existing = JSON.parse(localStorage.getItem("techbypete_leads") || "[]");
      existing.push(lead);
      localStorage.setItem("techbypete_leads", JSON.stringify(existing));
    } catch {}
    trackEvent("lead_captured", { name: lead.name });
    setSubmitted(true);
    if (onSubmit) onSubmit(lead);
  };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
      <div style={{
        position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,
        width:"min(440px, calc(100vw - 32px))",
        background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",
        border:"2px solid rgba(122,178,212,0.35)",borderRadius:20,
        boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"28px 24px",
        animation:"fadeUp 0.25s ease",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:15,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>
            {submitted ? "✅ You're all set!" : "📋 Get Your Free Assessment"}
          </span>
          <button onClick={onClose} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
        </div>

        {submitted ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.7,margin:"0 0 16px"}}>
              Thanks, <strong style={{color:"#38bdf8"}}>{name}</strong>! Your assessment is ready to download. Pete will also follow up at <strong style={{color:"#38bdf8"}}>{email}</strong> to discuss next steps.
            </p>
            <button onClick={onClose} style={{background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:10,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Got it — close
            </button>
          </div>
        ) : (
          <>
            <p style={{color:"#94a3b8",fontSize:14,lineHeight:1.6,margin:"0 0 18px"}}>
              Enter your details to download the assessment PDF and receive a follow-up from Pete with next steps.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                style={{background:"#0a1525",border:"2px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" type="email"
                style={{background:"#0a1525",border:"2px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
              <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                  style={{marginTop:3,accentColor:"#0ea5e9",width:18,height:18,flexShrink:0}}/>
                <span style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>
                  I agree to receive a follow-up from Pete regarding this assessment. My data will not be shared with third parties or used to train AI models.
                </span>
              </label>
              <button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || !consent}
                style={{background:(!name.trim()||!email.trim()||!consent)?"rgba(122,178,212,0.1)":"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:10,padding:"14px 20px",color:(!name.trim()||!email.trim()||!consent)?"#4a6a82":"#fff",fontSize:14,fontWeight:700,cursor:(!name.trim()||!email.trim()||!consent)?"not-allowed":"pointer",fontFamily:"inherit",transition:"all .2s",minHeight:48}}>
                📄 Download Assessment & Submit
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ROICalculator({ onClose, mobile }) {
  const [users, setUsers] = useState(50);
  const [spend, setSpend] = useState(5000);
  const [age, setAge] = useState(5);
  const savingsRate = age >= 7 ? 0.45 : age >= 5 ? 0.35 : age >= 3 ? 0.25 : 0.15;
  const monthlySavings = Math.round(spend * savingsRate);
  const yearlySavings = monthlySavings * 12;
  const migrationCost = Math.round(users * 350);
  const paybackMonths = Math.ceil(migrationCost / monthlySavings);
  const threeYearROI = (yearlySavings * 3) - migrationCost;

  const inputStyle = {width:"100%",background:"#0a1525",border:"2px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:15,fontFamily:"inherit",outline:"none"};
  const labelStyle = {fontSize:12,color:"#7ab2d4",fontWeight:600,marginBottom:4,display:"block"};

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(520px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",border:"2px solid rgba(122,178,212,0.35)",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"24px",animation:"fadeUp 0.25s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>📊 ROI Calculator</span>
          <button onClick={onClose} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={labelStyle}>Number of users / endpoints</label>
            <input type="number" value={users} onChange={e => setUsers(Math.max(1,+e.target.value||1))} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Current monthly IT spend ($)</label>
            <input type="number" value={spend} onChange={e => setSpend(Math.max(0,+e.target.value||0))} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Infrastructure age (years)</label>
            <input type="range" min="1" max="15" value={age} onChange={e => setAge(+e.target.value)} style={{width:"100%",accentColor:"#0ea5e9"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#4a6a82"}}><span>1 yr</span><span style={{color:"#38bdf8",fontWeight:700}}>{age} years</span><span>15 yrs</span></div>
          </div>
        </div>
        <div style={{marginTop:20,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.15)",borderRadius:14,padding:"18px"}}>
          <div style={{fontSize:12,color:"#3a5a72",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Projected Results</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#34d399"}}>${monthlySavings.toLocaleString()}</div>
              <div style={{fontSize:11,color:"#4a6a82",marginTop:2}}>Monthly Savings</div>
            </div>
            <div style={{background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#38bdf8"}}>${yearlySavings.toLocaleString()}</div>
              <div style={{fontSize:11,color:"#4a6a82",marginTop:2}}>Annual Savings</div>
            </div>
            <div style={{background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.15)",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#7ab2d4"}}>{paybackMonths} mo</div>
              <div style={{fontSize:11,color:"#4a6a82",marginTop:2}}>Payback Period</div>
            </div>
            <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#34d399"}}>${threeYearROI.toLocaleString()}</div>
              <div style={{fontSize:11,color:"#4a6a82",marginTop:2}}>3-Year ROI</div>
            </div>
          </div>
          <div style={{marginTop:12,fontSize:12,color:"#64748b",lineHeight:1.6}}>
            Based on {Math.round(savingsRate*100)}% optimization rate for {age}-year-old infrastructure with {users} users. Estimated migration investment: ${migrationCost.toLocaleString()}.
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",cursor:"pointer",fontFamily:"inherit"}}>
            📞 Discuss with Pete
          </a>
          <button onClick={onClose} style={{flex:1,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px",color:"#7ab2d4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

function ClientPortal({ onClose, sessions, onLoadProject, mobile }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState("menu"); /* menu | save | load */
  const [status, setStatus] = useState("");

  const saveProject = () => {
    if (!email.trim()) return;
    try {
      const projects = JSON.parse(localStorage.getItem("techbypete_projects") || "{}");
      const key = email.trim().toLowerCase();
      if (!projects[key]) projects[key] = [];
      const toSave = sessions.filter(s => s.messages.length > 0).map(s => ({
        id: s.id, title: s.title, messages: s.messages.map(m => ({ role: m.role, display: m.display || (typeof m.content === "string" ? m.content : "") })),
        savedAt: new Date().toISOString(),
      }));
      projects[key] = [...toSave, ...projects[key]].slice(0, 50);
      localStorage.setItem("techbypete_projects", JSON.stringify(projects));
      setStatus("saved");
      trackEvent("portal_save", { email: key, count: toSave.length });
    } catch { setStatus("error"); }
  };

  const loadProjects = () => {
    if (!email.trim()) return;
    try {
      const projects = JSON.parse(localStorage.getItem("techbypete_projects") || "{}");
      const key = email.trim().toLowerCase();
      setSaved(projects[key] || []);
      setView("results");
    } catch { setSaved([]); }
  };

  const inputStyle = {width:"100%",background:"#0a1525",border:"2px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:15,fontFamily:"inherit",outline:"none"};

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(480px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",border:"2px solid rgba(122,178,212,0.35)",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"24px",animation:"fadeUp 0.25s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>💼 My Projects</span>
          <button onClick={onClose} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
        </div>

        {view === "menu" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={() => setView("save")} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:12,padding:"16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <span style={{fontSize:24}}>💾</span>
              <div><div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>Save Current Sessions</div><div style={{fontSize:12,color:"#4a6a82",marginTop:2}}>Save your conversations to access them later</div></div>
            </button>
            <button onClick={() => setView("load")} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:12,padding:"16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <span style={{fontSize:24}}>📂</span>
              <div><div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>Load Saved Projects</div><div style={{fontSize:12,color:"#4a6a82",marginTop:2}}>Retrieve your previous conversations and SOWs</div></div>
            </button>
          </div>
        )}

        {(view === "save" || view === "load") && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={() => setView("menu")} style={{background:"none",border:"none",color:"#7ab2d4",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",padding:0}}>← Back</button>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" type="email" style={inputStyle}/>
            {view === "save" ? (
              <>
                <button onClick={saveProject} disabled={!email.trim()} style={{background:email.trim()?"linear-gradient(135deg,#0078d4,#0ea5e9)":"rgba(122,178,212,0.1)",border:"none",borderRadius:10,padding:"14px",color:email.trim()?"#fff":"#4a6a82",fontSize:14,fontWeight:700,cursor:email.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  💾 Save My Projects
                </button>
                {status === "saved" && <p style={{color:"#34d399",fontSize:13,textAlign:"center",margin:0}}>✅ Projects saved! Use this email to load them anytime.</p>}
                {status === "error" && <p style={{color:"#ef4444",fontSize:13,textAlign:"center",margin:0}}>Failed to save. Please try again.</p>}
              </>
            ) : (
              <>
                <button onClick={loadProjects} disabled={!email.trim()} style={{background:email.trim()?"linear-gradient(135deg,#0078d4,#0ea5e9)":"rgba(122,178,212,0.1)",border:"none",borderRadius:10,padding:"14px",color:email.trim()?"#fff":"#4a6a82",fontSize:14,fontWeight:700,cursor:email.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  📂 Load My Projects
                </button>
              </>
            )}
          </div>
        )}

        {view === "results" && (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={() => setView("load")} style={{background:"none",border:"none",color:"#7ab2d4",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",padding:0}}>← Back</button>
            {saved.length === 0 ? (
              <p style={{color:"#4a6a82",fontSize:14,textAlign:"center",padding:"20px 0"}}>No saved projects found for this email.</p>
            ) : (
              saved.map((s, i) => (
                <button key={i} onClick={() => { onLoadProject(s); onClose(); }} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.15)",borderRadius:10,padding:"12px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                  <span style={{fontSize:16}}>💬</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                    <div style={{fontSize:11,color:"#3a5a72",marginTop:2}}>{new Date(s.savedAt).toLocaleDateString()} · {s.messages.length} messages</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

const STORAGE_KEY = "techbypete_sessions";
const KNOWLEDGE_KEY = "techbypete_learned_knowledge";

/* Load learned knowledge from localStorage */
function loadLearnedKnowledge() {
  try { return JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || "[]"); } catch { return []; }
}
function saveLearnedKnowledge(entries) {
  try { localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(entries.slice(-50))); } catch {} /* max 50 entries */
}
const ACTIVE_KEY = "techbypete_active";

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveSessions(sessions) {
  try {
    /* Strip base64 file data before saving — keeps localStorage under 5 MB */
    const clean = sessions.map(s => ({
      ...s,
      messages: s.messages.map(m => ({
        role: m.role,
        display: m.display || (typeof m.content === "string" ? m.content : ""),
        content: typeof m.content === "string" ? m.content : (m.display || ""),
      }))
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {}
}

export default function App() {
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadDocContent, setLeadDocContent] = useState("");
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [deferredInstall, setDeferredInstall] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showROI, setShowROI] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showSecureScore, setShowSecureScore] = useState(false);
  const [secureScoreData, setSecureScoreData] = useState(null);
  const [secureScoreLoading, setSecureScoreLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(() => {
    try { return !!localStorage.getItem("techbypete_lead_email"); } catch { return false; }
  });
  const FREE_MESSAGE_LIMIT = 5;
  const [learnedKnowledge, setLearnedKnowledge] = useState(() => loadLearnedKnowledge());
  const [showKnowledgeReview, setShowKnowledgeReview] = useState(false);
  const [pendingKnowledge, setPendingKnowledge] = useState({ title: "", content: "", source: "" });
  const [showVendorUpdate, setShowVendorUpdate] = useState(false);
  const [vendorUpdateStatus, setVendorUpdateStatus] = useState(""); /* "" | "loading" | "ready" | "saved" */
  const [vendorUpdateContent, setVendorUpdateContent] = useState("");
  const [orchestratorActive, setOrchestratorActive] = useState(false);
  const [specialistsWorking, setSpecialistsWorking] = useState([]); /* [{key, name, icon, status}] */
  const recognitionRef = useRef(null);

  /* Detect if query is complex enough to trigger multi-agent */
  const detectComplexQuery = (query) => {
    const lower = query.toLowerCase();
    /* Multi-domain keywords — if 2+ of these appear, it's complex */
    const domains = [
      { name: "azure", terms: ["azure","avd","vnet","expressroute","hub-spoke","landing zone"] },
      { name: "security", terms: ["zero trust","conditional access","defender","sentinel","cis","mfa","phishing"] },
      { name: "m365", terms: ["m365","office 365","exchange","teams","sharepoint","intune","entra","autopilot"] },
      { name: "vmware", terms: ["vmware","vsphere","esxi","vsan","vcenter","vmotion"] },
      { name: "fortigate", terms: ["fortigate","sd-wan","ztna","vpn","forticlient","fortinet"] },
      { name: "veeam", terms: ["veeam","backup","immutable","ransomware","rpo","rto"] },
      { name: "network", terms: ["cisco","unifi","vlan","wifi","wireless","radius","802.1x"] },
      { name: "server", terms: ["active directory","ad ds","hyper-v","wsfc","sql always on","gpo"] },
    ];
    let hits = 0;
    for (const d of domains) if (d.terms.some(t => lower.includes(t))) hits++;

    /* Complexity markers that justify multi-agent even on single-domain */
    const complexMarkers = ["migrate","deploy","design","architect","plan","sow","statement of work","solution","project","end-to-end","full stack","complete"];
    const hasComplexity = complexMarkers.some(m => lower.includes(m));

    /* Trigger multi-agent when: 2+ domains OR 1 domain + complexity marker */
    return (hits >= 2) || (hits === 1 && hasComplexity && query.length > 40);
  };

  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  const active = sessions.find(s => s.id === activeId);
  const msgs = active?.messages || [];

  useEffect(() => {
    setMounted(true);
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    const check = () => { setMobile(window.innerWidth < 768); setVh(); };
    check();
    window.addEventListener("resize", check);

    /* Load persisted sessions */
    const saved = loadSessions();
    if (saved.length > 0) {
      setSessions(saved);
      const savedActive = localStorage.getItem(ACTIVE_KEY);
      const target = saved.find(s => s.id === savedActive) || saved[0];
      setActiveId(target.id);
      setChatStarted(target.messages.length > 0);
    } else {
      const id = uid();
      setSessions([{ id, title: "New Chat", messages: [] }]);
      setActiveId(id);
    }

    /* Load Vercel Web Analytics */
    if (!document.querySelector('script[src*="vercel/insights"]')) {
      const s = document.createElement("script");
      s.src = "/_vercel/insights/script.js";
      s.defer = true;
      document.head.appendChild(s);
    }

    /* PWA: Add manifest link */
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
    }

    /* PWA: Add theme-color meta */
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#0078d4";
      document.head.appendChild(meta);
    }

    /* PWA: Register service worker */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    /* PWA: Capture install prompt */
    const handleInstall = (e) => {
      e.preventDefault();
      setDeferredInstall(e);
      const dismissed = localStorage.getItem("techbypete_install_dismissed");
      if (!dismissed) setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  /* Persist sessions to localStorage on every change */
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  /* Persist active session ID */
  useEffect(() => {
    if (activeId) {
      try { localStorage.setItem(ACTIVE_KEY, activeId); } catch {}
    }
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading, streamingText]);

  const newChat = () => {
    const id = uid();
    setSessions(p => [{ id, title: "New Chat", messages: [] }, ...p]);
    setActiveId(id); setInput(""); setChatStarted(false); setAttachedFile(null);
  };

  const updateChat = (id, m) => setSessions(p => p.map(s => s.id !== id ? s : {
    ...s, messages: m,
    title: m.find(x => x.role === "user")?.display?.slice(0, 36) || m.find(x => x.role === "user")?.content?.slice?.(0, 36) || "New Chat"
  }));

  const deleteChat = (id) => setSessions(p => {
    const n = p.filter(s => s.id !== id);
    if (id === activeId) { if (n.length) setActiveId(n[0].id); else newChat(); }
    return n;
  });

  const clearAllChats = () => {
    if (!confirm("Delete all chat history? This cannot be undone.")) return;
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(ACTIVE_KEY); } catch {}
    const id = uid();
    setSessions([{ id, title: "New Chat", messages: [] }]);
    setActiveId(id);
    setChatStarted(false);
    setInput("");
  };

  /* Voice Input — Speech-to-Text */
  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input is not supported in this browser. Try Chrome or Edge."); return; }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
      setInput(transcript);
      if (taRef.current) {
        taRef.current.style.height = "auto";
        taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + "px";
      }
    };

    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setListening(false); recognitionRef.current = null; };

    recognition.start();
    setListening(true);
    trackEvent("voice_input_start");
  };

  /* Voice Output — Text-to-Speech */
  const speakMessage = (text, idx) => {
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    /* Strip markdown for cleaner speech */
    const clean = text
      .replace(/^#+\s/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/\|[^\n]+\|/g, "")
      .replace(/^[\-\*]\s/gm, "")
      .replace(/^\d+\.\s/gm, "")
      .replace(/---/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    /* Try to pick a natural English voice */
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"))
      || voices.find(v => v.lang.startsWith("en") && v.localService)
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingIdx(idx);
    trackEvent("voice_output_play");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCSV = file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".csv");
    if (!isCSV && !ALLOWED_TYPES.includes(file.type)) {
      alert("Supported formats: PDF, PNG, JPEG, GIF, WebP, CSV");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`File must be under ${MAX_FILE_MB} MB`);
      return;
    }
    try {
      if (isCSV) {
        /* Parse CSV and create analysis summary */
        const text = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => rej(new Error("Read failed"));
          r.readAsText(file);
        });
        const summary = parseCSVToSummary(text, file.name);
        setAttachedFile({ name: file.name, type: "text/csv", size: file.size, data: null, preview: null, csvSummary: summary });
        trackEvent("csv_upload", { filename: file.name });
      } else {
        const base64 = await fileToBase64(file);
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        setAttachedFile({ name: file.name, type: file.type, size: file.size, data: base64, preview });
      }
    } catch {
      alert("Failed to read file. Please try again.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  /* Secure Score Scanner */
  const MSAL_CONFIG = {
    auth: {
      clientId: MSAL_CLIENT_ID,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: typeof window !== "undefined" ? window.location.origin : "",
    },
    cache: { cacheLocation: "sessionStorage" },
  };

  /* Level 2: Save conversation insight to knowledge base */
  const generateKnowledgeSummary = async (msgContent) => {
    setShowKnowledgeReview(true);
    setPendingKnowledge({ title: "Generating summary...", content: "Please wait...", source: "conversation" });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: "Summarize the following AI response into a concise knowledge base entry. Format it as:\n\nTitle: [short descriptive title]\n\n[2-4 paragraphs covering: the problem/scenario, the solution approach, key technical details, and any gotchas or lessons learned. Include specific commands, pricing, or timelines if mentioned.]\n\nHere is the response to summarize:\n\n" + msgContent
          }],
          mode: "projects",
          language: "en",
        })
      });
      if (!response.ok) throw new Error("API error");
      let accumulated = "";
      if (response.body?.getReader) {
        const reader = response.body.getReader();
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
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") accumulated += evt.delta.text;
            } catch {}
          }
        }
      }
      const titleMatch = accumulated.match(/Title:\s*(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : "Knowledge Entry";
      const content = accumulated.replace(/Title:\s*.+\n*/i, "").trim();
      setPendingKnowledge({ title, content, source: "conversation" });
    } catch {
      setPendingKnowledge({ title: "Error", content: "Failed to generate summary. You can write one manually.", source: "conversation" });
    }
  };

  const approveKnowledge = () => {
    if (!pendingKnowledge.content || pendingKnowledge.title === "Generating summary...") return;
    const entry = {
      id: Date.now(),
      title: pendingKnowledge.title,
      content: pendingKnowledge.content,
      source: pendingKnowledge.source,
      date: new Date().toISOString(),
    };
    const updated = [...learnedKnowledge, entry];
    setLearnedKnowledge(updated);
    saveLearnedKnowledge(updated);
    setShowKnowledgeReview(false);
    setPendingKnowledge({ title: "", content: "", source: "" });
    trackEvent("knowledge_approved", { title: entry.title });
  };

  const deleteKnowledgeEntry = (id) => {
    const updated = learnedKnowledge.filter(e => e.id !== id);
    setLearnedKnowledge(updated);
    saveLearnedKnowledge(updated);
  };

  const exportKnowledgeAsMD = (entry) => {
    const md = "# " + entry.title + "\n\n" + entry.content + "\n\n---\n*Source: " + entry.source + " · " + new Date(entry.date).toLocaleDateString() + "*\n";
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = entry.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + ".md";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* Level 3: Auto-update from vendor sources */
  const runVendorUpdate = async () => {
    setShowVendorUpdate(true);
    setVendorUpdateStatus("loading");
    setVendorUpdateContent("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: "Search the web for the latest Microsoft Azure, Microsoft 365, Intune, Entra ID, and Windows Server updates, security advisories, and feature announcements from the past 7 days. Summarize the top 5-8 most important updates that IT admins and solutions architects need to know. Format each as:\n\n### [Update Title]\n[2-3 sentence summary of what changed and why it matters]\n\nFocus on: new features, security patches, deprecation notices, licensing changes, and best practice updates."
          }],
          mode: "projects",
          language: "en",
        })
      });
      if (!response.ok) throw new Error("API error");
      let accumulated = "";
      if (response.body?.getReader) {
        const reader = response.body.getReader();
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
                accumulated += evt.delta.text;
                setVendorUpdateContent(accumulated);
              }
            } catch {}
          }
        }
      }
      if (accumulated) {
        setVendorUpdateContent(accumulated);
        setVendorUpdateStatus("ready");
      } else {
        setVendorUpdateStatus("");
        setVendorUpdateContent("Failed to fetch updates. Please try again.");
      }
    } catch {
      setVendorUpdateStatus("");
      setVendorUpdateContent("Error fetching vendor updates.");
    }
  };

  const approveVendorUpdate = () => {
    const entry = {
      id: Date.now(),
      title: "Vendor Updates — " + new Date().toLocaleDateString(),
      content: vendorUpdateContent,
      source: "vendor-auto-update",
      date: new Date().toISOString(),
    };
    const updated = [...learnedKnowledge, entry];
    setLearnedKnowledge(updated);
    saveLearnedKnowledge(updated);
    setVendorUpdateStatus("saved");
    trackEvent("vendor_update_approved");
  };

  const loadMSAL = () => new Promise((resolve, reject) => {
    if (window.msal) { resolve(); return; }
    const urls = [
      "https://alcdn.msauth.net/browser/2.38.3/js/msal-browser-2.38.3.min.js",
      "https://alcdn.msauth.net/browser/2.38.0/js/msal-browser-2.38.0.min.js",
    ];
    let idx = 0;
    const tryLoad = () => {
      if (idx >= urls.length) { reject(new Error("Failed to load Microsoft authentication library.")); return; }
      const s = document.createElement("script");
      s.src = urls[idx];
      s.onload = () => resolve();
      s.onerror = () => { idx++; tryLoad(); };
      document.head.appendChild(s);
    };
    tryLoad();
  });

  const checkSecureScore = async () => {
    setSecureScoreLoading(true);
    setShowSecureScore(true);
    try {
      await loadMSAL();
    } catch (err) {
      setSecureScoreData({ error: "Could not load Microsoft authentication. Please disable ad blockers and try again." });
      setSecureScoreLoading(false);
      return;
    }
    try {
      const msalInstance = new window.msal.PublicClientApplication(MSAL_CONFIG);
      await msalInstance.initialize();
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["SecurityEvents.Read.All"],
        prompt: "select_account",
      });
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ["SecurityEvents.Read.All"],
        account: loginResponse.account,
      });
      const res = await fetch("https://graph.microsoft.com/v1.0/security/secureScores?$top=1", {
        headers: { Authorization: "Bearer " + tokenResponse.accessToken },
      });
      if (!res.ok) throw new Error("Graph API " + res.status);
      const data = await res.json();
      const score = data.value?.[0];
      if (score) {
        const result = {
          currentScore: score.currentScore,
          maxScore: score.maxScore,
          percentage: Math.round((score.currentScore / score.maxScore) * 100),
          tenant: loginResponse.account?.username?.split("@")[1] || "Your tenant",
          controls: (score.controlScores || []).filter(c => c.score < c.scoreInPercentage).sort((a,b) => b.scoreInPercentage - a.scoreInPercentage).slice(0, 8).map(c => ({
            name: c.controlName, score: c.score, max: c.scoreInPercentage, category: c.controlCategory,
          })),
        };
        setSecureScoreData(result);
        trackEvent("secure_score_check", { score: result.percentage });
      }
    } catch (err) {
      if (err.errorCode === "user_cancelled") { setShowSecureScore(false); }
      else {
        let errorMsg = "Unable to retrieve your Secure Score.";
        const errStr = (err.message || err.errorMessage || "").toLowerCase();
        if (errStr.includes("consent") || errStr.includes("approval") || errStr.includes("admin")) {
          errorMsg = "Your tenant admin needs to grant consent for this app first. Ask your Microsoft 365 Global Admin to visit the Secure Score Scanner and approve the permission request. This is a one-time step.";
        } else if (errStr.includes("forbidden") || errStr.includes("403") || errStr.includes("authorization") || errStr.includes("insufficient")) {
          errorMsg = "Your account doesn't have permission to view the Secure Score. You need the Security Reader or Global Admin role in your Microsoft 365 tenant. Ask your IT admin to assign this role to your account, or have them run the scan instead.";
        } else {
          errorMsg = err.message || "Failed to connect to Microsoft. Please try again.";
        }
        setSecureScoreData({ error: errorMsg });
      }
    } finally { setSecureScoreLoading(false); }
  };

  const sendSecureScoreToChat = () => {
    if (!secureScoreData || secureScoreData.error) return;
    const summary = `## My Microsoft Secure Score Results\n**Tenant:** ${secureScoreData.tenant}\n**Score:** ${secureScoreData.currentScore}/${secureScoreData.maxScore} (${secureScoreData.percentage}%)\n\n**Top improvement areas:**\n${secureScoreData.controls.map(c => "- " + c.name + " (" + c.category + ") — " + c.score + "/" + c.max).join("\n")}\n\nPlease analyze my Secure Score and give me a prioritized action plan to improve it. Focus on quick wins first.`;
    send(summary);
    setShowSecureScore(false);
  };

  const stopGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading || !activeId) return;

    /* Layer 2: Lead capture gate — after FREE_MESSAGE_LIMIT, require email */
    if (!leadCaptured) {
      const totalUserMsgs = sessions.reduce((sum, s) => sum + s.messages.filter(m => m.role === "user").length, 0);
      if (totalUserMsgs >= FREE_MESSAGE_LIMIT) {
        setShowLeadCapture(true);
        return;
      }
    }
    trackEvent("message_sent", { length: t.length, isCard: !!text });
    setInput(""); setChatStarted(true); setDrawerOpen(false); setStreamingText("");
    if (taRef.current) taRef.current.style.height = "auto";

    /* Build user message */
    let apiContent;
    let displayText = t;
    const currentFile = attachedFile;

    if (currentFile) {
      if (currentFile.csvSummary) {
        /* CSV: send parsed summary as text */
        apiContent = currentFile.csvSummary + "\n\n" + t;
        displayText = "\u{1F4CE} " + currentFile.name + " (analyzed)\n" + t;
      } else {
        const parts = [];
        if (currentFile.type.startsWith("image/")) {
          parts.push({ type: "image", source: { type: "base64", media_type: currentFile.type, data: currentFile.data } });
        } else if (currentFile.type === "application/pdf") {
          parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: currentFile.data } });
        }
        parts.push({ type: "text", text: t });
        apiContent = parts;
        displayText = "\u{1F4CE} " + currentFile.name + "\n" + t;
      }
    } else {
      apiContent = t;
    }

    const uMsg = { role: "user", content: apiContent, display: displayText };
    const newMsgs = [...msgs, uMsg];
    updateChat(activeId, newMsgs);
    setLoading(true);
    setAttachedFile(null);

    /* Build API payload — strip file data from older messages to save tokens */
    const apiMessages = newMsgs.map((m, idx) => {
      if (m.role === "user" && Array.isArray(m.content)) {
        if (idx < newMsgs.length - 1) {
          const textPart = m.content.find(p => p.type === "text");
          return { role: "user", content: textPart?.text || "" };
        }
        return { role: "user", content: m.content };
      }
      return { role: m.role, content: typeof m.content === "string" ? m.content : (m.display || "") };
    });

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      /* Route to orchestrator for complex multi-domain queries */
      const useOrchestrator = detectComplexQuery(t) && !currentFile;
      const endpoint = useOrchestrator ? "/api/orchestrate" : "/api/chat";

      if (useOrchestrator) {
        setOrchestratorActive(true);
        setSpecialistsWorking([]);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, mode: activeTab, language, learnedKnowledge: learnedKnowledge.map(e => e.title + ": " + e.content).join("\n\n---\n\n") }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = "I encountered an issue. Please try again.";
        try {
          const errData = await response.json();
          if (errData.error === "rate_limited") errorMsg = "⏳ " + errData.message;
          else if (errData.error === "daily_limit") errorMsg = "📅 " + errData.message + "\n\n📞 Book a call: https://calendly.com/pilot3282/30min";
          else if (errData.error === "limit_reached") errorMsg = "🌙 " + errData.message + "\n\n📞 Book a call: https://calendly.com/pilot3282/30min";
          else if (errData.message) errorMsg = errData.message;
        } catch {}
        updateChat(activeId, [...newMsgs, { role: "assistant", content: errorMsg, display: errorMsg }]);
        setLoading(false); setStreamingText("");
        return;
      }

      if (response.body && typeof response.body.getReader === "function") {
        /* SSE streaming */
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        try {
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
                /* Orchestrator-specific events */
                if (evt.type === "orchestrator_start") {
                  setSpecialistsWorking(evt.specialists.map(s => ({ ...s, status: "pending" })));
                } else if (evt.type === "specialist_start") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "working" } : s));
                } else if (evt.type === "specialist_complete") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "complete" } : s));
                } else if (evt.type === "specialist_error") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "error" } : s));
                } else if (evt.type === "assembly_start") {
                  setSpecialistsWorking(prev => [...prev, { key: "_pete", name: "Pete Matsoukas (Lead Architect)", icon: "🎯", status: "working" }]);
                }
                /* Regular content streaming */
                if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                  accumulated += evt.delta.text;
                  setStreamingText(accumulated);
                }
              } catch {}
            }
          }
        } catch (streamErr) {
          /* If aborted, save what we have so far */
          if (controller.signal.aborted && accumulated) {
            setStreamingText("");
            updateChat(activeId, [...newMsgs, { role: "assistant", content: accumulated + "\n\n*(Response stopped by user)*", display: accumulated + "\n\n*(Response stopped by user)*" }]);
            return;
          }
          console.warn("Stream read error:", streamErr);
        }

        if (accumulated) {
          setStreamingText("");
          updateChat(activeId, [...newMsgs, { role: "assistant", content: accumulated, display: accumulated }]);
        } else {
          updateChat(activeId, [...newMsgs, { role: "assistant", content: "I encountered an issue processing that. Please try again.", display: "I encountered an issue processing that. Please try again." }]);
        }

      } else {
        /* No ReadableStream — fallback JSON parse */
        const data = await response.json();
        const reply = data.content?.map(b => b.text || "").join("") || "I encountered an issue. Please try again.";
        updateChat(activeId, [...newMsgs, { role: "assistant", content: reply, display: reply }]);
      }

    } catch (e) {
      if (e.name === "AbortError") {
        /* User stopped generation — streamErr handler already saved the text */
        return;
      }
      console.error("Chat error:", e);
      updateChat(activeId, [...newMsgs, { role: "assistant", content: "Connection error. Please try again.", display: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      setStreamingText("");
      setOrchestratorActive(false);
      setSpecialistsWorking([]);
      abortRef.current = null;
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !mobile) { e.preventDefault(); send(); }
  };

  const onTa = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  if (!mounted) return null;

  const PeteModal = drawerOpen ? (
    <>
      {/* Backdrop */}
      <div onClick={() => setDrawerOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)",animation:"fadeIn 0.2s ease"}}/>
      {/* Modal */}
      <div style={{
        position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,
        width:mobile?"calc(100vw - 24px)":"min(660px, 90vw)",
        maxHeight:mobile?"calc(100vh - 40px)":"85vh",
        background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",
        border:"2px solid rgba(122,178,212,0.35)",
        borderRadius:20,
        boxShadow:"0 24px 80px rgba(0,0,0,0.8),0 0 40px rgba(122,178,212,0.1)",
        overflowY:"auto",WebkitOverflowScrolling:"touch",
        animation:"fadeUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{padding:mobile?"16px 16px 0":"24px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#3a5a72",letterSpacing:"0.12em",textTransform:"uppercase"}}>Meet Pete Matsoukas</div>
          <button onClick={() => setDrawerOpen(false)} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>×</button>
        </div>

        {/* Profile area */}
        <div style={{padding:mobile?"20px 16px":"24px 28px",display:"flex",flexDirection:mobile?"column":"row",gap:mobile?16:24,alignItems:mobile?"center":"flex-start"}}>
          <div style={{flexShrink:0,textAlign:"center"}}>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" title="View LinkedIn Profile" style={{display:"block",cursor:"pointer"}}>
              <img src="/pete.jpg" alt="Pete Matsoukas" style={{width:mobile?110:130,height:mobile?110:130,borderRadius:16,border:"3px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",display:"block",boxShadow:"0 0 28px rgba(122,178,212,0.3)",transition:"transform .2s"}}/>
            </a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:10,fontSize:12,color:"#0ea5e9",textDecoration:"none",fontWeight:600}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
          <div style={{textAlign:mobile?"center":"left",flex:1}}>
            <div style={{fontSize:mobile?22:26,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif",lineHeight:1.2}}>Pete Matsoukas</div>
            <div style={{fontSize:15,color:"#38bdf8",fontWeight:600,marginTop:4}}>IT Solutions Architect & MCT Trainer</div>
            <p style={{fontSize:15,color:"#94a3b8",lineHeight:1.7,marginTop:12}}>
              15+ years hands-on expertise in Microsoft Azure, Microsoft 365, infrastructure modernization, Zero Trust security, and cloud migrations.
            </p>
            <p style={{fontSize:15,color:"#94a3b8",lineHeight:1.7,marginTop:8}}>
              I help mid-sized organizations simplify their IT — turning complex infrastructure, security, and cloud challenges into reliable, cost-effective solutions that just work.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:"rgba(122,178,212,0.12)",margin:mobile?"0 16px":"0 28px"}}/>

        {/* About section */}
        <div style={{padding:mobile?"20px 16px":"20px 28px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>About Pete</div>
          <div style={{fontSize:15,color:"#94a3b8",lineHeight:1.75}}>
            <p style={{margin:"0 0 10px"}}>As a Microsoft Certified Trainer (MCT) and Solutions Architect, I've spent over 15 years designing and delivering IT projects for businesses that want technology to support growth — not slow it down.</p>
            <p style={{margin:"0 0 10px"}}>Whether it's refreshing outdated server rooms, implementing proper Zero Trust security, migrating to Azure, or optimizing cloud spend, my approach is practical, vendor-neutral where it makes sense, and always focused on real business outcomes.</p>
            <p style={{margin:0}}>I've helped organizations reduce complexity, strengthen security, and lower costs — all while making sure the solutions are maintainable long after the project ends.</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:"rgba(122,178,212,0.12)",margin:mobile?"0 16px":"0 28px"}}/>

        {/* Credentials */}
        <div style={{padding:mobile?"20px 16px":"20px 28px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Credentials & Quick Facts</div>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:8}}>
            {[
              {i:"🎓",t:"Microsoft Certified Trainer (MCT)"},
              {i:"☁️",t:"Azure, M365, Entra ID, Intune, Defender"},
              {i:"🔒",t:"Zero Trust & Disaster Recovery Specialist"},
              {i:"🖥️",t:"5x VMware VCP · CCNA · Fortinet FCP"},
              {i:"🏢",t:"Solutions Architect — Client Services Group"},
              {i:"🌍",t:"Based in Greece · Serving clients globally"},
            ].map((c,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(122,178,212,0.05)",border:"1px solid rgba(122,178,212,0.1)",borderRadius:10,padding:"10px 14px"}}>
                <span style={{fontSize:16,flexShrink:0}}>{c.i}</span>
                <span style={{fontSize:14,color:"#a8c8e0",fontWeight:500,lineHeight:1.4}}>{c.t}</span>
              </div>
            ))}
          </div>
          {/* Cert badges */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
            {CERTS.map((c,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.12)",borderRadius:20,padding:"4px 10px",fontSize:12,fontWeight:600,color:"#7ab2d4",whiteSpace:"nowrap"}}>
                <span>{c.i}</span><span>{c.l}</span>
              </div>
            ))}
          </div>

          {/* Verification Badges */}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <a href="https://learn.microsoft.com/en-us/users/pete-matsoukas/transcript/7xxlgcyop8k6kmp" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("verify_microsoft")}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(0,120,212,0.08)",border:"1px solid rgba(0,120,212,0.25)",borderRadius:10,padding:"10px 12px",textDecoration:"none",cursor:"pointer",transition:"all .15s"}}>
              <svg width="16" height="16" viewBox="0 0 23 23" fill="none"><rect width="11" height="11" fill="#f25022"/><rect x="12" width="11" height="11" fill="#7fba00"/><rect y="12" width="11" height="11" fill="#00a4ef"/><rect x="12" y="12" width="11" height="11" fill="#ffb900"/></svg>
              <span style={{fontSize:12,fontWeight:700,color:"#38bdf8"}}>Verify Microsoft Certs</span>
            </a>
            <a href="https://www.credly.com/users/pmatsoukas" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("verify_credly")}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(255,111,0,0.06)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:10,padding:"10px 12px",textDecoration:"none",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:16}}>🏅</span>
              <span style={{fontSize:12,fontWeight:700,color:"#ff6f00"}}>View Credly Badges</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:"rgba(122,178,212,0.12)",margin:mobile?"0 16px":"0 28px"}}/>

        {/* CTA buttons */}
        <div style={{padding:mobile?"20px 16px 24px":"24px 28px 28px",display:"flex",flexDirection:"column",gap:10}}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("calendly_click", { source: "modal" })} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:12,padding:"14px 20px",color:"#fff",fontSize:15,fontWeight:700,textDecoration:"none",cursor:"pointer",boxShadow:"0 4px 20px rgba(14,165,233,0.4)",fontFamily:"inherit",minHeight:50}}>
            📞 Book a free 30-minute call with Pete
          </a>
          <div style={{display:"flex",gap:10}}>
            <a href="https://www.techbypete.com" target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(122,178,212,0.08)",border:"2px solid rgba(122,178,212,0.3)",borderRadius:12,padding:"12px 16px",color:"#7ab2d4",fontSize:14,fontWeight:700,textDecoration:"none",cursor:"pointer",fontFamily:"inherit",minHeight:46}}>
              🌐 Visit TechByPete.com
            </a>
            <button onClick={() => setDrawerOpen(false)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(122,178,212,0.04)",border:"1px solid rgba(122,178,212,0.15)",borderRadius:12,padding:"12px 16px",color:"#4a6a82",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",minHeight:46}}>
              💬 Continue chatting
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(122,178,212,0.4)}50%{box-shadow:0 0 0 6px rgba(122,178,212,0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        html{height:100%;height:-webkit-fill-available}
        body{height:100%;height:-webkit-fill-available;overflow:hidden}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(122,178,212,0.25);border-radius:10px}
        textarea{resize:none}textarea:focus{outline:none}textarea::placeholder{color:#4a6a82}
        .sbtn:active{transform:scale(0.94)}
        .sbtn:hover:not(:disabled){opacity:0.85}
        .sbtn:disabled{opacity:.3;cursor:not-allowed}
        .card:hover{background:rgba(122,178,212,0.1)!important;border-color:rgba(122,178,212,0.35)!important}
        .card:active{transform:scale(0.98)}
        .card:hover .ct{color:#a8d4f0!important}
        .fin{animation:fadeUp 0.25s ease forwards}
        .pete-btn:hover{background:linear-gradient(135deg,rgba(122,178,212,0.18),rgba(14,165,233,0.12))!important;border-color:rgba(122,178,212,0.6)!important}
        .pete-btn:active{transform:scale(0.97)}
        .chatitem:hover{background:rgba(122,178,212,0.1)!important}
        .attach-btn:hover{background:rgba(122,178,212,0.15)!important;border-color:rgba(122,178,212,0.4)!important}
      `}</style>

      <div style={{
        display:"flex", flexDirection:"column",
        height:"calc(var(--vh, 1vh) * 100)",
        background:"#162032",
        fontFamily:"'DM Sans','Segoe UI',sans-serif",
        color:"#e2e8f0", overflow:"hidden", position:"relative"
      }}>

        {/* TOP NAV */}
        <div style={{background:"#1a2840",borderBottom:"1px solid rgba(122,178,212,0.15)",padding:mobile?"10px 12px":"10px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0,zIndex:10}}>

          <button
            className="pete-btn"
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              display:"flex", alignItems:"center", gap:12,
              background:"linear-gradient(135deg,rgba(122,178,212,0.12),rgba(14,165,233,0.08))",
              border:"2px solid rgba(122,178,212,0.45)",
              borderRadius:14, padding:mobile?"7px 14px 7px 7px":"8px 18px 8px 8px",
              cursor:"pointer", flexShrink:0, transition:"all .2s",
              minHeight:mobile?54:58,
              boxShadow:"0 0 18px rgba(122,178,212,0.15),inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
            <div style={{position:"relative",flexShrink:0}}>
              <img src="/pete.jpg" alt="Pete" style={{width:mobile?42:46,height:mobile?42:46,borderRadius:"50%",border:"2.5px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",display:"block",boxShadow:"0 0 14px rgba(122,178,212,0.4)"}}/>
              <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:"2px solid rgba(122,178,212,0.6)",animation:"pulse 2s infinite"}}/>
              <div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:"#34d399",border:"2px solid #1a2840",boxShadow:"0 0 6px rgba(52,211,153,0.8)"}}/>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:mobile?13:15,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif",whiteSpace:"nowrap",lineHeight:1.2,letterSpacing:"0.02em"}}>Pete Matsoukas</div>
              <div style={{fontSize:mobile?10.5:11,color:"#38bdf8",fontWeight:700,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                <span style={{fontSize:11}}>👤</span>
                <span style={{letterSpacing:"0.03em"}}>{mobile ? "Meet Pete" : "Tap to meet Pete"}</span>
                <span style={{fontSize:10,background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.3)",borderRadius:4,padding:"0px 5px",marginLeft:2}}>{drawerOpen?"▲":"▼"}</span>
              </div>
            </div>
          </button>

          <div style={{flex:1,minWidth:0}}>
            {!mobile && (
              <div style={{display:"flex",alignItems:"center",gap:8,borderLeft:"3px solid #0ea5e9",paddingLeft:14}}>
                <div>
                  <div style={{fontSize:14,color:"#e2e8f0",fontStyle:"italic",fontWeight:400,lineHeight:1.5,letterSpacing:"0.01em"}}>
                    Making complex IT effortless — so your business can focus on what matters.
                  </div>
                  <div style={{fontSize:12,color:"#4a6a82",marginTop:3,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>
                    IT Solutions Architect · MCT Trainer
                  </div>
                </div>
              </div>
            )}
            {mobile && (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>TechByPete</span>
                <span style={{background:"rgba(52,211,153,0.12)",color:"#34d399",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,border:"1px solid rgba(52,211,153,0.2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>● Live</span>
              </div>
            )}
          </div>

          {!mobile && (
            <span style={{background:"rgba(52,211,153,0.12)",color:"#34d399",fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:20,border:"1px solid rgba(52,211,153,0.2)",letterSpacing:"0.1em",textTransform:"uppercase",flexShrink:0}}>● Live</span>
          )}

          {/* Language selector */}
          <div style={{position:"relative",flexShrink:0}}>
            <select value={language} onChange={e => { setLanguage(e.target.value); trackEvent("language_change", { lang: e.target.value }); }}
              style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:mobile?"6px 8px":"6px 12px",color:"#7ab2d4",fontSize:13,fontFamily:"inherit",cursor:"pointer",appearance:"none",WebkitAppearance:"none",minHeight:36,minWidth:mobile?44:undefined}}>
              {LANG_OPTIONS.map(l => <option key={l.code} value={l.code} style={{background:"#0f1e35"}}>{l.flag} {mobile ? "" : l.label}</option>)}
            </select>
          </div>

          {/* ROI Calculator */}
          <button onClick={() => { setShowROI(true); trackEvent("roi_open"); }}
            style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:mobile?"0 8px":"6px 14px",color:"#34d399",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",flexShrink:0,minHeight:36,whiteSpace:"nowrap"}}>
            <span>📊</span>{!mobile && " ROI Calc"}
          </button>

          {/* Secure Score */}
          <button onClick={checkSecureScore}
            style={{background:"rgba(255,111,0,0.06)",border:"1px solid rgba(255,111,0,0.2)",borderRadius:10,padding:mobile?"0 8px":"6px 14px",color:"#ff6f00",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",flexShrink:0,minHeight:36,whiteSpace:"nowrap"}}>
            <span>🛡️</span>{!mobile && " Secure Score"}
          </button>

          {/* My Projects */}
          <button onClick={() => { setShowPortal(true); trackEvent("portal_open"); }}
            style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:mobile?"0 8px":"6px 14px",color:"#7ab2d4",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",flexShrink:0,minHeight:36,whiteSpace:"nowrap"}}>
            <span>💼</span>{!mobile && " My Projects"}
          </button>

          {/* Vendor Knowledge Update */}
          <button onClick={() => { runVendorUpdate(); trackEvent("vendor_update_open"); }}
            style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:10,padding:mobile?"0 8px":"6px 14px",color:"#a855f7",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",flexShrink:0,minHeight:36,whiteSpace:"nowrap"}}>
            <span>🔄</span>{!mobile && " Update KB"}
          </button>

          <button onClick={() => setShowContact(v => !v)} style={{background:"linear-gradient(135deg,#1a5a9a,#0ea5e9)",border:"none",borderRadius:20,padding:mobile?"0 12px":"7px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",flexShrink:0,minHeight:44,minWidth:mobile?44:undefined}}>
            <span>💬</span>{!mobile&&" Contact Pete"}
          </button>
        </div>

        {/* MAIN */}
        <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>

          {/* RIGHT PANEL */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

            {!chatStarted ? (
              <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",padding:mobile?"10px 12px":"12px 28px",WebkitOverflowScrolling:"touch"}}>
                <div style={{flex:1,display:"flex",flexDirection:"column",maxWidth:1200,margin:"0 auto",width:"100%",minHeight:"min-content"}}>

                  <div style={{background:"rgba(122,178,212,0.05)",border:"1px solid rgba(122,178,212,0.12)",borderRadius:10,padding:"10px 16px",marginBottom:10,flexShrink:0}}>
                    {activeTab === "projects" ? (
                      <p style={{color:"#cbd5e1",fontSize:mobile?14:15,lineHeight:1.65,margin:0}}>
                        👋 Hi! Get a free <strong style={{color:"#38bdf8"}}>Assessment</strong>, <strong style={{color:"#38bdf8"}}>Solution Design</strong>, or <strong style={{color:"#38bdf8"}}>Statement of Work</strong> for your IT infrastructure, cloud, or security needs — backed by <strong style={{color:"#f1f5f9"}}>15+ years</strong> of hands-on expertise.
                      </p>
                    ) : (
                      <p style={{color:"#cbd5e1",fontSize:mobile?14:15,lineHeight:1.65,margin:0}}>
                        🎓 Looking for <strong style={{color:"#38bdf8"}}>IT Training</strong> for your team? Pete is a certified <strong style={{color:"#f1f5f9"}}>Microsoft MCT</strong>, VMware VCP, Cisco CCNA and Fortinet FCP trainer. Available <strong style={{color:"#38bdf8"}}>on-site</strong>, <strong style={{color:"#38bdf8"}}>remote</strong>, or <strong style={{color:"#38bdf8"}}>blended</strong>.
                      </p>
                    )}
                  </div>

                  <div style={{display:"flex",marginBottom:10,background:"#1a2840",borderRadius:10,padding:4,border:"1px solid rgba(122,178,212,0.15)",flexShrink:0}}>
                    {[{id:"projects",label:mobile?"🏗️ IT Projects":"🏗️ IT Projects & Solutions"},{id:"training",label:mobile?"🎓 Training":"🎓 Training & Courses"}].map(t=>(
                      <button key={t.id} onClick={() => setActiveTab(t.id)} style={{flex:1,background:activeTab===t.id?"linear-gradient(135deg,#1a5a9a,#0ea5e9)":"transparent",border:"none",borderRadius:7,padding:mobile?"10px 6px":"10px 16px",color:activeTab===t.id?"#fff":"#4a6a82",fontSize:mobile?13:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",minHeight:40}}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div style={{fontSize:12,color:"#3a5a72",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif",marginBottom:8,flexShrink:0}}>
                    {activeTab==="projects" ? "Select your IT challenge" : "Select a training course"}
                  </div>

                  {activeTab === "projects" && (
                    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"1fr 1fr 1fr",gap:mobile?8:10,paddingBottom:12}}>
                      {PROJECT_CARDS.map((c,i) => (
                        <button key={i} className="card" onClick={() => send(c.q)} style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.15)",borderRadius:10,padding:mobile?"10px":"14px 16px",cursor:"pointer",textAlign:"left",transition:"all .15s",lineHeight:1.4,fontFamily:"inherit",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                          <div style={{fontSize:mobile?18:22,marginBottom:4,flexShrink:0}}>{c.icon}</div>
                          <div className="ct" style={{color:"#e2e8f0",fontWeight:600,fontSize:mobile?13:14,marginBottom:4,lineHeight:1.3}}>{c.q}</div>
                          <div style={{color:"#4a6a82",fontSize:mobile?13:14,lineHeight:1.4}}>{c.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === "training" && (
                    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10,paddingBottom:12}}>
                      {TRAINING_CARDS.map((c,i) => (
                        <button key={i} className="card" onClick={() => send(c.q)} style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.15)",borderRadius:10,padding:mobile?"14px":"20px 24px",cursor:"pointer",textAlign:"left",transition:"all .15s",lineHeight:1.4,fontFamily:"inherit",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                          <div style={{fontSize:mobile?24:30,marginBottom:8,flexShrink:0}}>{c.icon}</div>
                          <div className="ct" style={{color:"#e2e8f0",fontWeight:600,fontSize:mobile?14:16,marginBottom:5,lineHeight:1.35}}>{c.q}</div>
                          <div style={{color:"#4a6a82",fontSize:mobile?13:14,lineHeight:1.4}}>{c.desc}</div>
                          <div style={{marginTop:10,fontSize:12,color:"#38bdf8",fontWeight:600,fontStyle:"normal",background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:8,padding:"6px 10px",display:"inline-flex",alignItems:"center",gap:6}}>🎓 Delivered by certified MCT · <strong style={{color:"#f1f5f9"}}>Pete Matsoukas</strong></div>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div style={{flex:1,overflowY:"auto",padding:mobile?"12px":"20px 28px",WebkitOverflowScrolling:"touch"}}>
                <div style={{maxWidth:960,margin:"0 auto"}}>
                  <button onClick={() => setChatStarted(false)} style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:8,color:"#7ab2d4",fontSize:14,fontWeight:600,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",marginBottom:14,minHeight:40}}>← Back to topics</button>
                  {/* Mode indicator */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:activeTab==="training"?"rgba(16,124,16,0.08)":"rgba(0,120,212,0.08)",border:activeTab==="training"?"1px solid rgba(52,211,153,0.2)":"1px solid rgba(56,189,248,0.2)",borderRadius:10,marginBottom:14,fontSize:13,fontWeight:600,color:activeTab==="training"?"#34d399":"#38bdf8"}}>
                    {activeTab==="training" ? "🎓" : "🔧"} <strong>{activeTab==="training" ? "Training Mode Active" : "Projects & SOW Mode Active"}</strong>
                    <span style={{color:"#4a6a82",fontWeight:400,fontSize:12}}> — {activeTab==="training" ? "Building your personalized learning path" : "Ready to scope and draft your Statement of Work"}</span>
                  </div>
                  {msgs.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    const displayContent = msg.display || (typeof msg.content === "string" ? msg.content : "");
                    const hasDocument = !isUser && isDocumentResponse(displayContent);
                    return (
                      <div key={idx} className="fin" style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:12,gap:8,alignItems:"flex-start"}}>
                        {!isUser && <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0,marginTop:2}}/>}
                        <div style={{maxWidth:"85%"}}>
                          <div style={{background:isUser?"linear-gradient(135deg,#0d2d6e,#0a1e4a)":"#1e2e42",border:isUser?"1px solid rgba(122,178,212,0.25)":"1px solid rgba(122,178,212,0.12)",borderRadius:isUser?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"11px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                            {isUser ? <p style={{color:"#c8dff0",fontSize:15,lineHeight:1.6,margin:0,whiteSpace:"pre-wrap"}}>{displayContent}</p> : <Msg content={displayContent}/>}
                          </div>
                          {/* Copy + Share + Listen + Save buttons for assistant messages */}
                          {!isUser && displayContent.length > 20 && (
                            <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(displayContent).then(() => {
                                    const btn = document.getElementById("copy-btn-"+idx);
                                    if (btn) { btn.textContent = "✅ Copied"; setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000); }
                                  });
                                  trackEvent("copy_message");
                                }}
                                id={"copy-btn-"+idx}
                                title="Copy to clipboard"
                                style={{
                                  background:"none",border:"none",
                                  cursor:"pointer",fontSize:15,padding:"4px 8px",
                                  color:"#3a5a72",
                                  display:"flex",alignItems:"center",gap:5,
                                  borderRadius:6,transition:"all .15s",
                                }}>
                                📋 Copy
                              </button>
                              <button
                                onClick={() => {
                                  trackEvent("share_message");
                                  const shareText = displayContent.slice(0, 2000);
                                  if (navigator.share) {
                                    navigator.share({ title: "TechByPete AI — Solution", text: shareText, url: "https://ask.techbypete.com" }).catch(() => {});
                                  } else {
                                    const subject = encodeURIComponent("TechByPete AI — Solution");
                                    const body = encodeURIComponent(shareText + "\n\n---\nGenerated by Pete's AI Agent: https://ask.techbypete.com");
                                    window.open("mailto:?subject=" + subject + "&body=" + body, "_blank");
                                  }
                                }}
                                title="Share via email or Teams"
                                style={{
                                  background:"none",border:"none",
                                  cursor:"pointer",fontSize:15,padding:"4px 8px",
                                  color:"#3a5a72",
                                  display:"flex",alignItems:"center",gap:5,
                                  borderRadius:6,transition:"all .15s",
                                }}>
                                🔗 Share
                              </button>
                              <button
                                onClick={() => speakMessage(displayContent, idx)}
                                title={speakingIdx === idx ? "Stop reading" : "Read aloud"}
                                style={{
                                  background:"none",border:"none",
                                  cursor:"pointer",fontSize:15,padding:"4px 8px",
                                  color:speakingIdx===idx?"#ef4444":"#3a5a72",
                                  display:"flex",alignItems:"center",gap:5,
                                  borderRadius:6,transition:"all .15s",
                                }}>
                                {speakingIdx === idx ? "⏹️ Stop" : "🔊 Listen"}
                              </button>
                              {displayContent.length > 100 && (
                                <button
                                  onClick={() => generateKnowledgeSummary(displayContent)}
                                  title="Save this response to Pete's knowledge base"
                                  style={{
                                    background:"none",border:"none",
                                    cursor:"pointer",fontSize:15,padding:"4px 8px",
                                    color:"#a855f7",
                                    display:"flex",alignItems:"center",gap:5,
                                    borderRadius:6,transition:"all .15s",
                                  }}>
                                  💡 Save to Knowledge
                                </button>
                              )}
                            </div>
                          )}
                          {hasDocument && (
                            <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                              <button
                                onClick={() => { trackEvent("pdf_download"); openDocumentPrint(displayContent); }}
                                className="sbtn"
                                style={{
                                  flex:1,display:"flex",alignItems:"center",gap:8,
                                  background:"linear-gradient(135deg,#0078d4,#0ea5e9)",
                                  border:"none",borderRadius:10,padding:"10px 14px",
                                  color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",
                                  fontFamily:"inherit",boxShadow:"0 4px 16px rgba(14,165,233,0.3)",
                                  justifyContent:"center",minHeight:44,minWidth:0,
                                }}>
                                📄 PDF
                              </button>
                              <button
                                onClick={() => {
                                  trackEvent("markdown_export");
                                  const blob = new Blob([displayContent], { type: "text/markdown" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url; a.download = "TechByPete-Document.md"; a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="sbtn"
                                style={{
                                  flex:1,display:"flex",alignItems:"center",gap:8,
                                  background:"rgba(122,178,212,0.08)",
                                  border:"1px solid rgba(122,178,212,0.25)",borderRadius:10,padding:"10px 14px",
                                  color:"#7ab2d4",fontSize:13,fontWeight:700,cursor:"pointer",
                                  fontFamily:"inherit",justifyContent:"center",minHeight:44,minWidth:0,
                                }}>
                                📝 Markdown
                              </button>
                              <button
                                onClick={() => { setLeadDocContent(displayContent); setShowLeadCapture(true); }}
                                className="sbtn"
                                style={{
                                  flex:1,display:"flex",alignItems:"center",gap:8,
                                  background:"rgba(52,211,153,0.1)",
                                  border:"2px solid rgba(52,211,153,0.3)",borderRadius:10,padding:"10px 14px",
                                  color:"#34d399",fontSize:13,fontWeight:700,cursor:"pointer",
                                  fontFamily:"inherit",justifyContent:"center",minHeight:44,minWidth:0,
                                }}>
                                ✉️ Email
                              </button>
                            </div>
                          )}
                        </div>
                        {isUser && <div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:"rgba(122,178,212,0.12)",border:"1px solid rgba(122,178,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#7ab2d4",marginTop:2}}>U</div>}
                      </div>
                    );
                  })}
                  {/* Streaming message — text appearing word by word */}
                  {loading && streamingText && (
                    <div className="fin" style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:12}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0,marginTop:2}}/>
                      <div style={{maxWidth:"85%",background:"#1e2e42",border:"1px solid rgba(122,178,212,0.12)",borderRadius:"14px 14px 14px 4px",padding:"11px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                        <Msg content={streamingText}/>
                        <span style={{display:"inline-block",width:2,height:16,background:"#7ab2d4",animation:"bounce 1s infinite",verticalAlign:"text-bottom",marginLeft:2}}/>
                      </div>
                    </div>
                  )}
                  {/* Loading — before stream starts */}
                  {loading && !streamingText && !specialistsWorking.length && (
                    <div className="fin" style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:12}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0}}/>
                      <div style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.12)",borderRadius:"14px 14px 14px 4px",padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                        <Dots/>
                        <span style={{fontSize:13,color:"#4a6a82",fontWeight:500,whiteSpace:"nowrap"}}>Pete's AI Agent is thinking…</span>
                      </div>
                    </div>
                  )}
                  {/* Multi-Agent Orchestrator — specialists working */}
                  {loading && specialistsWorking.length > 0 && !streamingText && (
                    <div className="fin" style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:12}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0,marginTop:2}}/>
                      <div style={{background:"#1e2e42",border:"1px solid rgba(168,85,247,0.25)",borderRadius:"14px 14px 14px 4px",padding:"14px 16px",minWidth:280}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <span style={{fontSize:16}}>🧠</span>
                          <span style={{fontSize:13,fontWeight:700,color:"#a855f7",letterSpacing:"0.04em",textTransform:"uppercase"}}>Multi-Specialist Analysis</span>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {specialistsWorking.map(s => (
                            <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",background:s.status==="working"?"rgba(168,85,247,0.1)":s.status==="complete"?"rgba(52,211,153,0.08)":s.status==="error"?"rgba(239,68,68,0.08)":"rgba(122,178,212,0.04)",border:"1px solid "+(s.status==="working"?"rgba(168,85,247,0.3)":s.status==="complete"?"rgba(52,211,153,0.25)":s.status==="error"?"rgba(239,68,68,0.25)":"rgba(122,178,212,0.12)"),borderRadius:8,transition:"all .3s"}}>
                              <span style={{fontSize:16}}>{s.icon}</span>
                              <span style={{flex:1,fontSize:13,fontWeight:500,color:s.status==="complete"?"#34d399":s.status==="error"?"#ef4444":"#e2e8f0"}}>{s.name}</span>
                              {s.status === "pending" && <span style={{fontSize:11,color:"#4a6a82"}}>waiting...</span>}
                              {s.status === "working" && <Dots/>}
                              {s.status === "complete" && <span style={{fontSize:14,color:"#34d399"}}>✓</span>}
                              {s.status === "error" && <span style={{fontSize:14,color:"#ef4444"}}>✗</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Suggested reply buttons — shown after last assistant message when not loading */}
                  {!loading && msgs.length > 0 && msgs[msgs.length - 1]?.role === "assistant" && (() => {
                    const lastMsg = msgs[msgs.length - 1].display || msgs[msgs.length - 1].content || "";
                    const isDoc = isDocumentResponse(lastMsg);
                    const suggestions = isDoc
                      ? ["Refine for cost optimization", "Refine for security emphasis", "Book a call with Pete"]
                      : activeTab === "training"
                        ? ["Adjust the pace", "Add more hands-on labs", "Generate full training plan"]
                        : msgs.length >= 6
                          ? ["Generate SOW", "Generate my assessment", "Book a call with Pete"]
                          : ["Tell me more", "What are the risks?", "What would you recommend?"];
                    return (
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,marginLeft:36}}>
                        {suggestions.map((s, i) => (
                          <button key={i} onClick={() => send(s)} className="sbtn"
                            style={{background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:20,padding:"7px 14px",color:"#7ab2d4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap"}}>
                            {s}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                  <div ref={bottomRef}/>
                </div>
              </div>
            )}

            {/* INPUT BAR */}
            <div style={{borderTop:"2px solid rgba(122,178,212,0.3)",background:"linear-gradient(180deg,#1a2840 0%,#0f1e35 100%)",padding:mobile?"10px 12px":"12px 28px 18px",paddingBottom:`max(${mobile?"10px":"18px"}, env(safe-area-inset-bottom, 0px))`,flexShrink:0}}>
              <div style={{maxWidth:1200,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8,overflowX:"auto",WebkitOverflowScrolling:"touch",msOverflowStyle:"none",scrollbarWidth:"none"}}>
                  <button onClick={newChat} style={{background:"linear-gradient(135deg,#1a5a9a,#0ea5e9)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"0 12px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,boxShadow:"0 0 10px rgba(14,165,233,0.3)",flexShrink:0,whiteSpace:"nowrap",minHeight:36,minWidth:64}}>
                    <span>✏️</span> New
                  </button>
                  {sessions.some(s => s.messages.length > 0) && (
                    <button onClick={clearAllChats} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,color:"#ef4444",fontSize:12,fontWeight:600,padding:"0 10px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4,flexShrink:0,whiteSpace:"nowrap",minHeight:36}}>
                      🗑️ Clear all
                    </button>
                  )}
                  {sessions.map(s => (
                    <div key={s.id} className="chatitem" onClick={() => { setActiveId(s.id); setChatStarted(s.messages.length > 0); }} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:8,cursor:"pointer",background:s.id===activeId?"rgba(122,178,212,0.15)":"rgba(122,178,212,0.06)",border:s.id===activeId?"1px solid rgba(122,178,212,0.35)":"1px solid rgba(122,178,212,0.12)",transition:"all .15s",whiteSpace:"nowrap",flexShrink:0,minHeight:36}}>
                      <span style={{fontSize:12}}>💬</span>
                      <span style={{fontSize:13,color:s.id===activeId?"#7ab2d4":"#3a5a72",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>{s.title}</span>
                      <button onClick={e => { e.stopPropagation(); deleteChat(s.id); }} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",cursor:"pointer",fontSize:14,padding:"0",lineHeight:1,minWidth:22,minHeight:22,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px rgba(56,189,248,0.8)",animation:"bounce 2s infinite",flexShrink:0}}/>
                  <div style={{fontSize:13,color:"#38bdf8",fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif"}}>
                    {!chatStarted && activeTab === "training" ? "Ask about a training course" : "Describe your IT challenge"}
                  </div>
                </div>

                {/* Quick action buttons */}
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  {activeTab === "projects" ? (
                    <button
                      onClick={() => { trackEvent("action_sow"); send("I'd like to scope a project and generate a Statement of Work. Let's start the discovery."); }}
                      disabled={loading}
                      style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",minHeight:40,opacity:loading?0.5:1,boxShadow:"0 2px 12px rgba(14,165,233,0.3)"}}>
                      📋 Generate SOW Outline
                    </button>
                  ) : (
                    <button
                      onClick={() => { trackEvent("action_training"); send("I'd like to build a personalized training and certification plan. Let's start with my current role and goals."); }}
                      disabled={loading}
                      style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"linear-gradient(135deg,#107c10,#34d399)",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",minHeight:40,opacity:loading?0.5:1,boxShadow:"0 2px 12px rgba(52,211,153,0.3)"}}>
                      🎯 Build My Training Plan
                    </button>
                  )}
                  <button
                    onClick={() => { trackEvent("weekly_take"); send("Generate Pete's Weekly Take — search for the latest trending Microsoft, Azure, and M365 news from the past 7 days and write a blog post for www.techbypete.com in Pete's voice."); }}
                    disabled={loading}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(168,85,247,0.08)",border:"1px solid rgba(168,85,247,0.25)",borderRadius:10,padding:"10px 12px",color:"#a855f7",fontSize:12,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",minHeight:40,whiteSpace:"nowrap",flexShrink:0,opacity:loading?0.5:1}}>
                    ✍️ Weekly Take
                  </button>
                  <a
                    href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent("calendly_click", { source: "input_bar" })}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.25)",borderRadius:10,padding:"10px 14px",color:"#7ab2d4",fontSize:13,fontWeight:600,textDecoration:"none",cursor:"pointer",fontFamily:"inherit",minHeight:40,whiteSpace:"nowrap",flexShrink:0}}>
                    📞 Book a call
                  </a>
                </div>

                {/* File attachment chip */}
                {attachedFile && (
                  <div style={{marginBottom:8}}>
                    <FileChip file={attachedFile} onRemove={() => setAttachedFile(null)}/>
                  </div>
                )}

                <div style={{display:"flex",gap:10,alignItems:"flex-end",background:"#0a1525",border:"2px solid #38bdf8",borderRadius:mobile?14:16,padding:mobile?"10px 12px":"14px 18px",boxShadow:"0 0 24px rgba(56,189,248,0.15)"}}>
                  {/* File upload button */}
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.csv" onChange={handleFileSelect} style={{display:"none"}}/>
                  <button
                    className="attach-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={loading}
                    title="Attach PDF or image"
                    style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,width:mobile?40:38,height:mobile?40:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:"#7ab2d4",transition:"all .15s",fontSize:18}}>
                    📎
                  </button>
                  {/* Voice input button */}
                  <button
                    onClick={toggleListening}
                    disabled={loading}
                    title={listening ? "Stop listening" : "Voice input"}
                    style={{
                      background:listening?"rgba(239,68,68,0.15)":"rgba(122,178,212,0.08)",
                      border:listening?"2px solid rgba(239,68,68,0.5)":"1px solid rgba(122,178,212,0.2)",
                      borderRadius:10,width:mobile?40:38,height:mobile?40:38,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer",flexShrink:0,transition:"all .15s",fontSize:16,
                      animation:listening?"mic-pulse 1.5s infinite":"none",
                    }}>
                    {listening ? "⏹️" : "🎙️"}
                  </button>
                  <textarea ref={taRef} value={input} onChange={onTa} onKeyDown={onKey}
                    placeholder={!chatStarted && activeTab==="training" ? "e.g. We need AZ-104 training for 10 engineers…" : "e.g. We need to migrate our servers to Azure…"}
                    rows={mobile?1:2}
                    style={{flex:1,background:"transparent",border:"none",color:"#e2e8f0",fontSize:mobile?16:14.5,lineHeight:1.7,fontFamily:"inherit",minHeight:mobile?40:48,maxHeight:120}}/>
                  {loading ? (
                    <button className="sbtn" onClick={stopGeneration}
                      style={{background:"linear-gradient(135deg,#dc2626,#ef4444)",border:"none",borderRadius:12,width:mobile?48:46,height:mobile?48:46,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:"#fff",transition:"all .15s",boxShadow:"0 0 20px rgba(239,68,68,0.4)"}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                    </button>
                  ) : (
                    <button className="sbtn" onClick={() => send()} disabled={!input.trim()}
                      style={{background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:12,width:mobile?48:46,height:mobile?48:46,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:"#fff",transition:"all .15s",boxShadow:"0 0 20px rgba(14,165,233,0.5)"}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  )}
                </div>
                {!mobile && (
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,padding:"0 2px"}}>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em"}}>ASK.TECHBYPETE.COM · AI AGENT · PRESS ENTER TO SEND</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:4}}>
                      <span>🔒</span> Conversations are encrypted, never used to train AI, and deleted after 30 days unless saved
                    </div>
                  </div>
                )}
                {mobile && (
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",textAlign:"center",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <span>🔒</span> Encrypted · Private · Auto-deleted after 30 days
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showContact && <ContactCard onClose={() => setShowContact(false)}/>}
        {PeteModal}
        {showLeadCapture && (
          <LeadCaptureModal
            onClose={() => setShowLeadCapture(false)}
            onSubmit={(lead) => {
              /* Unlock the message gate */
              setLeadCaptured(true);
              try { localStorage.setItem("techbypete_lead_email", lead.email); } catch {}
              if (leadDocContent) {
                setTimeout(() => openDocumentPrint(leadDocContent), 500);
              }
            }}
          />
        )}

        {/* ROI Calculator Modal */}
        {showROI && <ROICalculator onClose={() => setShowROI(false)} mobile={mobile}/>}

        {/* Secure Score Modal */}
        {showSecureScore && (
          <>
            <div onClick={() => setShowSecureScore(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(520px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",border:"2px solid rgba(255,111,0,0.3)",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"24px",animation:"fadeUp 0.25s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>🛡️ Microsoft Secure Score</span>
                <button onClick={() => setShowSecureScore(false)} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
              </div>

              {secureScoreLoading && (
                <div style={{textAlign:"center",padding:"40px 0"}}>
                  <Dots/>
                  <p style={{color:"#7ab2d4",fontSize:14,marginTop:12}}>Authenticating with Microsoft...</p>
                </div>
              )}

              {secureScoreData?.error && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <p style={{color:"#ef4444",fontSize:14,marginBottom:12}}>⚠️ {secureScoreData.error}</p>
                  <p style={{color:"#4a6a82",fontSize:13,lineHeight:1.6}}>
                    <strong style={{color:"#7ab2d4"}}>Requirements:</strong><br/>
                    • You need <strong style={{color:"#e2e8f0"}}>Security Reader</strong> or <strong style={{color:"#e2e8f0"}}>Global Admin</strong> role in your M365 tenant<br/>
                    • Your tenant admin must grant consent the first time (one-time approval)<br/>
                    • Contact Pete if you need help setting this up
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:12,background:"linear-gradient(135deg,#0078d4,#0ea5e9)",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none"}}>📞 Get Help from Pete</a>
                </div>
              )}

              {secureScoreData && !secureScoreData.error && (
                <>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:52,fontWeight:700,color:secureScoreData.percentage>=80?"#34d399":secureScoreData.percentage>=60?"#fbbf24":"#ef4444",lineHeight:1}}>{secureScoreData.percentage}%</div>
                    <div style={{fontSize:14,color:"#94a3b8",marginTop:4}}>{secureScoreData.currentScore} / {secureScoreData.maxScore} points</div>
                    <div style={{fontSize:12,color:"#4a6a82",marginTop:2}}>{secureScoreData.tenant}</div>
                  </div>

                  {secureScoreData.controls.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Top Improvement Areas</div>
                      {secureScoreData.controls.map((c,i) => (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(122,178,212,0.08)"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,color:"#e2e8f0",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                            <div style={{fontSize:11,color:"#4a6a82"}}>{c.category}</div>
                          </div>
                          <div style={{fontSize:12,fontWeight:700,color:"#ff6f00",flexShrink:0}}>{c.score}/{c.max}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{display:"flex",gap:8}}>
                    <button onClick={sendSecureScoreToChat} style={{flex:1,background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      📋 Get Action Plan from Pete's AI
                    </button>
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px",color:"#7ab2d4",fontSize:13,fontWeight:600,textDecoration:"none",cursor:"pointer",fontFamily:"inherit"}}>
                      📞 Discuss with Pete
                    </a>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Client Portal Modal */}
        {showPortal && (
          <ClientPortal
            onClose={() => setShowPortal(false)}
            sessions={sessions}
            mobile={mobile}
            onLoadProject={(project) => {
              const id = uid();
              setSessions(p => [{ id, title: project.title, messages: project.messages }, ...p]);
              setActiveId(id);
              setChatStarted(project.messages.length > 0);
              trackEvent("portal_load");
            }}
          />
        )}

        {/* Level 2: Knowledge Review Modal */}
        {showKnowledgeReview && (
          <>
            <div onClick={() => setShowKnowledgeReview(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(600px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",border:"2px solid rgba(168,85,247,0.3)",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"24px",animation:"fadeUp 0.25s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>💡 Review & Approve Knowledge</span>
                <button onClick={() => setShowKnowledgeReview(false)} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
              </div>
              <p style={{color:"#64748b",fontSize:13,marginBottom:12,lineHeight:1.5}}>Review the AI-generated summary below. Edit if needed, then approve to add it to your agent's knowledge base.</p>

              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,color:"#7ab2d4",fontWeight:600,marginBottom:4,display:"block"}}>Title</label>
                <input value={pendingKnowledge.title} onChange={e => setPendingKnowledge(p => ({...p, title: e.target.value}))}
                  style={{width:"100%",background:"#0a1525",border:"2px solid rgba(168,85,247,0.2)",borderRadius:10,padding:"10px 14px",color:"#e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:"#7ab2d4",fontWeight:600,marginBottom:4,display:"block"}}>Content</label>
                <textarea value={pendingKnowledge.content} onChange={e => setPendingKnowledge(p => ({...p, content: e.target.value}))} rows={10}
                  style={{width:"100%",background:"#0a1525",border:"2px solid rgba(168,85,247,0.2)",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.6}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={approveKnowledge} disabled={pendingKnowledge.title === "Generating summary..."}
                  style={{flex:1,background:pendingKnowledge.title === "Generating summary..."?"rgba(168,85,247,0.1)":"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",borderRadius:10,padding:"12px",color:pendingKnowledge.title === "Generating summary..."?"#4a6a82":"#fff",fontSize:14,fontWeight:700,cursor:pendingKnowledge.title === "Generating summary..."?"not-allowed":"pointer",fontFamily:"inherit"}}>
                  ✅ Approve & Save to Knowledge Base
                </button>
                <button onClick={() => setShowKnowledgeReview(false)} style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px 20px",color:"#7ab2d4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  Cancel
                </button>
              </div>

              {/* Existing knowledge entries */}
              {learnedKnowledge.length > 0 && (
                <div style={{marginTop:20,borderTop:"1px solid rgba(122,178,212,0.12)",paddingTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Saved Knowledge ({learnedKnowledge.length} entries)</div>
                  {learnedKnowledge.map(e => (
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(122,178,212,0.06)"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                        <div style={{fontSize:11,color:"#3a5a72"}}>{new Date(e.date).toLocaleDateString()} · {e.source}</div>
                      </div>
                      <button onClick={() => exportKnowledgeAsMD(e)} title="Download as .md file" style={{background:"none",border:"none",color:"#7ab2d4",cursor:"pointer",fontSize:14,padding:"4px"}}>📥</button>
                      <button onClick={() => deleteKnowledgeEntry(e.id)} title="Delete" style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:14,padding:"4px"}}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Level 3: Vendor Knowledge Update Modal */}
        {showVendorUpdate && (
          <>
            <div onClick={() => setShowVendorUpdate(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:900,backdropFilter:"blur(4px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(640px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0f1e35 0%,#0a1525 100%)",border:"2px solid rgba(168,85,247,0.3)",borderRadius:20,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",padding:"24px",animation:"fadeUp 0.25s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>🔄 Vendor Knowledge Update</span>
                <button onClick={() => setShowVendorUpdate(false)} style={{background:"rgba(122,178,212,0.1)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:"50%",color:"#7ab2d4",cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>×</button>
              </div>

              {vendorUpdateStatus === "loading" && (
                <div style={{textAlign:"center",padding:"30px 0"}}>
                  <Dots/>
                  <p style={{color:"#a855f7",fontSize:14,marginTop:12}}>Searching for the latest Microsoft, Azure & M365 updates...</p>
                  <p style={{color:"#4a6a82",fontSize:12,marginTop:4}}>This may take 15-30 seconds (web search in progress)</p>
                </div>
              )}

              {vendorUpdateStatus === "loading" && vendorUpdateContent && (
                <div style={{background:"#0a1525",border:"1px solid rgba(168,85,247,0.15)",borderRadius:12,padding:"16px",marginTop:12,maxHeight:300,overflowY:"auto"}}>
                  <Msg content={vendorUpdateContent}/>
                </div>
              )}

              {vendorUpdateStatus === "ready" && (
                <>
                  <p style={{color:"#64748b",fontSize:13,marginBottom:12}}>Review the latest vendor updates below. Approve to add them to your agent's knowledge base.</p>
                  <div style={{background:"#0a1525",border:"1px solid rgba(168,85,247,0.15)",borderRadius:12,padding:"16px",marginBottom:16,maxHeight:400,overflowY:"auto"}}>
                    <Msg content={vendorUpdateContent}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={approveVendorUpdate} style={{flex:1,background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      ✅ Approve & Save to Knowledge Base
                    </button>
                    <button onClick={() => setShowVendorUpdate(false)} style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"12px 20px",color:"#7ab2d4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      Discard
                    </button>
                  </div>
                </>
              )}

              {vendorUpdateStatus === "saved" && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:40,marginBottom:12}}>✅</div>
                  <p style={{color:"#34d399",fontSize:16,fontWeight:700}}>Vendor updates saved to knowledge base!</p>
                  <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Your agent will now reference these updates in conversations.</p>
                  <button onClick={() => setShowVendorUpdate(false)} style={{marginTop:16,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"10px 24px",color:"#7ab2d4",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* PWA Install — floating card, bottom-right */}
        {showInstallBanner && deferredInstall && (
          <div style={{
            position:"fixed",bottom:mobile?145:125,right:16,zIndex:950,
            background:"linear-gradient(135deg,#0078d4,#0ea5e9)",
            padding:"16px 18px",display:"flex",alignItems:"center",gap:12,
            borderRadius:16,boxShadow:"0 6px 28px rgba(0,0,0,0.5)",
            animation:"fadeUp 0.3s ease",maxWidth:320,
          }}>
            <img src="/techbypete-logo.png" alt="TechByPete" style={{width:40,height:40,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.5)",objectFit:"cover",flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontSize:14,fontWeight:700,lineHeight:1.3}}>Install TechByPete AI</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:3}}>Quick access from your home screen</div>
            </div>
            <button onClick={async () => {
              trackEvent("pwa_install");
              deferredInstall.prompt();
              const result = await deferredInstall.userChoice;
              if (result.outcome === "accepted") setShowInstallBanner(false);
              setDeferredInstall(null);
            }} style={{background:"#fff",color:"#0078d4",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
              Install
            </button>
            <button onClick={() => {
              setShowInstallBanner(false);
              localStorage.setItem("techbypete_install_dismissed", "1");
            }} style={{position:"absolute",top:-8,right:-8,background:"#1e2e42",border:"2px solid #0ea5e9",color:"#7ab2d4",cursor:"pointer",fontSize:12,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
              ×
            </button>
          </div>
        )}
      </div>
    </>
  );
}
