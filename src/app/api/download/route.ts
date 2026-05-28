import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  const name = req.nextUrl.searchParams.get("name") ?? "file";

  if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("files")
    .download(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }

  const buffer = await data.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}