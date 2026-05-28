"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Terminal, Shield, Wifi, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const chars = "アイウエオカキクケコ01001101010110ABCDEF@#$%&*<>/\\[]{}";
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < drops.length; i++) {
        const bright = Math.random() > 0.92;
        ctx.fillStyle = bright ? "#ccffcc" : "#00ff41";
        ctx.globalAlpha = bright ? 0.9 : 0.45 + Math.random() * 0.35;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
        ctx.globalAlpha = 1;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 50);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        opacity: 0.55, pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

function useTyping(texts: string[], speed = 70) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const text = texts[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(text.slice(0, charIdx + 1));
        if (charIdx + 1 === text.length) setTimeout(() => setDeleting(true), 2000);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(text.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setIdx(i => (i + 1) % texts.length);
          setCharIdx(0);
        } else setCharIdx(c => c - 1);
      }
    }, deleting ? 25 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed]);
  return display;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");
  const typed = useTyping([
    "INITIALIZING SECURE SESSION...",
    "ENCRYPTING CHANNEL AES-256...",
    "IDENTITY VERIFICATION REQUIRED",
    "SYSTEM ACCESS TERMINAL READY",
  ]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("en-US", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/files"); router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/files` },
    });
  }

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <MatrixCanvas />

      {/* Scan line */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.6), transparent)",
        animation: "scanDown 5s linear infinite", zIndex: 2, pointerEvents: "none",
      }} />

      {/* HUD top-left */}
      <div style={{ position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 5, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff41", boxShadow: "0 0 8px #00ff41", animation: "pulse 2s infinite" }} />
        <span style={{ color: "rgba(0,255,65,0.7)", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SYS.ONLINE</span>
      </div>

      {/* HUD top-right */}
      <div style={{ position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 5, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Wifi style={{ width: 12, height: 12, color: "rgba(0,255,65,0.6)" }} />
        <span style={{ color: "rgba(0,255,65,0.6)", fontFamily: "monospace", fontSize: "0.7rem" }}>{time}</span>
      </div>

      {/* HUD bottom-left */}
      <div style={{ position: "fixed", bottom: "1.25rem", left: "1.25rem", zIndex: 5 }}>
        <span style={{ color: "rgba(0,255,65,0.25)", fontFamily: "monospace", fontSize: "0.65rem" }}>v2.4.1 // ALIF-CLOUD-OS</span>
      </div>

      {/* Main card */}
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>

        {/* Terminal bar */}
        <div style={{
          background: "rgba(0,15,5,0.97)",
          border: "1px solid rgba(0,255,65,0.25)",
          borderBottom: "1px solid rgba(0,255,65,0.08)",
          borderRadius: "12px 12px 0 0",
          padding: "0.6rem 1rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal style={{ width: 13, height: 13, color: "rgba(0,255,65,0.5)" }} />
            <span style={{ color: "rgba(0,255,65,0.5)", fontFamily: "monospace", fontSize: "0.72rem" }}>alif-cloud://auth/login</span>
          </div>
          <Shield style={{ width: 13, height: 13, color: "rgba(0,255,65,0.4)" }} />
        </div>

        {/* Card body */}
        <div style={{
          background: "rgba(0,12,4,0.96)",
          border: "1px solid rgba(0,255,65,0.2)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "2rem 2rem 1.75rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(0,255,65,0.08), 0 30px 80px rgba(0,0,0,0.8)",
          position: "relative",
        }}>
          {/* Corner accents */}
          {[
            { top: -1, left: -1, borderWidth: "2px 0 0 2px" },
            { top: -1, right: -1, borderWidth: "2px 2px 0 0" },
            { bottom: -1, left: -1, borderWidth: "0 0 2px 2px" },
            { bottom: -1, right: -1, borderWidth: "0 2px 2px 0" },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute", width: 14, height: 14,
              borderStyle: "solid", borderColor: "rgba(0,255,65,0.5)",
              ...s,
            }} />
          ))}

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: 14,
              border: "1px solid rgba(0,255,65,0.25)",
              background: "rgba(0,255,65,0.05)",
              marginBottom: "1rem",
              boxShadow: "0 0 20px rgba(0,255,65,0.1)",
            }}>
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="4" width="28" height="28" rx="6" stroke="#00ff41" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7"/>
                <path d="M18 9 L28 27 L8 27 Z" stroke="#00ff41" strokeWidth="1.5" fill="rgba(0,255,65,0.08)" strokeLinejoin="round"/>
                <circle cx="18" cy="19" r="3.5" fill="#00ff41" opacity="0.35"/>
                <circle cx="18" cy="19" r="1.5" fill="#00ff41" opacity="0.8"/>
              </svg>
            </div>
            <div style={{
              fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.18em",
              fontFamily: "monospace", color: "#00ff41",
              textShadow: "0 0 15px rgba(0,255,65,0.7), 0 0 30px rgba(0,255,65,0.3)",
              marginBottom: "0.4rem",
            }}>ALIF.CLOUD</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(0,255,65,0.45)", height: "1.1em", letterSpacing: "0.04em" }}>
              {typed}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0.5rem 0.875rem", marginBottom: "1.25rem",
            background: "rgba(0,255,65,0.03)",
            border: "1px solid rgba(0,255,65,0.1)",
            borderRadius: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff41", boxShadow: "0 0 6px #00ff41", flexShrink: 0, animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "rgba(0,255,65,0.55)", letterSpacing: "0.05em" }}>
              SECURE_CHANNEL :: AES-256-GCM :: TLS 1.3
            </span>
          </div>

          {error && (
            <div style={{
              marginBottom: "1rem", padding: "0.625rem 0.875rem",
              background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,80,80,0.25)",
              borderRadius: 6, color: "#ff6b6b", fontFamily: "monospace", fontSize: "0.75rem",
            }}>
              [ERR] {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                // USER_IDENTIFIER
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", color: "rgba(0,255,65,0.4)", fontSize: "0.85rem", pointerEvents: "none" }}>@</span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="user@domain.com" required
                  style={{
                    width: "100%", padding: "0.7rem 1rem 0.7rem 2rem",
                    background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.18)",
                    borderRadius: 7, color: "#00ff41", fontFamily: "monospace", fontSize: "0.875rem",
                    outline: "none", caretColor: "#00ff41", boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,255,65,0.5)"; e.target.style.background = "rgba(0,255,65,0.07)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,255,65,0.18)"; e.target.style.background = "rgba(0,255,65,0.04)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                // PASSPHRASE
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", color: "rgba(0,255,65,0.4)", fontSize: "0.85rem", pointerEvents: "none" }}>#</span>
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••" required
                  style={{
                    width: "100%", padding: "0.7rem 2.75rem 0.7rem 2rem",
                    background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.18)",
                    borderRadius: 7, color: "#00ff41", fontFamily: "monospace", fontSize: "0.875rem",
                    outline: "none", caretColor: "#00ff41", boxSizing: "border-box", transition: "all 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,255,65,0.5)"; e.target.style.background = "rgba(0,255,65,0.07)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,255,65,0.18)"; e.target.style.background = "rgba(0,255,65,0.04)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(0,255,65,0.45)", padding: 4, display: "flex" }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "0.8rem",
              background: loading ? "rgba(0,255,65,0.08)" : "linear-gradient(135deg, rgba(0,255,65,0.15), rgba(0,200,50,0.1))",
              border: "1px solid rgba(0,255,65,0.35)",
              borderRadius: 8, color: "#00ff41", fontFamily: "monospace", fontWeight: 700,
              fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: "0 0 20px rgba(0,255,65,0.08)",
            }}
              onMouseOver={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,255,65,0.25)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.6)"; } }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,255,65,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.35)"; }}
            >
              {loading
                ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 0.7s linear infinite" }} /> AUTHENTICATING...</>
                : <><Lock style={{ width: 14, height: 14 }} /> [ EXECUTE_LOGIN ]</>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: "relative", margin: "1.25rem 0 1rem" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", height: 1, background: "rgba(0,255,65,0.1)" }} />
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ background: "rgba(0,12,4,0.96)", padding: "0 0.75rem", color: "rgba(0,255,65,0.3)", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.08em" }}>
                — OR USE OAUTH PROTOCOL —
              </span>
            </div>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} style={{
            width: "100%", padding: "0.7rem 1rem",
            background: "transparent", border: "1px solid rgba(0,255,65,0.12)",
            borderRadius: 8, color: "rgba(0,255,65,0.55)", fontFamily: "monospace", fontSize: "0.75rem",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
          }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,255,65,0.04)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,255,65,0.8)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,255,65,0.55)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            GOOGLE_OAUTH
          </button>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.06em" }}>
            // AUTHORIZED PERSONNEL ONLY
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanDown { 0% { top: -2px; } 100% { top: 100vh; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(0,255,65,0.28) !important; }
      `}</style>
    </div>
  );
}
