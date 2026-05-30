"use client";
import { useEffect, useState, useCallback } from "react";
import { Mail, Plus, Trash2, Loader2, RefreshCw, Check, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AllowedEmail {
  id: string;
  email: string;
  note: string | null;
  created_at: string;
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadEmails = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("allowed_emails")
      .select("*")
      .order("created_at", { ascending: false });
    setEmails((data ?? []) as AllowedEmail[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadEmails(); }, [loadEmails]);

  async function addEmail() {
    if (!newEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      showToast("Invalid email format", "error");
      return;
    }
    setAdding(true);
    const supabase = createClient();
    const { error } = await supabase.from("allowed_emails").insert({
      email: newEmail.trim().toLowerCase(),
      note: newNote.trim() || null,
    });
    if (error) {
      showToast(
        error.code === "23505" ? "Email already in list" : "Failed to add email",
        "error"
      );
    } else {
      showToast("Email added to whitelist");
      setNewEmail("");
      setNewNote("");
      loadEmails();
    }
    setAdding(false);
  }

  async function removeEmail(item: AllowedEmail) {
    setDeletingId(item.id);
    const supabase = createClient();
    await supabase.from("allowed_emails").delete().eq("id", item.id);
    showToast(`${item.email} removed`);
    setEmails(prev => prev.filter(e => e.id !== item.id));
    setDeletingId(null);
  }

  async function bulkAdd() {
    const lines = bulkText
      .split("\n")
      .map(l => l.trim().toLowerCase())
      .filter(l => l && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l));
    if (lines.length === 0) { showToast("No valid emails found", "error"); return; }
    setBulkLoading(true);
    const supabase = createClient();
    const rows = lines.map(email => ({ email, note: "bulk import" }));
    const { error } = await supabase.from("allowed_emails").upsert(rows, { onConflict: "email" });
    if (error) { showToast("Bulk add failed", "error"); }
    else {
      showToast(`${lines.length} emails added`);
      setBulkText("");
      setBulkMode(false);
      loadEmails();
    }
    setBulkLoading(false);
  }

  const filtered = emails.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.note ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-pink-400" />
            Allowed Emails
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">{emails.length} emails in whitelist</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Bulk Add
          </button>
          <button
            onClick={loadEmails}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white text-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="flex gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          এই whitelist এ যে emails থাকবে শুধু তারাই sign up করতে পারবে।
          List খালি থাকলে সবাই sign up করতে পারবে।
        </p>
      </div>

      {/* Bulk add */}
      {bulkMode && (
        <div className="glass rounded-2xl p-5 border border-pink-500/15">
          <h3 className="text-sm font-semibold text-white mb-3">Bulk Add Emails</h3>
          <p className="text-xs text-slate-600 mb-2">One email per line</p>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={"alice@example.com\nbob@company.org\n..."}
            rows={5}
            className="input-field text-sm font-mono w-full resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={bulkAdd}
              disabled={bulkLoading}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add All
            </button>
            <button
              onClick={() => setBulkMode(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add single email */}
      <div className="glass rounded-2xl p-5 border border-white/[0.05]">
        <h3 className="text-sm font-semibold text-white mb-4">Add Email</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addEmail()}
            placeholder="user@example.com"
            className="input-field text-sm flex-1"
          />
          <input
            type="text"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addEmail()}
            placeholder="Note (optional)"
            className="input-field text-sm w-full sm:w-40"
          />
          <button
            onClick={addEmail}
            disabled={adding || !newEmail.trim()}
            className="btn-primary flex items-center justify-center gap-2 text-sm py-2 px-4 flex-shrink-0"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search emails..."
        className="input-field text-sm w-full max-w-xs"
      />

      {/* Email list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-600 text-sm">
              {emails.length === 0 ? "No emails in whitelist yet" : "No results"}
            </div>
          )}
          {filtered.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/[0.04] hover:border-white/[0.08] group transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/25 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{item.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.note && (
                    <span className="text-[10px] text-slate-600">{item.note}</span>
                  )}
                  <span className="text-[10px] text-slate-700">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeEmail(item)}
                disabled={deletingId === item.id}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs transition-all"
              >
                {deletingId === item.id
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Trash2 className="w-3 h-3" />
                }
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
