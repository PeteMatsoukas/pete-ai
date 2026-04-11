import { useState, useRef, useEffect } from "react";

const CERTS = [
  { l: "Microsoft MCT", i: "🎓" },
  { l: "Azure & M365 Expert", i: "☁️" },
  { l: "MCP", i: "🏅" },
  { l: "5x VMware VCP", i: "🖥️" },
  { l: "CCNA R&S", i: "🔗" },
  { l: "CCNA Security", i: "🔒" },
  { l: "Dell Server & Storage", i: "💾" },
  { l: "HPE Server & Storage", i: "🗄️" },
];

const SUGS = [
  "Request a Server Room Refresh assessment",
  "Design a Zero Trust security architecture for M365",
  "Get a SOW for Azure cloud migration",
  "Plan a Hyper-V or VMware cluster refresh",
  "Design a FortiGate HA firewall with SD-WAN",
  "Get an Azure FinOps cost governance plan",
  "Plan a UniFi wireless refresh with RADIUS",
  "Request an M365 migration SOW",
];

function Logo({ size, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="50" cy="50" r="49" fill="#7ab2d4" />
      <circle cx="50" cy="50" r="44" fill="#0d1b3e" />
      <circle cx="50" cy="50" r="43" fill="#7ab2d4" />
      <circle cx="50" cy="50" r="39" fill="#0d1b3e" />
      <ellipse cx="42" cy="36" rx="17" ry="12" fill="white" />
      <ellipse cx="57" cy="39" rx="13" ry="10" fill="white" />
      <ellipse cx="30" cy="41" rx="9" ry="7" fill="white" />
      <rect x="27" y="41" width="42" height="7" fill="white" />
      <rect x="38" y="36" width="21" height="20" rx="2" fill="#7ab2d4" />
      <rect x="40" y="39" width="17" height="2" rx="0.8" fill="#0d1b3e" />
      <rect x="40" y="42.5" width="17" height="2" rx="0.8" fill="#0d1b3e" />
      <rect x="40" y="46" width="17" height="2" rx="0.8" fill="#0d1b3e" />
      <rect x="40" y="49.5" width="17" height="2" rx="0.8" fill="#0d1b3e" />
      <rect x="28" y="34" width="8" height="10" rx="1" fill="none" stroke="#0d1b3e" strokeWidth="1.5" />
      <line x1="30" y1="37" x2="34" y2="37" stroke="#0d1b3e" strokeWidth="0.9" />
      <line x1="30" y1="39" x2="34" y2="39" stroke="#0d1b3e" strokeWidth="0.9" />
      <line x1="30" y1="41" x2="34" y2="41" stroke="#0d1b3e" strokeWidth="0.9" />
      <circle cx="65" cy="30" r="2.5" fill="#0d1b3e" />
      <circle cx="71" cy="38" r="2" fill="#0d1b3e" />
      <line x1="65" y1="30" x2="71" y2="38" stroke="#0d1b3e" strokeWidth="1.2" />
      <line x1="59" y1="34" x2="65" y2="30" stroke="#0d1b3e" strokeWidth="1.2" />
      <text x="50" y="70" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="2.5">TECH</text>
      <text x="50" y="79" textAnchor="middle" fill="white" fontSize="6" fontWeight="400" fontFamily="Arial,sans-serif" letterSpacing="2">BY PETE</text>
    </svg>
  );
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function renderInline(text) {
  const parts = [], re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[0].startsWith("**")) parts.push(<strong key={k++} style={{ color: "#e2e8f0", fontWeight: 700 }}>{m[0].slice(2, -2)}</strong>);
    else parts.push(<code key={k++} style={{ background: "#0a1628", color: "#7ab2d4", padding: "1px 6px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{m[0].slice(1, -1)}</code>);
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
      els.push(<pre key={k++} style={{ background: "#050d1a", border: "1px solid rgba(122,178,212,0.2)", borderRadius: 8, padding: "14px 16px", overflowX: "auto", fontFamily: "monospace", fontSize: 12.5, color: "#7ab2d4", margin: "12px 0", lineHeight: 1.65 }}><code>{code.join("\n")}</code></pre>);
      i++; continue;
    }
    if (l.includes("|") && lines[i + 1]?.match(/^\|?[\s\-|]+\|?$/)) {
      const hdrs = l.split("|").map(h => h.trim()).filter(Boolean); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) { rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean)); i++; }
      els.push(<div key={k++} style={{ overflowX: "auto", margin: "14px 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr>{hdrs.map((h, hi) => <th key={hi} style={{ background: "rgba(13,27,62,0.9)", color: "#7ab2d4", padding: "8px 14px", textAlign: "left", borderBottom: "1px solid rgba(122,178,212,0.2)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead><tbody>{rows.map((r, ri) => <tr key={ri} style={{ borderBottom: "1px solid rgba(122,178,212,0.08)" }}>{r.map((c, ci) => <td key={ci} style={{ padding: "8px 14px", color: "#cbd5e1", fontSize: 13, background: ri % 2 === 0 ? "transparent" : "rgba(13,27,62,0.3)" }}>{renderInline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (l.startsWith("## ")) { els.push(<h3 key={k++} style={{ color: "#7ab2d4", fontSize: 14.5, fontWeight: 700, margin: "18px 0 7px" }}>{l.slice(3)}</h3>); i++; continue; }
    if (l.startsWith("# ")) { els.push(<h2 key={k++} style={{ color: "#a8c8e0", fontSize: 16, fontWeight: 700, margin: "18px 0 8px" }}>{l.slice(2)}</h2>); i++; continue; }
    if (l.startsWith("---")) { els.push(<hr key={k++} style={{ border: "none", borderTop: "1px solid rgba(122,178,212,0.15)", margin: "16px 0" }} />); i++; continue; }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      const it = []; while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { it.push(lines[i].slice(2)); i++; }
      els.push(<ul key={k++} style={{ margin: "6px 0", paddingLeft: 20 }}>{it.map((x, xi) => <li key={xi} style={{ color: "#cbd5e1", fontSize: 13.5, marginBottom: 4, lineHeight: 1.65 }}>{renderInline(x)}</li>)}</ul>); continue;
    }
    if (/^\d+\. /.test(l)) {
      const it = []; while (i < lines.length && /^\d+\. /.test(lines[i])) { it.push(lines[i].replace(/^\d+\. /, "")); i++; }
      els.push(<ol key={k++} style={{ margin: "6px 0", paddingLeft: 20 }}>{it.map((x, xi) => <li key={xi} style={{ color: "#cbd5e1", fontSize: 13.5, marginBottom: 4, lineHeight: 1.65 }}>{renderInline(x)}</li>)}</ol>); continue;
    }
    if (l.trim() === "") { els.push(<div key={k++} style={{ height: 7 }} />); i++; continue; }
    els.push(<p key={k++} style={{ color: "#cbd5e1", fontSize: 13.5, lineHeight: 1.75, margin: "3px 0" }}>{renderInline(l)}</p>); i++;
  }
  return <div>{els}</div>;
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "13px 16px", alignItems: "center" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7ab2d4", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />)}
    </div>
  );
}

function Sidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  return (
    <div style={{ width: 210, background: "rgba(5,10,22,0.97)", borderRight: "1px solid rgba(122,178,212,0.12)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid rgba(122,178,212,0.12)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#2a4a62", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 9 }}>Conversations</div>
        <button onClick={onNew} style={{ width: "100%", background: "rgba(122,178,212,0.08)", border: "1px solid rgba(122,178,212,0.2)", borderRadius: 7, color: "#7ab2d4", fontSize: 12, fontWeight: 600, padding: "7px 0", cursor: "pointer", fontFamily: "inherit" }}>+ New Chat</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
        {sessions.length === 0 && <div style={{ color: "#1a3a5c", fontSize: 12, textAlign: "center", marginTop: 20 }}>No history yet</div>}
        {sessions.map(s => (
          <div key={s.id} onClick={() => onSelect(s.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 9px", borderRadius: 7, marginBottom: 3, cursor: "pointer", background: s.id === activeId ? "rgba(122,178,212,0.1)" : "transparent", border: s.id === activeId ? "1px solid rgba(122,178,212,0.2)" : "1px solid transparent", transition: "all .15s" }}>
            <span style={{ fontSize: 13 }}>💬</span>
            <span style={{ flex: 1, fontSize: 12, color: s.id === activeId ? "#7ab2d4" : "#2a4a62", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
            <button onClick={e => { e.stopPropagation(); onDelete(s.id); }} style={{ background: "none", border: "none", color: "#1a3a5c", cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const active = sessions.find(s => s.id === activeId);
  const msgs = active?.messages || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const newChat = () => {
    const id = uid();
    setSessions(p => [{ id, title: "New Chat", messages: [] }, ...p]);
    setActiveId(id);
    setInput("");
  };

  useEffect(() => { newChat(); }, []);

  const updateChat = (id, m) => setSessions(p => p.map(s => s.id !== id ? s : { ...s, messages: m, title: m.find(x => x.role === "user")?.content?.slice(0, 36) || "New Chat" }));

  const deleteChat = (id) => setSessions(p => {
    const n = p.filter(s => s.id !== id);
    if (id === activeId) { if (n.length) setActiveId(n[0].id); else newChat(); }
    return n;
  });

  const send = async () => {
    const t = input.trim();
    if (!t || loading || !activeId) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    const uMsg = { role: "user", content: t };
    const newMsgs = [...msgs, uMsg];
    updateChat(activeId, newMsgs);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "I encountered an issue. Please try again.";
      updateChat(activeId, [...newMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      updateChat(activeId, [...newMsgs, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const onTa = (e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#070d1a", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(122,178,212,0.2);border-radius:10px}
        textarea{resize:none}textarea:focus{outline:none}textarea::placeholder{color:#2a4a62}
        .sbtn:hover:not(:disabled){background:rgba(14,165,233,0.85)!important;transform:scale(1.04)}
        .sbtn:disabled{opacity:.3;cursor:not-allowed}
        .sug:hover{background:rgba(122,178,212,0.12)!important;border-color:rgba(122,178,212,0.35)!important;color:#a8c8e0!important}
        .fin{animation:fadeUp 0.28s ease forwards}
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%,rgba(13,40,80,0.9) 0%,#070d1a 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "8%", left: "15%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,130,210,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "5%", right: "10%", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(122,178,212,0.12)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(122,178,212,0.08)", pointerEvents: "none" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.1 }} xmlns="http://www.w3.org/2000/svg">
        <line x1="15%" y1="18%" x2="85%" y2="5%" stroke="#7ab2d4" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="5%" y1="75%" x2="40%" y2="20%" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="90%" y1="80%" x2="60%" y2="30%" stroke="#7ab2d4" strokeWidth="0.5" strokeDasharray="4 8" />
      </svg>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ background: "rgba(5,10,22,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(122,178,212,0.15)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setSidebar(v => !v)} style={{ background: "rgba(122,178,212,0.06)", border: "1px solid rgba(122,178,212,0.15)", borderRadius: 6, color: "#7ab2d4", cursor: "pointer", padding: "5px 9px", fontSize: 14, flexShrink: 0 }}>☰</button>
          <Logo size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>TechByPete</span>
              <span style={{ color: "#1a3a5c" }}>·</span>
              <span style={{ fontSize: 11.5, color: "#7ab2d4", fontWeight: 500, whiteSpace: "nowrap" }}>AI Agent</span>
              <span style={{ background: "rgba(56,189,248,0.08)", color: "#38bdf8", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(56,189,248,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>● Live</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
              {["Azure", "FinOps", "Zero Trust", "On-Prem HA", "Hyper-V · VMware", "Cisco · Ubiquiti · Fortinet"].map(t => (
                <span key={t} style={{ background: "rgba(122,178,212,0.05)", border: "1px solid rgba(122,178,212,0.1)", color: "#3a5a72", fontSize: 9.5, padding: "1px 7px", borderRadius: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {sidebar && <Sidebar sessions={sessions} activeId={activeId} onSelect={id => setActiveId(id)} onNew={newChat} onDelete={deleteChat} />}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 0" }}>
              <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 22px" }}>
                {msgs.length === 0 && (
                  <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 36 }}>
                    <Logo size={115} style={{ margin: "0 auto 18px", display: "block", filter: "drop-shadow(0 0 24px rgba(122,178,212,0.45))" }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 6, fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.02em" }}>
                      TechByPete <span style={{ color: "#7ab2d4", fontWeight: 400, fontSize: 18 }}>AI Agent</span>
                    </h2>
                    <p style={{ color: "#3a5a72", fontSize: 13.5, maxWidth: 560, margin: "0 auto 18px", lineHeight: 1.65 }}>
                      Ask for a free <strong style={{ color: "#7ab2d4" }}>Assessment</strong>, <strong style={{ color: "#7ab2d4" }}>Solution Design</strong>, or <strong style={{ color: "#7ab2d4" }}>Statement of Work</strong> for your Server Room Refresh, Azure Migration, or M365 deployment — powered by <strong style={{ color: "#38bdf8" }}>15+ years of real-world IT expertise</strong>.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, maxWidth: 680, margin: "0 auto 26px" }}>
                      {CERTS.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(13,27,62,0.7)", border: "1px solid rgba(122,178,212,0.18)", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#7ab2d4", whiteSpace: "nowrap" }}>
                          <span>{c.i}</span><span>{c.l}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#2a4a62", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Rajdhani',sans-serif", marginBottom: 10 }}>What can I help you with today?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 700, margin: "0 auto" }}>
                      {SUGS.map((q, i) => (
                        <button key={i} className="sug" onClick={() => { setInput(q); taRef.current?.focus(); }} style={{ background: "rgba(13,27,62,0.6)", border: "1px solid rgba(122,178,212,0.15)", borderRadius: 10, padding: "12px 15px", color: "#7ab2d4", fontSize: 12.5, fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "all .2s", lineHeight: 1.45, fontFamily: "inherit" }}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}

                {msgs.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={idx} className="fin" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 18, gap: 10, alignItems: "flex-start" }}>
                      {!isUser && <div style={{ flexShrink: 0, marginTop: 2 }}><Logo size={30} /></div>}
                      <div style={{ maxWidth: "79%", background: isUser ? "linear-gradient(135deg,#0d2d6e,#0a1e4a)" : "rgba(8,18,40,0.95)", border: isUser ? "1px solid rgba(122,178,212,0.22)" : "1px solid rgba(122,178,212,0.1)", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}>
                        {isUser ? <p style={{ color: "#c8dff0", fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{msg.content}</p> : <Msg content={msg.content} />}
                      </div>
                      {isUser && <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "rgba(13,27,62,0.9)", border: "1px solid rgba(122,178,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7ab2d4", marginTop: 2 }}>U</div>}
                    </div>
                  );
                })}

                {loading && (
                  <div className="fin" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}>
                    <div style={{ flexShrink: 0 }}><Logo size={30} /></div>
                    <div style={{ background: "rgba(8,18,40,0.95)", border: "1px solid rgba(122,178,212,0.1)", borderRadius: "16px 16px 16px 4px" }}><Dots /></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(122,178,212,0.1)", background: "rgba(5,10,22,0.97)", padding: "12px 18px 16px", flexShrink: 0 }}>
              <div style={{ maxWidth: 820, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(13,27,62,0.6)", border: "1px solid rgba(122,178,212,0.18)", borderRadius: 12, padding: "10px 12px" }}>
                  <textarea ref={taRef} value={input} onChange={onTa} onKeyDown={onKey} placeholder="Request an Assessment, Solution Design, or SOW — Server Room, Azure, M365, Networking…" rows={1} style={{ flex: 1, background: "transparent", border: "none", color: "#c8dff0", fontSize: 13.5, lineHeight: 1.6, fontFamily: "inherit", minHeight: 24, maxHeight: 140 }} />
                  <button className="sbtn" onClick={send} disabled={!input.trim() || loading} style={{ background: "linear-gradient(135deg,#1a5a9a,#0ea5e9)", border: "none", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#fff", boxShadow: "0 0 12px rgba(14,165,233,0.2)", transition: "all .15s" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </button>
                </div>
                <div style={{ fontSize: 10, color: "#1a3a5c", textAlign: "center", marginTop: 8, fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.1em" }}>TECHBYPETE.COM · AI AGENT · ENTER TO SEND</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
