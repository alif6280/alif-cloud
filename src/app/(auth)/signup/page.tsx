"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Terminal, Shield, Wifi, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const chars = "アイウエオカキクケコ01001101010110ABCDEF@#$%&*<>/\\[]{}";
    const fontSize = 14;
    let drops: number[] = Array(Math.floor(canvas.width / fontSize)).fill(1);
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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.55, pointerEvents: "none", zIndex: 0 }} />;
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
        if (charIdx - 1 === 0) { setDeleting(false); setIdx(i => (i + 1) % texts.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? 25 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed]);
  return display;
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [time, setTime] = useState("");
  const typed = useTyping(["CREATING NEW IDENTITY...", "REGISTERING SECURE ACCESS...", "INITIALIZING USER PROFILE...", "ACCESS REQUEST TERMINAL READY"]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString("en-US", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    // Check allowed emails whitelist
    const { count: whitelistCount } = await supabase
      .from("allowed_emails")
      .select("id", { count: "exact", head: true });

    // If whitelist has entries, check if this email is in it
    if (whitelistCount && whitelistCount > 0) {
      const { data: allowed } = await supabase
        .from("allowed_emails")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (!allowed) {
        setError("EMAIL_NOT_AUTHORIZED :: Contact administrator");
        setLoading(false);
        return;
      }
    }

    const { error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signupErr) {
      setError(signupErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (success) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <MatrixCanvas />
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10, textAlign: "center" }}>
        <div style={{ background: "rgba(0,12,4,0.96)", border: "1px solid rgba(0,255,65,0.2)", borderRadius: 12, padding: "3rem 2rem", backdropFilter: "blur(20px)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", color: "#00ff41", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>ACCESS_GRANTED</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(0,255,65,0.5)", lineHeight: 1.6 }}>
            Confirmation link sent to<br />
            <span style={{ color: "#00ff41" }}>{email}</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.25)", marginTop: "1rem" }}>
            Redirecting to login...
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <MatrixCanvas />

      <div style={{ position: "fixed", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.6), transparent)", animation: "scanDown 5s linear infinite", zIndex: 2, pointerEvents: "none" }} />

      <div style={{ position: "fixed", top: "1.25rem", left: "1.25rem", zIndex: 5, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff41", boxShadow: "0 0 8px #00ff41", animation: "pulse 2s infinite" }} />
        <span style={{ color: "rgba(0,255,65,0.7)", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SYS.ONLINE</span>
      </div>

      <div style={{ position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 5, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Wifi style={{ width: 12, height: 12, color: "rgba(0,255,65,0.6)" }} />
        <span style={{ color: "rgba(0,255,65,0.6)", fontFamily: "monospace", fontSize: "0.7rem" }}>{time}</span>
      </div>

      <div style={{ position: "fixed", bottom: "1.25rem", left: "1.25rem", zIndex: 5 }}>
        <span style={{ color: "rgba(0,255,65,0.25)", fontFamily: "monospace", fontSize: "0.65rem" }}>v2.4.1 // ALIF-CLOUD-OS</span>
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>
        {/* Terminal bar */}
        <div style={{ background: "rgba(0,15,5,0.97)", border: "1px solid rgba(0,255,65,0.25)", borderBottom: "1px solid rgba(0,255,65,0.08)", borderRadius: "12px 12px 0 0", padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal style={{ width: 13, height: 13, color: "rgba(0,255,65,0.5)" }} />
            <span style={{ color: "rgba(0,255,65,0.5)", fontFamily: "monospace", fontSize: "0.72rem" }}>alif-cloud://auth/register</span>
          </div>
          <Shield style={{ width: 13, height: 13, color: "rgba(0,255,65,0.4)" }} />
        </div>

        {/* Card body */}
        <div style={{ background: "rgba(0,12,4,0.96)", border: "1px solid rgba(0,255,65,0.2)", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "2rem 2rem 1.75rem", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(0,255,65,0.08), 0 30px 80px rgba(0,0,0,0.8)", position: "relative" }}>
          {[{ top: -1, left: -1, borderWidth: "2px 0 0 2px" }, { top: -1, right: -1, borderWidth: "2px 2px 0 0" }, { bottom: -1, left: -1, borderWidth: "0 0 2px 2px" }, { bottom: -1, right: -1, borderWidth: "0 2px 2px 0" }].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 14, height: 14, borderStyle: "solid", borderColor: "rgba(0,255,65,0.5)", ...s }} />
          ))}

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 12, border: "1px solid rgba(0,255,65,0.25)", background: "rgba(0,255,65,0.05)", marginBottom: "0.875rem", boxShadow: "0 0 20px rgba(0,255,65,0.1)" }}>
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <rect x="4" y="4" width="28" height="28" rx="6" stroke="#00ff41" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7"/>
                <path d="M18 9 L28 27 L8 27 Z" stroke="#00ff41" strokeWidth="1.5" fill="rgba(0,255,65,0.08)" strokeLinejoin="round"/>
                <circle cx="18" cy="19" r="3.5" fill="#00ff41" opacity="0.35"/>
                <circle cx="18" cy="19" r="1.5" fill="#00ff41" opacity="0.8"/>
              </svg>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.18em", fontFamily: "monospace", color: "#00ff41", textShadow: "0 0 15px rgba(0,255,65,0.7)", marginBottom: "0.3rem" }}>ALIF.CLOUD</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "rgba(0,255,65,0.45)", height: "1.1em", letterSpacing: "0.04em" }}>
              {typed}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: "1rem", padding: "0.625rem 0.875rem", background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 6, color: "#ff6b6b", fontFamily: "monospace", fontSize: "0.75rem" }}>
              [ERR] {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div style={{ marginBottom: "0.875rem" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>// DISPLAY_NAME</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required
                style={{ width: "100%", padding: "0.65rem 1rem", background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.18)", borderRadius: 7, color: "#00ff41", fontFamily: "monospace", fontSize: "0.875rem", outline: "none", caretColor: "#00ff41", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,255,65,0.5)"; e.target.style.background = "rgba(0,255,65,0.07)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.07)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,255,65,0.18)"; e.target.style.background = "rgba(0,255,65,0.04)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "0.875rem" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>// USER_IDENTIFIER</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", color: "rgba(0,255,65,0.4)", fontSize: "0.85rem", pointerEvents: "none" }}>@</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@domain.com" required
                  style={{ width: "100%", padding: "0.65rem 1rem 0.65rem 2rem", background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.18)", borderRadius: 7, color: "#00ff41", fontFamily: "monospace", fontSize: "0.875rem", outline: "none", caretColor: "#00ff41", boxSizing: "border-box", transition: "all 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,255,65,0.5)"; e.target.style.background = "rgba(0,255,65,0.07)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,255,65,0.18)"; e.target.style.background = "rgba(0,255,65,0.04)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>// PASSPHRASE</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", color: "rgba(0,255,65,0.4)", fontSize: "0.85rem", pointerEvents: "none" }}>#</span>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8}
                  style={{ width: "100%", padding: "0.65rem 2.75rem 0.65rem 2rem", background: "rgba(0,255,65,0.04)", border: "1px solid rgba(0,255,65,0.18)", borderRadius: 7, color: "#00ff41", fontFamily: "monospace", fontSize: "0.875rem", outline: "none", caretColor: "#00ff41", boxSizing: "border-box", transition: "all 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,255,65,0.5)"; e.target.style.background = "rgba(0,255,65,0.07)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,255,65,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,255,65,0.18)"; e.target.style.background = "rgba(0,255,65,0.04)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "rgba(0,255,65,0.45)", padding: 4, display: "flex" }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "0.8rem", background: loading ? "rgba(0,255,65,0.08)" : "linear-gradient(135deg, rgba(0,255,65,0.15), rgba(0,200,50,0.1))", border: "1px solid rgba(0,255,65,0.35)", borderRadius: 8, color: "#00ff41", fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 0 20px rgba(0,255,65,0.08)" }}
              onMouseOver={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,255,65,0.25)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.6)"; } }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,255,65,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,65,0.35)"; }}
            >
              {loading
                ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 0.7s linear infinite" }} /> REGISTERING...</>
                : <><UserPlus style={{ width: 14, height: 14 }} /> [ REQUEST_ACCESS ]</>
              }
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>// ALREADY REGISTERED?</p>
            <p style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "rgba(0,255,65,0.35)" }}>
              <a href="/login" style={{ color: "rgba(0,255,65,0.7)", textDecoration: "none", borderBottom: "1px solid rgba(0,255,65,0.3)" }}>[ EXECUTE_LOGIN ]</a>
            </p>
          </div>
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
