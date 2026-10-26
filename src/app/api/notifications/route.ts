import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { body, errorResponse, fail, stringField } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await requireUser();
    const notifications = db.prepare("SELECT id,type,title,body,href,read_at AS readAt,created_at AS createdAt FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100").all(user.id);
    return NextResponse.json({data:notifications,unread:notifications.filter((item) => !item.readAt).length},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return errorResponse(error); }
}
export async function PATCH(request:Request) {
  try {
    const user = await requireUser();
    const input = await body(request);
    const readAt = new Date().toISOString();
    if (input.all === true) {
      db.prepare("UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL").run(readAt,user.id);
      return NextResponse.json({ok:true});
    }
    const id = stringField(input,"id",true,100);
    if (input.read === true) {
      db.prepare("UPDATE notifications SET read_at=? WHERE id=? AND user_id=?").run(readAt,id,user.id);
      return NextResponse.json({ok:true});
    }
    if (input.read === false) {
      db.prepare("UPDATE notifications SET read_at=NULL WHERE id=? AND user_id=?").run(id,user.id);
      return NextResponse.json({ok:true});
    }
    fail(400,"Choose whether to mark this notice as read.");
  } catch(error) { return errorResponse(error); }
}
