"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Atom,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  FlaskConical,
  Globe2,
  Leaf,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sigma,
  Sparkles,
} from "lucide-react";

const subjects = [
  { name: "Mathematics", Icon: Sigma, caption: "THE SHAPE OF AN IDEA" },
  { name: "Physics", Icon: Atom, caption: "THE SCIENCE OF MOTION" },
  {
    name: "Chemistry",
    Icon: FlaskConical,
    caption: "SMALL THINGS, BIG DISCOVERIES",
  },
  { name: "Biology", Icon: Leaf, caption: "A CLOSER LOOK AT LIFE" },
  { name: "English", Icon: BookOpen, caption: "MAKE EVERY WORD COUNT" },
  { name: "Social Science", Icon: Globe2, caption: "UNDERSTAND YOUR WORLD" },
  { name: "Computer Science", Icon: Code2, caption: "THINK IN NEW WAYS" },
];

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="learning-insight">
      <Lightbulb size={20} />
      <div>
        <strong>Something to think about</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Mathematics() {
  const [a, setA] = useState(1);
  const [c, setC] = useState(0);
  const points = Array.from({ length: 201 }, (_, i) => {
    const x = -5 + i * 0.05;
    return `${250 + x * 42},${210 - (a * x * x + c) * 30}`;
  }).join(" ");
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">01 / INTERACTIVE EXPLORATION</span>
          <h2>Give an equation a shape.</h2>
          <p>
            Move the sliders. Watch how a simple rule draws a different world.
          </p>
        </div>
        <span className="learning-experiment-badge">Live graph</span>
      </div>
      <div className="learning-experiment-grid">
        <div className="learning-graph">
          <div className="learning-graph-formula">
            y = <span>{a.toFixed(1)}</span>x² {c < 0 ? "−" : "+"}{" "}
            <span>{Math.abs(c).toFixed(1)}</span>
          </div>
          <svg
            viewBox="0 0 500 330"
            role="img"
            aria-label={`Graph of y equals ${a} x squared plus ${c}`}
          >
            <defs>
              <pattern
                id="grid"
                width="42"
                height="30"
                patternUnits="userSpaceOnUse"
                x="250"
                y="210"
              >
                <path
                  d="M42 0H0V30"
                  fill="none"
                  stroke="#e7edf4"
                  strokeWidth="1"
                />
              </pattern>
              <clipPath id="graph-clip">
                <rect x="40" y="20" width="420" height="280" />
              </clipPath>
            </defs>
            <rect x="40" y="20" width="420" height="280" fill="url(#grid)" />
            <line x1="40" x2="470" y1="210" y2="210" stroke="#b0bdce" />
            <line x1="250" x2="250" y1="15" y2="305" stroke="#b0bdce" />
            {[-4, -2, 2, 4].map((x) => (
              <text
                key={x}
                x={250 + x * 42}
                y="226"
                textAnchor="middle"
                fill="#75849a"
                fontSize="10"
              >
                {x}
              </text>
            ))}
            {[-2, 2, 4, 6].map((y) => (
              <text
                key={y}
                x="240"
                y={214 - y * 30}
                textAnchor="end"
                fill="#75849a"
                fontSize="10"
              >
                {y}
              </text>
            ))}
            <text x="477" y="214" fill="#75849a" fontSize="12">
              x
            </text>
            <text x="246" y="12" fill="#75849a" fontSize="12">
              y
            </text>
            <polyline
              points={points}
              fill="none"
              stroke="#2862df"
              strokeWidth="3"
              clipPath="url(#graph-clip)"
            />
            <circle cx="250" cy={210 - c * 30} r="5" fill="#00a99d" />
            <circle
              cx="250"
              cy={210 - c * 30}
              r="10"
              fill="#00a99d"
              opacity=".12"
            />
          </svg>
          <span className="learning-graph-legend">
            <i /> Vertex: (0, {c.toFixed(1)})
          </span>
        </div>
        <div className="learning-controls">
          <span className="learning-eyebrow">YOU’RE IN CONTROL</span>
          <h3>Change the variables.</h3>
          <label htmlFor="coefficient">
            Curve coefficient <strong>a = {a.toFixed(1)}</strong>
          </label>
          <input
            id="coefficient"
            type="range"
            min="-2"
            max="2"
            step=".1"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
          <div className="learning-range-labels">
            <span>−2</span>
            <span>2</span>
          </div>
          <label htmlFor="offset">
            Vertical shift <strong>c = {c.toFixed(1)}</strong>
          </label>
          <input
            id="offset"
            type="range"
            min="-2"
            max="4"
            step=".5"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
          />
          <div className="learning-range-labels">
            <span>−2</span>
            <span>4</span>
          </div>
          <div className="learning-observation" aria-live="polite">
            <span>WHAT YOU’RE SEEING</span>
            <p>
              {a === 0
                ? "With a = 0, the curve becomes a horizontal line."
                : `The parabola opens ${a > 0 ? "upward" : "downward"}. ${Math.abs(a) > 1 ? "A larger absolute coefficient makes the curve narrower." : "A smaller absolute coefficient makes the curve wider."}`}{" "}
              {c !== 0 &&
                `The whole graph shifts ${Math.abs(c)} units ${c > 0 ? "up" : "down"}.`}
            </p>
          </div>
          <button
            className="learning-reset"
            onClick={() => {
              setA(1);
              setC(0);
            }}
          >
            <RotateCcw size={14} /> Reset experiment
          </button>
        </div>
      </div>
      <Insight>
        Try changing a from 1 to −1. What stays the same? What changes? Now set
        a to 0 and describe the result.
      </Insight>
    </>
  );
}

function Physics() {
  const [length, setLength] = useState(1.5);
  const [gravity, setGravity] = useState(9.81);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const pixels = 60 + length * 58;
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">02 / MOTION LAB</span>
          <h2>Find the rhythm of physics.</h2>
          <p>Experiment with a pendulum and discover what changes its swing.</p>
        </div>
        <span className="learning-experiment-badge">Small-angle model</span>
      </div>
      <div className="learning-experiment-grid">
        <div className="learning-pendulum">
          <div className="learning-pendulum-reading">
            <span>TIME FOR ONE FULL SWING</span>
            <strong>
              {period.toFixed(2)} <small>seconds</small>
            </strong>
          </div>
          <svg
            viewBox="0 0 500 330"
            role="img"
            aria-label={`Pendulum with length ${length} metres and period ${period.toFixed(2)} seconds`}
          >
            <path
              d="M195 54h110"
              stroke="#b7c6d9"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path d="M250 60v240" stroke="#e3eaf3" strokeDasharray="4 6" />
            <motion.g
              key={`${length}-${gravity}-${playing}`}
              style={{ originX: "250px", originY: "60px" }}
              animate={{ rotate: playing && !reduced ? [-15, 15, -15] : -15 }}
              transition={{
                duration: period,
                ease: "easeInOut",
                repeat: playing && !reduced ? Infinity : 0,
              }}
            >
              <line
                x1="250"
                y1="60"
                x2="250"
                y2={60 + pixels}
                stroke="#7589a7"
                strokeWidth="2"
              />
              <circle cx="250" cy={60 + pixels} r="23" fill="#dbe8ff" />
              <circle cx="250" cy={60 + pixels} r="17" fill="#2563eb" />
              <circle cx="245" cy={55 + pixels} r="5" fill="#7ea8ff" />
            </motion.g>
            <circle cx="250" cy="60" r="6" fill="#14213d" />
            <text x="292" y={90 + pixels / 2} fill="#7b8ca4" fontSize="12">
              {length.toFixed(1)} m
            </text>
          </svg>
          <div className="learning-formula-caption">T = 2π √(L / g)</div>
        </div>
        <div className="learning-controls">
          <span className="learning-eyebrow">CHANGE THE CONDITIONS</span>
          <h3>A different kind of swing.</h3>
          <label htmlFor="pendulum-length">
            Length <strong>{length.toFixed(1)} m</strong>
          </label>
          <input
            id="pendulum-length"
            type="range"
            min=".5"
            max="3"
            step=".1"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <div className="learning-range-labels">
            <span>0.5 m</span>
            <span>3.0 m</span>
          </div>
          <label htmlFor="gravity">Gravity</label>
          <select
            id="gravity"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
          >
            <option value={9.81}>Earth · 9.81 m/s²</option>
            <option value={1.62}>Moon · 1.62 m/s²</option>
            <option value={3.71}>Mars · 3.71 m/s²</option>
          </select>
          <button
            className="learning-button learning-button-blue"
            onClick={() => setPlaying((v) => !v)}
            disabled={!!reduced}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
            {reduced
              ? "Reduced motion enabled"
              : playing
                ? "Pause simulation"
                : "Start simulation"}
          </button>
          <p className="learning-control-note">
            Ideal pendulum at a small 15° angle. Air resistance and friction are
            omitted. The diagram’s length is illustrative.
          </p>
        </div>
      </div>
      <Insight>
        A longer pendulum takes longer to complete a swing. Compare Earth and
        the Moon: how does weaker gravity affect the period?
      </Insight>
    </>
  );
}

const elements = [
  {
    symbol: "H",
    name: "Hydrogen",
    number: 1,
    mass: "1.008",
    electrons: [1],
    note: "Hydrogen is the lightest element. Each neutral atom has one proton and one electron.",
  },
  {
    symbol: "C",
    name: "Carbon",
    number: 6,
    mass: "12.011",
    electrons: [2, 4],
    note: "Carbon has six protons. It is a key element in the molecules found in living things.",
  },
  {
    symbol: "O",
    name: "Oxygen",
    number: 8,
    mass: "15.999",
    electrons: [2, 6],
    note: "Oxygen has eight protons. Two oxygen atoms can bond to form the O₂ molecule.",
  },
  {
    symbol: "Na",
    name: "Sodium",
    number: 11,
    mass: "22.990",
    electrons: [2, 8, 1],
    note: "Sodium has one electron in its outer shell in this simplified model. It commonly forms a +1 ion by losing that electron.",
  },
];
function Chemistry() {
  const [selected, setSelected] = useState(1);
  const element = elements[selected];
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">03 / ATOMIC EXPLORER</span>
          <h2>A whole world within an atom.</h2>
          <p>
            Select an element and explore its simplified electron arrangement.
          </p>
        </div>
        <span className="learning-experiment-badge">Shell model</span>
      </div>
      <div className="learning-experiment-grid">
        <div className="learning-atom-diagram">
          <svg
            viewBox="0 0 500 350"
            role="img"
            aria-label={`${element.name}: ${element.number} protons and ${element.number} electrons, shells ${element.electrons.join(", ")}`}
          >
            <defs>
              <radialGradient id="atomGlow">
                <stop stopColor="#e2ecff" />
                <stop offset="1" stopColor="#f8fbff" />
              </radialGradient>
            </defs>
            <circle cx="250" cy="175" r="155" fill="url(#atomGlow)" />
            {element.electrons.map((count, shell) => (
              <g key={shell}>
                <circle
                  cx="250"
                  cy="175"
                  r={65 + shell * 42}
                  fill="none"
                  stroke="#c4d7f5"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {Array.from({ length: count }, (_, i) => {
                  const angle = (2 * Math.PI * i) / count + shell * 0.4;
                  return (
                    <circle
                      key={i}
                      cx={250 + Math.cos(angle) * (65 + shell * 42)}
                      cy={175 + Math.sin(angle) * (65 + shell * 42)}
                      r="6"
                      fill={
                        shell === element.electrons.length - 1
                          ? "#00aa9b"
                          : "#2563eb"
                      }
                    />
                  );
                })}
              </g>
            ))}
            <circle cx="250" cy="175" r="31" fill="#14213d" />
            <text
              x="250"
              y="181"
              textAnchor="middle"
              fill="white"
              fontSize="22"
              fontWeight="600"
            >
              {element.symbol}
            </text>
          </svg>
          <p>
            Simplified shell diagram · electrons do not follow fixed circular
            paths.
          </p>
        </div>
        <div className="learning-controls">
          <span className="learning-eyebrow">CHOOSE AN ELEMENT</span>
          <div className="learning-element-picker">
            {elements.map((e, i) => (
              <button
                key={e.symbol}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
              >
                <small>{e.number}</small>
                <strong>{e.symbol}</strong>
              </button>
            ))}
          </div>
          <h3>{element.name}</h3>
          <dl className="learning-element-facts">
            <div>
              <dt>Atomic number</dt>
              <dd>{element.number}</dd>
            </div>
            <div>
              <dt>Relative atomic mass</dt>
              <dd>{element.mass}</dd>
            </div>
            <div>
              <dt>Electrons per shell</dt>
              <dd>{element.electrons.join(" · ")}</dd>
            </div>
          </dl>
          <p className="learning-control-note">{element.note}</p>
        </div>
      </div>
      <Insight>
        For a neutral atom, the number of electrons equals the number of
        protons. The atomic number tells you how many protons are in its
        nucleus.
      </Insight>
    </>
  );
}

const organelles = [
  {
    name: "Nucleus",
    color: "#8f79bc",
    description:
      "The nucleus contains most of the cell’s DNA. This genetic information helps direct the cell’s activities.",
  },
  {
    name: "Mitochondria",
    color: "#df9872",
    description:
      "Mitochondria release usable energy from nutrients through cellular respiration, producing ATP.",
  },
  {
    name: "Cell membrane",
    color: "#5ca497",
    description:
      "The cell membrane forms a selective boundary. It controls the movement of many substances into and out of the cell.",
  },
  {
    name: "Cytoplasm",
    color: "#a6c9c2",
    description:
      "Cytoplasm includes the gel-like material inside the cell and its organelles, excluding the nucleus. Many chemical reactions take place here.",
  },
];
function Biology() {
  const [selected, setSelected] = useState(0);
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">04 / LIFE UNDER THE LENS</span>
          <h2>Small structures. Remarkable jobs.</h2>
          <p>Explore a simplified animal cell, one essential part at a time.</p>
        </div>
        <span className="learning-experiment-badge">Animal cell</span>
      </div>
      <div className="learning-experiment-grid">
        <div className="learning-cell-diagram">
          <svg
            viewBox="0 0 500 350"
            role="img"
            aria-label={`Animal cell with ${organelles[selected].name} selected`}
          >
            <path
              d="M103 117C130 26 305 33 380 94s69 168-29 208S81 264 89 187q-5-42 14-70"
              fill={selected === 3 ? "#c0ded6" : "#e7f1ed"}
              stroke={selected === 2 ? "#147563" : "#79ad9f"}
              strokeWidth={selected === 2 ? 8 : 4}
            />
            <ellipse
              cx="245"
              cy="172"
              rx="60"
              ry="52"
              fill={selected === 0 ? "#9984be" : "#c3b4d9"}
              stroke="#9481b2"
              strokeWidth={selected === 0 ? 4 : 2}
            />
            <circle cx="257" cy="166" r="19" fill="#796098" />
            <path
              d="M214 162q20-25 45-14m-38 44q26-15 47-4"
              fill="none"
              stroke="#f4edf9"
              strokeWidth="3"
              opacity=".7"
            />
            {[
              { x: 149, y: 142, r: 30 },
              { x: 340, y: 188, r: -28 },
              { x: 207, y: 264, r: 10 },
            ].map((m, i) => (
              <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.r})`}>
                <ellipse
                  rx="30"
                  ry="14"
                  fill={selected === 1 ? "#edac82" : "#f0c7ad"}
                  stroke="#cb8e67"
                  strokeWidth={selected === 1 ? 3 : 1.5}
                />
                <path
                  d="m-20 0 7-6 7 12L2-6l7 12 8-7"
                  fill="none"
                  stroke="#b97f5d"
                  strokeWidth="2"
                />
              </g>
            ))}
            <path
              d="M308 93q23 3 29 20m-31-10q16 2 20 14m-27-3q14 1 20 12m-25-1q12 1 16 12"
              stroke="#91b7a8"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {[
              [137, 209],
              [151, 229],
              [306, 258],
              [336, 118],
              [121, 171],
              [279, 91],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="#94b6a9" />
            ))}
          </svg>
          <span>Illustrative model · structures are not shown to scale.</span>
        </div>
        <div className="learning-controls">
          <span className="learning-eyebrow">LOOK A LITTLE CLOSER</span>
          <h3>Every part has a purpose.</h3>
          <div className="learning-organelle-list">
            {organelles.map((o, i) => (
              <button
                key={o.name}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
              >
                <i style={{ background: o.color }} />
                {o.name}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          <div className="learning-observation" aria-live="polite">
            <span>{organelles[selected].name.toUpperCase()}</span>
            <p>{organelles[selected].description}</p>
          </div>
        </div>
      </div>
      <Insight>
        Cells are living systems. How might a cell’s activities change if it
        could not release usable energy from nutrients?
      </Insight>
    </>
  );
}

function English() {
  const [answer, setAnswer] = useState<number | null>(null);
  const options = [
    "The students is ready to learn.",
    "The students are ready to learn.",
    "The students am ready to learn.",
  ];
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">05 / LANGUAGE STUDIO</span>
          <h2>Find the words that work.</h2>
          <p>A small language challenge to sharpen your eye.</p>
        </div>
        <span className="learning-experiment-badge">Grammar practice</span>
      </div>
      <div className="learning-language-card">
        <BookOpen size={35} strokeWidth={1.2} />
        <span className="learning-eyebrow">SUBJECT–VERB AGREEMENT</span>
        <h3>Which sentence is correct?</h3>
        <div className="learning-quiz-options">
          {options.map((o, i) => (
            <button
              key={o}
              onClick={() => setAnswer(i)}
              aria-pressed={answer === i}
              className={
                answer === i ? (i === 1 ? "is-correct" : "is-incorrect") : ""
              }
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
              {answer === i && i === 1 && <Check size={18} />}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div className="learning-quiz-feedback" aria-live="polite">
            <strong>
              {answer === 1 ? "Exactly right." : "Try once more."}
            </strong>
            <p>
              “Students” is plural, so it takes the plural verb “are.” A
              singular subject would take “is”: “The student is ready to learn.”
            </p>
          </div>
        )}
      </div>
      <Insight>
        Write a sentence about one student, then rewrite it about a whole class
        of students. Which words need to change?
      </Insight>
    </>
  );
}

function Geography() {
  const [distance, setDistance] = useState(4);
  const [scale, setScale] = useState(25000);
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">06 / OUR CONNECTED WORLD</span>
          <h2>A bigger picture, on a smaller map.</h2>
          <p>Explore how a map’s scale connects a drawing to real distances.</p>
        </div>
        <span className="learning-experiment-badge">Map scale</span>
      </div>
      <div className="learning-experiment-grid">
        <div className="learning-map-diagram">
          <svg
            viewBox="0 0 500 330"
            role="img"
            aria-label={`A map distance of ${distance} centimetres represents ${((distance * scale) / 100000).toFixed(2)} kilometres`}
          >
            <rect
              x="35"
              y="35"
              width="430"
              height="260"
              rx="10"
              fill="#e9f0e8"
            />
            <path
              d="M35 223q130-170 210-50t220-72"
              fill="none"
              stroke="#c3dcd5"
              strokeWidth="26"
            />
            <path
              d="M35 120h430M130 35v260M344 35v260M35 247h430"
              stroke="#fff"
              strokeWidth="12"
            />
            <path
              d="m160 77 45-16 36 27-5 27-53 8zM370 192l58-12 19 46-67 6z"
              fill="#d6e3cc"
            />
            <path
              d={`M130 159H${130 + distance * 28}`}
              stroke="#2563eb"
              strokeWidth="3"
              strokeDasharray="5 4"
            />
            <circle cx="130" cy="159" r="8" fill="#2563eb" />
            <circle cx={130 + distance * 28} cy="159" r="8" fill="#00a99d" />
            <text
              x="130"
              y="141"
              textAnchor="middle"
              fill="#14213d"
              fontSize="12"
            >
              A
            </text>
            <text
              x={130 + distance * 28}
              y="141"
              textAnchor="middle"
              fill="#14213d"
              fontSize="12"
            >
              B
            </text>
            <rect x="167" y="185" width="166" height="44" rx="6" fill="white" />
            <text
              x="250"
              y="212"
              textAnchor="middle"
              fill="#14213d"
              fontSize="18"
            >
              {((distance * scale) / 100000).toFixed(2)} km
            </text>
          </svg>
          <p>Illustrative map · distance is measured in a straight line.</p>
        </div>
        <div className="learning-controls">
          <span className="learning-eyebrow">DISTANCE IN PERSPECTIVE</span>
          <h3>From paper to place.</h3>
          <label htmlFor="map-distance">
            Distance on the map <strong>{distance} cm</strong>
          </label>
          <input
            id="map-distance"
            type="range"
            min="1"
            max="10"
            step=".5"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
          />
          <div className="learning-range-labels">
            <span>1 cm</span>
            <span>10 cm</span>
          </div>
          <label htmlFor="map-scale">Map scale</label>
          <select
            id="map-scale"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          >
            <option value={10000}>1 : 10,000</option>
            <option value={25000}>1 : 25,000</option>
            <option value={50000}>1 : 50,000</option>
          </select>
          <div className="learning-observation" aria-live="polite">
            <span>THE CALCULATION</span>
            <p>
              {distance} cm × {scale.toLocaleString()} ={" "}
              {(distance * scale).toLocaleString()} cm in real life.
              <br />
              Divide by 100,000 to get{" "}
              {((distance * scale) / 100000).toFixed(2)} km.
            </p>
          </div>
        </div>
      </div>
      <Insight>
        A scale of 1 : 25,000 means 1 cm on the map represents 25,000 cm, or 250
        metres, on the ground.
      </Insight>
    </>
  );
}

function ComputerScience() {
  const [bits, setBits] = useState([0, 0, 1, 0, 1, 0, 1, 0]);
  const value = bits.reduce((sum, b, i) => sum + b * 2 ** (7 - i), 0);
  return (
    <>
      <div className="learning-experiment-header">
        <div>
          <span className="learning-eyebrow">07 / THINK LIKE A COMPUTER</span>
          <h2>Big possibilities. Just two digits.</h2>
          <p>Toggle the bits to build a number in binary.</p>
        </div>
        <span className="learning-experiment-badge">8-bit explorer</span>
      </div>
      <div className="learning-binary-card">
        <div className="learning-binary-value">
          <span>YOUR NUMBER IN DECIMAL</span>
          <strong aria-live="polite">{value}</strong>
        </div>
        <div className="learning-bits">
          {bits.map((bit, i) => (
            <div key={i}>
              <span>{2 ** (7 - i)}</span>
              <button
                aria-label={`${2 ** (7 - i)} bit, ${bit ? "on" : "off"}`}
                aria-pressed={!!bit}
                onClick={() =>
                  setBits((b) => b.map((v, j) => (i === j ? 1 - v : v)))
                }
              >
                {bit}
              </button>
            </div>
          ))}
        </div>
        <p>
          {bits.some(Boolean)
            ? bits
                .map((b, i) => (b ? 2 ** (7 - i) : null))
                .filter((v) => v !== null)
                .join(" + ")
            : "0"}{" "}
          = <strong>{value}</strong>
        </p>
        <button
          className="learning-reset"
          onClick={() => setBits([0, 0, 0, 0, 0, 0, 0, 0])}
        >
          <RotateCcw size={14} /> Clear all bits
        </button>
      </div>
      <Insight>
        Each position is worth twice the position to its right. Can you create
        the number 100? What is the largest value you can represent with eight
        bits?
      </Insight>
    </>
  );
}

export default function SchoolPage() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const experiments = [
    Mathematics,
    Physics,
    Chemistry,
    Biology,
    English,
    Geography,
    ComputerScience,
  ];
  const Experiment = experiments[selected];
  return (
    <main className="learning-main learning-school">
      <section className="learning-lab-hero">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="learning-eyebrow">
            <span /> WELCOME TO THE SCHOOL LAB
          </span>
          <h1>
            Less memorizing.
            <br />
            <em>More discovering.</em>
          </h1>
          <p>
            Explore. Experiment. Understand.
            <br />A space where good questions lead to great discoveries.
          </p>
        </motion.div>
        <div className="learning-lab-symbol" aria-hidden="true">
          <div />
          <div />
          <Atom size={160} strokeWidth={0.7} />
          <span className="learning-lab-equation">E = mc²</span>
          <span className="learning-lab-spark">
            <Sparkles size={20} />
          </span>
        </div>
      </section>
      <div
        className="learning-lab-subjects"
        role="tablist"
        aria-label="School subjects"
      >
        {subjects.map(({ name, Icon }, i) => (
          <button
            key={name}
            id={`subject-tab-${i}`}
            role="tab"
            aria-selected={selected === i}
            aria-controls="experiment-panel"
            tabIndex={selected === i ? 0 : -1}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % subjects.length;
              else if (e.key === "ArrowLeft")
                next = (i - 1 + subjects.length) % subjects.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = subjects.length - 1;
              else return;
              e.preventDefault();
              setSelected(next);
              document.getElementById(`subject-tab-${next}`)?.focus();
            }}
            onClick={() => setSelected(i)}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </div>
      <motion.section
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        id="experiment-panel"
        role="tabpanel"
        aria-labelledby={`subject-tab-${selected}`}
        className="learning-lab-experiment"
        key={selected}
      >
        <Experiment />
      </motion.section>
      <div className="learning-lab-bottom">
        <span>
          <Sparkles size={16} /> Curiosity is a skill. Keep practising.
        </span>
        <span>EXPLORIUM SCHOOL LAB</span>
      </div>
    </main>
  );
}
