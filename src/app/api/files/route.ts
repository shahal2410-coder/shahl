import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, errorResponse, fail } from "@/lib/server/http";
import { storeFile, MAX_FILE_BYTES } from "@/lib/server/files";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    if (
      Number(request.headers.get("content-length") || 0) >
      MAX_FILE_BYTES + 65536
    )
      fail(413, "Choose a file smaller than 8 MB.");
    const reader = request.body?.getReader();
    if (!reader) fail(400, "Choose a file.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_FILE_BYTES + 65536) {
        await reader.cancel();
        fail(413, "Choose a file smaller than 8 MB.");
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) fail(400, "Choose a file.");
    const data = storeFile(user, {
      classId: String(form.get("classId") || ""),
      assignmentId: String(form.get("assignmentId") || ""),
      name: file.name,
      bytes: Buffer.from(await file.arrayBuffer()),
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
