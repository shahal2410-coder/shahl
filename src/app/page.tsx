"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  FlaskConical,
  Globe2,
  GraduationCap,
  Heart,
  Menu,
  MessageCircle,
  Orbit,
  Play,
  Plus,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import Link from "next/link";
import Gateway from "@/components/Gateway";
import LearningIllustration from "@/components/LearningIllustration";

const subjects = {
  "All programs": [
    "Qur’an & Tajweed",
    "Arabic",
    "Islamic Studies",
    "Mathematics",
    "Science",
    "English",
  ],
  "Madrasa learning": ["Qur’an & Tajweed", "Arabic", "Islamic Studies"],
  "School learning": ["Mathematics", "Science", "English"],
};
const programDescriptions: Record<string, string> = {
  "Qur’an & Tajweed":
    "A thoughtful path to recitation, understanding, and connection.",
  Arabic: "Build confidence in the language, one meaningful lesson at a time.",
  "Islamic Studies":
    "Explore knowledge, values, and character with caring guidance.",
  Mathematics:
    "Turn curiosity into confidence with patterns, numbers, and discovery.",
  Science: "Ask big questions. Explore the extraordinary in the everyday.",
  English: "Find your voice through reading, writing, and conversation.",
};
const faq = [
  [
    "What makes Explorium different?",
    "Explorium brings Islamic education and modern academic learning together in one thoughtfully designed space. Students have a personal dashboard, access to their teachers’ materials, and interactive learning environments.",
  ],
  [
    "Can my child join both learning programs?",
    "You can express interest in both Madrasa Learning and School Learning. Our academy team will help you choose suitable subjects and timings when you inquire.",
  ],
  [
    "How do online classes work?",
    "Once your account is approved and classes are assigned, your student space shows your timetable, assignments, learning resources, and teacher instructions. Your teacher will share the details for each class.",
  ],
  [
    "How can I enroll my child?",
    "Complete the inquiry form below and continue on WhatsApp. Your details will appear in a message ready for you to send. The academy will confirm available programs, timings, and enrollment.",
  ],
  [
    "How do I access my student account?",
    "Select Your Space, choose Student Space, and sign in. New students can create an account, which becomes available after approval by the academy.",
  ],
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Explorium Academy home"
    >
      <span className="brand-symbol">
        <Compass size={29} strokeWidth={1.8} />
      </span>
      <span>
        explorium<span className="brand-subtitle">A C A D E M Y</span>
      </span>
    </Link>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      data-reveal
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [gateway, setGateway] = useState(false);
  const [menu, setMenu] = useState(false);
  const [intro, setIntro] = useState(false);
  const [filter, setFilter] = useState<keyof typeof subjects>("All programs");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [whatsapp, setWhatsapp] = useState("");
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [announcements, setAnnouncements] = useState<
    {
      id: string;
      title: string;
      body?: string;
      content?: string;
      description?: string;
    }[]
  >([]);
  const reduced = useReducedMotion();
  useEffect(() => {
    try {
      if (
        !sessionStorage.getItem("explorium-intro") &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setIntro(true);
        sessionStorage.setItem("explorium-intro", "seen");
      }
    } catch {}
    const timer = setTimeout(() => setIntro(false), 1800);
    fetch("/api/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((value) => {
        if (value) {
          setAnnouncements(
            value.data?.announcements ?? value.announcements ?? [],
          );
          setSiteContent(value.data?.settings ?? {});
        }
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);
  function enrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const message = `Hello Explorium Academy! I would like to inquire about enrollment.\n\nStudent: ${values.get("student")}\nGuardian: ${values.get("guardian")}\nAge: ${values.get("age")}\nEmail: ${values.get("email")}\nWhatsApp: ${values.get("phone")}\nProgram: ${values.get("program")}\nPreferred timing: ${values.get("timing")}\n\nPlease share availability and the next steps.`;
    setWhatsapp(
      `https://wa.me/917025375305?text=${encodeURIComponent(message)}`,
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnimatePresence>
        {intro && (
          <motion.div
            className="brand-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            aria-label="Welcome to Explorium Academy"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Compass className="intro-compass" size={72} strokeWidth={1} />
              <h2>EXPLORIUM ACADEMY</h2>
              <p>A New Dimension of Learning.</p>
            </motion.div>
            <button onClick={() => setIntro(false)}>
              Skip intro <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={`desktop-nav ${menu ? "nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <a
              className="nav-active"
              href="#home"
              onClick={() => setMenu(false)}
            >
              Home
            </a>
            <a href="#about" onClick={() => setMenu(false)}>
              Our story
            </a>
            <a href="#programs" onClick={() => setMenu(false)}>
              Learning programs <ChevronDown size={12} />
            </a>
            <a href="#approach" onClick={() => setMenu(false)}>
              Our approach
            </a>
            <a href="#contact" onClick={() => setMenu(false)}>
              Get in touch
            </a>
          </nav>
          <button className="nav-portal" onClick={() => setGateway(true)}>
            Your space <ArrowUpRight size={16} />
          </button>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero container" id="home">
          <motion.div
            className="hero-copy"
            initial={reduced ? false : { opacity: 0, y: 25 }}
            animate={{ opacity: intro && !reduced ? 0 : 1, y: intro && !reduced ? 18 : 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="hero-eyebrow">
              <span className="tiny-star">✦</span> A NEW DIMENSION OF LEARNING
            </span>
            <h1>
              Learning that
              <br />
              opens{" "}
              <span className="new-word">
                new
                <svg viewBox="0 0 180 16" aria-hidden="true">
                  <path d="M3 12C50 1 120 1 174 9" />
                </svg>
              </span>
              <br />
              <span className="blue-word">worlds.</span>
              <span className="heading-spark" aria-hidden="true">
                <svg width="57" height="57" viewBox="0 0 60 60" fill="none">
                  <g
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  >
                    <path d="M30 5v50M5 30h50M12 12l36 36M12 48l36-36" />
                  </g>
                </svg>
              </span>
            </h1>
            <p>
              Rooted in values. Inspired by possibility.
              <br />
              {siteContent.heroDescription ||
                "Meaningful Islamic education and modern academic learning, beautifully brought together."}
            </p>
            <div className="hero-actions">
              <a className="button button-blue" href="#programs">
                Explore our programs <ArrowUpRight size={18} />
              </a>
              <button className="text-button" onClick={() => setGateway(true)}>
                <span className="play-icon">
                  <Play size={11} fill="currentColor" />
                </span>{" "}
                Step inside Explorium
              </button>
            </div>
            <div className="hero-note">
              <span className="note-icon">
                <Heart size={16} />
              </span>
              <span>A little curiosity. A lifetime of possibility.</span>
            </div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: intro && !reduced ? 0 : 1, scale: intro && !reduced ? .96 : 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="visual-grid" />
            <div className="visual-topline">
              <span>
                <span className="status-dot" /> MADE FOR CURIOUS MINDS
              </span>
              <Orbit size={21} />
            </div>
            <LearningIllustration />
            <div className="floating-label label-top">
              <span className="floating-icon gold">
                <Sparkles size={18} />
              </span>
              <div>
                Big ideas start here.<small>Let curiosity lead the way.</small>
              </div>
            </div>
            <div className="floating-label label-bottom">
              <span className="floating-icon teal">
                <BookOpen size={20} />
              </span>
              <div>
                Two worlds. One journey.<small>Faith meets discovery.</small>
                <span className="little-dots">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <ArrowUpRight size={16} />
            </div>
            <span className="visual-footnote">EXPLORE · DISCOVER · BECOME</span>
            <span className="visual-index">01 / ∞</span>
          </motion.div>
        </section>
        <section className="values-strip" aria-label="Our values">
          <div className="container">
            <span>
              Thoughtfully designed.
              <br />
              <strong>Wholeheartedly taught.</strong>
            </span>
            <span>
              <BookOpen /> Rooted in values
            </span>
            <span>
              <Globe2 /> Learning without limits
            </span>
            <span>
              <Heart /> Every learner matters
            </span>
            <span>
              <Sprout /> Growth, every day
            </span>
          </div>
        </section>

        <section className="section container worlds-section" id="programs">
          <Reveal className="section-heading">
            <div>
              <span className="eyebrow">
                ONE ACADEMY. ENDLESS POSSIBILITIES.
              </span>
              <h2>
                Two worlds of learning.
                <br />
                <span className="muted-heading">One extraordinary you.</span>
              </h2>
            </div>
            <p>
              Knowledge for the mind. Values for the heart.
              <br />
              Discover a learning journey that nurtures both.
            </p>
          </Reveal>
          <div className="worlds-grid">
            <Reveal className="world-card madrasa-card">
              <div className="world-card-top">
                <span className="world-tag">
                  <BookOpen size={14} /> MADRASA STUDIO
                </span>
                <span className="world-number">01</span>
              </div>
              <h3>
                Rooted in faith.
                <br />
                Growing in wisdom.
              </h3>
              <p>
                A thoughtful space to discover Islamic knowledge,
                <br className="desktop-break" /> build character, and connect
                with what matters.
              </p>
              <a
                className="world-link"
                href="#subjects"
                onClick={() => setFilter("Madrasa learning")}
              >
                Explore Madrasa learning <ArrowUpRight size={18} />
              </a>
              <div className="madrasa-art" aria-hidden="true">
                <div className="arch arch-one" />
                <div className="arch arch-two" />
                <span className="arch-star">✦</span>
                <div className="art-book">
                  <span />
                  <span />
                </div>
                <div className="book-pedestal" />
                <span className="art-leaf leaf-one" />
                <span className="art-leaf leaf-two" />
              </div>
              <div className="world-card-bottom">
                <span>Qur’an & Tajweed</span>
                <i />
                <span>Arabic</span>
                <i />
                <span>Islamic Studies</span>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="world-card school-card">
              <div className="world-card-top">
                <span className="world-tag">
                  <FlaskConical size={14} /> SCHOOL LAB
                </span>
                <span className="world-number">02</span>
              </div>
              <h3>
                Big questions.
                <br />
                Brilliant discoveries.
              </h3>
              <p>
                Bring ideas to life through interactive exploration,
                <br className="desktop-break" /> creative thinking, and a little
                everyday wonder.
              </p>
              <a
                className="world-link"
                href="#subjects"
                onClick={() => setFilter("School learning")}
              >
                Explore School learning <ArrowUpRight size={18} />
              </a>
              <div className="science-art" aria-hidden="true">
                <div className="science-orbit orbit-one" />
                <div className="science-orbit orbit-two" />
                <div className="science-orbit orbit-three" />
                <div className="atom-core" />
                <div className="atom-dot dot-one" />
                <div className="atom-dot dot-two" />
                <span className="math-symbol">x²</span>
                <span className="science-plus">+</span>
              </div>
              <div className="world-card-bottom">
                <span>Mathematics</span>
                <i />
                <span>Science</span>
                <i />
                <span>Languages & more</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="container about-grid">
            <Reveal className="about-art">
              <div className="about-circles">
                <span />
                <span />
                <span />
              </div>
              <div className="about-statement">
                <span className="tiny-star">✦</span>
                <span>
                  More than lessons.
                  <br />
                  Life-long
                  <br />
                  <em>possibilities.</em>
                </span>
                <span className="statement-caption">THE EXPLORIUM WAY</span>
              </div>
              <span className="about-corner">
                <Sprout size={42} strokeWidth={1} />
              </span>
            </Reveal>
            <Reveal className="about-copy">
              <span className="eyebrow">SMALL MOMENTS. MEANINGFUL GROWTH.</span>
              <h2>
                A love for learning.
                <br />A foundation for life.
              </h2>
              <p>
                We believe education should open doors. To new ideas, to deeper
                understanding, and to the person every learner has the potential
                to become.
              </p>
              <p>
                {siteContent.philosophyText ||
                  "At Explorium, timeless values meet modern ways of learning. We make space for questions, celebrate effort, and help every student find their own way forward."}
              </p>
              <a className="text-link" href="#approach">
                Discover our approach <ArrowUpRight size={18} />
              </a>
            </Reveal>
          </div>
        </section>

        <section className="section container" id="approach">
          <Reveal className="section-heading">
            <div>
              <span className="eyebrow">THOUGHTFULLY DIFFERENT</span>
              <h2>
                Built around the way
                <br />
                <span className="muted-heading">your child learns.</span>
              </h2>
            </div>
            <a href="#contact" className="text-link">
              Let’s find their path <ArrowUpRight size={18} />
            </a>
          </Reveal>
          <div className="features-grid">
            {[
              {
                icon: Sparkles,
                title: "Learning by doing",
                text: "Hands-on activities turn abstract ideas into moments of real understanding.",
              },
              {
                icon: MessageCircle,
                title: "Room for curiosity",
                text: "Interactive lessons make questions, conversations, and discovery part of every day.",
              },
              {
                icon: Clock3,
                title: "A rhythm that fits",
                text: "Find learning opportunities that work alongside your family’s everyday life.",
              },
              {
                icon: Heart,
                title: "Support at every step",
                text: "A thoughtful learning space where progress matters and each learner belongs.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.07} className="feature">
                <span className={`feature-icon feature-icon-${i}`}>
                  <Icon size={24} strokeWidth={1.6} />
                </span>
                <span className="feature-index">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="experience-section">
          <div className="container experience-grid">
            <Reveal className="experience-copy">
              <span className="eyebrow light-eyebrow">
                A SPACE THAT GROWS WITH YOU
              </span>
              <h2>
                Your whole learning
                <br />
                world. <span>Connected.</span>
              </h2>
              <p>
                Classes, assignments, progress, and those little moments of
                achievement. All together in a calm, personal space that feels
                like yours.
              </p>
              <ul>
                <li>
                  <Check /> A personal dashboard for every learner
                </li>
                <li>
                  <Check /> Meaningful guidance from your teachers
                </li>
                <li>
                  <Check /> Interactive tools that make ideas click
                </li>
              </ul>
              <button
                className="button button-white"
                onClick={() => setGateway(true)}
              >
                Find your space <ArrowUpRight size={17} />
              </button>
            </Reveal>
            <Reveal className="dashboard-preview">
              <div className="preview-top">
                <span className="preview-logo">
                  <Compass size={18} /> explorium
                </span>
                <span>
                  YOUR LEARNING SPACE{" "}
                  <span className="preview-avatar">
                    <GraduationCap size={17} />
                  </span>
                </span>
              </div>
              <div className="preview-body">
                <span className="preview-kicker">
                  A LITTLE PROGRESS, EVERY DAY
                </span>
                <h3>
                  Make room for possibility. <span>✦</span>
                </h3>
                <p>Pick a world. Follow your curiosity.</p>
                <div className="preview-worlds">
                  <button onClick={() => setGateway(true)}>
                    <BookOpen size={28} strokeWidth={1.3} />
                    <strong>Madrasa Studio</strong>
                    <span>
                      Knowledge. Values. Connection. <ArrowUpRight size={14} />
                    </span>
                  </button>
                  <button onClick={() => setGateway(true)}>
                    <Orbit size={28} strokeWidth={1.3} />
                    <strong>School Lab</strong>
                    <span>
                      Explore. Experiment. Understand.{" "}
                      <ArrowUpRight size={14} />
                    </span>
                  </button>
                </div>
                <div className="preview-tools">
                  <span>
                    <Clock3 size={17} /> My timetable
                  </span>
                  <span>
                    <BookOpen size={17} /> Learning resources
                  </span>
                  <span>
                    <GraduationCap size={17} /> My progress
                  </span>
                </div>
              </div>
              <div className="preview-caption">
                <span className="status-dot" /> A preview of your personal
                learning space
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section container" id="subjects">
          <Reveal className="section-heading">
            <div>
              <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
              <h2>Find your next discovery.</h2>
            </div>
            <div
              className="program-filters"
              role="group"
              aria-label="Filter programs"
            >
              {Object.keys(subjects).map((key) => (
                <button
                  key={key}
                  className={filter === key ? "selected" : ""}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key as keyof typeof subjects)}
                >
                  {key}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="program-grid">
            {subjects[filter].map((subject, i) => (
              <motion.a
                layout={!reduced}
                key={subject}
                className="program-item"
                href="#contact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="program-count">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{subject}</h3>
                  <p>{programDescriptions[subject]}</p>
                </div>
                <span className="program-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </motion.a>
            ))}
          </div>
        </section>

        <section className="journey-section">
          <div className="container">
            <Reveal className="centered-heading">
              <span className="eyebrow">
                BIG JOURNEYS START WITH A SMALL STEP
              </span>
              <h2>
                A simple beginning.
                <br />
                An extraordinary journey.
              </h2>
            </Reveal>
            <div className="journey-grid">
              {[
                [
                  "01",
                  "Discover",
                  "Find the world of learning that sparks your curiosity.",
                ],
                [
                  "02",
                  "Register",
                  "Tell us a little about your learner and their interests.",
                ],
                [
                  "03",
                  "Connect",
                  "Meet your academy and find your learning rhythm.",
                ],
                [
                  "04",
                  "Learn",
                  "Ask, explore, and grow. One meaningful lesson at a time.",
                ],
              ].map(([number, title, description]) => (
                <Reveal className="journey-step" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {announcements.length > 0 && (
          <section className="section container" id="announcements">
            <span className="eyebrow">FROM THE ACADEMY</span>
            <h2>The latest at Explorium.</h2>
            <div className="announcement-grid">
              {announcements.map((a) => (
                <article key={a.id}>
                  <span className="world-tag">ACADEMY UPDATE</span>
                  <h3>{a.title}</h3>
                  <p>{a.description ?? a.body ?? a.content}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="section container faq-section" id="faq">
          <Reveal>
            <span className="eyebrow">A LITTLE CLARITY</span>
            <h2>
              Curious?
              <br />
              You’re in good company.
            </h2>
            <p>A few things you might be wondering.</p>
            <a
              className="text-link"
              href="https://wa.me/917025375305"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask us on WhatsApp <ArrowUpRight size={17} />
            </a>
          </Reveal>
          <div className="faq-list">
            {faq.map(([q, a], i) => (
              <div
                key={q}
                className={`faq-item ${openFaq === i ? "faq-open" : ""}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                >
                  <span>{q}</span>
                  <Plus size={18} />
                </button>
                <div id={`faq-${i}`} hidden={openFaq !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-grid">
            <Reveal className="contact-copy">
              <span className="eyebrow">LET’S OPEN A NEW WORLD</span>
              <h2>
                Their next chapter
                <br />
                starts <em>with you.</em>
              </h2>
              <p>
                {siteContent.enrollmentNote ||
                  "Tell us a little about your learner. We’ll help you take the next step."}
              </p>
              <a
                className="contact-number"
                href="https://wa.me/917025375305"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  <MessageCircle size={22} />
                </span>
                <div>
                  <small>LET’S TALK ON WHATSAPP</small>+91 70253 75305
                </div>
                <ArrowUpRight size={20} />
              </a>
              <div className="contact-flower" aria-hidden="true">
                <Sprout size={86} strokeWidth={1} />
              </div>
            </Reveal>
            <form
              className="enrollment-form"
              onSubmit={enrollment}
              onChange={() => setWhatsapp("")}
            >
              <div className="form-title">
                <h3>A world of possibility awaits.</h3>
                <p>Start with an enrollment inquiry.</p>
              </div>
              <div className="form-grid">
                <label>
                  Student’s name
                  <input
                    required
                    name="student"
                    placeholder="Full name"
                    autoComplete="off"
                    maxLength={100}
                  />
                </label>
                <label>
                  Guardian’s name
                  <input
                    required
                    name="guardian"
                    placeholder="Full name"
                    autoComplete="name"
                    maxLength={100}
                  />
                </label>
                <label>
                  Student’s age
                  <input
                    required
                    name="age"
                    type="number"
                    min="3"
                    max="100"
                    placeholder="Age"
                  />
                </label>
                <label>
                  WhatsApp number
                  <input
                    required
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    pattern="[+0-9 ()-]{7,20}"
                  />
                </label>
                <label className="form-full">
                  Email address
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Interested in
                  <select name="program" required defaultValue="">
                    <option value="" disabled>
                      Select a program
                    </option>
                    <option>Madrasa Learning</option>
                    <option>School Learning</option>
                    <option>Both programs</option>
                  </select>
                </label>
                <label>
                  Preferred time
                  <select name="timing" required defaultValue="">
                    <option value="" disabled>
                      Select a timing
                    </option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Flexible</option>
                  </select>
                </label>
              </div>
              {whatsapp ? (
                <a
                  className="button button-blue form-submit"
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send your inquiry on WhatsApp <ArrowUpRight size={18} />
                </a>
              ) : (
                <button
                  className="button button-blue form-submit"
                  type="submit"
                >
                  Continue on WhatsApp <ArrowUpRight size={18} />
                </button>
              )}
              <p className="form-note">
                {whatsapp
                  ? "Your message is ready. Open WhatsApp to review and send it."
                  : "Your details open in WhatsApp for you to review and send."}{" "}
                Enrollment is confirmed by the academy.
              </p>
            </form>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <Brand light />
              <p>
                A new dimension of learning.
                <br />A world of possibilities.
              </p>
            </div>
            <div>
              <span>EXPLORE</span>
              <a href="#about">Our story</a>
              <a href="#programs">Learning programs</a>
              <a href="#approach">Our approach</a>
            </div>
            <div>
              <span>YOUR SPACE</span>
              <Link href="/login?role=student">
                Student Space <ArrowUpRight size={12} />
              </Link>
              <Link href="/login?role=teacher">
                Teaching Studio <ArrowUpRight size={12} />
              </Link>
              <Link href="/login?role=admin">
                Administration <ArrowUpRight size={12} />
              </Link>
            </div>
            <div>
              <span>LET’S CONNECT</span>
              <a href="#contact">Enrollment inquiries</a>
              <a href="#faq">Common questions</a>
              <a
                href="https://wa.me/917025375305"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Explorium Academy. All rights
              reserved.
            </span>
            <span>
              Made for minds that wonder. <span>✦</span>
            </span>
          </div>
        </div>
      </footer>
      <Gateway open={gateway} onClose={() => setGateway(false)} />
    </>
  );
}
