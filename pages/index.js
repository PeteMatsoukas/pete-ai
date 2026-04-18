// TechByPete AI Agent v3.0 — 2026 Linear-Style Redesign
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

/* Template categories for sidebar accordion */
const TEMPLATE_CATEGORIES = [
  {
    id: "azure",
    label: "Azure & Cloud",
    icon: "☁️",
    items: [
      { icon:"☁️", q:"We want to migrate our infrastructure to Azure", desc:"Lift-and-shift or full Azure migration" },
      { icon:"🔄", q:"We need DR protection — on-premises to Azure", desc:"ASR replication & automated failover" },
      { icon:"🌍", q:"We need cross-region disaster recovery in Azure", desc:"ASR cross-region, Traffic Manager, WAF" },
      { icon:"💰", q:"We're overspending on Azure — help us reduce costs", desc:"FinOps, right-sizing, savings plans" },
    ],
  },
  {
    id: "security",
    label: "Security & Identity",
    icon: "🔒",
    items: [
      { icon:"🔒", q:"We need Zero Trust security across M365 & Azure", desc:"Conditional Access, Defender, Sentinel" },
      { icon:"🛡️", q:"Harden our Entra ID & M365 against cyber threats", desc:"CIS Benchmark, Conditional Access" },
      { icon:"🪪", q:"We need to onboard Entra ID and deploy Intune", desc:"Identity modernisation, MDM, MAM" },
      { icon:"📧", q:"We need to migrate email and collaboration to M365", desc:"Exchange, Teams, SharePoint, Intune" },
    ],
  },
  {
    id: "network",
    label: "Network & Connectivity",
    icon: "🔗",
    items: [
      { icon:"🔗", q:"We need a secure, resilient network with SD-WAN", desc:"FortiGate, Cisco, Ubiquiti — HA firewall" },
      { icon:"📡", q:"Our WiFi is unreliable — design a new wireless network", desc:"Site survey, AP placement, RADIUS, WPA3" },
    ],
  },
  {
    id: "onprem",
    label: "On-Prem & Virtualization",
    icon: "🖥️",
    items: [
      { icon:"🖥️", q:"My server room is outdated — assess and refresh it", desc:"Hardware, networking & modernisation" },
      { icon:"⚙️", q:"Our Hyper-V or VMware cluster needs upgrading", desc:"HPE, Dell hardware refresh & virtualisation" },
    ],
  },
];

const TRAINING_TEMPLATES = [
  { icon:"🎓", q:"We need Microsoft Server & Azure training for our team", desc:"AZ-800, AZ-801, AZ-104 · MCT-delivered" },
  { icon:"📚", q:"We need M365 & Intune training for our IT team", desc:"MS-102, MD-102 — M365 & endpoint" },
  { icon:"🔗", q:"We need CCNA networking training for our engineers", desc:"CCNA R&S & Security — routing, switching" },
  { icon:"🔵", q:"We need VMware vSphere training for our team", desc:"VMware VCP — vSphere, vSAN, HA/DRS" },
];

/* Quick-start prompts shown on landing page (4 most popular) */
const QUICK_PROMPTS = [
  { icon:"☁️", title:"Migrate our infrastructure to Azure", sub:"Lift-and-shift or full migration" },
  { icon:"🔒", title:"Deploy Zero Trust across M365", sub:"Conditional Access & Defender" },
  { icon:"🛡️", title:"Replace VPN with SD-WAN", sub:"FortiGate, HA & ZTNA" },
  { icon:"💾", title:"Design backup & DR strategy", sub:"3-2-1-1-0 with Veeam" },
];

const TRAINING_QUICK_PROMPTS = [
  { icon:"🎓", title:"Microsoft Azure certification path", sub:"AZ-104, AZ-800/801" },
  { icon:"📚", title:"M365 & Intune training program", sub:"MS-102, MD-102" },
  { icon:"🔗", title:"Cisco CCNA networking training", sub:"R&S and Security" },
  { icon:"🔵", title:"VMware vSphere training", sub:"VCP-level deep dive" },
];

/* CSV Parser */
function parseCSVToSummary(csvText, filename) {
  const lines = csvText.split("\n").filter(l => l.trim());
  if (lines.length < 2) return "Uploaded CSV appears empty.";

  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const rows = lines.slice(1, Math.min(lines.length, 1000));

  const azureCostCols = ["cost", "costusd", "extendedcost", "pretaxcost", "billedcost"];
  const serviceCols = ["service", "servicename", "meterCategory", "consumedservice", "resourcetype"];
  const costIdx = header.findIndex(h => azureCostCols.some(c => h.includes(c)));
  const serviceIdx = header.findIndex(h => serviceCols.some(s => h.toLowerCase().includes(s.toLowerCase())));

  if (costIdx !== -1 && serviceIdx !== -1) {
    const byService = {};
    let totalCost = 0;
    for (const row of rows) {
      const cells = row.split(",").map(c => c.trim().replace(/"/g, ""));
      const service = cells[serviceIdx] || "Unknown";
      const cost = parseFloat(cells[costIdx]) || 0;
      byService[service] = (byService[service] || 0) + cost;
      totalCost += cost;
    }
    const top = Object.entries(byService).sort((a,b) => b[1]-a[1]).slice(0, 10);
    let summary = `**Azure Cost Report — ${filename}**\n\n`;
    summary += `- **Total:** $${totalCost.toFixed(2)}\n`;
    summary += `- **Rows:** ${rows.length}\n\n`;
    summary += `**Top 10 Services:**\n`;
    for (const [svc, cost] of top) {
      const pct = ((cost/totalCost)*100).toFixed(1);
      summary += `- ${svc}: $${cost.toFixed(2)} (${pct}%)\n`;
    }
    return summary;
  }

  const licCols = ["accountskuid", "displayname", "usertype", "assignedto", "userprincipalname"];
  const hasLicenseCols = licCols.filter(l => header.some(h => h.includes(l))).length >= 2;
  if (hasLicenseCols) {
    return `**M365 Licensing Report — ${filename}**\n\n- **Records:** ${rows.length}\n- Preview: ${header.slice(0, 5).join(", ")}...\n\nPlease analyze the licensing distribution and recommend optimization opportunities.`;
  }

  return `**CSV Data — ${filename}**\n\n- Columns: ${header.length}\n- Rows: ${rows.length}\n- Headers: ${header.slice(0, 8).join(", ")}${header.length > 8 ? "..." : ""}\n\nPlease analyze this data.`;
}

/* Analytics */
function trackEvent(name, data = {}) {
  try {
    if (typeof window === "undefined") return;
    if (window.gtag) window.gtag("event", name, data);
    if (window.plausible) window.plausible(name, { props: data });
  } catch {}
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

const STORAGE_KEY = "techbypete_sessions";
const KNOWLEDGE_KEY = "techbypete_learned_knowledge";

function loadLearnedKnowledge() {
  try { return JSON.parse(localStorage.getItem(KNOWLEDGE_KEY) || "[]"); } catch { return []; }
}
function saveLearnedKnowledge(entries) {
  try { localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(entries.slice(-50))); } catch {}
}
function loadSessions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(-50) : [];
  } catch { return []; }
}
function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-50))); } catch {}
}

/* Inline markdown rendering (bold, code) */
function renderInline(text) {
  const parts = [], re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[0].startsWith("**")) parts.push(<strong key={k++} style={{color:"#ffffff",fontWeight:600}}>{m[0].slice(2,-2)}</strong>);
    else parts.push(<code key={k++} style={{background:"rgba(255,255,255,0.06)",color:"#a5b4fc",padding:"1px 6px",borderRadius:4,fontSize:12.5,fontFamily:"'JetBrains Mono',monospace"}}>{m[0].slice(1,-1)}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}
/* ============================================================
   MESSAGE RENDERER — Parses markdown into styled React elements
   ============================================================ */
function Msg({ content }) {
  const lines = content.split("\n"), els = []; let i = 0, k = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const lang = l.slice(3).trim().toLowerCase();
      const code = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      if (lang === "mermaid") {
        els.push(<MermaidDiagram key={k++} code={code.join("\n")} id={"d"+k}/>);
      } else {
        els.push(<pre key={k++} style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"12px 14px",overflowX:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#a5b4fc",margin:"12px 0",lineHeight:1.6}}><code>{code.join("\n")}</code></pre>);
      }
      i++; continue;
    }
    if (l.includes("|") && lines[i+1]?.match(/^\|?[\s\-|]+\|?$/)) {
      const hdrs = l.split("|").map(h=>h.trim()).filter(Boolean); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) { rows.push(lines[i].split("|").map(c=>c.trim()).filter(Boolean)); i++; }
      els.push(<div key={k++} style={{overflowX:"auto",margin:"14px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}><thead><tr>{hdrs.map((h,hi)=><th key={hi} style={{background:"rgba(94,106,210,0.08)",color:"#c7d2fe",padding:"8px 12px",textAlign:"left",borderBottom:"1px solid rgba(94,106,210,0.2)",fontWeight:600,fontSize:12}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,ri)=><tr key={ri} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.map((c,ci)=><td key={ci} style={{padding:"8px 12px",color:"#d1d5db",fontSize:13.5}}>{renderInline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (l.startsWith("### ")) { els.push(<h4 key={k++} style={{color:"#ffffff",fontSize:15,fontWeight:600,margin:"16px 0 6px",letterSpacing:"-0.01em"}}>{l.slice(4)}</h4>); i++; continue; }
    if (l.startsWith("## ")) { els.push(<h3 key={k++} style={{color:"#ffffff",fontSize:17,fontWeight:600,margin:"18px 0 8px",letterSpacing:"-0.02em"}}>{l.slice(3)}</h3>); i++; continue; }
    if (l.startsWith("# "))  { els.push(<h2 key={k++} style={{color:"#ffffff",fontSize:20,fontWeight:600,margin:"20px 0 10px",letterSpacing:"-0.02em"}}>{l.slice(2)}</h2>); i++; continue; }
    if (l.startsWith("---")) { els.push(<hr key={k++} style={{border:"none",borderTop:"1px solid rgba(255,255,255,0.08)",margin:"16px 0"}}/>); i++; continue; }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      const it = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { it.push(lines[i].slice(2)); i++; }
      els.push(<ul key={k++} style={{margin:"8px 0",paddingLeft:20}}>{it.map((x,xi)=><li key={xi} style={{color:"#d1d5db",fontSize:14,marginBottom:4,lineHeight:1.65}}>{renderInline(x)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const it = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { it.push(lines[i].replace(/^\d+\. /,"")); i++; }
      els.push(<ol key={k++} style={{margin:"8px 0",paddingLeft:20}}>{it.map((x,xi)=><li key={xi} style={{color:"#d1d5db",fontSize:14,marginBottom:4,lineHeight:1.65}}>{renderInline(x)}</li>)}</ol>);
      continue;
    }
    if (l.trim() === "") { els.push(<div key={k++} style={{height:8}}/>); i++; continue; }
    els.push(<p key={k++} style={{color:"#d1d5db",fontSize:14,lineHeight:1.7,margin:"4px 0"}}>{renderInline(l)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

/* ============================================================
   MERMAID DIAGRAM — Renders architecture diagrams inline
   ============================================================ */
function MermaidDiagram({ code, id }) {
  const ref = useRef(null);
  const [error, setError] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [svgContent, setSvgContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panState = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  useEffect(() => {
    let cancelled = false;
    if (!code || code.trim().length < 20) return;
    const render = async () => {
      if (!window.mermaid) {
        setTimeout(() => { if (!cancelled) render(); }, 500);
        return;
      }
      try {
        const diagramId = "mermaid-" + id + "-" + Math.random().toString(36).slice(2, 9);
        const { svg } = await window.mermaid.render(diagramId, code.trim());
        if (!cancelled) {
          const enhanced = svg.replace(/<svg /, '<svg style="max-width:100%;height:auto;min-width:600px;" ');
          setSvgContent(enhanced);
          setRendered(true);
          setError(false);
        }
      } catch { if (!cancelled) { setError(true); setRendered(false); } }
    };
    const timer = setTimeout(render, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [code, id]);

  useEffect(() => { if (expanded) { setZoom(1); setPan({ x: 0, y: 0 }); } }, [expanded]);

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "techbypete-architecture-" + Date.now() + ".svg";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!svgContent) return;
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = svgContent;
      const svg = tempDiv.querySelector("svg");
      if (!svg) return;
      const viewBox = svg.viewBox?.baseVal;
      const width = viewBox?.width || svg.width?.baseVal?.value || 1200;
      const height = viewBox?.height || svg.height?.baseVal?.value || 800;
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      const serialized = new XMLSerializer().serializeToString(svg);
      const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const scale = 3;
          const canvas = document.createElement("canvas");
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#0b0f14";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) { alert("Could not generate PNG. Try SVG download instead."); return; }
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.href = pngUrl; a.download = "techbypete-architecture-" + Date.now() + ".png";
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }, "image/png");
        } catch { alert("PNG export failed. Use SVG download instead."); }
      };
      img.onerror = () => alert("PNG export failed. Use SVG download instead.");
      img.src = svgDataUrl;
    } catch { alert("PNG export failed. Use SVG download — it works everywhere."); }
  };

  const handleWheel = (e) => {
    if (!expanded) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(5, z + delta)));
  };
  const handleMouseDown = (e) => {
    if (!expanded) return;
    panState.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y };
  };
  const handleMouseMove = (e) => {
    if (!panState.current.dragging) return;
    setPan({
      x: panState.current.startPanX + (e.clientX - panState.current.startX),
      y: panState.current.startPanY + (e.clientY - panState.current.startY),
    });
  };
  const handleMouseUp = () => { panState.current.dragging = false; };

  if (error) {
    return (
      <div style={{background:"#0a0d12",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"12px 14px",margin:"12px 0"}}>
        <div style={{fontSize:12,color:"#ef4444",fontWeight:600,marginBottom:6}}>⚠️ Diagram code received (not yet rendered)</div>
        <pre style={{background:"#12161d",color:"#a5b4fc",padding:"10px",borderRadius:6,fontSize:12,overflowX:"auto",margin:0,maxHeight:200}}><code>{code}</code></pre>
      </div>
    );
  }

  return (
    <div style={{margin:"14px 0",background:"#0a0d12",border:"1px solid rgba(94,106,210,0.2)",borderRadius:10,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(94,106,210,0.04)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:11,fontWeight:600,color:"#a5b4fc",letterSpacing:"0.04em",textTransform:"uppercase"}}>Architecture Diagram</span>
        {rendered && (
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <button onClick={() => setExpanded(true)} style={{background:"#5e6ad2",border:"none",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Open Fullscreen</button>
            <button onClick={downloadPNG} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"5px 10px",color:"#d1d5db",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>PNG</button>
            <button onClick={downloadSVG} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"5px 10px",color:"#d1d5db",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>SVG</button>
          </div>
        )}
      </div>
      <div ref={ref} onClick={() => rendered && setExpanded(true)} style={{padding:"20px",minHeight:80,overflow:"auto",textAlign:"center",cursor:rendered?"zoom-in":"default"}}>
        {!rendered ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"20px 0"}}><Dots/><span style={{fontSize:12,color:"#6b7280"}}>Rendering diagram...</span></div>
        ) : (
          <div dangerouslySetInnerHTML={{__html: svgContent}}/>
        )}
      </div>
      {expanded && rendered && (
        <>
          <div onClick={() => setExpanded(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:2000,backdropFilter:"blur(4px)"}}/>
          <div style={{position:"fixed",top:10,left:10,right:10,bottom:10,zIndex:2010,background:"#0b0f14",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#12161d",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:13,fontWeight:600,color:"#ffffff"}}>Architecture Diagram · Fullscreen</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 10px",color:"#d1d5db",fontSize:14,fontWeight:500,cursor:"pointer",minWidth:36}}>−</button>
                <span style={{fontSize:12,color:"#9ca3af",fontWeight:500,minWidth:50,textAlign:"center"}}>{Math.round(zoom*100)}%</span>
                <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 10px",color:"#d1d5db",fontSize:14,fontWeight:500,cursor:"pointer",minWidth:36}}>+</button>
                <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 12px",color:"#d1d5db",fontSize:11,fontWeight:500,cursor:"pointer"}}>Reset</button>
                <button onClick={() => setZoom(2)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 12px",color:"#d1d5db",fontSize:11,fontWeight:500,cursor:"pointer"}}>2x</button>
                <div style={{width:1,height:24,background:"rgba(255,255,255,0.1)",margin:"0 4px"}}/>
                <button onClick={downloadPNG} style={{background:"#5e6ad2",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:500,cursor:"pointer"}}>Download PNG</button>
                <button onClick={downloadSVG} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"6px 12px",color:"#d1d5db",fontSize:11,fontWeight:500,cursor:"pointer"}}>SVG</button>
                <button onClick={() => setExpanded(false)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"50%",color:"#ef4444",cursor:"pointer",width:32,height:32,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            </div>
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#0b0f14",position:"relative",cursor:panState.current?.dragging?"grabbing":"grab"}}>
              <div style={{transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,transformOrigin:"center center",transition:panState.current?.dragging?"none":"transform 0.15s ease"}} dangerouslySetInnerHTML={{__html: svgContent}}/>
            </div>
            <div style={{padding:"8px 16px",borderTop:"1px solid rgba(255,255,255,0.06)",fontSize:11,color:"#6b7280",textAlign:"center",background:"#12161d"}}>
              Scroll to zoom · Click + drag to pan
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Loading dots */
function Dots() {
  return (
    <div style={{display:"flex",gap:5,padding:"10px 14px",alignItems:"center"}}>
      {[0,1,2].map(i => <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#5e6ad2",animation:"tbp-bounce 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
    </div>
  );
}

/* File attachment chip */
function FileChip({ file, onRemove }) {
  if (!file) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 10px",maxWidth:"fit-content",marginBottom:8}}>
      {file.preview ? (
        <img src={file.preview} alt={file.name} style={{width:28,height:28,borderRadius:4,objectFit:"cover"}}/>
      ) : (
        <div style={{width:28,height:28,borderRadius:4,background:"#5e6ad2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff"}}>
          {file.type === "application/pdf" ? "📄" : file.type === "text/csv" ? "📊" : "📎"}
        </div>
      )}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:"#e8eaed",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:200}}>{file.name}</div>
        <div style={{fontSize:10,color:"#6b7280"}}>{(file.size/1024).toFixed(1)} KB</div>
      </div>
      <button onClick={onRemove} style={{background:"transparent",border:"none",color:"#6b7280",cursor:"pointer",fontSize:16,padding:"2px 6px"}}>×</button>
    </div>
  );
}

function isDocumentResponse(text) {
  if (!text) return false;
  const markers = ["Statement of Work", "SOW", "Executive Summary", "## Scope", "Deliverables:", "## Timeline", "Training Plan", "Certification Path"];
  return markers.filter(m => text.includes(m)).length >= 2;
}
/* ============================================================
   PDF PRINT — Generates styled, printable HTML with diagrams
   ============================================================ */
async function openDocumentPrint(markdownText) {
  const mermaidBlocks = [];
  let processedMarkdown = markdownText;

  if (window.mermaid) {
    const regex = /```mermaid\s*([\s\S]*?)```/g;
    let match;
    const matches = [];
    while ((match = regex.exec(markdownText)) !== null) {
      matches.push({ full: match[0], code: match[1].trim() });
    }
    for (let i = 0; i < matches.length; i++) {
      try {
        const id = "pdfmermaid-" + i + "-" + Math.random().toString(36).slice(2, 9);
        const { svg } = await window.mermaid.render(id, matches[i].code);
        mermaidBlocks.push(svg);
        processedMarkdown = processedMarkdown.replace(matches[i].full, `\n\n<!--MERMAID_${i}-->\n\n`);
      } catch {
        processedMarkdown = processedMarkdown.replace(matches[i].full, "");
      }
    }
  }

  let html = processedMarkdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/^(\|.*\|)\n\|[\s\-|]+\|\n((?:\|.*\|\n?)*)/gm, (match, header, body) => {
    const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (/^<[hH\d|ul|ol|li|table|thead|tbody|tr|td|th|hr]/.test(trimmed)) return trimmed;
    if (trimmed.startsWith('<!--MERMAID_')) return trimmed;
    return `<p>${trimmed}</p>`;
  }).join('\n');
  mermaidBlocks.forEach((svg, i) => {
    const placeholder = `<!--MERMAID_${i}-->`;
    const diagramHtml = `<div class="diagram-container"><div class="diagram-label">Architecture Diagram</div><div class="diagram-svg">${svg}</div></div>`;
    html = html.replace(placeholder, diagramHtml);
  });

  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>TechByPete · Document</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',-apple-system,sans-serif;color:#1a1d23;line-height:1.65;padding:48px 56px;max-width:900px;margin:0 auto;font-size:13.5px;letter-spacing:-0.005em;}
@media print{body{padding:24px 32px;}.no-print{display:none!important;}}
h1{font-size:26px;font-weight:600;color:#0a0d12;border-bottom:2px solid #5e6ad2;padding-bottom:12px;margin-bottom:20px;letter-spacing:-0.02em;}
h2{font-size:17px;font-weight:600;color:#5e6ad2;margin:26px 0 10px;letter-spacing:-0.01em;}
h3{font-size:14.5px;font-weight:600;color:#1a1d23;margin:18px 0 8px;}
p{margin:6px 0;color:#3a3f4a;}
strong{color:#0a0d12;font-weight:600;}
hr{border:none;border-top:1px solid #e5e7eb;margin:20px 0;}
ul,ol{margin:8px 0 8px 20px;}
li{margin:4px 0;color:#3a3f4a;}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:12.5px;}
th{background:#eef0ff;color:#5e6ad2;padding:8px 12px;text-align:left;border-bottom:2px solid #5e6ad2;font-weight:600;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;}
td{padding:7px 12px;color:#3a3f4a;border-bottom:1px solid #f1f3f5;}
.diagram-container{margin:24px 0;padding:20px;background:#fafbff;border:1px solid #5e6ad2;border-radius:10px;page-break-inside:avoid;}
.diagram-label{font-size:10px;font-weight:600;color:#5e6ad2;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;text-align:center;}
.diagram-svg{text-align:center;}
.diagram-svg svg{max-width:100%;height:auto;}
.footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:11px;}
.footer a{color:#5e6ad2;text-decoration:none;}
.header-print{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #e5e7eb;}
.brand-title{font-size:18px;font-weight:600;color:#5e6ad2;letter-spacing:-0.01em;}
.brand-sub{font-size:10px;color:#6b7280;margin-top:2px;letter-spacing:0.05em;text-transform:uppercase;}
.print-btn{display:inline-block;padding:10px 20px;background:#5e6ad2;color:#fff;text-decoration:none;border-radius:8px;font-weight:500;font-size:13px;margin:16px 0;}
</style></head><body>
<div class="no-print">
<div style="text-align:center;padding:16px 0 24px;">
<button onclick="window.print()" class="print-btn">Save as PDF</button>
</div>
</div>
<div class="header-print">
<div style="display:flex;align-items:center;gap:12px;">
<img src="${typeof window !== 'undefined' ? window.location.origin : ''}/techbypete-logo.png" alt="TechByPete" style="width:44px;height:44px;border-radius:10px;object-fit:cover;"/>
<div>
<div class="brand-title">TechByPete</div>
<div class="brand-sub">IT Solutions Architect · MCT · Pete Matsoukas</div>
</div>
</div>
<div style="text-align:right;font-size:10px;color:#6b7280;">Generated ${new Date().toLocaleDateString()}</div>
</div>
${html}
<div class="footer">
<strong style="color:#1a1d23;">Pete Matsoukas</strong> · IT Solutions Architect & MCT<br>
<a href="mailto:${CONTACT.email}">${CONTACT.email}</a> · ${CONTACT.phone} · <a href="https://ask.techbypete.com">ask.techbypete.com</a>
</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(fullHtml); w.document.close(); }
}

/* ============================================================
   ROI CALCULATOR — Modal for quick savings estimate
   ============================================================ */
function ROICalculator({ onClose, onAskPete, mobile }) {
  const [users, setUsers] = useState(50);
  const [spend, setSpend] = useState(5000);
  const [age, setAge] = useState(3);

  const yearlySpend = spend * 12;
  const savings = Math.round(yearlySpend * (0.25 + Math.min(0.15, age * 0.05)));
  const payback = Math.ceil(8000 / (savings / 12));
  const threeYearROI = Math.round(((savings * 3) / 8000) * 100);

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(540px, 90vw)",maxHeight:"90vh",overflowY:"auto",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontSize:17,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em"}}>ROI Calculator</div>
            <div style={{fontSize:12.5,color:"#9ca3af",marginTop:2}}>Estimate savings from Azure optimization</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#9ca3af",cursor:"pointer",width:32,height:32,fontSize:14}}>×</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{fontSize:12,color:"#9ca3af",fontWeight:500,marginBottom:6,display:"block"}}>Number of users</label>
            <input type="number" value={users} onChange={e => setUsers(Number(e.target.value)||0)} style={{width:"100%",background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:12,color:"#9ca3af",fontWeight:500,marginBottom:6,display:"block"}}>Monthly Azure/IT spend (USD)</label>
            <input type="number" value={spend} onChange={e => setSpend(Number(e.target.value)||0)} style={{width:"100%",background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:12,color:"#9ca3af",fontWeight:500,marginBottom:6,display:"block"}}>Infrastructure age (years)</label>
            <input type="number" value={age} min={0} max={15} onChange={e => setAge(Number(e.target.value)||0)} style={{width:"100%",background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          </div>
        </div>

        <div style={{marginTop:22,padding:16,background:"rgba(94,106,210,0.08)",border:"1px solid rgba(94,106,210,0.2)",borderRadius:10}}>
          <div style={{fontSize:11,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Estimated Results</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{fontSize:20,fontWeight:600,color:"#a5b4fc"}}>${savings.toLocaleString()}</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>Annual savings</div>
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:600,color:"#26d07c"}}>{payback}mo</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>Payback period</div>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <div style={{fontSize:20,fontWeight:600,color:"#a5b4fc"}}>{threeYearROI}%</div>
              <div style={{fontSize:11,color:"#9ca3af"}}>3-year ROI</div>
            </div>
          </div>
        </div>

        <button onClick={() => { onAskPete(users, spend, age, savings); onClose(); }} style={{marginTop:16,width:"100%",background:"#5e6ad2",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
          Get detailed analysis from Pete →
        </button>
      </div>
    </>
  );
}

/* ============================================================
   MSAL SINGLETON — Microsoft's required pattern for popup flow.
   Creating a fresh PublicClientApplication per click causes
   "timed_out" errors because the popup's postMessage callback
   races with the new instance's listener registration. One
   initialized instance, reused across scans, fixes this.
   ============================================================ */
let _msalInstancePromise = null;
function getMsalInstance() {
  if (_msalInstancePromise) return _msalInstancePromise;
  _msalInstancePromise = (async () => {
    const msal = await import("@azure/msal-browser");
    const instance = new msal.PublicClientApplication({
      auth: {
        clientId: MSAL_CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: typeof window !== "undefined" ? window.location.origin : "",
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
      },
    });
    await instance.initialize();
    /* Consume any lingering redirect response from a prior session so
       a fresh loginPopup doesn't race with stale state. */
    try { await instance.handleRedirectPromise(); } catch (_) {}
    return instance;
  })();
  return _msalInstancePromise;
}

/* ============================================================
   SECURE SCORE SCANNER — M365 lead magnet, live Graph API scan
   ============================================================ */
function SecureScoreScanner({ onClose, onAskPete, mobile }) {
  const [state, setState] = useState("ready"); /* ready | authenticating | scanning | success | error */
  const [error, setError] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  async function runScan() {
    setState("authenticating");
    setError("");
    /* Declared at function scope so catch block can inspect HTTP status */
    let scoreResponse = null;

    try {
      /* Use singleton — initialized once, reused across all scans */
      const msalInstance = await getMsalInstance();

      const loginResponse = await msalInstance.loginPopup({
        scopes: ["User.Read", "SecurityEvents.Read.All"],
        prompt: "select_account",
      });

      const account = loginResponse.account;
      setUserInfo({
        name: account.name,
        username: account.username,
        tenantId: account.tenantId,
      });

      setState("scanning");

      const tokenRequest = {
        scopes: ["SecurityEvents.Read.All"],
        account,
      };

      let tokenResponse;
      try {
        tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
      } catch (e) {
        tokenResponse = await msalInstance.acquireTokenPopup(tokenRequest);
      }

      scoreResponse = await fetch(
        "https://graph.microsoft.com/v1.0/security/secureScores?$top=1",
        { headers: { Authorization: `Bearer ${tokenResponse.accessToken}` } }
      );

      if (!scoreResponse.ok) {
        const errData = await scoreResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Graph API returned ${scoreResponse.status}`);
      }

      const scoreJson = await scoreResponse.json();

      if (!scoreJson.value || scoreJson.value.length === 0) {
        throw new Error("No Secure Score data available for this tenant. New tenants need ~24h to generate an initial score.");
      }

      setScoreData(scoreJson.value[0]);
      setState("success");
      trackEvent("securescore_scan_success");
    } catch (err) {
      console.error("Secure Score scan error:", err);
      setState("error");
      trackEvent("securescore_scan_error", { code: err.errorCode || "unknown" });

      const code = err.errorCode || "";
      const msg = err.message || "";

      if (code === "user_cancelled") {
        setError("Sign-in was cancelled. Click below to try again.");
      } else if (code === "popup_window_error" || code === "empty_window_error") {
        setError("The sign-in popup was blocked by your browser. Please allow popups for ask.techbypete.com and try again.");
      } else if (code === "timed_out" || msg.includes("timed_out")) {
        setError("The sign-in popup timed out. Most common causes: (1) your tenant admin has not granted consent for SecurityEvents.Read.All — check API permissions in Entra, (2) the Entra app's Supported account types is set to Single tenant instead of Multitenant, or (3) a browser extension is blocking cross-window communication. Try in an incognito window to rule out extensions.");
      } else if (code === "consent_required" || msg.includes("consent")) {
        setError("Your tenant admin must consent to the SecurityEvents.Read.All permission. Please have a Global Administrator run this scan, or contact Pete to arrange admin consent separately.");
      } else if (msg.includes("Insufficient privileges") || msg.includes("Authorization_RequestDenied") || msg.includes("Forbidden") || (scoreResponse && scoreResponse.status === 403)) {
        setError("This account doesn't have permission to read Secure Score. Please sign in with a Global Administrator, Security Administrator, or Security Reader account.");
      } else {
        setError(msg || "An unexpected error occurred. Please try again, or contact Pete if this persists.");
      }
    }
  }

  const percent = scoreData ? Math.round((scoreData.currentScore / scoreData.maxScore) * 100) : 0;
  const rating = percent >= 80 ? "Excellent" : percent >= 60 ? "Good" : percent >= 40 ? "Fair" : percent >= 20 ? "Needs Work" : "Critical";
  const ratingColor = percent >= 80 ? "#26d07c" : percent >= 60 ? "#a5b4fc" : percent >= 40 ? "#f59e0b" : "#ef4444";

  const byCategory = scoreData?.controlScores?.reduce((acc, c) => {
    const cat = c.controlCategory || "Other";
    if (!acc[cat]) acc[cat] = { score: 0, max: 0, count: 0 };
    acc[cat].score += c.score || 0;
    acc[cat].max += c.maxScore || 0;
    acc[cat].count += 1;
    return acc;
  }, {}) || {};

  const topGaps = scoreData?.controlScores
    ?.filter(c => c.maxScore > 0 && (c.maxScore - (c.score || 0)) > 0)
    ?.sort((a, b) => ((b.maxScore || 0) - (b.score || 0)) - ((a.maxScore || 0) - (a.score || 0)))
    ?.slice(0, 5) || [];

  function askPete() {
    const summary = `Analyze my Microsoft Secure Score and design a remediation roadmap:

**Current score:** ${scoreData.currentScore}/${scoreData.maxScore} (${percent}%) — ${rating}
**Licensed users:** ${scoreData.licensedUserCount ?? "N/A"}
**Active users:** ${scoreData.activeUserCount ?? "N/A"}
**Scan date:** ${new Date(scoreData.createdDateTime).toLocaleDateString()}

**Category breakdown:**
${Object.entries(byCategory).map(([cat, v]) => `- ${cat}: ${Math.round(v.score)}/${Math.round(v.max)} (${Math.round((v.score / v.max) * 100)}%)`).join("\n")}

**Top 5 highest-impact gaps (by point value):**
${topGaps.map((c, i) => `${i + 1}. ${c.controlName} — +${Math.round((c.maxScore || 0) - (c.score || 0))} pts possible`).join("\n")}

Design a prioritized remediation roadmap with three tiers:
1. **Quick wins** (this week, no license upgrades needed)
2. **30-day improvements** (medium effort, config changes)
3. **90-day strategic** (may require E5/Defender/Sentinel licensing)

For each item: estimated time to implement, expected score delta, and whether it requires a license upgrade. End with Essential / Recommended / Premium pricing tiers for my engagement.`;

    onAskPete(summary);
    trackEvent("securescore_ask_pete");
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(620px, 90vw)",maxHeight:"90vh",overflowY:"auto",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:12}}>
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:18}}>🛡️</span>
              <div style={{fontSize:17,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em"}}>Secure Score Scanner</div>
            </div>
            <div style={{fontSize:12.5,color:"#9ca3af"}}>Read-only scan of your M365 tenant — nothing is stored</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#9ca3af",cursor:"pointer",width:32,height:32,fontSize:14,flexShrink:0}}>×</button>
        </div>

        {state === "ready" && (
          <div>
            <div style={{background:"rgba(94,106,210,0.06)",border:"1px solid rgba(94,106,210,0.18)",borderRadius:10,padding:16,marginBottom:14}}>
              <div style={{fontSize:13,color:"#e8eaed",fontWeight:600,marginBottom:8}}>What this does</div>
              <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"#9ca3af",lineHeight:1.7}}>
                <li>Signs you in with your Microsoft 365 admin account</li>
                <li>Reads your tenant's current Secure Score from Microsoft Graph</li>
                <li>Shows the top gaps and generates a remediation plan</li>
                <li>Everything runs in your browser — Pete never sees your credentials</li>
              </ul>
            </div>

            <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:12,marginBottom:16}}>
              <div style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginBottom:4}}>⚠️ Required access</div>
              <div style={{fontSize:12,color:"#d1d5db",lineHeight:1.55}}>
                Sign in with a <strong style={{color:"#fbbf24"}}>Global Administrator</strong>, <strong style={{color:"#fbbf24"}}>Security Administrator</strong>, or <strong style={{color:"#fbbf24"}}>Security Reader</strong> account. You will be asked to consent to read-only <code style={{background:"#0a0d12",padding:"1px 5px",borderRadius:3,fontSize:11}}>SecurityEvents.Read.All</code> permission.
              </div>
            </div>

            <button onClick={runScan} style={{width:"100%",background:"#5e6ad2",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span>🔐</span> Sign in & scan my tenant
            </button>
          </div>
        )}

        {(state === "authenticating" || state === "scanning") && (
          <div style={{padding:"40px 20px",textAlign:"center"}}>
            <div style={{width:40,height:40,border:"3px solid rgba(94,106,210,0.2)",borderTopColor:"#5e6ad2",borderRadius:"50%",margin:"0 auto 16px",animation:"msalspin 0.8s linear infinite"}}/>
            <div style={{fontSize:14,color:"#e8eaed",fontWeight:500,marginBottom:4}}>
              {state === "authenticating" ? "Waiting for sign-in..." : "Fetching Secure Score..."}
            </div>
            <div style={{fontSize:12,color:"#9ca3af"}}>
              {state === "authenticating" ? "Complete the login in the popup window" : "Calling Microsoft Graph API"}
            </div>
            <style>{`@keyframes msalspin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {state === "success" && scoreData && (
          <div>
            {userInfo && (
              <div style={{fontSize:11,color:"#6b7280",marginBottom:14,textAlign:"center"}}>
                Signed in as <span style={{color:"#a5b4fc"}}>{userInfo.username}</span>
              </div>
            )}

            <div style={{textAlign:"center",padding:"12px 0 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:20}}>
              <div style={{fontSize:48,fontWeight:700,color:ratingColor,letterSpacing:"-0.03em",lineHeight:1}}>{percent}%</div>
              <div style={{fontSize:14,color:ratingColor,fontWeight:600,marginTop:4,letterSpacing:"0.02em"}}>{rating}</div>
              <div style={{fontSize:12,color:"#9ca3af",marginTop:6}}>
                {Math.round(scoreData.currentScore)} of {Math.round(scoreData.maxScore)} points
              </div>
            </div>

            {Object.keys(byCategory).length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>By Category</div>
                {Object.entries(byCategory).map(([cat, v]) => {
                  const pct = v.max > 0 ? Math.round((v.score / v.max) * 100) : 0;
                  const barColor = pct >= 80 ? "#26d07c" : pct >= 50 ? "#5e6ad2" : pct >= 25 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={cat} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,color:"#d1d5db",marginBottom:4}}>
                        <span style={{fontWeight:500}}>{cat}</span>
                        <span style={{color:"#9ca3af"}}>{Math.round(v.score)}/{Math.round(v.max)} · {pct}%</span>
                      </div>
                      <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:barColor,transition:"width 0.5s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {topGaps.length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Top 5 Opportunities</div>
                {topGaps.map((c, i) => (
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,marginBottom:5}}>
                    <div style={{fontSize:11,color:"#6b7280",fontWeight:700,minWidth:18}}>{i + 1}.</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,color:"#e8eaed",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.controlName}</div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>
                        +{Math.round((c.maxScore || 0) - (c.score || 0))} pts possible · {c.controlCategory || "Other"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={askPete} style={{width:"100%",background:"#5e6ad2",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
              Get Pete's remediation roadmap →
            </button>
          </div>
        )}

        {state === "error" && (
          <div>
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,color:"#fca5a5",fontWeight:600,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                <span>⚠️</span> Scan failed
              </div>
              <div style={{fontSize:12.5,color:"#d1d5db",lineHeight:1.55}}>{error}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => { setState("ready"); setError(""); }} style={{flex:1,background:"#5e6ad2",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                Try again
              </button>
              <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"12px 20px",color:"#9ca3af",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================================
   LEAD CAPTURE MODAL — Email gate after 5 free messages
   ============================================================ */
function LeadCaptureModal({ onClose, onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) { alert("Please enter a valid email"); return; }
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, source: "chat_limit" }),
      });
      localStorage.setItem("techbypete_email", email);
      trackEvent("lead_captured", { email });
      onSubmit(email);
    } catch {} finally { setLoading(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:"min(460px, calc(100vw - 24px))",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
        <div style={{fontSize:17,fontWeight:600,color:"#ffffff",marginBottom:6,letterSpacing:"-0.01em"}}>Keep the conversation going</div>
        <p style={{fontSize:13,color:"#9ca3af",lineHeight:1.5,marginBottom:20}}>You've used your free messages. Leave your email to continue — Pete will personally follow up within 24 hours.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company (optional)" style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
        </div>
        <button onClick={handleSubmit} disabled={loading||!email} style={{width:"100%",background:loading?"rgba(94,106,210,0.3)":"#5e6ad2",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:500,cursor:loading?"wait":"pointer",fontFamily:"inherit"}}>
          {loading ? "Saving..." : "Continue conversation →"}
        </button>
        <div style={{marginTop:12,textAlign:"center"}}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#9ca3af",textDecoration:"none"}}>or book a 30-min call with Pete →</a>
        </div>
      </div>
    </>
  );
}
/* ============================================================
   MAIN APP — 2026 Linear-Style Sidebar Layout
   ============================================================ */
export default function App() {
  /* Viewport */
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); /* mobile only */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* Sessions */
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);

  /* Chat input */
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  /* Mode */
  const [activeTab, setActiveTab] = useState("projects"); /* projects | training */

  /* Templates accordion */
  const [openCategory, setOpenCategory] = useState(null);

  /* Modals */
  const [showContact, setShowContact] = useState(false);
  const [showMeetPete, setShowMeetPete] = useState(false);
  const [showROI, setShowROI] = useState(false);
  const [showSecureScoreScan, setShowSecureScoreScan] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showKnowledgeReview, setShowKnowledgeReview] = useState(false);
  const [showVendorUpdate, setShowVendorUpdate] = useState(false);

  /* Knowledge */
  const [learnedKnowledge, setLearnedKnowledge] = useState(() => typeof window !== "undefined" ? loadLearnedKnowledge() : []);
  const [pendingKnowledge, setPendingKnowledge] = useState({ title: "", content: "", source: "" });
  const [vendorUpdateStatus, setVendorUpdateStatus] = useState("");
  const [vendorUpdateContent, setVendorUpdateContent] = useState("");

  /* Files */
  const [attachedFile, setAttachedFile] = useState(null);
  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp"];
  const MAX_FILE_MB = 10;

  /* Language */
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  /* Message limits */
  const [messageCount, setMessageCount] = useState(0);
  const [capturedEmail, setCapturedEmail] = useState(null);
  const FREE_MESSAGE_LIMIT = 5;

  /* Orchestrator */
  const [orchestratorActive, setOrchestratorActive] = useState(false);
  const [specialistsWorking, setSpecialistsWorking] = useState([]);

  /* Speaking (TTS) */
  const [speakingIdx, setSpeakingIdx] = useState(null);

  /* Refs */
  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  const active = sessions.find(s => s.id === activeId);
  const msgs = active?.messages || [];
  const chatStarted = msgs.length > 0;

  /* Detect complex multi-domain queries */
  const detectComplexQuery = (query) => {
    const lower = query.toLowerCase();
    const domains = [
      { terms: ["azure","avd","vnet","expressroute","hub-spoke","landing zone"] },
      { terms: ["zero trust","conditional access","defender","sentinel","cis","mfa","phishing"] },
      { terms: ["m365","office 365","exchange","teams","sharepoint","intune","entra","autopilot"] },
      { terms: ["vmware","vsphere","esxi","vsan","vcenter","vmotion"] },
      { terms: ["fortigate","sd-wan","ztna","vpn","forticlient","fortinet"] },
      { terms: ["veeam","backup","immutable","ransomware","rpo","rto"] },
      { terms: ["cisco","unifi","vlan","wifi","wireless","radius","802.1x"] },
      { terms: ["active directory","ad ds","hyper-v","wsfc","sql always on","gpo"] },
    ];
    let hits = 0;
    for (const d of domains) if (d.terms.some(t => lower.includes(t))) hits++;
    const complexMarkers = ["migrate","deploy","design","architect","plan","sow","statement of work","solution","project","end-to-end","full stack","complete"];
    const hasComplexity = complexMarkers.some(m => lower.includes(m));
    return (hits >= 2) || (hits === 1 && hasComplexity && query.length > 40);
  };

  /* ========== MOUNT EFFECTS ========== */
  useEffect(() => {
    setMounted(true);
    const setVh = () => document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    setVh();
    const check = () => { setMobile(window.innerWidth < 900); setVh(); };
    check();
    window.addEventListener("resize", check);

    /* Load FontAwesome for Mermaid diagrams */
    if (!document.querySelector('link[href*="fontawesome"]')) {
      const fa = document.createElement("link");
      fa.rel = "stylesheet";
      fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
      document.head.appendChild(fa);
    }

    /* Load Mermaid */
    if (!window.mermaid && !document.querySelector('script[data-mermaid]')) {
      const mm = document.createElement("script");
      mm.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
      mm.setAttribute("data-mermaid", "true");
      mm.onload = () => {
        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
              darkMode: true, fontSize: "16px",
              background: "#0b0f14",
              primaryColor: "#5e6ad2", primaryTextColor: "#ffffff", primaryBorderColor: "#4f5abf",
              secondaryColor: "#1a1f28", tertiaryColor: "#12161d",
              lineColor: "#a5b4fc", textColor: "#e8eaed",
              mainBkg: "#1a1f28", secondBkg: "#12161d", tertiaryBkg: "#0b0f14",
              clusterBkg: "rgba(94,106,210,0.08)", clusterBorder: "#5e6ad2",
              edgeLabelBackground: "#0b0f14",
              nodeBkg: "#1a1f28", nodeBorder: "#a5b4fc", nodeTextColor: "#ffffff",
            },
            securityLevel: "loose",
            flowchart: { curve: "basis", padding: 30, nodeSpacing: 80, rankSpacing: 100, htmlLabels: true, useMaxWidth: false, diagramPadding: 20 },
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          });
        }
      };
      document.head.appendChild(mm);
    }

    /* Load sessions and email */
    const saved = loadSessions();
    if (saved.length > 0) { setSessions(saved); setActiveId(saved[0].id); }
    const savedEmail = localStorage.getItem("techbypete_email");
    if (savedEmail) setCapturedEmail(savedEmail);

    return () => window.removeEventListener("resize", check);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (mounted) saveSessions(sessions); }, [sessions, mounted]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading, streamingText]);

  /* ========== CHAT OPERATIONS ========== */
  const newChat = () => {
    const id = uid();
    const newSession = { id, title: "New conversation", messages: [], createdAt: Date.now() };
    setSessions(p => [newSession, ...p]);
    setActiveId(id);
    setInput("");
    setAttachedFile(null);
    if (mobile) setSidebarOpen(false);
  };

  const updateChat = (id, messages) => {
    setSessions(p => p.map(s => s.id !== id ? s : {
      ...s,
      messages,
      title: messages.find(m => m.role === "user")?.content?.slice(0, 50) || "New conversation",
    }));
  };

  const deleteChat = (id) => {
    setSessions(p => {
      const remaining = p.filter(s => s.id !== id);
      if (id === activeId) {
        if (remaining.length > 0) setActiveId(remaining[0].id);
        else {
          const nid = uid();
          setActiveId(nid);
          return [{ id: nid, title: "New conversation", messages: [], createdAt: Date.now() }];
        }
      }
      return remaining;
    });
  };

  const switchChat = (id) => {
    setActiveId(id);
    if (mobile) setSidebarOpen(false);
  };

  /* ========== FILE HANDLING ========== */
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    const isCompetitorMode = fileRef.current?.getAttribute("data-mode") === "competitor";
    if (fileRef.current) fileRef.current.removeAttribute("data-mode");
    if (!file) return;

    const isCSV = file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".csv");
    if (!isCSV && !ALLOWED_TYPES.includes(file.type)) { alert("Supported: PDF, PNG, JPEG, GIF, WebP, CSV"); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { alert(`File must be under ${MAX_FILE_MB} MB`); return; }
    if (isCompetitorMode && file.type !== "application/pdf") { alert("For proposal analysis, please upload a PDF file."); return; }

    try {
      if (isCSV) {
        const text = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => rej(new Error("Read failed"));
          r.readAsText(file);
        });
        const summary = parseCSVToSummary(text, file.name);
        setAttachedFile({ name: file.name, type: "text/csv", size: file.size, data: null, preview: null, csvSummary: summary });
      } else {
        const base64 = await fileToBase64(file);
        const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
        setAttachedFile({ name: file.name, type: file.type, size: file.size, data: base64, preview });
        if (isCompetitorMode) {
          trackEvent("competitor_analysis_submit");
          setTimeout(() => send("Please analyze this competitor's proposal/SOW using the Proposal Comparison Engine framework. Identify gaps, risks, and what Pete's approach would add."), 200);
        }
      }
    } catch { alert("Failed to read file. Please try again."); }
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ========== SEND MESSAGE ========== */
  const send = async (text) => {
    const t = (text || input).trim();
    if ((!t && !attachedFile) || loading) return;

    /* Lead capture gate */
    if (!capturedEmail && messageCount >= FREE_MESSAGE_LIMIT) {
      setShowLeadCapture(true);
      return;
    }

    /* Ensure we have an active session */
    let currentId = activeId;
    if (!currentId || !sessions.find(s => s.id === currentId)) {
      currentId = uid();
      const newSession = { id: currentId, title: "New conversation", messages: [], createdAt: Date.now() };
      setSessions(p => [newSession, ...p]);
      setActiveId(currentId);
    }

    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    const currentFile = attachedFile;
    setAttachedFile(null);

    let userDisplay = t || "(see attached file)";
    let userApiContent;
    if (currentFile) {
      if (currentFile.type === "text/csv") {
        userApiContent = `${t || "Please analyze this data."}\n\n${currentFile.csvSummary}`;
      } else if (currentFile.type === "application/pdf") {
        userApiContent = [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: currentFile.data } },
          { type: "text", text: t || "Please analyze this document." },
        ];
      } else {
        userApiContent = [
          { type: "image", source: { type: "base64", media_type: currentFile.type, data: currentFile.data } },
          { type: "text", text: t || "Please analyze this image." },
        ];
      }
    } else {
      userApiContent = t;
    }

    const uMsg = { role: "user", content: typeof userApiContent === "string" ? userApiContent : userDisplay, display: userDisplay, file: currentFile };
    const newMsgs = [...msgs, uMsg];
    updateChat(currentId, newMsgs);
    setLoading(true);
    setMessageCount(c => c + 1);

    const apiMessages = newMsgs.map(m => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : (m.display || ""),
    }));
    /* Use full content with attachment for last user message */
    if (currentFile) apiMessages[apiMessages.length - 1] = { role: "user", content: userApiContent };

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const useOrchestrator = detectComplexQuery(t) && !currentFile;
      const endpoint = useOrchestrator ? "/api/orchestrate" : "/api/chat";

      if (useOrchestrator) {
        setOrchestratorActive(true);
        setSpecialistsWorking([]);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          mode: activeTab,
          language,
          learnedKnowledge: learnedKnowledge.map(e => e.title + ": " + e.content).join("\n\n---\n\n"),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = "I encountered an issue. Please try again.";
        try {
          const errData = await response.json();
          if (errData.error === "rate_limited") errorMsg = "⏳ " + errData.message;
          else if (errData.error === "daily_limit") errorMsg = "📅 " + errData.message + "\n\nBook a call: " + CALENDLY_URL;
          else if (errData.message) errorMsg = errData.message;
        } catch {}
        updateChat(currentId, [...newMsgs, { role: "assistant", content: errorMsg, display: errorMsg }]);
        setLoading(false); setStreamingText("");
        return;
      }

      if (response.body?.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "", accumulated = "";

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
                if (evt.type === "orchestrator_start") {
                  setSpecialistsWorking(evt.specialists.map(s => ({ ...s, status: "pending" })));
                } else if (evt.type === "specialist_start") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "working" } : s));
                } else if (evt.type === "specialist_complete") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "complete" } : s));
                } else if (evt.type === "specialist_error") {
                  setSpecialistsWorking(prev => prev.map(s => s.key === evt.key ? { ...s, status: "error" } : s));
                } else if (evt.type === "assembly_start") {
                  setSpecialistsWorking(prev => [...prev, { key: "_pete", name: "Pete Matsoukas (Lead)", icon: "🎯", status: "working" }]);
                }
                if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                  accumulated += evt.delta.text;
                  setStreamingText(accumulated);
                }
              } catch {}
            }
          }
        } catch (streamErr) {
          if (controller.signal.aborted && accumulated) {
            setStreamingText("");
            updateChat(currentId, [...newMsgs, { role: "assistant", content: accumulated + "\n\n*(Response stopped by user)*", display: accumulated + "\n\n*(Response stopped by user)*" }]);
            return;
          }
        }

        if (accumulated) {
          setStreamingText("");
          updateChat(currentId, [...newMsgs, { role: "assistant", content: accumulated, display: accumulated }]);
        } else {
          updateChat(currentId, [...newMsgs, { role: "assistant", content: "I encountered an issue. Please try again.", display: "I encountered an issue. Please try again." }]);
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      updateChat(currentId, [...newMsgs, { role: "assistant", content: "Connection error. Please try again.", display: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      setStreamingText("");
      setOrchestratorActive(false);
      setSpecialistsWorking([]);
      abortRef.current = null;
    }
  };

  /* ========== KNOWLEDGE OPERATIONS ========== */
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
            content: "Summarize the following AI response into a concise knowledge base entry. Format:\n\nTitle: [short title]\n\n[2-4 paragraphs with specifics]\n\nResponse to summarize:\n\n" + msgContent,
          }],
          mode: "projects", language: "en",
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
    } catch { setPendingKnowledge({ title: "Error", content: "Failed to generate. Write manually.", source: "conversation" }); }
  };

  const approveKnowledge = () => {
    if (!pendingKnowledge.content || pendingKnowledge.title === "Generating summary...") return;
    const entry = { id: Date.now(), ...pendingKnowledge, date: new Date().toISOString() };
    const updated = [...learnedKnowledge, entry];
    setLearnedKnowledge(updated);
    saveLearnedKnowledge(updated);
    setShowKnowledgeReview(false);
    setPendingKnowledge({ title: "", content: "", source: "" });
  };

  const deleteKnowledgeEntry = (id) => {
    const updated = learnedKnowledge.filter(e => e.id !== id);
    setLearnedKnowledge(updated);
    saveLearnedKnowledge(updated);
  };

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
            content: "Search the web for the latest Microsoft Azure, M365, Intune, Entra ID, and Windows Server updates from the past 7 days. Top 5-8 updates. Format:\n### [Title]\n[2-3 sentence summary]",
          }],
          mode: "projects", language: "en",
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
      if (accumulated) { setVendorUpdateContent(accumulated); setVendorUpdateStatus("ready"); }
      else { setVendorUpdateStatus(""); setVendorUpdateContent("Failed to fetch updates."); }
    } catch { setVendorUpdateStatus(""); setVendorUpdateContent("Error fetching vendor updates."); }
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
  };

  /* ========== INPUT HANDLERS ========== */
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !mobile) { e.preventDefault(); send(); }
  };
  const onTa = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };
  const stopGeneration = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false); setStreamingText("");
  };
  const speakMessage = (text, idx) => {
    if ("speechSynthesis" in window) {
      if (speakingIdx === idx) { window.speechSynthesis.cancel(); setSpeakingIdx(null); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[`*#\[\]]/g, "").slice(0, 3000));
      u.onend = () => setSpeakingIdx(null);
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
      setSpeakingIdx(idx);
    }
  };

  if (!mounted) return null;
  /* ========== RENDER ========== */
  const currentLang = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; overflow: hidden; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0b0f14;
          color: #e8eaed;
          letter-spacing: -0.005em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        @keyframes tbp-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes tbp-fade-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tbp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

        textarea { resize: none; font-family: inherit; }
        textarea:focus { outline: none; }
        button { font-family: inherit; }
        input { font-family: inherit; }

        .sb-item-btn { background: transparent; border: none; width: 100%; text-align: left; }
        .sb-item-btn:hover { background: rgba(255,255,255,0.04); }
        .sb-item-btn.active { background: rgba(94,106,210,0.12); color: #e8eaed; }
        .chat-item:hover .delete-btn { opacity: 1; }
        .delete-btn { opacity: 0; transition: opacity 0.15s; }
        .ibtn:hover { background: rgba(255,255,255,0.08); color: #e8eaed; }
        .msg-action-btn:hover { background: rgba(255,255,255,0.06); color: #e8eaed; }
      `}</style>

      <div style={{
        display: "flex",
        height: "calc(var(--vh, 1vh) * 100)",
        background: "#0b0f14",
        color: "#e8eaed",
        overflow: "hidden",
      }}>

        {/* ============ SIDEBAR ============ */}
        {mobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:90,backdropFilter:"blur(2px)"}}/>
        )}
        <aside style={{
          width: sidebarCollapsed && !mobile ? 0 : 280,
          flexShrink: 0,
          background: "#12161d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          position: mobile ? "fixed" : "relative",
          left: mobile ? (sidebarOpen ? 0 : -280) : 0,
          top: 0, bottom: 0,
          zIndex: 100,
          transition: "left 0.25s ease, width 0.2s ease",
        }}>

          {/* Sidebar header */}
          <div style={{padding:"14px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <div onClick={() => setShowMeetPete(true)} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}}>
              <img src="/techbypete-logo.png" alt="TechByPete" style={{width:26,height:26,borderRadius:7,objectFit:"cover",flexShrink:0}}/>
              <div style={{fontWeight:600,fontSize:14,letterSpacing:"-0.01em",color:"#ffffff"}}>TechByPete</div>
            </div>
            {mobile && (
              <button onClick={() => setSidebarOpen(false)} style={{width:28,height:28,borderRadius:6,background:"transparent",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            )}
          </div>

          {/* New conversation button */}
          <button onClick={newChat} style={{margin:12,padding:"9px 12px",background:"rgba(94,106,210,0.12)",border:"1px solid rgba(94,106,210,0.3)",borderRadius:8,color:"#a5b4fc",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
            <span style={{fontSize:16,lineHeight:1}}>+</span>
            <span>New conversation</span>
          </button>

          {/* Scrollable sidebar content */}
          <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>

            {/* Start section */}
            <div style={{marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px"}}>START</div>
              <button className={"sb-item-btn" + (activeTab==="projects"?" active":"")} onClick={() => setActiveTab("projects")} style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:activeTab==="projects"?"#e8eaed":"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>🏗️</span>
                <span style={{flex:1}}>IT Projects</span>
              </button>
              <button className={"sb-item-btn" + (activeTab==="training"?" active":"")} onClick={() => setActiveTab("training")} style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:activeTab==="training"?"#e8eaed":"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>🎓</span>
                <span style={{flex:1}}>Training</span>
              </button>
            </div>

            {/* Templates accordion - only for projects mode */}
            {activeTab === "projects" && (
              <div style={{marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>TEMPLATES</span>
                  <span style={{fontSize:10,background:"rgba(255,255,255,0.06)",padding:"1px 6px",borderRadius:10}}>{TEMPLATE_CATEGORIES.reduce((a,c) => a+c.items.length, 0)}</span>
                </div>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <button onClick={() => setOpenCategory(openCategory===cat.id ? null : cat.id)} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                      <span style={{fontSize:14,width:18,textAlign:"center"}}>{cat.icon}</span>
                      <span style={{flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cat.label}</span>
                      <span style={{fontSize:10,color:"#6b7280",transform:openCategory===cat.id?"rotate(90deg)":"rotate(0)",transition:"transform 0.15s"}}>▸</span>
                    </button>
                    {openCategory === cat.id && (
                      <div style={{paddingLeft:18,marginBottom:4}}>
                        {cat.items.map((item, i) => (
                          <button key={i} onClick={() => { send(item.q); }} className="sb-item-btn" style={{padding:"6px 10px",borderRadius:6,display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",fontSize:12.5,color:"#9ca3af",marginBottom:1,textAlign:"left"}}>
                            <span style={{fontSize:12,marginTop:2}}>{item.icon}</span>
                            <span style={{flex:1,lineHeight:1.35}}>{item.q}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Training templates */}
            {activeTab === "training" && (
              <div style={{marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px"}}>TRAINING PROGRAMS</div>
                {TRAINING_TEMPLATES.map((item, i) => (
                  <button key={i} onClick={() => send(item.q)} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",fontSize:12.5,color:"#9ca3af",marginBottom:1,textAlign:"left",lineHeight:1.35}}>
                    <span style={{fontSize:14,marginTop:1}}>{item.icon}</span>
                    <span style={{flex:1}}>{item.q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tools */}
            <div style={{marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px"}}>TOOLS</div>
              <button onClick={() => { setShowSecureScoreScan(true); trackEvent("tool_securescore_open"); }} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>🛡️</span>
                <span style={{flex:1}}>Scan Secure Score</span>
                <span style={{fontSize:9,background:"rgba(38,208,124,0.15)",color:"#26d07c",padding:"1px 6px",borderRadius:10,border:"1px solid rgba(38,208,124,0.25)",letterSpacing:"0.04em",fontWeight:600,textTransform:"uppercase"}}>New</span>
              </button>
              <button onClick={() => { setShowROI(true); trackEvent("tool_roi_open"); }} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>📊</span>
                <span style={{flex:1}}>ROI Calculator</span>
              </button>
              <button onClick={() => { fileRef.current?.setAttribute("data-mode", "competitor"); fileRef.current?.click(); trackEvent("tool_analyze_proposal"); }} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>🔍</span>
                <span style={{flex:1}}>Analyze Proposal</span>
              </button>
              <button onClick={() => { send("Generate Pete's Weekly Take — search for the latest trending Microsoft, Azure, and M365 news from the past 7 days and write a blog post for www.techbypete.com in Pete's voice."); trackEvent("tool_weekly_take"); }} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>✍️</span>
                <span style={{flex:1}}>Weekly Take</span>
              </button>
            </div>

            {/* Admin */}
            <div style={{marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px"}}>ADMIN</div>
              <button onClick={() => { setShowKnowledgeReview(true); }} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>📚</span>
                <span style={{flex:1}}>Saved Knowledge</span>
                {learnedKnowledge.length > 0 && <span style={{fontSize:10,background:"rgba(94,106,210,0.2)",color:"#a5b4fc",padding:"1px 6px",borderRadius:10}}>{learnedKnowledge.length}</span>}
              </button>
              <button onClick={runVendorUpdate} className="sb-item-btn" style={{padding:"7px 10px",borderRadius:7,display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"#9ca3af",marginBottom:1}}>
                <span style={{fontSize:14,width:18,textAlign:"center"}}>🔄</span>
                <span style={{flex:1}}>Update Knowledge</span>
              </button>
            </div>

            {/* Recents */}
            {sessions.length > 0 && (
              <div style={{marginBottom:6}}>
                <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",padding:"12px 10px 6px"}}>RECENTS</div>
                {sessions.slice(0, 15).map(s => (
                  <div key={s.id} className="chat-item" onClick={() => switchChat(s.id)} style={{padding:"6px 10px",borderRadius:6,fontSize:12.5,color:s.id===activeId?"#e8eaed":"#9ca3af",cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",overflow:"hidden",background:s.id===activeId?"rgba(94,106,210,0.12)":"transparent",marginBottom:1}}>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{s.title}</span>
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }} style={{background:"transparent",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13,padding:"0 4px"}}>×</button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Sidebar footer - Pete profile */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={() => setShowMeetPete(true)}>
            <img src="/techbypete-logo.png" alt="TechByPete" style={{width:32,height:32,borderRadius:8,objectFit:"cover",border:"1px solid rgba(255,255,255,0.12)",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:"#e8eaed",lineHeight:1.2}}>Pete Matsoukas</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>IT Solutions Architect · MCT</div>
            </div>
            <span style={{fontSize:10,color:"#26d07c"}}>●</span>
          </div>

        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <main style={{flex:1,display:"flex",flexDirection:"column",background:"#0b0f14",minWidth:0}}>

          {/* Topbar */}
          <div style={{height:52,borderBottom:"1px solid rgba(255,255,255,0.06)",padding:mobile?"0 12px":"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              {mobile && (
                <button onClick={() => setSidebarOpen(true)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"6px 10px",color:"#9ca3af",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center"}}>☰</button>
              )}
              <div style={{fontSize:13,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                <strong style={{color:"#e8eaed",fontWeight:500}}>{activeTab === "projects" ? "IT Projects" : "Training"}</strong>
                {active && <span> · {active.title}</span>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{position:"relative"}}>
                <button onClick={() => setShowLangMenu(v => !v)} style={{padding:"6px 10px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#9ca3af",fontSize:12.5,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <span>{currentLang.flag}</span>{!mobile && <span>{currentLang.code.toUpperCase()}</span>}
                </button>
                {showLangMenu && (
                  <>
                    <div onClick={() => setShowLangMenu(false)} style={{position:"fixed",inset:0,zIndex:200}}/>
                    <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:4,zIndex:210,minWidth:160,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
                      {LANG_OPTIONS.map(l => (
                        <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} style={{width:"100%",background:language===l.code?"rgba(94,106,210,0.12)":"transparent",border:"none",borderRadius:6,padding:"7px 10px",color:"#e8eaed",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
                          <span>{l.flag}</span><span>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {!mobile && (
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("calendly_click")} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px 4px 5px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,color:"#d1d5db",fontSize:12.5,fontWeight:500,cursor:"pointer",textDecoration:"none"}}>
                  <img src="/pete.jpg" alt="Pete" style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",border:"1px solid rgba(94,106,210,0.5)",flexShrink:0}}/>
                  Book a call
                </a>
              )}
              <button onClick={() => setShowContact(true)} style={{padding:"6px 12px",background:"#5e6ad2",border:"1px solid #5e6ad2",borderRadius:7,color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
                About TechByPete
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div style={{flex:1,overflowY:"auto",padding:mobile?"20px 12px 12px":"40px 24px 20px"}}>
            <div style={{maxWidth:780,margin:"0 auto"}}>

              {!chatStarted ? (
                /* Welcome screen */
                <div style={{textAlign:"center",paddingTop:mobile?20:40}}>
                  <img src="/techbypete-logo.png" alt="TechByPete" style={{width:64,height:64,borderRadius:16,objectFit:"cover",margin:"0 auto 20px",display:"block",boxShadow:"0 4px 20px rgba(94,106,210,0.25)"}}/>
                  <h1 style={{fontSize:mobile?24:28,fontWeight:600,letterSpacing:"-0.02em",marginBottom:10,color:"#ffffff"}}>
                    {activeTab === "projects" ? "Describe your IT challenge" : "Build your training roadmap"}
                  </h1>
                  <p style={{fontSize:mobile?13.5:15,color:"#9ca3af",lineHeight:1.5,maxWidth:520,margin:"0 auto 32px"}}>
                    {activeTab === "projects"
                      ? "Get a free Assessment, Solution Design, or Statement of Work — backed by 15+ years of hands-on expertise across Azure, M365, on-prem, and networking."
                      : "Plan a certification path for your team"}
                  </p>

                  <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10,maxWidth:620,margin:"0 auto"}}>
                    {(activeTab === "projects" ? QUICK_PROMPTS : TRAINING_QUICK_PROMPTS).map((p, i) => (
                      <button key={i} onClick={() => send(p.title)} style={{background:"#12161d",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"14px 16px",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10,fontFamily:"inherit",color:"inherit",transition:"all 0.15s"}} onMouseEnter={e => { e.currentTarget.style.background = "#1a1f28"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#12161d"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                        <span style={{fontSize:16,color:"#a5b4fc",flexShrink:0,marginTop:1}}>{p.icon}</span>
                        <div>
                          <div style={{fontSize:13.5,color:"#e8eaed",lineHeight:1.4}}>{p.title}</div>
                          <div style={{fontSize:11.5,color:"#6b7280",marginTop:3}}>{p.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {!mobile && (
                    <div style={{marginTop:28,fontSize:11,color:"#6b7280"}}>
                      Or browse templates in the sidebar · Type your own question below
                    </div>
                  )}
                </div>
              ) : (
                /* Chat messages */
                <div style={{paddingBottom:20}}>
                  {msgs.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    const displayContent = msg.display || (typeof msg.content === "string" ? msg.content : "");
                    return (
                      <div key={idx} style={{display:"flex",gap:12,marginBottom:24,animation:"tbp-fade-up 0.2s ease"}}>
                        {isUser ? (
                          <div style={{width:28,height:28,borderRadius:7,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"#fff",background:"rgba(255,255,255,0.08)"}}>You</div>
                        ) : (
                          <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",flexShrink:0,border:"1px solid rgba(94,106,210,0.3)"}}/>
                        )}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#ffffff",marginBottom:6}}>{isUser ? "You" : "Pete"}</div>
                          {msg.file && (
                            <div style={{marginBottom:8}}><FileChip file={msg.file} onRemove={() => {}}/></div>
                          )}
                          {isUser ? (
                            <div style={{fontSize:14,lineHeight:1.65,color:"#d1d5db",whiteSpace:"pre-wrap"}}>{displayContent}</div>
                          ) : (
                            <>
                              <Msg content={displayContent}/>
                              {displayContent.length > 20 && (
                                <div style={{display:"flex",gap:2,marginTop:6,flexWrap:"wrap"}}>
                                  <button className="msg-action-btn" onClick={() => navigator.clipboard.writeText(displayContent)} style={{background:"transparent",border:"none",padding:"4px 8px",borderRadius:6,color:"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>📋 Copy</button>
                                  <button className="msg-action-btn" onClick={() => speakMessage(displayContent, idx)} style={{background:"transparent",border:"none",padding:"4px 8px",borderRadius:6,color:speakingIdx===idx?"#ef4444":"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{speakingIdx===idx?"⏹ Stop":"🔊 Read"}</button>
                                  {isDocumentResponse(displayContent) && (
                                    <button className="msg-action-btn" onClick={() => openDocumentPrint(displayContent)} style={{background:"transparent",border:"none",padding:"4px 8px",borderRadius:6,color:"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>📄 PDF</button>
                                  )}
                                  {displayContent.length > 100 && (
                                    <button className="msg-action-btn" onClick={() => generateKnowledgeSummary(displayContent)} style={{background:"transparent",border:"none",padding:"4px 8px",borderRadius:6,color:"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>💡 Save</button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Streaming assistant message */}
                  {loading && streamingText && (
                    <div style={{display:"flex",gap:12,marginBottom:24}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",flexShrink:0,border:"1px solid rgba(94,106,210,0.3)"}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#ffffff",marginBottom:6}}>Pete</div>
                        <Msg content={(() => {
                          const parts = streamingText.split("```mermaid");
                          if (parts.length === 1) return streamingText;
                          let result = parts[0];
                          for (let i = 1; i < parts.length; i++) {
                            const closingIdx = parts[i].indexOf("```");
                            if (closingIdx === -1) { result += "\n\n*📊 Generating architecture diagram...*"; break; }
                            result += "```mermaid" + parts[i].slice(0, closingIdx + 3);
                            if (i < parts.length - 1) result += parts[i].slice(closingIdx + 3);
                          }
                          return result;
                        })()}/>
                        <span style={{display:"inline-block",width:2,height:16,background:"#a5b4fc",animation:"tbp-pulse 1s infinite",verticalAlign:"text-bottom",marginLeft:2}}/>
                      </div>
                    </div>
                  )}

                  {/* Multi-agent specialists panel */}
                  {loading && specialistsWorking.length > 0 && !streamingText && (
                    <div style={{display:"flex",gap:12,marginBottom:24}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",flexShrink:0,border:"1px solid rgba(94,106,210,0.3)"}}/>
                      <div style={{flex:1,background:"#12161d",border:"1px solid rgba(94,106,210,0.2)",borderRadius:10,padding:16,minWidth:280}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                          <span style={{fontSize:14}}>🧠</span>
                          <span style={{fontSize:12,fontWeight:600,color:"#a5b4fc",letterSpacing:"0.04em",textTransform:"uppercase"}}>Multi-Specialist Analysis</span>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {specialistsWorking.map(s => (
                            <div key={s.key} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:s.status==="working"?"rgba(94,106,210,0.1)":s.status==="complete"?"rgba(38,208,124,0.08)":s.status==="error"?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.02)",border:"1px solid "+(s.status==="working"?"rgba(94,106,210,0.3)":s.status==="complete"?"rgba(38,208,124,0.25)":s.status==="error"?"rgba(239,68,68,0.25)":"rgba(255,255,255,0.06)"),borderRadius:7}}>
                              <span style={{fontSize:14}}>{s.icon}</span>
                              <span style={{flex:1,fontSize:12.5,fontWeight:500,color:s.status==="complete"?"#26d07c":s.status==="error"?"#ef4444":"#e8eaed"}}>{s.name}</span>
                              {s.status === "pending" && <span style={{fontSize:10,color:"#6b7280"}}>waiting</span>}
                              {s.status === "working" && <Dots/>}
                              {s.status === "complete" && <span style={{fontSize:13,color:"#26d07c"}}>✓</span>}
                              {s.status === "error" && <span style={{fontSize:13,color:"#ef4444"}}>✗</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple loading */}
                  {loading && !streamingText && specialistsWorking.length === 0 && (
                    <div style={{display:"flex",gap:12,marginBottom:24}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",flexShrink:0,border:"1px solid rgba(94,106,210,0.3)"}}/>
                      <div style={{padding:"4px 0"}}><Dots/></div>
                    </div>
                  )}

                  <div ref={bottomRef}/>
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:mobile?"12px":"16px 24px 20px",background:"#0b0f14",flexShrink:0,paddingBottom:`max(${mobile?"12px":"20px"}, env(safe-area-inset-bottom, 0px))`}}>
            <div style={{maxWidth:780,margin:"0 auto"}}>
              {attachedFile && <FileChip file={attachedFile} onRemove={() => setAttachedFile(null)}/>}
              <div style={{background:"#12161d",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"10px 12px 10px 14px",display:"flex",alignItems:"flex-end",gap:8,transition:"border-color 0.15s"}} onFocusCapture={e => e.currentTarget.style.borderColor = "#5e6ad2"} onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}>
                <textarea ref={taRef} value={input} onChange={onTa} onKeyDown={onKey} rows={1}
                  placeholder={activeTab === "projects" ? "Describe your IT challenge, or ask about any project..." : "Ask about certifications, training plans..."}
                  style={{flex:1,background:"transparent",border:"none",color:"#e8eaed",fontSize:mobile?16:14,lineHeight:1.5,minHeight:22,maxHeight:120,padding:"6px 0"}}/>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <button className="ibtn" onClick={() => fileRef.current?.click()} title="Attach file" style={{width:32,height:32,background:"transparent",border:"none",borderRadius:7,color:"#6b7280",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>📎</button>
                  {loading ? (
                    <button onClick={stopGeneration} title="Stop" style={{width:32,height:32,background:"#ef4444",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>■</button>
                  ) : (
                    <button onClick={() => send()} disabled={!input.trim() && !attachedFile} title="Send" style={{width:32,height:32,background:(!input.trim() && !attachedFile)?"rgba(94,106,210,0.3)":"#5e6ad2",border:"none",borderRadius:7,color:"#fff",cursor:(!input.trim() && !attachedFile)?"not-allowed":"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.csv" onChange={handleFileSelect} style={{display:"none"}}/>
              {!mobile && (
                <div style={{fontSize:11,color:"#6b7280",textAlign:"center",marginTop:8}}>
                  Press <kbd style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,background:"#12161d",padding:"1px 5px",borderRadius:3,border:"1px solid rgba(255,255,255,0.08)"}}>Enter</kbd> to send, <kbd style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,background:"#12161d",padding:"1px 5px",borderRadius:3,border:"1px solid rgba(255,255,255,0.08)"}}>Shift</kbd>+<kbd style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,background:"#12161d",padding:"1px 5px",borderRadius:3,border:"1px solid rgba(255,255,255,0.08)"}}>Enter</kbd> for new line
                </div>
              )}
            </div>
          </div>

        </main>

        {/* ============ MODALS ============ */}
        {showContact && (
          <>
            <div onClick={() => setShowContact(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:"min(440px, calc(100vw - 24px))",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
                  <img src="/pete.jpg" alt="Pete Matsoukas" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",border:"2px solid rgba(94,106,210,0.5)",flexShrink:0}}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3,fontWeight:600}}>Contact</div>
                    <div style={{fontSize:17,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em",lineHeight:1.2}}>Pete Matsoukas</div>
                    <div style={{fontSize:12,color:"#a5b4fc",marginTop:2,lineHeight:1.4}}>IT Solutions Architect · Active Microsoft Certified Trainer (MCT)</div>
                  </div>
                </div>
                <button onClick={() => setShowContact(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#9ca3af",cursor:"pointer",width:32,height:32,fontSize:14,flexShrink:0}}>×</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <a href={"mailto:"+CONTACT.email} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,textDecoration:"none"}}>
                  <span style={{fontSize:18}}>✉️</span>
                  <div>
                    <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Email</div>
                    <div style={{fontSize:13,color:"#a5b4fc",fontWeight:500}}>{CONTACT.email}</div>
                  </div>
                </a>
                <a href={"tel:"+CONTACT.phone} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,textDecoration:"none"}}>
                  <span style={{fontSize:18}}>📞</span>
                  <div>
                    <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Phone · WhatsApp</div>
                    <div style={{fontSize:13,color:"#a5b4fc",fontWeight:500}}>{CONTACT.phone}</div>
                  </div>
                </a>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(94,106,210,0.08)",border:"1px solid rgba(94,106,210,0.25)",borderRadius:10,textDecoration:"none"}}>
                  <span style={{fontSize:18}}>📅</span>
                  <div>
                    <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>Book a meeting</div>
                    <div style={{fontSize:13,color:"#a5b4fc",fontWeight:500}}>30-min scoping call</div>
                  </div>
                </a>
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,textDecoration:"none"}}>
                  <span style={{fontSize:18}}>💼</span>
                  <div>
                    <div style={{fontSize:10,color:"#6b7280",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>LinkedIn</div>
                    <div style={{fontSize:13,color:"#a5b4fc",fontWeight:500}}>Full profile & CV</div>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}

        {showMeetPete && (
          <>
            <div onClick={() => setShowMeetPete(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:"min(480px, calc(100vw - 24px))",maxHeight:"85vh",overflowY:"auto",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <img src="/pete.jpg" alt="Pete" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",objectPosition:"center top",border:"2px solid rgba(94,106,210,0.5)",margin:"0 auto 12px",display:"block"}}/>
                <div style={{fontSize:20,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em"}}>Pete Matsoukas</div>
                <div style={{fontSize:13,color:"#a5b4fc",marginTop:4}}>IT Solutions Architect · MCT Trainer</div>
              </div>
              <p style={{fontSize:13.5,color:"#d1d5db",lineHeight:1.6,marginBottom:16,textAlign:"center"}}>15+ years designing production IT solutions across Azure, M365, on-premises, and networking. Active Microsoft Certified Trainer.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                {[
                  {i:"🪟",l:"Microsoft Architect & MCT"},
                  {i:"🔵",l:"VMware Expert"},
                  {i:"🔗",l:"Networking Expert"},
                ].map((b,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10}}>
                    <span style={{fontSize:18}}>{b.i}</span>
                    <span style={{fontSize:14,color:"#e8eaed",fontWeight:600,letterSpacing:"-0.005em"}}>{b.l}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowMeetPete(false); setShowContact(true); }} style={{width:"100%",background:"#5e6ad2",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                Contact Pete →
              </button>
            </div>
          </>
        )}

        {showROI && <ROICalculator onClose={() => setShowROI(false)} onAskPete={(u,s,a,sv) => send(`Based on my environment: ${u} users, $${s}/month Azure spend, ${a}-year old infrastructure. Your calculator estimates ~$${sv.toLocaleString()} annual savings. Design me a specific optimization plan.`)} mobile={mobile}/>}

        {showSecureScoreScan && <SecureScoreScanner onClose={() => setShowSecureScoreScan(false)} onAskPete={(prompt) => send(prompt)} mobile={mobile}/>}

        {showLeadCapture && <LeadCaptureModal onClose={() => setShowLeadCapture(false)} onSubmit={(email) => { setCapturedEmail(email); setShowLeadCapture(false); }}/>}

        {showKnowledgeReview && (
          <>
            <div onClick={() => setShowKnowledgeReview(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(600px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:16,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em"}}>💡 Knowledge Base</div>
                <button onClick={() => setShowKnowledgeReview(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#9ca3af",cursor:"pointer",width:32,height:32,fontSize:14}}>×</button>
              </div>
              {pendingKnowledge.content && (
                <>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:11,color:"#9ca3af",fontWeight:500,marginBottom:6,display:"block",letterSpacing:"0.04em",textTransform:"uppercase"}}>Title</label>
                    <input value={pendingKnowledge.title} onChange={e => setPendingKnowledge(p => ({...p, title: e.target.value}))} style={{width:"100%",background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
                  </div>
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,color:"#9ca3af",fontWeight:500,marginBottom:6,display:"block",letterSpacing:"0.04em",textTransform:"uppercase"}}>Content</label>
                    <textarea value={pendingKnowledge.content} onChange={e => setPendingKnowledge(p => ({...p, content: e.target.value}))} rows={8} style={{width:"100%",background:"#0a0d12",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#e8eaed",fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.6}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:20}}>
                    <button onClick={approveKnowledge} disabled={pendingKnowledge.title==="Generating summary..."} style={{flex:1,background:pendingKnowledge.title==="Generating summary..."?"rgba(94,106,210,0.3)":"#5e6ad2",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:13,fontWeight:500,cursor:pendingKnowledge.title==="Generating summary..."?"wait":"pointer"}}>
                      ✓ Approve & Save
                    </button>
                    <button onClick={() => { setShowKnowledgeReview(false); setPendingKnowledge({title:"",content:"",source:""}); }} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 20px",color:"#9ca3af",fontSize:13,fontWeight:500,cursor:"pointer"}}>Cancel</button>
                  </div>
                </>
              )}
              {learnedKnowledge.length > 0 && (
                <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:16}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:10}}>Saved Entries ({learnedKnowledge.length})</div>
                  {learnedKnowledge.map(e => (
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:"#e8eaed",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                        <div style={{fontSize:11,color:"#6b7280"}}>{new Date(e.date).toLocaleDateString()}</div>
                      </div>
                      <button onClick={() => deleteKnowledgeEntry(e.id)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13,padding:"4px 8px"}}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {showVendorUpdate && (
          <>
            <div onClick={() => setShowVendorUpdate(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,backdropFilter:"blur(6px)"}}/>
            <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:910,width:mobile?"calc(100vw - 24px)":"min(640px, 90vw)",maxHeight:"85vh",overflowY:"auto",background:"#12161d",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:16,fontWeight:600,color:"#ffffff",letterSpacing:"-0.01em"}}>🔄 Vendor Updates</div>
                <button onClick={() => setShowVendorUpdate(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#9ca3af",cursor:"pointer",width:32,height:32,fontSize:14}}>×</button>
              </div>
              {vendorUpdateStatus === "loading" && (
                <div style={{textAlign:"center",padding:"30px 0"}}>
                  <Dots/>
                  <p style={{color:"#a5b4fc",fontSize:13,marginTop:12}}>Searching for latest vendor news...</p>
                </div>
              )}
              {vendorUpdateStatus === "loading" && vendorUpdateContent && (
                <div style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14,maxHeight:300,overflowY:"auto"}}><Msg content={vendorUpdateContent}/></div>
              )}
              {vendorUpdateStatus === "ready" && (
                <>
                  <div style={{background:"#0a0d12",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14,marginBottom:14,maxHeight:400,overflowY:"auto"}}><Msg content={vendorUpdateContent}/></div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={approveVendorUpdate} style={{flex:1,background:"#5e6ad2",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>✓ Approve & Save</button>
                    <button onClick={() => setShowVendorUpdate(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 20px",color:"#9ca3af",fontSize:13,fontWeight:500,cursor:"pointer"}}>Discard</button>
                  </div>
                </>
              )}
              {vendorUpdateStatus === "saved" && (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:32,marginBottom:10}}>✓</div>
                  <p style={{color:"#26d07c",fontSize:14,fontWeight:500}}>Saved to knowledge base</p>
                  <button onClick={() => setShowVendorUpdate(false)} style={{marginTop:14,background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 20px",color:"#9ca3af",fontSize:13,fontWeight:500,cursor:"pointer"}}>Close</button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </>
  );
}
