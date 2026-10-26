"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import "../styles/portal.css";

type Role = "admin" | "teacher" | "student";
const roles: { value: Role; title: string; icon: typeof GraduationCap }[] = [
  { value: "student", title: "Student", icon: GraduationCap },
  { value: "teacher", title: "Teacher", icon: BookOpen },
  { value: "admin", title: "Administration", icon: Layers3 },
];

export default function PortalAuth({
  register = false,
}: {
  register?: boolean;
}) {
  const [role, setRole] = useState<Role>("student");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("role");
    if (value === "admin" || value === "teacher" || value === "student")
      setRole(value);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (register && password !== form.get("confirmPassword")) {
      setError("Your passwords do not match. Please try again.");
      return;
    }
    const body = register
      ? {
          name: form.get("name"),
          username: form.get("username"),
          email: form.get("email"),
          password,
          guardianName: form.get("guardianName"),
          guardianPhone: form.get("guardianPhone"),
          age: Number(form.get("age")),
          program: form.get("program"),
        }
      : {
          identifier: form.get("identifier"),
          password,
          role,
          remember: form.get("remember") === "on",
        };
    setPending(true);
    try {
      const response = await fetch(
        `/api/auth/${register ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "We could not complete this request. Please try again.",
        );
      if (register) setComplete(true);
      else {
        const next = new URLSearchParams(window.location.search).get("next");
        window.location.assign(
          next && /^\/learn(?:\/|$)/.test(next) ? next : "/portal",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={`auth-shell ${register ? "auth-register" : ""}`}>
      <aside className="auth-story">
        <Link href="/" className="portal-brand">
          <span className="portal-brand-symbol">
            <Sparkles size={25} strokeWidth={1.5} />
          </span>
          <span>
            EXPLORIUM<small>ACADEMY</small>
          </span>
        </Link>
        <div className="auth-story-content">
          <span className="auth-eyebrow">A NEW DIMENSION OF LEARNING</span>
          <h1>
            Great journeys
            <br />
            begin with
            <br />
            <em>curiosity.</em>
          </h1>
          <p>
            A thoughtful space to discover, connect, and grow. Your next chapter
            starts here.
          </p>
        </div>
        <div className="auth-orbit-art" aria-hidden="true">
          <div className="auth-orbit one" />
          <div className="auth-orbit two" />
          <div className="auth-orbit three" />
          <div className="auth-orbit-center">
            <BookOpen size={56} strokeWidth={1} />
          </div>
          <span className="auth-orbit-dot first" />
          <span className="auth-orbit-dot second" />
        </div>
        <div className="auth-story-foot">
          <span>Faith. Knowledge. Possibility.</span>
          <span>01 — ∞</span>
        </div>
      </aside>
      <section className="auth-form-panel">
        <Link href="/" className="auth-back">
          <ArrowLeft size={15} /> Back to Explorium
        </Link>
        {complete ? (
          <div className="auth-form-wrap auth-success">
            <span className="auth-success-icon">
              <Check size={30} />
            </span>
            <span className="auth-eyebrow">YOUR NEXT CHAPTER</span>
            <h2>You’re on the list.</h2>
            <p>
              Your account has been created and is awaiting academy approval.
              Once approved, you can sign in to your personal learning space.
            </p>
            <Link
              href="/account?action=request-verify"
              className="auth-contact"
            >
              Verify your email address
            </Link>
            <Link href="/login" className="portal-primary">
              Back to sign in <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/917025375305"
              target="_blank"
              rel="noreferrer"
              className="auth-contact"
            >
              Contact the academy about your application
            </a>
          </div>
        ) : (
          <div className="auth-form-wrap">
            <span className="auth-eyebrow">
              {register ? "JOIN THE EXPLORIUM COMMUNITY" : "YOUR SPACE TO GROW"}
            </span>
            <h2>{register ? "A world of possibility." : "Welcome back."}</h2>
            <p className="auth-intro">
              {register
                ? "Create your student account and begin your learning journey."
                : "Sign in to continue your Explorium experience."}
            </p>
            {!register && (
              <div
                className="auth-role-tabs"
                aria-label="Choose your sign-in role"
              >
                {roles.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={role === item.value}
                    className={role === item.value ? "active" : ""}
                    onClick={() => {
                      setRole(item.value);
                      setError("");
                    }}
                  >
                    <item.icon size={16} />
                    {item.title}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={submit} className="auth-form">
              {register ? (
                <>
                  <div className="auth-field-row">
                    <label>
                      Full name
                      <input
                        name="name"
                        autoComplete="name"
                        placeholder="Student’s full name"
                        required
                        maxLength={100}
                      />
                    </label>
                    <label>
                      Username
                      <input
                        name="username"
                        autoComplete="username"
                        placeholder="Choose a username"
                        required
                        minLength={3}
                        maxLength={40}
                        pattern="[A-Za-z0-9_.-]+"
                      />
                    </label>
                  </div>
                  <label>
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      maxLength={254}
                    />
                  </label>
                </>
              ) : (
                <label>
                  Email or username
                  <input
                    name="identifier"
                    autoComplete="username"
                    placeholder="Enter your email or username"
                    required
                  />
                </label>
              )}
              <div className={register ? "auth-field-row" : ""}>
                <label>
                  Password
                  <span className="auth-password">
                    <input
                      name="password"
                      type={visible ? "text" : "password"}
                      autoComplete={
                        register ? "new-password" : "current-password"
                      }
                      placeholder={
                        register
                          ? "At least 12 characters"
                          : "Enter your password"
                      }
                      required
                      minLength={register ? 12 : undefined}
                      maxLength={128}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? "Hide password" : "Show password"}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                {register && (
                  <label>
                    Confirm password
                    <input
                      name="confirmPassword"
                      type={visible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter password again"
                      required
                      minLength={12}
                    />
                  </label>
                )}
              </div>
              {register ? (
                <>
                  <div className="auth-field-row">
                    <label>
                      Guardian name
                      <input
                        name="guardianName"
                        placeholder="Parent or guardian’s name"
                        required
                        maxLength={100}
                      />
                    </label>
                    <label>
                      Guardian WhatsApp
                      <input
                        name="guardianPhone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 …"
                        required
                        maxLength={30}
                      />
                    </label>
                  </div>
                  <div className="auth-field-row">
                    <label>
                      Student age
                      <input
                        name="age"
                        type="number"
                        min="3"
                        max="100"
                        placeholder="Age"
                        required
                      />
                    </label>
                    <label>
                      Learning program
                      <select name="program" required defaultValue="">
                        <option value="" disabled>
                          Choose a program
                        </option>
                        <option value="madrasa">Madrasa Learning</option>
                        <option value="school">School Learning</option>
                        <option value="both">Madrasa + School Learning</option>
                      </select>
                    </label>
                  </div>
                  <p className="auth-form-note">
                    New student accounts are reviewed by the academy before
                    access is enabled.
                  </p>
                </>
              ) : (
                <div className="auth-form-options">
                  <label className="auth-checkbox">
                    <input type="checkbox" name="remember" />
                    Remember me
                  </label>
                  <Link href="/account">Forgot password?</Link>
                </div>
              )}
              {error && (
                <p className="portal-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="portal-primary"
                type="submit"
                disabled={pending}
              >
                {pending ? (
                  <LoaderCircle size={18} className="portal-spin" />
                ) : null}
                {pending
                  ? "Please wait…"
                  : register
                    ? "Create student account"
                    : "Continue to your space"}
                {!pending && <ArrowRight size={18} />}
              </button>
            </form>
            <p className="auth-switch">
              {register ? "Already part of Explorium?" : "New to Explorium?"}{" "}
              <Link href={register ? "/login" : "/register"}>
                {register ? "Sign in" : "Create a student account"}{" "}
                <ArrowRight size={13} />
              </Link>
            </p>
          </div>
        )}
        <footer className="auth-footer">
          EXPLORIUM ACADEMY<span>Made for meaningful learning.</span>
        </footer>
      </section>
    </main>
  );
}
