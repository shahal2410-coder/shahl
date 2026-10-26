"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import "@/styles/portal.css";
export default function AccountPage() {
  const [action, setAction] = useState("request-reset"),
    [token, setToken] = useState(""),
    [available, setAvailable] = useState<boolean | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const value = new URLSearchParams(location.search).get("action");
    if (value && ["reset", "verify", "request-verify"].includes(value))
      setAction(value);
    setToken(new URLSearchParams(location.hash.slice(1)).get("token") || "");
    fetch("/api/auth/email")
      .then((r) => r.json())
      .then((r) => setAvailable(r.available))
      .catch(() => setAvailable(false));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    if (action === "reset" && form.get("password") !== form.get("confirm")) {
      setError("Your passwords do not match.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          token,
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(result.message);
      history.replaceState(null, "", location.pathname + location.search);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const isLink = action === "reset" || action === "verify";
  return (
    <main className="account-page">
      <div className="account-card">
        <Link href="/login" className="auth-back">
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
        <span className="account-icon">
          <Mail size={28} strokeWidth={1.3} />
        </span>
        <span className="auth-eyebrow">YOUR EXPLORIUM ACCOUNT</span>
        <h1>
          {action === "verify" || action === "request-verify"
            ? "A little peace of mind."
            : "A fresh start."}
        </h1>
        <p>
          {action === "verify"
            ? "Confirm your email address to keep your account connected."
            : action === "request-verify"
              ? "Request a new link to verify your email address."
              : action === "reset"
                ? "Choose a new password for your learning space."
                : "Enter your email and we’ll help you reset your password."}
        </p>
        {message ? (
          <div className="account-confirmation" role="status">
            <Check size={24} />
            <p>{message}</p>
            <Link className="portal-primary" href="/login">
              Continue to sign in
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : available === null && !isLink ? (
          <p>Checking account services…</p>
        ) : !isLink && !available ? (
          <div className="account-assistance">
            <p>
              Online email assistance is not available yet. Contact the academy
              for help accessing your account.
            </p>
            <a
              className="portal-primary"
              href="https://wa.me/917025375305?text=Hello%20Explorium%2C%20I%20need%20help%20with%20my%20account."
              target="_blank"
              rel="noreferrer"
            >
              Contact the academy
              <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            {!isLink && (
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                />
              </label>
            )}
            {action === "reset" && (
              <>
                <label>
                  New password
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    type="password"
                    name="confirm"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
              </>
            )}
            {error && (
              <p className="portal-error" role="alert">
                {error}
              </p>
            )}
            <button className="portal-primary" disabled={busy} type="submit">
              {busy
                ? "Please wait…"
                : action === "verify"
                  ? "Verify email"
                  : action === "reset"
                    ? "Save new password"
                    : "Send account link"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
