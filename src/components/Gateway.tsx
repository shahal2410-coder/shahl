"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Landmark,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Gateway({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="gateway-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="gateway-title"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="gateway-content"
            initial={{ opacity: 0, y: reduced ? 0 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="icon-button gateway-close"
              onClick={onClose}
              aria-label="Close gateway"
            >
              <X size={22} />
            </button>
            <span className="eyebrow">THE EXPLORIUM GATEWAY</span>
            <h2 id="gateway-title">
              Your next chapter
              <br />
              starts here.
            </h2>
            <p>Where would you like to begin?</p>
            <div className="gateway-panels">
              {[
                {
                  role: "student",
                  label: "Student Space",
                  description: "Discover. Learn. Achieve.",
                  icon: GraduationCap,
                  number: "01",
                  className: "student",
                },
                {
                  role: "teacher",
                  label: "Teaching Studio",
                  description: "Inspire. Guide. Educate.",
                  icon: BookOpen,
                  number: "02",
                  className: "teacher",
                },
                {
                  role: "admin",
                  label: "Administration",
                  description: "Lead. Organize. Manage.",
                  icon: Landmark,
                  number: "03",
                  className: "admin",
                },
              ].map(
                ({
                  role,
                  label,
                  description,
                  icon: Icon,
                  number,
                  className,
                }) => (
                  <Link
                    href={`/login?role=${role}`}
                    className={`gateway-panel ${className}`}
                    key={role}
                  >
                    <span className="gateway-number">
                      {number} <ArrowUpRight size={22} />
                    </span>
                    <span className="gateway-symbol">
                      <Icon strokeWidth={1.2} size={70} />
                    </span>
                    <h3>{label}</h3>
                    <p>{description}</p>
                    <span className="gateway-enter">
                      Enter your space <ArrowUpRight size={17} />
                    </span>
                  </Link>
                ),
              )}
            </div>
            <p className="gateway-footer">
              New to Explorium?{" "}
              <Link href="/register">
                Create a student account <ArrowUpRight size={13} />
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
