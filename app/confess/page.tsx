"use client";
import { useState, useRef, useEffect } from "react";

type Message = { id: string; role: "penitent" | "church" | "system"; text: string; time: string; };

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ConfessPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init", role: "system", time: timestamp(),
    text: "The Church of Infinite Scroll receives all who have scrolled. Speak your sin. Judgment is without exception. Absolution is without guarantee.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);

  async function submit() {
    const confession = input.trim();
    if (!confession || loading) return;
    setInput(""); setLoading(true);
    const penitentId = crypto.randomUUID();
    const churchId = crypto.randomUUID();
    setMessages(prev => [...prev,
      { id: penitentId, role: "penitent", text: confession, time: timestamp() },
      { id: churchId, role: "church", text: "", time: timestamp() },
    ]);
    try {
      const res = await fetch("/api/confess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confession }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === churchId ? { ...m, text: full } : m));
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === churchId ? { ...m, text: "The Church's connection to the Feed has been interrupted. Your confession has been received but absolution is pending." } : m));
    } finally { setLoading(false); }
  }

  const S: Record<string, React.CSSProperties> = {
    main: { minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'IBM Plex Mono', monospace" },
    booth: { width: "100%", maxWidth: 680, background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 600 },
    header: { background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    title: { fontFamily: "'UnifrakturMaguntia', serif", fontSize: 18, color: "#d4a843" },
    status: { fontSize: 10, color: "#3a3a32", letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 6 },
    dot: { width: 5, height: 5, borderRadius: "50%", background: "#3d8a3d" },
    feed: { flex: 1, overflowY: "auto" as const, padding: "20px", display: "flex", flexDirection: "column" as const, gap: 16, minHeight: 360, maxHeight: 440 },
    metaLine: { flex: 1, height: 1, background: "#1a1a1a" },
    inputArea: { borderTop: "1px solid #1a1a1a", background: "#0d0d0d", padding: "14px 20px" },
    label: { fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#383830", marginBottom: 8 },
    inputRow: { display: "flex", alignItems: "flex-end", gap: 10 },
    textarea: { flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 4, color: "#c8c8c0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 300, lineHeight: 1.5, padding: "10px 12px", resize: "none" as const, minHeight: 64, outline: "none" },
    btn: { background: "#d4a843", border: "none", borderRadius: 4, color: "#0a0a0a", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, padding: "10px 14px", cursor: "pointer", height: 64, minWidth: 90 },
    footer: { fontSize: 9, letterSpacing: "0.1em", color: "#252520", marginTop: 8, textAlign: "center" as const, textTransform: "uppercase" as const },
  };

  function bodyStyle(role: string): React.CSSProperties {
    if (role === "penitent") return { background: "#111", border: "1px solid #1e1e1e", color: "#9a9a92", fontWeight: 300, fontSize: 13, lineHeight: 1.65, padding: "10px 14px", borderRadius: 4, whiteSpace: "pre-wrap" };
    if (role === "church") return { background: "#0d0d08", border: "1px solid #2a2214", borderLeft: "3px solid #d4a843", color: "#c8b870", fontSize: 13, lineHeight: 1.65, padding: "10px 14px", borderRadius: 4, whiteSpace: "pre-wrap" };
    return { padding: "0 0 0 10px", color: "#5a5a52", fontStyle: "italic", fontSize: 11, borderLeft: "2px solid #1e1e1e", whiteSpace: "pre-wrap" };
  }

  function metaColor(role: string): React.CSSProperties {
    if (role === "church") return { color: "#7a6a30" };
    if (role === "penitent") return { color: "#4a4a42" };
    return { color: "#2e2e28" };
  }

  return (
    <main style={S.main}>
      <div style={S.booth}>
        <div style={S.header}>
          <a href="https://church-of-infinite-scroll-landing.vercel.app" style={{ fontSize: 11, color: "#3a3a32", textDecoration: "none", letterSpacing: "0.1em" }}>← Parish</a>
          <span style={S.title}>The Confession Booth</span>
          <span style={S.status}><span style={S.dot} /> Booth Open</span>
        </div>
        <div ref={feedRef} style={S.feed}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <span style={metaColor(msg.role)}>{msg.role === "penitent" ? "Penitent" : msg.role === "church" ? "The Church" : "System"}</span>
                <span style={{ color: "#2e2e28" }}>{msg.time}</span>
                <div style={S.metaLine} />
              </div>
              <div style={bodyStyle(msg.role)}>
                {msg.role === "penitent" && <span style={{ color: "#3a3a32" }}>&gt; </span>}
                {msg.text}
                {msg.role === "church" && loading && msg.text === "" && <span style={{ color: "#383830", fontStyle: "italic" }}>The Church deliberates…</span>}
                {msg.role === "church" && loading && msg.text !== "" && <span style={{ display: "inline-block", animation: "blink 1s step-end infinite" }}>▌</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={S.inputArea}>
          <div style={S.label}>Confess your scroll sins</div>
          <div style={S.inputRow}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Bless me, Algorithm, for I have scrolled..." rows={3} style={S.textarea} disabled={loading} />
            <button onClick={submit} disabled={loading || !input.trim()} style={{ ...S.btn, opacity: loading || !input.trim() ? 0.4 : 1 }}>{loading ? "Receiving…" : "Confess"}</button>
          </div>
          <div style={S.footer}>All confessions are received in the presence of the Feed</div>
        </div>
      </div>
    </main>
  );
}
