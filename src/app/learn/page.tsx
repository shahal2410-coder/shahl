"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Atom, BookOpen, Compass, Sparkles } from "lucide-react";

export default function LearningHub() {
  const reduced = useReducedMotion();
  return (
    <main className="learning-main learning-hub">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="learning-hub-heading"
      >
        <span className="learning-eyebrow">
          <span /> YOUR PERSONAL LEARNING SPACE
        </span>
        <h1>
          Follow your <em>curiosity.</em>
        </h1>
        <p>
          Two worlds to discover. One place to grow.
          <br />
          Choose a path and make something new of today.
        </p>
      </motion.div>
      <div className="learning-worlds">
        <Link
          href="/learn/madrasa"
          className="learning-world learning-world-madrasa"
        >
          <div className="learning-world-top">
            <span>01 / KNOWLEDGE & CHARACTER</span>
            <ArrowUpRight />
          </div>
          <div className="learning-world-illustration learning-arch">
            <div className="learning-arch-outline" />
            <div className="learning-sun" />
            <BookOpen size={100} strokeWidth={0.8} />
            <span className="learning-arch-star">✧</span>
          </div>
          <div className="learning-world-copy">
            <span className="learning-eyebrow">A MEANINGFUL JOURNEY</span>
            <h2>Madrasa Studio</h2>
            <p>
              A peaceful space for Islamic learning, language, values, and
              thoughtful reflection.
            </p>
            <span className="learning-world-link">
              Enter the studio <ArrowUpRight size={18} />
            </span>
          </div>
        </Link>
        <Link
          href="/learn/school"
          className="learning-world learning-world-school"
        >
          <div className="learning-world-top">
            <span>02 / CURIOSITY & DISCOVERY</span>
            <ArrowUpRight />
          </div>
          <div className="learning-world-illustration learning-science-orbit">
            <div />
            <div />
            <Atom size={115} strokeWidth={0.8} />
            <span className="learning-orbit-point" />
          </div>
          <div className="learning-world-copy">
            <span className="learning-eyebrow">BIG IDEAS START HERE</span>
            <h2>School Lab</h2>
            <p>
              See ideas come to life. Explore mathematics, science, and the
              world through hands-on discovery.
            </p>
            <span className="learning-world-link">
              Explore the lab <ArrowUpRight size={18} />
            </span>
          </div>
        </Link>
      </div>
      <section className="learning-hub-note">
        <Compass size={25} strokeWidth={1.3} />
        <div>
          <h3>Learn at your own pace.</h3>
          <p>
            Experiment, ask questions, and return whenever you like. Your
            teacher’s assignments and resources are waiting in your dashboard.
          </p>
        </div>
        <Link href="/portal">
          View my learning <ArrowUpRight size={18} />
        </Link>
      </section>
    </main>
  );
}
