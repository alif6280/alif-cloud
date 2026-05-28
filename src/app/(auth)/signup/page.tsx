"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cloud, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (success) return (
    <div className="w-full max-w-md animate-slide-up text-center">
      <div className="glass rounded-2xl p-10 border border-white/[0.06]">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Check your email!</h2>
        <p className="text-slate-500 text-sm">We sent a confirmation link to <span className="text-brand-400">{email}</span>. Click it to activate your account.</p>
        <p className="text-slate-600 text-xs mt-4">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4 glow">
          <Cloud className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="text-3xl font-display font-bold gradient-text mb-1">Alif Cloud</h1>
        <p className="text-slate-500 text-sm">Create your personal cloud storage</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-white/[0.06]">
        <h2 className="text-xl font-display font-semibold text-white mb-6">Create account</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your name" className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" className="input-field pl-10 pr-10" minLength={8} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
