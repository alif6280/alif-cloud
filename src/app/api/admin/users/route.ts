import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") return null;
  return { user, adminDb };
}

// GET - সব users fetch
export async function GET() {
  const auth = await checkAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { adminDb } = auth;

  const { data: profiles } = await adminDb
    .from("profiles")
    .select("id, email, full_name, role, storage_used, storage_quota, is_blocked, blocked_reason, created_at")
    .order("created_at", { ascending: false });

  const { data: fileCounts } = await adminDb
    .from("files")
    .select("user_id")
    .eq("is_deleted", false);

  const countMap: Record<string, number> = {};
  fileCounts?.forEach((f: { user_id: string }) => {
    countMap[f.user_id] = (countMap[f.user_id] ?? 0) + 1;
  });

  const users = (profiles ?? []).map((u: any) => ({
    ...u,
    file_count: countMap[u.id] ?? 0,
  }));

  return NextResponse.json({ users });
}

// PATCH - role বা block update
export async function PATCH(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, action } = await request.json();
  if (!userId || !action) return NextResponse.json({ error: "userId and action required" }, { status: 400 });

  const { adminDb } = auth;

  if (action === "make_admin") {
    await adminDb.from("profiles").update({ role: "admin" }).eq("id", userId);
  } else if (action === "remove_admin") {
    await adminDb.from("profiles").update({ role: "user" }).eq("id", userId);
  } else if (action === "block") {
    await adminDb.from("profiles").update({ is_blocked: true, blocked_at: new Date().toISOString() }).eq("id", userId);
  } else if (action === "unblock") {
    await adminDb.from("profiles").update({ is_blocked: false, blocked_at: null }).eq("id", userId);
  } else if (action === "update_quota") {
    const { quota } = await request.json().catch(() => ({}));
    await adminDb.from("profiles").update({ storage_quota: quota }).eq("id", userId);
  }

  return NextResponse.json({ success: true });
}

// DELETE - user delete
export async function DELETE(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { adminDb } = auth;

  const { data: userFiles } = await adminDb
    .from("files")
    .select("storage_path")
    .eq("user_id", userId);

  if (userFiles && userFiles.length > 0) {
    await adminDb.storage.from("files").remove(userFiles.map((f: any) => f.storage_path));
  }

  await adminDb.from("profiles").delete().eq("id", userId);
  await adminDb.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}
