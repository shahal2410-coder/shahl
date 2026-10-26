"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Leaf,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const subjects = [
  {
    name: "Qur’an",
    tag: "RECITATION & REFLECTION",
    description:
      "Build a thoughtful recitation practice with guidance from your teacher.",
    prompt:
      "Choose a quiet place, prepare your materials, and ask your teacher which passage to practise.",
  },
  {
    name: "Tajweed",
    tag: "CAREFUL RECITATION",
    description:
      "Develop your recitation through careful listening and teacher-guided practice.",
    prompt:
      "Listen to your assigned example, practise slowly, and note the sounds you would like to review.",
  },
  {
    name: "Hadith",
    tag: "LEARNING WITH CONTEXT",
    description:
      "Explore your teacher’s selected lessons with care, context, and curiosity.",
    prompt:
      "Read the assigned material and bring one question to your next lesson.",
  },
  {
    name: "Fiqh",
    tag: "UNDERSTANDING & PRACTICE",
    description:
      "Develop understanding through structured, educator-led lessons.",
    prompt:
      "Review your class notes and ask your teacher about anything that needs clarification.",
  },
  {
    name: "Aqeedah",
    tag: "FOUNDATIONS OF LEARNING",
    description:
      "Learn the foundations through materials selected by your academy’s educators.",
    prompt:
      "Summarise one idea from your assigned lesson in your own words for your teacher to review.",
  },
  {
    name: "Seerah",
    tag: "LIFE & LEARNING",
    description:
      "Follow your teacher’s lessons and connect each discussion to the wider story.",
    prompt:
      "Create a short timeline using only the events in your assigned lesson.",
  },
  {
    name: "Arabic",
    tag: "LANGUAGE & EXPRESSION",
    description:
      "Make space for language practice, from listening and reading to writing.",
    prompt:
      "Write five words from your current lesson and practise them with your teacher’s pronunciation guide.",
  },
  {
    name: "Islamic History",
    tag: "STORIES & PERSPECTIVE",
    description:
      "Explore historical context through the resources your teacher shares.",
    prompt:
      "Identify a place, a date, and one question from the history material assigned to you.",
  },
  {
    name: "Islamic Manners",
    tag: "CHARACTER & REFLECTION",
    description:
      "Reflect on your educator’s lessons and the ways learning shapes everyday life.",
    prompt:
      "Think about one example discussed in class and share your reflection with your teacher.",
  },
];

function Guide() {
  return (
    <svg
      viewBox="0 0 260 310"
      className="learning-guide"
      role="img"
      aria-label="A friendly illustrated student guide wearing a white prayer cap and a sage tunic"
    >
      <defs>
        <linearGradient id="tunic" x2="1" y2="1">
          <stop stopColor="#91a797" />
          <stop offset="1" stopColor="#4b6c59" />
        </linearGradient>
        <linearGradient id="face" x2="0" y2="1">
          <stop stopColor="#e6b68f" />
          <stop offset="1" stopColor="#ce9573" />
        </linearGradient>
      </defs>
      <ellipse cx="134" cy="289" rx="71" ry="12" fill="#304e3b" opacity=".12" />
      <path
        d="M101 263v24q10 12 25 0v-24m20 0v24q10 12 25 0v-24"
        fill="#415045"
      />
      <path
        d="M88 158q-20 18-26 65l21 7 19-44m67-29q21 10 33 44l-18 11-26-32"
        fill="url(#tunic)"
      />
      <path
        d="M65 223q-7 18 4 22 10 2 14-16m100-19 17-8 10-18q3-10-4-11-5-1-8 10-11-7-14 5l-1 22"
        fill="url(#face)"
      />
      <path d="M101 151q30-13 57 0l19 119q-45 15-90 0z" fill="url(#tunic)" />
      <path d="m116 145 13 20 17-20" fill="#f2f0e8" />
      <path d="M130 166v90" stroke="#a9bcaa" opacity=".6" strokeWidth="2" />
      <circle cx="135" cy="183" r="2" fill="#e1e7d8" />
      <circle cx="135" cy="201" r="2" fill="#e1e7d8" />
      <path d="M115 130v23q15 14 30 0v-23" fill="url(#face)" />
      <ellipse cx="86" cy="100" rx="10" ry="15" fill="#ce9573" />
      <ellipse cx="175" cy="100" rx="10" ry="15" fill="#ce9573" />
      <path
        d="M86 74q2-49 45-49 46 0 45 49v38q-5 35-45 41-39-6-45-41z"
        fill="url(#face)"
      />
      <path d="M84 78q-3-51 47-51t47 51l-6-17-85 1z" fill="#433b31" />
      <path d="M83 64q-4-43 48-43 52 0 48 43z" fill="#fffdf5" />
      <path d="M83 57h96v13H83z" fill="#e7e8de" />
      <path
        d="M90 56h82M94 49h74"
        stroke="#d8dfd5"
        strokeWidth="2"
        strokeDasharray="3 5"
      />
      <path
        d="M101 90q8-6 16 0m28 0q8-6 16 0"
        fill="none"
        stroke="#574333"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="109" cy="102" rx="4" ry="5" fill="#403b33" />
      <ellipse cx="153" cy="102" rx="4" ry="5" fill="#403b33" />
      <circle cx="110" cy="100" r="1.3" fill="white" />
      <circle cx="154" cy="100" r="1.3" fill="white" />
      <path
        d="m129 105-3 10h7"
        fill="none"
        stroke="#b77e60"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M118 125q13 13 26 0"
        fill="#fffaf2"
        stroke="#9f6855"
        strokeWidth="1.5"
      />
      <ellipse cx="100" cy="117" rx="8" ry="4" fill="#ce8a75" opacity=".45" />
      <ellipse cx="161" cy="117" rx="8" ry="4" fill="#ce8a75" opacity=".45" />
    </svg>
  );
}

export default function MadrasaPage() {
  const [selected, setSelected] = useState(0);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false]);
  const [resources, setResources] = useState<
    Array<{
      id: string;
      title?: string;
      name?: string;
      url?: string;
      fileId?: string;
      subjectId?: string;
      description?: string;
    }>
  >([]);
  const [resourceError, setResourceError] = useState(false);
  const reduced = useReducedMotion();
  const subject = subjects[selected];
  useEffect(() => {
    Promise.all([
      fetch("/api/records/resources"),
      fetch("/api/records/subjects"),
    ])
      .then(async (responses) => {
        if (responses.some((r) => !r.ok)) throw new Error();
        return Promise.all(responses.map((r) => r.json()));
      })
      .then(([resourceData, subjectData]) => {
        const ids = new Set(
          subjectData.data
            .filter(
              (item: { department: string }) => item.department === "madrasa",
            )
            .map((item: { id: string }) => item.id),
        );
        setResources(
          resourceData.data.filter((item: { subjectId: string }) =>
            ids.has(item.subjectId),
          ),
        );
      })
      .catch(() => setResourceError(true));
  }, []);
  return (
    <main className="learning-main learning-madrasa">
      <section className="learning-studio-hero">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="learning-eyebrow">
            <Leaf size={14} /> THE MADRASA STUDIO
          </span>
          <h1>
            Knowledge with
            <br />
            <em>meaning.</em>
          </h1>
          <p>
            A calm space to learn, reflect, and grow.
            <br />
            Every small step is part of a beautiful journey.
          </p>
          <a href="#subjects" className="learning-button learning-button-sage">
            Find your next lesson <ChevronRight size={17} />
          </a>
        </motion.div>
        <div className="learning-guide-scene">
          <div className="learning-guide-arch" />
          <div className="learning-guide-sun" />
          <Guide />
          <div className="learning-guide-caption">
            <Sparkles size={14} />
            <span>
              {checklist.every(Boolean)
                ? "You’re ready for your next discovery."
                : `Let’s explore ${subject.name} together.`}
            </span>
          </div>
          <BookOpen className="learning-guide-book" size={37} strokeWidth={1} />
        </div>
      </section>
      <section className="learning-subject-section" id="subjects">
        <div className="learning-section-heading">
          <div>
            <span className="learning-eyebrow">YOUR PATH TO UNDERSTANDING</span>
            <h2>Make room for learning.</h2>
          </div>
          <span>9 subjects · Teacher-guided learning</span>
        </div>
        <div className="learning-studio-grid">
          <aside
            className="learning-subject-list"
            aria-label="Madrasa subjects"
          >
            {subjects.map((s, i) => (
              <button
                key={s.name}
                onClick={() => {
                  setSelected(i);
                  setChecklist([false, false, false]);
                }}
                aria-pressed={selected === i}
              >
                <span className="learning-subject-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.name}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </aside>
          <motion.div
            key={subject.name}
            className="learning-study-panel"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="learning-eyebrow">{subject.tag}</span>
            <h3>{subject.name}</h3>
            <p>{subject.description}</p>
            <div className="learning-reflection">
              <BookOpen size={23} strokeWidth={1.4} />
              <div>
                <h4>A thoughtful place to begin</h4>
                <p>{subject.prompt}</p>
              </div>
            </div>
            <h4 className="learning-checklist-heading">
              Prepare for your lesson
            </h4>
            {[
              "Find a comfortable, quiet space",
              "Have your notes and learning materials ready",
              "Write down one question for your teacher",
            ].map((text, i) => (
              <label className="learning-check-item" key={text}>
                <input
                  type="checkbox"
                  checked={checklist[i]}
                  onChange={() =>
                    setChecklist((c) => c.map((v, j) => (j === i ? !v : v)))
                  }
                />
                <span className="learning-check-box">
                  {checklist[i] && <Check size={14} />}
                </span>
                <span>{text}</span>
              </label>
            ))}
            <p className="learning-check-status" aria-live="polite">
              {checklist.every(Boolean)
                ? "You’re ready. Bring your curiosity to class."
                : `${checklist.filter(Boolean).length} of 3 steps ready`}
            </p>
          </motion.div>
        </div>
      </section>
      <section className="learning-teacher-resources">
        <div>
          <span className="learning-eyebrow">SELECTED BY YOUR EDUCATORS</span>
          <h2>Your learning materials.</h2>
          <p>
            Religious lesson content is provided and reviewed by your academy’s
            authorized educators.
          </p>
        </div>
        <div className="learning-resource-list">
          {resources.length ? (
            resources.map((r) => (
              <div className="learning-resource-row" key={r.id}>
                <BookOpen size={20} />
                <div>
                  <strong>{r.title || r.name || "Learning resource"}</strong>
                  {r.description && <p>{r.description}</p>}
                </div>
                {(r.fileId || (r.url && /^https?:\/\//.test(r.url))) && (
                  <a
                    href={r.fileId ? `/api/files/${r.fileId}` : r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${r.title || r.name || "resource"}`}
                  >
                    <ArrowUpRight size={20} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="learning-resource-empty">
              <BookOpen size={28} strokeWidth={1.2} />
              <h3>
                {resourceError
                  ? "Materials are temporarily unavailable"
                  : "Your next lesson starts with your teacher"}
              </h3>
              <p>
                {resourceError
                  ? "Check your dashboard or return shortly."
                  : "Resources shared with your class will appear here. Visit your dashboard for assignments and teacher instructions."}
              </p>
              <Link href="/portal">
                Go to my dashboard <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
