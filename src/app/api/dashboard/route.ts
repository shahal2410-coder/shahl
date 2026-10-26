import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/http";
import { collections, visibleRecords } from "@/lib/server/records";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await requireUser();
    const data = Object.fromEntries(
      collections.map((key) => [key, visibleRecords(user, key)]),
    );
    const attendance = data.attendance;
    const attendanceRate = attendance.length
      ? `${Math.round((attendance.filter((item) => ["present", "late"].includes(String(item.status))).length / attendance.length) * 100)}%`
      : "—";
    const metrics =
      user.role === "admin"
        ? [
            {
              label: "Total students",
              value: data.students.filter((item) => item.status === "active")
                .length,
            },
            {
              label: "Teachers",
              value: data.teachers.filter((item) => item.status === "active")
                .length,
            },
            { label: "Active classes", value: data.classes.length },
            {
              label: "Pending registrations",
              value: data.students.filter((item) => item.status === "pending")
                .length,
            },
          ]
        : user.role === "teacher"
          ? [
              { label: "Assigned students", value: data.students.length },
              { label: "My classes", value: data.classes.length },
              { label: "Assignments", value: data.assignments.length },
              {
                label: "Awaiting feedback",
                value: data.submissions.filter(
                  (item) => item.status === "submitted",
                ).length,
              },
            ]
          : [
              { label: "My classes", value: data.classes.length },
              { label: "Assignments", value: data.assignments.length },
              { label: "Published results", value: data.marks.length },
              { label: "Attendance", value: attendanceRate },
            ];
    const recentActivity = [...data.announcements, ...data.instructions]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 5);
    return NextResponse.json(
      { data: { user, metrics, collections: data, recentActivity } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
