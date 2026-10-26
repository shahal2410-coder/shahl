"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import "../../styles/learning.css";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(({ user }) => {
        if (!active) return;
        if (!user)
          router.replace(
            `/login?role=student&next=${encodeURIComponent(pathname)}`,
          );
        else setReady(true);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [router, pathname]);
  return (
    <div
      className={`learning-shell ${pathname.includes("madrasa") ? "learning-shell-warm" : ""}`}
    >
      <header className="learning-header">
        <Link className="learning-brand" href="/">
          <Compass size={28} strokeWidth={1.4} />
          <span>
            explorium<span className="learning-brand-small">ACADEMY</span>
          </span>
        </Link>
        <nav aria-label="Learning navigation">
          <Link
            href="/learn"
            aria-current={pathname === "/learn" ? "page" : undefined}
          >
            Learning hub
          </Link>
          <Link
            href="/learn/madrasa"
            aria-current={pathname.includes("madrasa") ? "page" : undefined}
          >
            Madrasa Studio
          </Link>
          <Link
            href="/learn/school"
            aria-current={pathname.includes("school") ? "page" : undefined}
          >
            School Lab
          </Link>
        </nav>
        <Link className="learning-dashboard" href="/portal">
          My dashboard <ArrowUpRight size={16} />
        </Link>
      </header>
      {ready ? (
        children
      ) : (
        <main className="learning-loading" aria-live="polite">
          <Compass size={36} />
          <h1>
            {error
              ? "We couldn’t open your learning space."
              : "Opening your learning space…"}
          </h1>
          {error && (
            <>
              <p>Please check your connection and try again.</p>
              <button onClick={() => window.location.reload()}>
                Try again
              </button>
            </>
          )}
        </main>
      )}
      <footer className="learning-footer">
        <Link href="/portal">
          <ArrowLeft size={15} /> Back to my dashboard
        </Link>
        <span>A little curiosity. A world of possibility.</span>
        <span>EXPLORIUM ACADEMY</span>
      </footer>
    </div>
  );
}
