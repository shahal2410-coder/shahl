"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  LayoutDashboard,
  Library,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";
import "../styles/portal.css";

type Row = Record<string, any>;
type Dashboard = {
  user: Row;
  metrics: { label: string; value: string | number }[];
  collections: Record<string, Row[]>;
  recentActivity: Row[];
};
type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  collection?: string;
};
const modules: Record<
  string,
  {
    title: string;
    description: string;
    icon: typeof Users;
    fields: Field[];
    columns: string[];
  }
> = {
  students: {
    title: "Students",
    description: "A little support can open a world of possibility.",
    icon: GraduationCap,
    columns: ["name", "email", "program", "status"],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Initial password",
        type: "password",
        required: true,
      },
      {
        key: "status",
        label: "Account status",
        type: "select",
        options: ["active", "pending", "inactive"],
      },
      { key: "guardianName", label: "Guardian name" },
      { key: "guardianPhone", label: "Guardian WhatsApp", type: "tel" },
      { key: "age", label: "Age", type: "number" },
      {
        key: "program",
        label: "Learning program",
        type: "select",
        options: ["madrasa", "school", "both"],
      },
      {
        key: "classIds",
        label: "Assigned classes",
        type: "multi",
        collection: "classes",
      },
      {
        key: "subjectIds",
        label: "Assigned subjects",
        type: "multi",
        collection: "subjects",
      },
    ],
  },
  teachers: {
    title: "Teachers",
    description: "The people who make learning meaningful.",
    icon: Users,
    columns: ["name", "email", "status"],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "username", label: "Username", required: true },
      {
        key: "password",
        label: "Initial password",
        type: "password",
        required: true,
      },
      {
        key: "status",
        label: "Account status",
        type: "select",
        options: ["active", "pending", "inactive"],
      },
      {
        key: "classIds",
        label: "Assigned classes",
        type: "multi",
        collection: "classes",
      },
      {
        key: "subjectIds",
        label: "Assigned subjects",
        type: "multi",
        collection: "subjects",
      },
    ],
  },
  classes: {
    title: "Classes",
    description: "Thoughtfully organized spaces for learning together.",
    icon: Layers3,
    columns: ["title", "teacherId", "description"],
    fields: [
      { key: "title", label: "Class name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "teacherId",
        label: "Teacher",
        type: "select",
        collection: "teachers",
      },
      {
        key: "studentIds",
        label: "Students",
        type: "multi",
        collection: "students",
      },
      {
        key: "subjectIds",
        label: "Subjects",
        type: "multi",
        collection: "subjects",
      },
    ],
  },
  subjects: {
    title: "Subjects",
    description: "New ideas. Deeper understanding. Endless discovery.",
    icon: BookOpen,
    columns: ["title", "department", "description"],
    fields: [
      { key: "title", label: "Subject name", required: true },
      {
        key: "department",
        label: "Department",
        type: "select",
        options: ["madrasa", "school"],
      },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  assignments: {
    title: "Assignments",
    description: "Turn every new idea into a chance to grow.",
    icon: ClipboardCheck,
    columns: ["title", "classId", "dueDate", "description"],
    fields: [
      { key: "title", label: "Assignment title", required: true },
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "subjectId",
        label: "Subject",
        type: "select",
        collection: "subjects",
      },
      { key: "dueDate", label: "Due date", type: "date" },
      { key: "description", label: "Instructions", type: "textarea" },
    ],
  },
  announcements: {
    title: "Announcements",
    description: "Stay connected with life at the academy.",
    icon: Bell,
    columns: ["title", "description", "createdAt"],
    fields: [
      { key: "title", label: "Announcement title", required: true },
      {
        key: "description",
        label: "Announcement",
        type: "textarea",
        required: true,
      },
      {
        key: "classId",
        label: "Class (leave blank for everyone)",
        type: "select",
        collection: "classes",
      },
    ],
  },
  resources: {
    title: "Learning resources",
    description: "A growing library for curious minds.",
    icon: Library,
    columns: ["title", "classId", "description", "url"],
    fields: [
      { key: "title", label: "Resource title", required: true },
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "subjectId",
        label: "Subject",
        type: "select",
        collection: "subjects",
      },
      { key: "url", label: "Resource link", type: "url" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  instructions: {
    title: "Teacher instructions",
    description: "Clear guidance for every step of the journey.",
    icon: FileText,
    columns: ["title", "classId", "description"],
    fields: [
      { key: "title", label: "Instruction title", required: true },
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "subjectId",
        label: "Subject",
        type: "select",
        collection: "subjects",
      },
      {
        key: "description",
        label: "Instructions",
        type: "textarea",
        required: true,
      },
    ],
  },
  attendance: {
    title: "Attendance",
    description: "Showing up is the beginning of something great.",
    icon: Check,
    columns: ["studentId", "classId", "date", "status"],
    fields: [
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "studentId",
        label: "Student",
        type: "select",
        collection: "students",
        required: true,
      },
      { key: "date", label: "Date", type: "date", required: true },
      {
        key: "status",
        label: "Attendance",
        type: "select",
        options: ["present", "absent", "late", "excused"],
        required: true,
      },
    ],
  },
  marks: {
    title: "Marks & results",
    description: "Understand progress. Celebrate every step forward.",
    icon: Activity,
    columns: ["title", "studentId", "value", "maxValue", "status"],
    fields: [
      { key: "title", label: "Examination name", required: true },
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "studentId",
        label: "Student",
        type: "select",
        collection: "students",
        required: true,
      },
      {
        key: "subjectId",
        label: "Subject",
        type: "select",
        collection: "subjects",
      },
      { key: "value", label: "Marks obtained", type: "number", required: true },
      { key: "maxValue", label: "Total marks", type: "number", required: true },
      {
        key: "status",
        label: "Publication",
        type: "select",
        options: ["draft", "pending", "published"],
      },
      { key: "remarks", label: "Teacher remarks", type: "textarea" },
    ],
  },
  timetable: {
    title: "Timetable",
    description: "Make a little room for something extraordinary.",
    icon: CalendarDays,
    columns: ["title", "classId", "date", "startTime", "endTime"],
    fields: [
      { key: "title", label: "Lesson title", required: true },
      {
        key: "classId",
        label: "Class",
        type: "select",
        collection: "classes",
        required: true,
      },
      {
        key: "subjectId",
        label: "Subject",
        type: "select",
        collection: "subjects",
      },
      { key: "date", label: "Date", type: "date" },
      { key: "startTime", label: "Starts at", type: "time" },
      { key: "endTime", label: "Ends at", type: "time" },
      { key: "meetingUrl", label: "Online classroom link", type: "url" },
    ],
  },
  submissions: {
    title: "Submissions",
    description: "See the thinking behind every answer.",
    icon: FileText,
    columns: ["title", "studentId", "text", "status", "feedback", "url"],
    fields: [
      {
        key: "status",
        label: "Review status",
        type: "select",
        options: ["submitted", "reviewed"],
      },
      { key: "feedback", label: "Your feedback", type: "textarea" },
      { key: "score", label: "Score awarded", type: "number" },
      { key: "maxScore", label: "Score maximum", type: "number" },
    ],
  },
};
const fieldLabels: Record<string, string> = {
  classId: "Class",
  studentId: "Student",
  teacherId: "Teacher",
  createdAt: "Published",
  dueDate: "Due date",
  maxValue: "Total",
  value: "Marks",
  startTime: "Starts",
  endTime: "Ends",
  url: "Link",
  text: "Response",
  fileId: "Attachment",
  subjectId: "Subject",
  meetingUrl: "Classroom",
};
modules.examinations = {
  title: "Examinations",
  description: "A thoughtful plan for showing what you know.",
  icon: ClipboardCheck,
  columns: ["title", "classId", "subjectId", "date", "startTime"],
  fields: [
    { key: "title", label: "Examination name", required: true },
    {
      key: "classId",
      label: "Class",
      type: "select",
      collection: "classes",
      required: true,
    },
    {
      key: "subjectId",
      label: "Subject",
      type: "select",
      collection: "subjects",
    },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "startTime", label: "Starts at", type: "time" },
    { key: "endTime", label: "Ends at", type: "time" },
    { key: "description", label: "Instructions", type: "textarea" },
  ],
};
modules.events = {
  title: "Academy events",
  description: "Make space for learning together.",
  icon: CalendarDays,
  columns: ["title", "date", "startTime", "description"],
  fields: [
    { key: "title", label: "Event title", required: true },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "startTime", label: "Starts at", type: "time" },
    { key: "description", label: "Details", type: "textarea" },
    {
      key: "classId",
      label: "Class (leave blank for everyone)",
      type: "select",
      collection: "classes",
    },
  ],
};
for (const key of ["resources", "assignments"]) {
  modules[key].fields.push({
    key: "fileId",
    label: "Attach a document (PDF, image, or text; up to 8 MB)",
    type: "file",
  });
  modules[key].columns.push("fileId");
}
modules.submissions.columns.push("fileId");
modules.timetable.columns.push("meetingUrl");
const adminTabs = [
  "examinations",
  "events",
  "students",
  "teachers",
  "classes",
  "subjects",
  "marks",
  "attendance",
  "timetable",
  "assignments",
  "announcements",
  "instructions",
  "resources",
  "submissions",
];
const teacherTabs = [
  "examinations",
  "events",
  "students",
  "classes",
  "subjects",
  "marks",
  "attendance",
  "assignments",
  "instructions",
  "timetable",
  "resources",
  "submissions",
  "announcements",
];
const studentTabs = [
  "examinations",
  "events",
  "subjects",
  "marks",
  "timetable",
  "attendance",
  "assignments",
  "instructions",
  "resources",
  "submissions",
  "announcements",
];
function human(value: string) {
  return fieldLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

async function api(path: string, method = "GET", body?: Row) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "This request could not be completed.");
  return data;
}
function downloadCsv(rows: Row[], columns: string[], name: string) {
  const esc = (value: any) =>
    `"${String(value ?? "")
      .replaceAll('"', '""')
      .replace(/^[=+@-]/, "'$&")}"`;
  const text = [
    columns.map(human).map(esc).join(","),
    ...rows.map((row) => columns.map((k) => esc(row[k])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `explorium-${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PortalDashboard() {
  const [data, setData] = useState<Dashboard | null>(null),
    [tab, setTab] = useState("overview"),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [sidebar, setSidebar] = useState(false),
    [dark, setDark] = useState(false),
    [editor, setEditor] = useState<Row | null>(null),
    [submitting, setSubmitting] = useState<Row | null>(null),
    [notification, setNotification] = useState(false),
    [toast, setToast] = useState(""),
    [pageNumber, setPageNumber] = useState(1),
    [sortKey, setSortKey] = useState(""),
    [sortDirection, setSortDirection] = useState(1),
    [profileMode, setProfileMode] = useState<"details" | "password" | null>(
      null,
    );
  const reload = useCallback(async () => {
    try {
      const result = await api("/api/dashboard");
      setData(result.data);
      setError("");
    } catch (err) {
      const me = await api("/api/auth/me").catch(() => ({ user: null }));
      if (!me.user) {
        window.location.replace("/login");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Unable to load your workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (
      requested &&
      (requested in modules ||
        [
          "overview",
          "profile",
          "reports",
          "settings",
          "website",
          "audit",
        ].includes(requested))
    )
      setTab(requested);
    setDark(localStorage.getItem("explorium-portal-theme") === "dark");
    reload();
  }, [reload]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    setPageNumber(1);
  }, [tab, query]);
  function navigate(next: string) {
    setTab(next);
    setQuery("");
    setSidebar(false);
    window.history.replaceState(
      null,
      "",
      `/portal${next === "overview" ? "" : `?tab=${next}`}`,
    );
  }
  if (loading)
    return (
      <div className="portal-loading">
        <Sparkles size={32} />
        <p>Opening your learning space…</p>
        <LoaderCircle className="portal-spin" size={20} />
      </div>
    );
  if (!data)
    return (
      <div className="portal-loading">
        <p role="alert">{error || "Your workspace is unavailable."}</p>
        <button className="portal-primary" onClick={reload}>
          Try again
        </button>
        <Link href="/login">Return to sign in</Link>
      </div>
    );
  const { user, collections, metrics } = data;
  const role = user.role,
    tabs =
      role === "admin"
        ? adminTabs
        : role === "teacher"
          ? teacherTabs
          : studentTabs;
  const current = modules[tab];
  const rows = collections[tab] || [];
  const writable =
    role === "admin" ||
    (role === "teacher" &&
      [
        "marks",
        "attendance",
        "assignments",
        "instructions",
        "resources",
        "submissions",
        "announcements",
      ].includes(tab));
  function value(row: Row, key: string) {
    const raw = row[key];
    if (raw === undefined || raw === null || raw === "") return "—";
    if (key === "createdAt" || key === "updatedAt")
      return new Date(raw).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    const relation =
      key === "classId"
        ? "classes"
        : key === "studentId"
          ? "students"
          : key === "teacherId"
            ? "teachers"
            : key === "subjectId"
              ? "subjects"
              : null;
    if (relation) {
      const item = collections[relation]?.find((r) => r.id === raw);
      return (
        item?.name ||
        item?.title ||
        (raw === user.id ? user.name : "Assigned member")
      );
    }
    return String(raw);
  }
  const filtered = rows.filter(
    (row) =>
      !query ||
      Object.keys(row).some((key) =>
        value(row, key).toLowerCase().includes(query.toLowerCase()),
      ),
  );
  async function mutate(method: string, body: Row) {
    try {
      await api(`/api/records/${tab}`, method, body);
      await reload();
      setToast(method === "DELETE" ? "Record removed." : "Changes saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    }
  }
  const sorted = [...filtered].sort((a, b) =>
    sortKey
      ? value(a, sortKey).localeCompare(value(b, sortKey), undefined, {
          numeric: true,
        }) * sortDirection
      : 0,
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / 12));
  const visibleRows = sorted.slice(
    (Math.min(pageNumber, pageCount) - 1) * 12,
    Math.min(pageNumber, pageCount) * 12,
  );
  const shortName = String(user.name || "Learner").split(" ")[0];
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className={`portal-shell ${dark ? "portal-dark" : ""}`}>
      {sidebar && (
        <button
          className="portal-mobile-scrim"
          onClick={() => setSidebar(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`portal-sidebar ${sidebar ? "is-open" : ""}`}>
        <Link href="/" className="portal-brand">
          <span className="portal-brand-symbol">
            <Sparkles size={25} strokeWidth={1.5} />
          </span>
          <span>
            EXPLORIUM<small>ACADEMY</small>
          </span>
        </Link>
        <div className="portal-space-label">
          {role === "admin"
            ? "COMMAND CENTER"
            : role === "teacher"
              ? "TEACHING STUDIO"
              : "STUDENT SPACE"}
        </div>
        <nav aria-label="Workspace">
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => navigate("overview")}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          {role === "student" && (
            <Link href="/learn">
              <Sparkles size={18} />
              Learning hub<span className="portal-new">NEW</span>
            </Link>
          )}
          <div className="portal-nav-label">YOUR WORKSPACE</div>
          {tabs.map((key) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => navigate(key)}
            >
              {(() => {
                const Icon = modules[key].icon;
                return <Icon size={18} />;
              })()}
              {modules[key].title}
              {key === "students" &&
                role === "admin" &&
                collections.students?.some((s) => s.status === "pending") && (
                  <span className="portal-nav-count">
                    {
                      collections.students.filter((s) => s.status === "pending")
                        .length
                    }
                  </span>
                )}
            </button>
          ))}
          {role === "admin" && (
            <>
              <div className="portal-nav-label">ACADEMY</div>
              <button
                className={tab === "website" ? "active" : ""}
                onClick={() => navigate("website")}
              >
                <Home size={18} />
                Website content
              </button>
              <button
                className={tab === "audit" ? "active" : ""}
                onClick={() => navigate("audit")}
              >
                <ClipboardCheck size={18} />
                Audit history
              </button>
            </>
          )}
          <div className="portal-nav-label">ACCOUNT</div>
          <button
            className={tab === "reports" ? "active" : ""}
            onClick={() => navigate("reports")}
          >
            <Activity size={18} />
            {role === "student" ? "My progress" : "Reports & analytics"}
          </button>
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => navigate("profile")}
          >
            <Users size={18} />
            My profile
          </button>
          {role === "admin" && (
            <button
              className={tab === "settings" ? "active" : ""}
              onClick={() => navigate("settings")}
            >
              <Settings size={18} />
              Settings
            </button>
          )}
        </nav>
        <div className="portal-sidebar-bottom">
          <Link href="/">
            <Home size={16} />
            Academy website
            <ArrowRight size={15} />
          </Link>
          <button
            onClick={async () => {
              await api("/api/auth/logout", "POST");
              window.location.assign("/");
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar">
          <div className="portal-breadcrumb">
            <button
              className="portal-icon-button portal-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebar(!sidebar)}
            >
              <Menu size={20} />
            </button>
            <span>
              {role === "admin"
                ? "Administration"
                : role === "teacher"
                  ? "Teaching studio"
                  : "My workspace"}
            </span>
            <ChevronRight size={14} />
            <strong>{current?.title || human(tab)}</strong>
          </div>
          <div className="portal-topbar-actions">
            <button
              className="portal-icon-button"
              onClick={() => {
                setDark(!dark);
                localStorage.setItem(
                  "explorium-portal-theme",
                  !dark ? "dark" : "light",
                );
              }}
              aria-label={dark ? "Use light mode" : "Use dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="portal-notification-wrap">
              <button
                className="portal-icon-button"
                onClick={() => setNotification(!notification)}
                aria-label="Notifications"
                aria-expanded={notification}
              >
                <Bell size={19} />
                {(collections.announcements || []).length > 0 && <i />}
              </button>
              {notification && (
                <div className="portal-notification-popover">
                  <strong>Academy announcements</strong>
                  {collections.announcements?.length ? (
                    collections.announcements.slice(0, 4).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          navigate("announcements");
                          setNotification(false);
                        }}
                      >
                        {a.title}
                        <small>{a.description}</small>
                      </button>
                    ))
                  ) : (
                    <p>
                      You’re all caught up. Academy updates will appear here.
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              className="portal-account"
              onClick={() => navigate("profile")}
              aria-label="Open your profile"
            >
              <span>{shortName.charAt(0)}</span>
              <div>
                {user.name}
                <small>{human(role)}</small>
              </div>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main className="portal-content">
          {error && (
            <div className="portal-error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {tab === "overview" ? (
            <>
              <div className="portal-heading">
                <div>
                  <span className="portal-eyebrow">{today}</span>
                  <h1>
                    {role === "admin"
                      ? "A clearer view of your academy."
                      : role === "teacher"
                        ? `Welcome to your studio, ${shortName}.`
                        : `Good to see you, ${shortName}.`}
                    <span className="portal-heading-dot">.</span>
                  </h1>
                  <p>
                    {role === "student"
                      ? "A new day. A little discovery. A world of possibility."
                      : "Everything you need to keep meaningful learning moving."}
                  </p>
                </div>
                <Link
                  href={role === "student" ? "/learn" : "/"}
                  className="portal-outline"
                >
                  {role === "student"
                    ? "Explore learning hub"
                    : "Visit academy"}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="portal-stats">
                {metrics.map((metric, i) => (
                  <div key={metric.label} className="portal-stat">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <div className={`portal-stat-icon stat-${i % 4}`}>
                      {i % 4 === 0 ? (
                        <GraduationCap size={20} />
                      ) : i % 4 === 1 ? (
                        <BookOpen size={20} />
                      ) : i % 4 === 2 ? (
                        <ClipboardCheck size={20} />
                      ) : (
                        <Activity size={20} />
                      )}
                    </div>
                    <small>From your academy records</small>
                  </div>
                ))}
              </div>
              <div className="portal-overview-grid">
                <section className="portal-welcome-card">
                  <span className="portal-eyebrow">
                    MAKE ROOM FOR CURIOSITY
                  </span>
                  <h2>
                    {role === "student"
                      ? "Two worlds.\nOne curious mind."
                      : role === "teacher"
                        ? "Inspire their\nnext discovery."
                        : "Great learning\nstarts with you."}
                  </h2>
                  <p>
                    {role === "student"
                      ? "Explore timeless wisdom in Madrasa Studio and new possibilities in School Lab."
                      : "Bring your classes, resources, and learning community together in one thoughtful space."}
                  </p>
                  {role === "student" ? (
                    <Link href="/learn" className="portal-light-button">
                      Enter the learning hub
                      <ArrowRight size={17} />
                    </Link>
                  ) : (
                    <button
                      className="portal-light-button"
                      onClick={() =>
                        navigate(
                          role === "teacher" ? "assignments" : "students",
                        )
                      }
                    >
                      {role === "teacher"
                        ? "Manage assignments"
                        : "Manage students"}
                      <ArrowRight size={17} />
                    </button>
                  )}
                  <div className="portal-welcome-orbit" aria-hidden="true">
                    <BookOpen size={60} strokeWidth={1} />
                  </div>
                </section>
                <section className="portal-panel">
                  <div className="portal-panel-heading">
                    <h2>Coming up</h2>
                    <button onClick={() => navigate("timetable")}>
                      View timetable
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  {collections.timetable?.length ? (
                    <div className="portal-schedule">
                      {collections.timetable.slice(0, 4).map((item) => (
                        <div key={item.id}>
                          <span>
                            <CalendarDays size={19} />
                          </span>
                          <div>
                            <strong>{item.title}</strong>
                            <small>
                              {item.date || "Date to be confirmed"}
                              {item.startTime ? ` · ${item.startTime}` : ""}
                            </small>
                          </div>
                          {item.meetingUrl && (
                            <a
                              href={item.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join
                              <ArrowRight size={13} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={CalendarDays}
                      title="Room for what’s next"
                      text="Your scheduled classes will appear here once the academy publishes your timetable."
                    />
                  )}
                </section>
              </div>
              <div className="portal-overview-grid portal-bottom-grid">
                <section className="portal-panel">
                  <div className="portal-panel-heading">
                    <h2>Academy updates</h2>
                    <button onClick={() => navigate("announcements")}>
                      All updates
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  {collections.announcements?.length ? (
                    <div className="portal-updates">
                      {collections.announcements.slice(0, 3).map((a) => (
                        <article key={a.id}>
                          <span className="portal-update-dot" />
                          <div>
                            <h3>{a.title}</h3>
                            <p>{a.description}</p>
                            <small>{value(a, "createdAt")}</small>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Bell}
                      title="A quiet moment"
                      text="News, notices, and important academy updates will find you here."
                    />
                  )}
                </section>
                <section className="portal-panel">
                  <div className="portal-panel-heading">
                    <h2>Quick actions</h2>
                  </div>
                  <div className="portal-quick-actions">
                    {(role === "admin"
                      ? ["students", "classes", "announcements"]
                      : role === "teacher"
                        ? ["attendance", "marks", "assignments"]
                        : ["assignments", "marks", "resources"]
                    ).map((key) => {
                      const Icon = modules[key].icon;
                      return (
                        <button key={key} onClick={() => navigate(key)}>
                          <span>
                            <Icon size={20} />
                          </span>
                          <div>
                            <strong>{modules[key].title}</strong>
                            <small>
                              {role === "student"
                                ? "View your learning"
                                : "Open workspace"}
                            </small>
                          </div>
                          <ArrowRight size={17} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </>
          ) : current ? (
            <>
              <div className="portal-heading">
                <div>
                  <span className="portal-eyebrow">YOUR WORKSPACE</span>
                  <h1>{current.title}</h1>
                  <p>{current.description}</p>
                </div>
                {writable && tab !== "submissions" && (
                  <button
                    className="portal-primary"
                    onClick={() => setEditor({})}
                  >
                    <Plus size={17} />
                    Add{" "}
                    {tab === "classes"
                      ? "class"
                      : tab === "marks"
                        ? "result"
                        : tab === "attendance"
                          ? "attendance"
                          : tab === "resources"
                            ? "resource"
                            : tab === "timetable"
                              ? "lesson"
                              : tab === "teachers"
                                ? "teacher"
                                : tab === "students"
                                  ? "student"
                                  : tab.replace(/s$/, "")}
                  </button>
                )}
              </div>
              <section className="portal-panel portal-table-panel">
                <div className="portal-table-toolbar">
                  <div className="portal-search">
                    <Search size={17} />
                    <input
                      aria-label={`Search ${current.title}`}
                      placeholder={`Search ${current.title.toLowerCase()}…`}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>
                  <span>
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "record" : "records"}
                  </span>
                  <button
                    className="portal-outline"
                    disabled={!rows.length}
                    onClick={() =>
                      downloadCsv(
                        rows.map((row) =>
                          Object.fromEntries(
                            current.columns.map((key) => [
                              key,
                              value(row, key),
                            ]),
                          ),
                        ),
                        current.columns,
                        tab,
                      )
                    }
                  >
                    <ArrowDownToLine size={15} />
                    Export
                  </button>
                </div>
                {filtered.length ? (
                  <div>
                    <div className="portal-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            {current.columns.map((key) => (
                              <th
                                key={key}
                                aria-sort={
                                  sortKey === key
                                    ? sortDirection === 1
                                      ? "ascending"
                                      : "descending"
                                    : "none"
                                }
                              >
                                <button
                                  className="portal-sort"
                                  onClick={() => {
                                    setSortDirection(
                                      sortKey === key ? -sortDirection : 1,
                                    );
                                    setSortKey(key);
                                  }}
                                >
                                  {human(key)}
                                  <ChevronDown size={12} />
                                </button>
                              </th>
                            ))}
                            {(writable ||
                              (tab === "assignments" &&
                                role === "student")) && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row) => (
                            <tr key={row.id}>
                              {current.columns.map((key, i) => (
                                <td
                                  key={key}
                                  className={
                                    i === 0 ? "portal-table-primary" : ""
                                  }
                                >
                                  {key === "status" ? (
                                    <span
                                      className={`portal-status status-${row[key]}`}
                                    >
                                      {value(row, key)}
                                    </span>
                                  ) : key === "fileId" && row.fileId ? (
                                    <a
                                      href={`/api/files/${row.fileId}`}
                                      download
                                    >
                                      Download
                                      <ArrowDownToLine size={12} />
                                    </a>
                                  ) : (key === "url" || key === "meetingUrl") &&
                                    row[key] ? (
                                    <a
                                      href={row[key]}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Open resource
                                      <ArrowRight size={12} />
                                    </a>
                                  ) : (
                                    value(row, key)
                                  )}
                                </td>
                              ))}
                              {(writable ||
                                (tab === "assignments" &&
                                  role === "student")) && (
                                <td>
                                  <div className="portal-row-actions">
                                    {role === "student" ? (
                                      <button
                                        className="portal-text-button"
                                        onClick={() => setSubmitting(row)}
                                      >
                                        Submit work
                                        <ArrowRight size={13} />
                                      </button>
                                    ) : (
                                      <>
                                        {tab === "students" &&
                                          row.status === "pending" && (
                                            <button
                                              className="portal-approve"
                                              onClick={() =>
                                                mutate("PATCH", {
                                                  id: row.id,
                                                  status: "active",
                                                })
                                              }
                                            >
                                              <Check size={13} />
                                              Approve
                                            </button>
                                          )}
                                        <button
                                          className="portal-icon-button"
                                          aria-label={`Edit ${row.title || row.name || "record"}`}
                                          onClick={() => setEditor(row)}
                                        >
                                          <Pencil size={15} />
                                        </button>
                                        {tab !== "submissions" && (
                                          <button
                                            className="portal-icon-button"
                                            aria-label={`Remove ${row.title || row.name || "record"}`}
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  `Remove ${row.title || row.name || "this record"}? ${["students", "teachers"].includes(tab) ? "The account will be deactivated and academic records preserved." : "This cannot be undone."}`,
                                                )
                                              )
                                                mutate("DELETE", {
                                                  id: row.id,
                                                });
                                            }}
                                          >
                                            <Trash2 size={15} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="portal-pagination">
                      <span>
                        Page {Math.min(pageNumber, pageCount)} of {pageCount}
                      </span>
                      <button
                        className="portal-outline"
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber((v) => v - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="portal-outline"
                        disabled={pageNumber >= pageCount}
                        onClick={() => setPageNumber((v) => v + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={current.icon}
                    title={
                      query
                        ? "No matching records"
                        : `Your ${current.title.toLowerCase()} start here`
                    }
                    text={
                      query
                        ? "Try another name or keyword."
                        : writable
                          ? "Add your first record to organize this part of your academy."
                          : "Your academy will share these records with you when they are available."
                    }
                  />
                )}
              </section>
            </>
          ) : tab === "profile" ? (
            <>
              <div className="portal-heading">
                <div>
                  <span className="portal-eyebrow">
                    YOUR EXPLORIUM IDENTITY
                  </span>
                  <h1>My profile</h1>
                  <p>A little about the person behind the progress.</p>
                </div>
              </div>
              <section className="portal-panel portal-profile">
                <div className="portal-profile-avatar">
                  {shortName.charAt(0)}
                </div>
                <h2>{user.name}</h2>
                <span className={`portal-status status-${user.status}`}>
                  {user.status}
                </span>
                <dl>
                  {[
                    "email",
                    "username",
                    "role",
                    "program",
                    "guardianName",
                    "guardianPhone",
                    "age",
                  ]
                    .filter((key) => user[key])
                    .map((key) => (
                      <div key={key}>
                        <dt>
                          {human(key)
                            .replace("guardianName", "Guardian name")
                            .replace("guardianPhone", "Guardian WhatsApp")}
                        </dt>
                        <dd>{user[key]}</dd>
                      </div>
                    ))}
                </dl>
                <p>
                  Keep your profile up to date so your academy can stay
                  connected.
                </p>
                <div className="portal-profile-actions">
                  <button
                    className="portal-primary"
                    onClick={() => setProfileMode("details")}
                  >
                    <Pencil size={15} />
                    Edit profile
                  </button>
                  <button
                    className="portal-outline"
                    onClick={() => setProfileMode("password")}
                  >
                    Change password
                    <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </>
          ) : tab === "reports" ? (
            <>
              <div className="portal-heading">
                <div>
                  <span className="portal-eyebrow">A CLEARER PICTURE</span>
                  <h1>
                    {role === "student"
                      ? "Every step counts."
                      : "Reports & analytics"}
                  </h1>
                  <p>Real records. Meaningful progress. All in one place.</p>
                </div>
                <button
                  className="portal-outline"
                  onClick={() => window.print()}
                >
                  <ArrowDownToLine size={16} />
                  Print / save PDF
                </button>
              </div>
              <div className="portal-stats">
                {metrics.map((metric) => (
                  <div className="portal-stat" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>From your academy records</small>
                  </div>
                ))}
              </div>
              <AcademicProgress
                rows={collections.marks || []}
                resolve={value}
              />
              <section className="portal-panel">
                <div className="portal-panel-heading">
                  <h2>Academic reports</h2>
                </div>
                <div className="portal-report-list">
                  {["marks", "attendance", "assignments"].map((key) => (
                    <div key={key}>
                      <div>
                        <h3>{modules[key].title}</h3>
                        <p>
                          {(collections[key] || []).length} records available in
                          your workspace
                        </p>
                      </div>
                      <button
                        className="portal-outline"
                        disabled={!collections[key]?.length}
                        onClick={() =>
                          downloadCsv(
                            (collections[key] || []).map((row) =>
                              Object.fromEntries(
                                modules[key].columns.map((k) => [
                                  k,
                                  value(row, k),
                                ]),
                              ),
                            ),
                            modules[key].columns,
                            key,
                          )
                        }
                      >
                        <ArrowDownToLine size={15} />
                        Download CSV
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : tab === "website" && role === "admin" ? (
            <WebsiteSettings />
          ) : tab === "audit" && role === "admin" ? (
            <AuditHistory />
          ) : (
            <>
              <div className="portal-heading">
                <div>
                  <span className="portal-eyebrow">ACADEMY CONFIGURATION</span>
                  <h1>Workspace settings</h1>
                  <p>Your preferences and platform access at a glance.</p>
                </div>
              </div>
              <section className="portal-panel portal-settings">
                <div>
                  <div>
                    <h3>Appearance</h3>
                    <p>Choose the theme that helps you focus.</p>
                  </div>
                  <button
                    className="portal-outline"
                    onClick={() => {
                      setDark(!dark);
                      localStorage.setItem(
                        "explorium-portal-theme",
                        !dark ? "dark" : "light",
                      );
                    }}
                  >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}Use{" "}
                    {dark ? "light" : "dark"} mode
                  </button>
                </div>
                <div>
                  <div>
                    <h3>Account approval</h3>
                    <p>New student accounts require administrator approval.</p>
                  </div>
                  <button
                    className="portal-outline"
                    onClick={() => navigate("students")}
                  >
                    Manage students
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div>
                  <div>
                    <h3>Teaching permissions</h3>
                    <p>
                      Teachers can access only their assigned classes and
                      students.
                    </p>
                  </div>
                  <button
                    className="portal-outline"
                    onClick={() => navigate("teachers")}
                  >
                    Manage teachers
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div>
                  <div>
                    <h3>Enrollment inquiries</h3>
                    <p>Academy WhatsApp: +91 7025375305</p>
                  </div>
                  <a
                    className="portal-outline"
                    href="https://wa.me/917025375305"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open WhatsApp
                    <ArrowRight size={15} />
                  </a>
                </div>
              </section>
            </>
          )}
          <footer className="portal-footer">
            <span>EXPLORIUM ACADEMY</span>
            <span>A new dimension of learning.</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="portal-toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {profileMode && (
        <RecordEditor
          row={profileMode === "details" ? user : {}}
          title={profileMode === "details" ? "My profile" : "Change password"}
          fields={
            profileMode === "details"
              ? [
                  { key: "name", label: "Full name", required: true },
                  { key: "guardianName", label: "Guardian name" },
                  {
                    key: "guardianPhone",
                    label: "Guardian WhatsApp",
                    type: "tel",
                  },
                ]
              : [
                  {
                    key: "currentPassword",
                    label: "Current password",
                    type: "password",
                    required: true,
                  },
                  {
                    key: "newPassword",
                    label: "New password (at least 12 characters)",
                    type: "password",
                    required: true,
                  },
                ]
          }
          collections={collections}
          onClose={() => setProfileMode(null)}
          onSave={async (fields) => {
            await api("/api/profile", "PATCH", fields);
            await reload();
            setToast("Your profile has been updated.");
            setProfileMode(null);
          }}
        />
      )}
      {editor && current && (
        <RecordEditor
          row={editor}
          title={current.title}
          fields={current.fields
            .filter((field) => !(field.key === "password" && editor.id))
            .map((field) =>
              field.key === "status" && tab === "marks" && role === "teacher"
                ? { ...field, options: ["draft"] }
                : field,
            )}
          collections={collections}
          onClose={() => setEditor(null)}
          onSave={async (fields) => {
            await api(`/api/records/${tab}`, editor.id ? "PATCH" : "POST", {
              ...(editor.id ? { id: editor.id } : {}),
              ...fields,
            });
            await reload();
            setToast("Changes saved.");
            setEditor(null);
          }}
        />
      )}
      {submitting && (
        <RecordEditor
          uploadContext={{
            classId: submitting.classId,
            assignmentId: submitting.id,
          }}
          row={{}}
          title={`Submit: ${submitting.title}`}
          fields={[
            {
              key: "text",
              label: "Your response",
              type: "textarea",
              required: true,
            },
            { key: "url", label: "Link to your work (optional)", type: "url" },
            {
              key: "fileId",
              label: "Attach your work (PDF, image, or text; up to 8 MB)",
              type: "file",
            },
          ]}
          collections={collections}
          onClose={() => setSubmitting(null)}
          onSave={async (fields) => {
            await api("/api/submissions", "POST", {
              assignmentId: submitting.id,
              ...fields,
            });
            await reload();
            setToast("Your work has been submitted.");
            setSubmitting(null);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Users;
  title: string;
  text: string;
}) {
  return (
    <div className="portal-empty">
      <span>
        <Icon size={26} strokeWidth={1.3} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function RecordEditor({
  row,
  title,
  fields,
  collections,
  onClose,
  onSave,
  uploadContext,
}: {
  uploadContext?: Row;
  row: Row;
  title: string;
  fields: Field[];
  collections: Record<string, Row[]>;
  onClose: () => void;
  onSave: (fields: Row) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: Row = {};
    for (const field of fields) {
      const raw = data.get(field.key);
      if (field.type === "file") continue;
      values[field.key] =
        field.type === "multi"
          ? data.getAll(field.key)
          : field.type === "number"
            ? raw === ""
              ? undefined
              : Number(raw)
            : raw || "";
    }
    setSaving(true);
    setError("");
    try {
      for (const field of fields.filter((item) => item.type === "file")) {
        const file = data.get(field.key);
        if (file instanceof File && file.size) {
          const upload = new FormData();
          upload.set("file", file);
          upload.set(
            "classId",
            String(
              values.classId || uploadContext?.classId || row.classId || "",
            ),
          );
          if (uploadContext?.assignmentId)
            upload.set("assignmentId", uploadContext.assignmentId);
          const response = await fetch("/api/files", {
            method: "POST",
            body: upload,
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(
              result.error || "The document could not be uploaded.",
            );
          values[field.key] = result.data.id;
        }
      }
      await onSave(values);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save this record.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="portal-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="portal-dialog-content">
        <div className="portal-dialog-heading">
          <div>
            <span className="portal-eyebrow">YOUR WORKSPACE</span>
            <h2>
              {row.id
                ? "Edit record"
                : title.startsWith("Submit:")
                  ? title
                  : `Add to ${title.toLowerCase()}`}
            </h2>
          </div>
          <button
            className="portal-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.required && <span className="portal-required"> *</span>}
              {field.type === "file" ? (
                <>
                  <input
                    type="file"
                    name={field.key}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  />
                  {row.fileId && (
                    <a
                      className="portal-text-button"
                      href={`/api/files/${row.fileId}`}
                    >
                      Download current attachment
                    </a>
                  )}
                </>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.key}
                  defaultValue={row[field.key] || ""}
                  required={field.required}
                  rows={4}
                />
              ) : field.type === "select" || field.type === "multi" ? (
                <select
                  name={field.key}
                  defaultValue={
                    row[field.key] ||
                    (field.type === "multi" ? [] : field.options?.[0] || "")
                  }
                  required={field.required}
                  multiple={field.type === "multi"}
                >
                  {field.type !== "multi" && !field.options && (
                    <option value="">Select {field.label.toLowerCase()}</option>
                  )}
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {human(option)}
                    </option>
                  ))}
                  {field.collection &&
                    (collections[field.collection] || []).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name || option.title}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  name={field.key}
                  type={field.type || "text"}
                  defaultValue={row[field.key] ?? ""}
                  required={field.required}
                  min={field.type === "number" ? 0 : undefined}
                  minLength={
                    field.type === "password" && field.key !== "currentPassword"
                      ? 12
                      : undefined
                  }
                  maxLength={field.type === "password" ? 128 : undefined}
                />
              )}
              {field.type === "multi" && (
                <small>Hold Ctrl or ⌘ to select multiple items.</small>
              )}
            </label>
          ))}
          {error && (
            <p className="portal-error" role="alert">
              {error}
            </p>
          )}
          <div className="portal-dialog-actions">
            <button className="portal-outline" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="portal-primary" type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="portal-spin" size={17} />
              ) : (
                <Check size={17} />
              )}{" "}
              {saving
                ? "Saving…"
                : title.startsWith("Submit:")
                  ? "Submit work"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function WebsiteSettings() {
  const [settings, setSettings] = useState<Row | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    api("/api/website")
      .then((result) => setSettings(result.data))
      .catch((err) => setError(err.message));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await api(
        "/api/website",
        "PATCH",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setNotice("Your academy website has been updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="portal-heading">
        <div>
          <span className="portal-eyebrow">THE EXPLORIUM STORY</span>
          <h1>Website content</h1>
          <p>Keep your academy’s story fresh and your community informed.</p>
        </div>
        <Link href="/" className="portal-outline">
          View academy
          <ArrowRight size={15} />
        </Link>
      </div>
      <section className="portal-panel portal-editor-panel">
        {error && (
          <p role="alert" className="portal-error">
            {error}
          </p>
        )}
        {settings ? (
          <form onSubmit={submit} className="auth-form">
            {[
              { key: "heroDescription", label: "Homepage introduction" },
              { key: "philosophyText", label: "Our learning philosophy" },
              { key: "enrollmentNote", label: "Enrollment introduction" },
              { key: "academicYear", label: "Academic year" },
            ].map(({ key, label }) => (
              <label key={key}>
                {label}
                {key === "academicYear" ? (
                  <input
                    name={key}
                    defaultValue={settings[key]}
                    placeholder="For example, 2026–2027"
                    maxLength={100}
                  />
                ) : (
                  <textarea
                    name={key}
                    defaultValue={settings[key]}
                    rows={3}
                    required
                    maxLength={2000}
                  />
                )}
              </label>
            ))}
            <p className="auth-form-note">
              Manage learning programs in Subjects. Publish academy news in
              Announcements. Your official WhatsApp enrollment number stays
              connected.
            </p>
            {notice && (
              <p role="status" className="portal-success">
                {notice}
              </p>
            )}
            <button disabled={saving} className="portal-primary" type="submit">
              {saving ? "Saving…" : "Save website content"}
              <Check size={16} />
            </button>
          </form>
        ) : (
          <p>Loading academy content…</p>
        )}
      </section>
    </>
  );
}
function AuditHistory() {
  const [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    api("/api/audit")
      .then((result) => {
        setRows(result.data);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));
  }, []);
  return (
    <>
      <div className="portal-heading">
        <div>
          <span className="portal-eyebrow">ACCOUNTABILITY AT EVERY STEP</span>
          <h1>Audit history</h1>
          <p>The 200 most recent changes across your academy.</p>
        </div>
      </div>
      <section className="portal-panel portal-table-panel">
        {error && (
          <p role="alert" className="portal-error">
            {error}
          </p>
        )}
        {loaded ? (
          <div className="portal-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>By</th>
                  <th>When</th>
                  <th>Record</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.action}</td>
                    <td>{row.actor || "System"}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.targetId || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="portal-editor-panel">Loading activity…</p>
        )}
      </section>
    </>
  );
}

function AcademicProgress({
  rows,
  resolve,
}: {
  rows: Row[];
  resolve: (row: Row, key: string) => string;
}) {
  const published = rows.filter((row) => row.status === "published");
  const total = published.reduce((sum, row) => sum + Number(row.value), 0);
  const maximum = published.reduce((sum, row) => sum + Number(row.maxValue), 0);
  return (
    <section className="portal-panel portal-academic-progress">
      <div className="portal-panel-heading">
        <div>
          <h2>Published academic results</h2>
          <p>
            Based on {published.length} published{" "}
            {published.length === 1 ? "result" : "results"}.
          </p>
        </div>
        {maximum > 0 && (
          <strong>
            {Math.round((total / maximum) * 100)}%<small>Overall marks</small>
          </strong>
        )}
      </div>
      {published.length ? (
        <div className="portal-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Examination</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Progress</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {published.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{resolve(row, "studentId")}</td>
                  <td>{resolve(row, "subjectId")}</td>
                  <td>
                    {row.value} / {row.maxValue}
                  </td>
                  <td>
                    <div className="portal-result-bar">
                      <span
                        style={{
                          width: `${(Number(row.value) / Number(row.maxValue)) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {Math.round(
                        (Number(row.value) / Number(row.maxValue)) * 100,
                      )}
                      %
                    </small>
                  </td>
                  <td>{row.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="Every step will count"
          text="Once your academy publishes results, your academic progress and report details will appear here."
        />
      )}
    </section>
  );
}
