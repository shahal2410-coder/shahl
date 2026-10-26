"use client";

export default function LearningIllustration({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <svg
      className={compact ? "learning-art compact" : "learning-art"}
      viewBox="0 0 640 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="An original illustration of a student exploring books, science, and an online classroom"
    >
      <defs>
        <linearGradient
          id="arch"
          x1="340"
          y1="80"
          x2="340"
          y2="570"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0E4DE" />
          <stop offset="1" stopColor="#F0F4EA" />
        </linearGradient>
        <linearGradient
          id="desk"
          x1="170"
          y1="440"
          x2="490"
          y2="600"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0CE9B" />
          <stop offset="1" stopColor="#C89561" />
        </linearGradient>
        <linearGradient
          id="shirt"
          x1="290"
          y1="330"
          x2="430"
          y2="430"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7AAE93" />
          <stop offset="1" stopColor="#497D67" />
        </linearGradient>
        <linearGradient
          id="screen"
          x1="330"
          y1="335"
          x2="465"
          y2="440"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F7F8FB" />
          <stop offset="1" stopColor="#CCD5DF" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="13"
            floodColor="#223C35"
            floodOpacity=".12"
          />
        </filter>
        <filter id="soft">
          <feGaussianBlur stdDeviation="13" />
        </filter>
      </defs>
      <ellipse
        cx="330"
        cy="565"
        rx="213"
        ry="22"
        fill="#76998B"
        opacity=".13"
        filter="url(#soft)"
      />
      <path d="M131 543V266a188 188 0 01376 0v277z" fill="url(#arch)" />
      <path
        d="M159 539V270a160 160 0 01320 0v269"
        stroke="#FFF"
        strokeWidth="2"
        opacity=".65"
      />
      <path
        d="M320 110V535M159 278h320"
        stroke="#F8FCF4"
        strokeWidth="3"
        opacity=".65"
      />
      <circle cx="428" cy="178" r="38" fill="#FFF5D9" />
      <path
        d="M432 214c-28 8-45 34-48 64 28-9 46-30 48-64z"
        fill="#B6CCB6"
        opacity=".7"
      />
      <g className="art-orbit">
        <circle cx="185" cy="168" r="24" fill="#FFBB79" />
        <ellipse
          cx="185"
          cy="168"
          rx="45"
          ry="12"
          transform="rotate(-28 185 168)"
          stroke="#B37D48"
          strokeWidth="3"
        />
        <circle cx="214" cy="135" r="4" fill="#2C6257" />
      </g>
      <g className="art-equation" transform="rotate(9 485 274)">
        <rect
          x="449"
          y="232"
          width="87"
          height="87"
          rx="18"
          fill="#FEFCF5"
          filter="url(#shadow)"
        />
        <path d="M469 273h46m-23-23v46" stroke="#275DDD" strokeWidth="3" />
        <circle cx="491" cy="274" r="18" stroke="#275DDD" strokeWidth="2" />
        <ellipse
          cx="491"
          cy="274"
          rx="30"
          ry="12"
          transform="rotate(-45 491 274)"
          stroke="#7197EE"
          strokeWidth="2"
        />
      </g>
      <g filter="url(#shadow)">
        <path d="M111 420l116-30 65 25-115 31z" fill="#F5DEAB" />
        <path d="M111 420v52l66 28v-54z" fill="#DBAB64" />
        <path d="M177 446l115-31v51l-115 34z" fill="#EBC98B" />
        <path d="M114 395l114-28 62 23-114 31z" fill="#3260AA" />
        <path d="M114 395v25l62 26v-25z" fill="#244D8F" />
        <path d="M176 421l114-31v25l-114 31z" fill="#F7F2E5" />
        <path d="M126 370l102-27 54 22-102 28z" fill="#85A698" />
        <path d="M126 370v25l54 23v-25z" fill="#5D8172" />
        <path d="M180 393l102-28v25l-102 28z" fill="#F9F6E9" />
      </g>
      <path
        d="M265 412c-26 20-34 50-31 79l20 49h34l-8-55 43-28"
        fill="#243E52"
      />
      <path d="M308 428l63 29-11 66-26 8-6-49-47-21" fill="#304F64" />
      <path
        d="M253 530l30-1 13 16c4 8-1 11-10 11h-39c-10 0-12-8-7-14zM335 522l26-1 18 18c5 7 3 12-8 12h-39c-9 0-12-6-6-14z"
        fill="#F7F5ED"
      />
      <path
        d="M274 330c14-20 62-26 84-2 22 27 21 62 9 102-36 19-75 12-102-5-2-32-3-72 9-95z"
        fill="url(#shirt)"
      />
      <path d="M310 294v32c2 15 25 17 30 0v-36" fill="#C9926B" />
      <ellipse cx="323" cy="275" rx="36" ry="44" fill="#DCA77D" />
      <path
        d="M289 277c-15-32 3-58 31-59 28-4 45 16 41 42-14 0-32-8-41-18-7 15-16 19-31 20z"
        fill="#26362E"
      />
      <path d="M291 264c-12-3-14 18-1 21" fill="#DCA77D" />
      <path
        d="M329 278h3m17-1h2"
        stroke="#30362F"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M334 293c5 4 9 3 13-1"
        stroke="#A8684D"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M283 347c-20 10-18 38-9 48 12 11 40 14 66 8l7-19-41-4 6-24"
        fill="#67957D"
      />
      <path d="M329 383c17-2 35-1 40 8 4 9-15 18-33 12" fill="#DCA77D" />
      <g filter="url(#shadow)">
        <path d="M206 442l198-57 129 45-206 64z" fill="url(#desk)" />
        <path d="M206 442v15l121 54v-17z" fill="#C69765" />
        <path d="M327 494l206-64v15l-206 66z" fill="#B6885C" />
        <path
          d="M224 466l16 6-9 88-11-4zM504 453l13-4 10 102-10 5zM331 507l16-5-3 84-12 4z"
          fill="#B78B62"
        />
      </g>
      <path d="M340 428l99-29 52 21-100 31z" fill="#A7B4C2" />
      <path
        d="M390 442l-25-92c-1-5 1-8 6-9l93-25c4-1 7 1 8 5l25 93z"
        fill="url(#screen)"
        stroke="#A8B7C6"
        strokeWidth="2"
      />
      <circle cx="429" cy="381" r="10" fill="#FFF" opacity=".9" />
      <path d="M426 376l8 5-8 5z" fill="#91A6BE" />
      <path d="M454 459l26-8 14 5-27 9z" fill="#F9F4E4" />
      <g>
        <path d="M461 532h43l-7 42h-30z" fill="#E9DDC4" />
        <path d="M482 539v-81" stroke="#507D61" strokeWidth="3" />
        <path d="M483 499c-29-3-40-18-36-34 25 0 38 13 36 34z" fill="#6C9572" />
        <path d="M482 479c0-25 13-42 33-39-1 24-13 40-33 39z" fill="#91AA7F" />
        <path d="M482 520c13-23 27-29 42-23-7 19-22 26-42 23z" fill="#658B67" />
      </g>
      <path
        d="M127 291v18m-9-9h18M535 375v16m-8-8h16"
        stroke="#9FAE95"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="242" cy="115" r="3" fill="#81A090" />
      <circle cx="521" cy="198" r="3" fill="#DDB271" />
    </svg>
  );
}
