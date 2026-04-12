import { useState, useRef, useEffect } from "react";

const CONTACT = {
  email: "p.matsoukas@techbypete.com",
  phone: "+306909596515",
  linkedin: "https://www.linkedin.com/in/panosmatsoukas/",
};

const CERTS = [
  {l:"MCT",i:"🎓"},{l:"Azure Expert",i:"☁️"},{l:"MCP",i:"🏅"},
  {l:"5x VCP",i:"🖥️"},{l:"CCNA R&S",i:"🔗"},{l:"CCNA Sec",i:"🔒"},
  {l:"Dell",i:"💾"},{l:"HPE",i:"🗄️"},{l:"Fortinet FCP",i:"🛡️"},
  {l:"AZ-800",i:"📘"},{l:"AZ-801",i:"📗"},{l:"AZ-104",i:"📙"},
  {l:"MS-102",i:"📕"},{l:"MD-102",i:"📒"},{l:"VMware VCP",i:"🔵"},
];

const PROJECT_CARDS = [
  {q:"My server room is outdated — assess and refresh it", icon:"🖥️", desc:"Hardware, networking & infrastructure modernisation"},
  {q:"We need Zero Trust security across M365 & Azure", icon:"🔒", desc:"Conditional Access, Defender, Sentinel & compliance"},
  {q:"We want to migrate our infrastructure to Azure", icon:"☁️", desc:"Lift-and-shift, hybrid cloud or full Azure migration"},
  {q:"Our Hyper-V or VMware cluster needs upgrading", icon:"⚙️", desc:"HPE, Dell hardware refresh & virtualisation design"},
  {q:"We need a secure, resilient network with SD-WAN", icon:"🔗", desc:"FortiGate, Cisco, Ubiquiti — HA firewall & SD-WAN"},
  {q:"We're overspending on Azure — help us reduce costs", icon:"💰", desc:"FinOps, right-sizing, savings plans & governance"},
  {q:"Our WiFi is unreliable — design a new wireless network", icon:"📡", desc:"Site survey, AP placement, RADIUS & WPA3-Enterprise"},
  {q:"We need to migrate email and collaboration to M365", icon:"📧", desc:"Exchange, Teams, SharePoint, OneDrive & Intune"},
  {q:"We need to onboard Entra ID and deploy Intune", icon:"🪪", desc:"Identity modernisation, MDM, MAM & device compliance"},
  {q:"We need DR protection — on-premises to Azure", icon:"🔄", desc:"ASR replication, Recovery Plans & automated failover"},
  {q:"We need cross-region disaster recovery in Azure", icon:"🌍", desc:"ASR cross-region, Traffic Manager, App Gateway WAF v2"},
  {q:"Harden our Entra ID & M365 against cyber threats", icon:"🛡️", desc:"CIS Benchmark alignment, Conditional Access, Secure Score"},
];

const TRAINING_CARDS = [
  {q:"We need Microsoft Server & Azure training for our team", icon:"🎓", desc:"AZ-800, AZ-801, AZ-104 — delivered by certified MCT"},
  {q:"We need M365 & Intune training for our IT team", icon:"📚", desc:"MS-102, MD-102 — Microsoft 365 & endpoint management"},
  {q:"We need CCNA networking training for our engineers", icon:"🔗", desc:"CCNA R&S & Security — routing, switching, firewalls"},
  {q:"We need VMware vSphere training for our team", icon:"🔵", desc:"VMware VCP-level — virtualisation, vSAN, vMotion, HA/DRS"},
];

function uid(){return Math.random().toString(36).slice(2,9);}

function ContactCard({onClose}){
  return(
    <div style={{position:"fixed",bottom:80,right:24,zIndex:1000,background:"#1e2e42",border:"1px solid rgba(122,178,212,0.3)",borderRadius:16,padding:"20px 24px",width:290,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em",textTransform:"uppercase"}}>Get in Touch</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#4a6a82",cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {href:"mailto:"+CONTACT.email,icon:"✉️",label:"Email",val:CONTACT.email},
          {href:"tel:"+CONTACT.phone,icon:"📞",label:"Phone / WhatsApp",val:CONTACT.phone},
        ].map((c,i)=>(
          <a key={i} href={c.href} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"10px 14px",textDecoration:"none"}}>
            <span style={{fontSize:16}}>{c.icon}</span>
            <div><div style={{fontSize:10,color:"#4a6a82",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{c.label}</div>
            <div style={{fontSize:12,color:"#7ab2d4",fontWeight:600}}>{c.val}</div></div>
          </a>
        ))}
        <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:10,padding:"10px 14px",textDecoration:"none"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          <div><div style={{fontSize:10,color:"#4a6a82",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>LinkedIn</div>
          <div style={{fontSize:12,color:"#7ab2d4",fontWeight:600}}>View Full Profile & CV</div></div>
        </a>
      </div>
      <div style={{marginTop:12,padding:"10px 14px",background:"rgba(56,189,248,0.06)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:10,textAlign:"center"}}>
        <p style={{fontSize:11.5,color:"#4a6a82",margin:0,lineHeight:1.5}}>📅 Mention <strong style={{color:"#38bdf8"}}>Teams call</strong> in your email and I will send you a meeting invite</p>
      </div>
    </div>
  );
}

function renderInline(text){
  const parts=[],re=/(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last=0,m,k=0;
  while((m=re.exec(text))!==null){
    if(m.index>last)parts.push(<span key={k++}>{text.slice(last,m.index)}</span>);
    if(m[0].startsWith("**"))parts.push(<strong key={k++} style={{color:"#e2e8f0",fontWeight:700}}>{m[0].slice(2,-2)}</strong>);
    else parts.push(<code key={k++} style={{background:"#0f1e35",color:"#7ab2d4",padding:"1px 6px",borderRadius:4,fontSize:12,fontFamily:"monospace"}}>{m[0].slice(1,-1)}</code>);
    last=m.index+m[0].length;
  }
  if(last<text.length)parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length?parts:text;
}

function Msg({content}){
  const lines=content.split("\n"),els=[];let i=0,k=0;
  while(i<lines.length){
    const l=lines[i];
    if(l.startsWith("```")){const code=[];i++;while(i<lines.length&&!lines[i].startsWith("```")){code.push(lines[i]);i++;}els.push(<pre key={k++} style={{background:"#0f1e35",border:"1px solid rgba(122,178,212,0.2)",borderRadius:8,padding:"12px 14px",overflowX:"auto",fontFamily:"monospace",fontSize:12.5,color:"#7ab2d4",margin:"10px 0",lineHeight:1.6}}><code>{code.join("\n")}</code></pre>);i++;continue;}
    if(l.includes("|")&&lines[i+1]?.match(/^\|?[\s\-|]+\|?$/)){const hdrs=l.split("|").map(h=>h.trim()).filter(Boolean);i+=2;const rows=[];while(i<lines.length&&lines[i].includes("|")){rows.push(lines[i].split("|").map(c=>c.trim()).filter(Boolean));i++;}els.push(<div key={k++} style={{overflowX:"auto",margin:"12px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{hdrs.map((h,hi)=><th key={hi} style={{background:"rgba(122,178,212,0.1)",color:"#7ab2d4",padding:"7px 12px",textAlign:"left",borderBottom:"1px solid rgba(122,178,212,0.2)",fontWeight:600,fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,ri)=><tr key={ri} style={{borderBottom:"1px solid rgba(122,178,212,0.08)"}}>{r.map((c,ci)=><td key={ci} style={{padding:"7px 12px",color:"#cbd5e1",fontSize:13,background:ri%2===0?"transparent":"rgba(122,178,212,0.04)"}}>{renderInline(c)}</td>)}</tr>)}</tbody></table></div>);continue;}
    if(l.startsWith("## ")){els.push(<h3 key={k++} style={{color:"#7ab2d4",fontSize:14,fontWeight:700,margin:"14px 0 6px"}}>{l.slice(3)}</h3>);i++;continue;}
    if(l.startsWith("# ")){els.push(<h2 key={k++} style={{color:"#a8c8e0",fontSize:15,fontWeight:700,margin:"14px 0 6px"}}>{l.slice(2)}</h2>);i++;continue;}
    if(l.startsWith("---")){els.push(<hr key={k++} style={{border:"none",borderTop:"1px solid rgba(122,178,212,0.15)",margin:"12px 0"}}/>);i++;continue;}
    if(l.startsWith("- ")||l.startsWith("* ")){const it=[];while(i<lines.length&&(lines[i].startsWith("- ")||lines[i].startsWith("* "))){it.push(lines[i].slice(2));i++;}els.push(<ul key={k++} style={{margin:"6px 0",paddingLeft:18}}>{it.map((x,xi)=><li key={xi} style={{color:"#cbd5e1",fontSize:13.5,marginBottom:3,lineHeight:1.6}}>{renderInline(x)}</li>)}</ul>);continue;}
    if(/^\d+\. /.test(l)){const it=[];while(i<lines.length&&/^\d+\. /.test(lines[i])){it.push(lines[i].replace(/^\d+\. /,""));i++;}els.push(<ol key={k++} style={{margin:"6px 0",paddingLeft:18}}>{it.map((x,xi)=><li key={xi} style={{color:"#cbd5e1",fontSize:13.5,marginBottom:3,lineHeight:1.6}}>{renderInline(x)}</li>)}</ol>);continue;}
    if(l.trim()===""){els.push(<div key={k++} style={{height:6}}/>);i++;continue;}
    els.push(<p key={k++} style={{color:"#cbd5e1",fontSize:13.5,lineHeight:1.7,margin:"3px 0"}}>{renderInline(l)}</p>);i++;
  }
  return <div>{els}</div>;
}

function Dots(){
  return <div style={{display:"flex",gap:5,padding:"12px 14px",alignItems:"center"}}>
    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#7ab2d4",animation:"bounce 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
  </div>;
}

export default function App(){
  const [sessions,setSessions]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showContact,setShowContact]=useState(false);
  const [chatStarted,setChatStarted]=useState(false);
  const [activeTab,setActiveTab]=useState("projects");
  const bottomRef=useRef(null);
  const taRef=useRef(null);
  const active=sessions.find(s=>s.id===activeId);
  const msgs=active?.messages||[];

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  const newChat=()=>{const id=uid();setSessions(p=>[{id,title:"New Chat",messages:[]},...p]);setActiveId(id);setInput("");setChatStarted(false);};
  useEffect(()=>{newChat();},[]);
  const updateChat=(id,m)=>setSessions(p=>p.map(s=>s.id!==id?s:{...s,messages:m,title:m.find(x=>x.role==="user")?.content?.slice(0,36)||"New Chat"}));
  const deleteChat=(id)=>setSessions(p=>{const n=p.filter(s=>s.id!==id);if(id===activeId){if(n.length)setActiveId(n[0].id);else newChat();}return n;});

  const send=async(text)=>{
    const t=(text||input).trim();if(!t||loading||!activeId)return;
    setInput("");setChatStarted(true);
    if(taRef.current)taRef.current.style.height="auto";
    const uMsg={role:"user",content:t};
    const newMsgs=[...msgs,uMsg];
    updateChat(activeId,newMsgs);setLoading(true);
    try{
      const response=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content}))})
      });
      const data=await response.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"I encountered an issue. Please try again.";
      updateChat(activeId,[...newMsgs,{role:"assistant",content:reply}]);
    }catch(e){updateChat(activeId,[...newMsgs,{role:"assistant",content:"Connection error. Please try again."}]);}
    finally{setLoading(false);}
  };

  const onKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
  const onTa=(e)=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";};

  return(
    <>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(122,178,212,0.25);border-radius:10px}
        textarea{resize:none}textarea:focus{outline:none}textarea::placeholder{color:#4a6a82}
        .sbtn:hover:not(:disabled){background:#0ea5e9!important;transform:scale(1.04)}
        .sbtn:disabled{opacity:.3;cursor:not-allowed}
        .card:hover{background:rgba(122,178,212,0.1)!important;border-color:rgba(122,178,212,0.4)!important}
        .card:hover .ct{color:#a8d4f0!important}
        .fin{animation:fadeUp 0.25s ease forwards}
        .newchat:hover{background:rgba(122,178,212,0.2)!important}
        .chatitem:hover{background:rgba(122,178,212,0.06)!important}
      `}</style>

      <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#162032",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e2e8f0",overflow:"hidden"}}>

        {/* TOP NAV */}
        <div style={{background:"#1a2840",borderBottom:"1px solid rgba(122,178,212,0.15)",padding:"8px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <img src="/pete.jpg" alt="Pete" style={{width:32,height:32,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0}}/>
          <span style={{fontSize:14,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.02em"}}>Pete Matsoukas</span>
          <span style={{color:"#2a4a62",fontSize:12}}>·</span>
          <span style={{fontSize:11,color:"#7ab2d4",fontWeight:600}}>IT Solutions Architect & MCT Trainer</span>
          <span style={{background:"rgba(52,211,153,0.12)",color:"#34d399",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,border:"1px solid rgba(52,211,153,0.2)",letterSpacing:"0.1em",textTransform:"uppercase"}}>● Live</span>
          <div style={{flex:1}}/>
          <button onClick={()=>setShowContact(v=>!v)} style={{background:"linear-gradient(135deg,#1a5a9a,#0ea5e9)",border:"none",borderRadius:20,padding:"7px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>
            <span>💬</span> Contact Pete
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>

          {/* LEFT PANEL */}
          <div style={{width:280,background:"#1a2840",borderRight:"1px solid rgba(122,178,212,0.12)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>

            {/* New Chat button — top of sidebar */}
            <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(122,178,212,0.15)",background:"#162032"}}>
              <button className="newchat" onClick={newChat} style={{width:"100%",background:"linear-gradient(135deg,#1a5a9a,#0ea5e9)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,padding:"10px 0",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 0 12px rgba(14,165,233,0.25)"}}>
                <span style={{fontSize:16}}>✏️</span> Start New Conversation
              </button>
            </div>

            {/* Profile */}
            <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(122,178,212,0.1)",textAlign:"center"}}>
              <img src="/pete.jpg" alt="Pete Matsoukas" style={{width:80,height:80,borderRadius:"50%",border:"3px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",margin:"0 auto 12px",display:"block",boxShadow:"0 0 20px rgba(122,178,212,0.2)"}}/>
              <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",fontFamily:"'Rajdhani',sans-serif"}}>Pete Matsoukas</div>
              <div style={{fontSize:12.5,color:"#7ab2d4",fontWeight:600,marginTop:3}}>IT Solutions Architect & MCT Trainer</div>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
                <a href="https://www.techbypete.com" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#4a6a82",textDecoration:"none",justifyContent:"center"}}>🌐 techbypete.com</a>
                <a href={"mailto:"+CONTACT.email} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#4a6a82",textDecoration:"none",justifyContent:"center"}}>✉️ {CONTACT.email}</a>
                <a href={"tel:"+CONTACT.phone} style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#4a6a82",textDecoration:"none",justifyContent:"center"}}>📞 {CONTACT.phone}</a>
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#4a6a82",textDecoration:"none",justifyContent:"center"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn Profile & CV
                </a>
              </div>
            </div>

            {/* Credentials */}
            <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(122,178,212,0.1)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Credentials</div>
              {[{m:"🥇",l:"Microsoft MCT"},{m:"🥈",l:"MCP Certified"},{m:"🥉",l:"5x VMware VCP"}].map((b,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.12)",borderRadius:8,padding:"8px 12px",marginBottom:5}}>
                  <span style={{fontSize:16}}>{b.m}</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#a8c8e0"}}>{b.l}</span>
                </div>
              ))}
            </div>

            {/* Training */}
            <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(122,178,212,0.1)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Training Delivered</div>
              {[
                {i:"📘",l:"AZ-800 · AZ-801",d:"Windows Server Hybrid"},
                {i:"📙",l:"AZ-104",d:"Azure Administrator"},
                {i:"📕",l:"MS-102",d:"M365 Administrator"},
                {i:"📒",l:"MD-102",d:"Intune & Endpoint"},
                {i:"🔗",l:"CCNA R&S & Security",d:"Routing & Switching"},
                {i:"🔵",l:"VMware VCP",d:"vSphere, vSAN, HA/DRS"},
              ].map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,background:"rgba(122,178,212,0.04)",border:"1px solid rgba(122,178,212,0.08)",borderRadius:7,padding:"7px 12px",marginBottom:5}}>
                  <span style={{fontSize:14}}>{c.i}</span>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:700,color:"#7ab2d4"}}>{c.l}</div>
                    <div style={{fontSize:11,color:"#3a5a72"}}>{c.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(122,178,212,0.1)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Certifications</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {CERTS.map((c,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(122,178,212,0.06)",border:"1px solid rgba(122,178,212,0.12)",borderRadius:20,padding:"4px 10px",fontSize:11.5,fontWeight:600,color:"#7ab2d4",whiteSpace:"nowrap"}}>
                    <span>{c.i}</span><span>{c.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation history */}
            <div style={{padding:"14px 14px",flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:"#3a5a72",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Recent Conversations</div>
              {sessions.length===0&&<div style={{color:"#2a4a62",fontSize:12,textAlign:"center",marginTop:12}}>No conversations yet</div>}
              {sessions.map(s=>(
                <div key={s.id} className="chatitem" onClick={()=>{setActiveId(s.id);setChatStarted(s.messages.length>0);}} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:8,marginBottom:3,cursor:"pointer",background:s.id===activeId?"rgba(122,178,212,0.1)":"transparent",border:s.id===activeId?"1px solid rgba(122,178,212,0.2)":"1px solid transparent",transition:"all .15s"}}>
                  <span style={{fontSize:13}}>💬</span>
                  <span style={{flex:1,fontSize:12.5,color:s.id===activeId?"#7ab2d4":"#3a5a72",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</span>
                  <button onClick={e=>{e.stopPropagation();deleteChat(s.id);}} style={{background:"none",border:"none",color:"#2a4a62",cursor:"pointer",fontSize:14,padding:0}}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {!chatStarted ? (
              <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
                <div style={{maxWidth:760,margin:"0 auto"}}>
                  <div style={{background:"rgba(122,178,212,0.05)",border:"1px solid rgba(122,178,212,0.12)",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                    {activeTab==="projects" ? (
                      <p style={{color:"#cbd5e1",fontSize:15,lineHeight:1.7,margin:0}}>
                        👋 Hi! Get a free <strong style={{color:"#38bdf8"}}>Assessment</strong>, <strong style={{color:"#38bdf8"}}>Solution Design</strong>, or <strong style={{color:"#38bdf8"}}>Statement of Work</strong> for your IT infrastructure, cloud, or security needs — backed by <strong style={{color:"#f1f5f9"}}>15+ years</strong> of hands-on expertise. Select a topic below or type directly.
                      </p>
                    ):(
                      <p style={{color:"#cbd5e1",fontSize:15,lineHeight:1.7,margin:0}}>
                        🎓 Looking for <strong style={{color:"#38bdf8"}}>IT Training</strong> for your team? Pete is a certified <strong style={{color:"#f1f5f9"}}>Microsoft MCT</strong>, VMware VCP, Cisco CCNA and Fortinet FCP experienced trainer. Courses are available for <strong style={{color:"#38bdf8"}}>on-site</strong>, <strong style={{color:"#38bdf8"}}>remote</strong>, or <strong style={{color:"#38bdf8"}}>blended delivery</strong>. Select a course below or describe your training needs.
                      </p>
                    )}
                  </div>

                  <div style={{display:"flex",gap:0,marginBottom:16,background:"#1a2840",borderRadius:10,padding:4,border:"1px solid rgba(122,178,212,0.15)"}}>
                    {[{id:"projects",label:"🏗️ IT Projects & Solutions"},{id:"training",label:"🎓 Training & Courses"}].map(t=>(
                      <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,background:activeTab===t.id?"linear-gradient(135deg,#1a5a9a,#0ea5e9)":"transparent",border:"none",borderRadius:7,padding:"11px 16px",color:activeTab===t.id?"#fff":"#4a6a82",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",boxShadow:activeTab===t.id?"0 2px 8px rgba(14,165,233,0.25)":"none"}}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                    {activeTab==="projects"&&(
                    <>
                      <div style={{fontSize:12,color:"#3a5a72",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif",marginBottom:12}}>Select your IT challenge</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        {PROJECT_CARDS.map((c,i)=>(
                          <button key={i} className="card" onClick={()=>send(c.q)} style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.15)",borderRadius:12,padding:"16px 18px",cursor:"pointer",textAlign:"left",transition:"all .2s",lineHeight:1.45,fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
                            <div className="ct" style={{color:"#e2e8f0",fontWeight:600,fontSize:14,marginBottom:4,lineHeight:1.35}}>{c.q}</div>
                            <div style={{color:"#4a6a82",fontSize:12,fontWeight:400}}>{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab==="training"&&(
                    <>
                      <div style={{fontSize:12,color:"#3a5a72",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif",marginBottom:12}}>Select a training course</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        {TRAINING_CARDS.map((c,i)=>(
                          <button key={i} className="card" onClick={()=>send(c.q)} style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.15)",borderRadius:12,padding:"16px 18px",cursor:"pointer",textAlign:"left",transition:"all .2s",lineHeight:1.45,fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                            <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
                            <div className="ct" style={{color:"#e2e8f0",fontWeight:600,fontSize:14,marginBottom:4,lineHeight:1.35}}>{c.q}</div>
                            <div style={{color:"#4a6a82",fontSize:12,fontWeight:400}}>{c.desc}</div>
                          </button>
                        ))}
                      </div>
                      <div style={{marginTop:16,background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.15)",borderRadius:12,padding:"14px 18px"}}>
                        <p style={{color:"#4a6a82",fontSize:13.5,lineHeight:1.65,margin:0}}>
                          🎓 All courses delivered by <strong style={{color:"#38bdf8"}}>Pete Matsoukas</strong> — certified <strong style={{color:"#a8c8e0"}}>Microsoft MCT</strong>, VMware VCP, Cisco CCNA and Fortinet FCP experienced trainer. Available for corporate on-site, remote or blended delivery.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ):(
              <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
                <div style={{maxWidth:760,margin:"0 auto"}}>
                  <button onClick={()=>setChatStarted(false)} style={{background:"rgba(122,178,212,0.08)",border:"1px solid rgba(122,178,212,0.2)",borderRadius:8,color:"#7ab2d4",fontSize:12,fontWeight:600,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>← Back to topics</button>
                  {msgs.map((msg,idx)=>{
                    const isUser=msg.role==="user";
                    return(
                      <div key={idx} className="fin" style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:14,gap:8,alignItems:"flex-start"}}>
                        {!isUser&&<img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0,marginTop:2}}/>}
                        <div style={{maxWidth:"80%",background:isUser?"linear-gradient(135deg,#0d2d6e,#0a1e4a)":"#1e2e42",border:isUser?"1px solid rgba(122,178,212,0.25)":"1px solid rgba(122,178,212,0.12)",borderRadius:isUser?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"11px 15px",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                          {isUser?<p style={{color:"#c8dff0",fontSize:13.5,lineHeight:1.6,margin:0}}>{msg.content}</p>:<Msg content={msg.content}/>}
                        </div>
                        {isUser&&<div style={{width:28,height:28,borderRadius:7,flexShrink:0,background:"rgba(122,178,212,0.12)",border:"1px solid rgba(122,178,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#7ab2d4",marginTop:2}}>U</div>}
                      </div>
                    );
                  })}
                  {loading&&(
                    <div className="fin" style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:14}}>
                      <img src="/pete.jpg" alt="Pete" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #7ab2d4",objectFit:"cover",objectPosition:"center top",flexShrink:0}}/>
                      <div style={{background:"#1e2e42",border:"1px solid rgba(122,178,212,0.12)",borderRadius:"14px 14px 14px 4px"}}><Dots/></div>
                    </div>
                  )}
                  <div ref={bottomRef}/>
                </div>
              </div>
            )}

            {/* INPUT BAR */}
            <div style={{borderTop:"2px solid rgba(122,178,212,0.3)",background:"linear-gradient(180deg,#1a2840 0%,#0f1e35 100%)",padding:"16px 24px 20px",flexShrink:0,boxShadow:"0 -4px 24px rgba(14,165,233,0.08)"}}>
              <div style={{maxWidth:760,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px rgba(56,189,248,0.8)",animation:"bounce 2s infinite"}}/>
                  <div style={{fontSize:12,color:"#38bdf8",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Rajdhani',sans-serif"}}>
                    {!chatStarted&&activeTab==="training" ? "Ask about a training course or request a quote" : "Describe your IT challenge or ask a question"}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end",background:"#0a1525",border:"2px solid #38bdf8",borderRadius:16,padding:"14px 18px",boxShadow:"0 0 24px rgba(56,189,248,0.15), inset 0 0 24px rgba(56,189,248,0.03)"}}>
                  <textarea ref={taRef} value={input} onChange={onTa} onKeyDown={onKey}
                    placeholder={!chatStarted&&activeTab==="training"
                      ? "e.g. We need AZ-104 training for 10 engineers — remote delivery…"
                      : "e.g. We need to migrate our on-premises servers to Azure…"}
                    rows={2}
                    style={{flex:1,background:"transparent",border:"none",color:"#e2e8f0",fontSize:14.5,lineHeight:1.7,fontFamily:"inherit",minHeight:48,maxHeight:120}}/>
                  <button className="sbtn" onClick={()=>send()} disabled={!input.trim()||loading}
                    style={{background:"linear-gradient(135deg,#0078d4,#0ea5e9)",border:"none",borderRadius:12,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:"#fff",transition:"all .15s",boxShadow:"0 0 20px rgba(14,165,233,0.5)"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
                <div style={{fontSize:10,color:"#1a3a5c",textAlign:"center",marginTop:8,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.1em"}}>TECHBYPETE.COM · AI AGENT · PRESS ENTER TO SEND</div>
              </div>
            </div>
          </div>
        </div>

        {showContact&&<ContactCard onClose={()=>setShowContact(false)}/>}
      </div>
    </>
  );
}