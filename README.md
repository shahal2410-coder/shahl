# Explorium Nova

A fresh editorial website and learning application for Explorium Academy, built with Next.js, React, TypeScript, Framer Motion, and a persistent SQLite database.

The interface combines warm white, ink blue, sage, and restrained gold. Original illustrations, a short skippable brand introduction, an interactive role gateway, scroll reveals, and subtle interactions provide the visual identity. Fonts and artwork are bundled locally. Reduced-motion preferences are respected.

## Run locally

Requires **Node.js 24 or later** (uses the built-in `node:sqlite` module).

```sh
npm ci
npm run dev
```

The server uses port 3000. For an optimized server, run `npm run build` followed by `npm start`.

Use the existing checkout. Each cloud task is already isolated; no additional Git worktree is needed.

## First administrator

There are **no default passwords, demo accounts, or seeded student records**. Set `EXPLORIUM_ACCOUNT_PASSWORD` privately in your process or deployment configuration, then run:

```sh
npm run create:admin
```

The default administrator email is `exploriumadmin@gmail.com` and the default username is `administrator`. Passwords must contain 12–128 characters. The script refuses to overwrite existing accounts and never prints passwords.

For the initial teacher, set `EXPLORIUM_ACCOUNT_ROLE=teacher` with a separate private `EXPLORIUM_ACCOUNT_PASSWORD`, then run the same command. The default teacher email is `exploriumteachers@gmail.com`. `EXPLORIUM_ACCOUNT_EMAIL`, `EXPLORIUM_ACCOUNT_USERNAME`, and `EXPLORIUM_ACCOUNT_NAME` can override account details. Remove provisioning password variables when finished.

Students register at `/register`. Administrators approve pending registrations in the Students workspace and assign classes and subjects. Additional teacher accounts can be created from the administrator workspace.

## Included workflows

- Public homepage, learning program filters, FAQ, and WhatsApp enrollment inquiry addressed to **+91 7025375305**. The visitor reviews and sends the message; an inquiry does not mark enrollment complete.
- Separate administrator, teacher, and student sign-in, hashed passwords, opaque HTTP-only sessions, remembered sessions, account approval/deactivation, logout, profile editing, and password changes.
- Database-backed students, teachers, subjects, classes, examinations, events, attendance, timetable, marks, assignments, submissions, feedback, announcements, instructions, and resources.
- Server-enforced class and subject permissions. Students see their own attendance, published marks, and submissions. Only administrators publish marks.
- Documents attached to resources, assignments, and student submissions. Files are limited to 8 MB, validated as PDF, PNG, JPEG, WebP, or UTF-8 text, and served through authenticated download routes. Student uploads are private to their owner and authorized educators.
- Searchable, sortable, paginated tables; CSV exports; printable academic results suitable for saving as PDF; metrics derived from database records; light/dark portal themes; administrator audit history and website copy editing.
- Madrasa Studio with nine subject guides, an original illustrated character, lesson preparation interactions, and educator-provided resources. Religious lesson content must be supplied and reviewed by authorized educators.
- School Lab with interactive quadratic graphs, a small-angle pendulum, atomic shell models, an animal cell, grammar practice, map-scale calculations, and a binary-number explorer. Models state their simplifications.

## Email delivery and verification

Password recovery and email verification include hashed, single-use, expiring tokens. No email provider or sender identity is configured in this checkout. Until configured, account assistance explains the limitation and offers the academy’s WhatsApp contact.

Configure these securely in the server environment:

- `RESEND_API_KEY`: a Resend API key.
- `EXPLORIUM_EMAIL_FROM`: an address on your verified sending domain.
- `EXPLORIUM_APP_URL`: the public HTTPS origin of the application.
- `EXPLORIUM_REQUIRE_VERIFIED_EMAIL=true`: require email verification before sign-in. This also applies to provisioned staff; they can request a verification email through `/account?action=request-verify`.

The email API must be able to reach `api.resend.com`. In environments using the provided network proxy, enable Node’s supported environment proxy handling with `NODE_USE_ENV_PROXY=1` before starting the process. Keep TLS verification enabled.

Email delivery has **not** been verified against a live provider. Token validation, expiry, replay prevention, and session revocation are covered by automated tests. No messages are sent during tests.

## Data and deployment

The database defaults to `data/explorium.sqlite`; `EXPLORIUM_DB_PATH` can specify an absolute path on a persistent volume. Files are stored in this database as authenticated attachments. The data directory, environment files, build outputs, and dependencies are ignored by Git.

Run this application on a persistent Node server with HTTPS. The SQLite database and process-local login rate limits are intended for a single application instance. Back up the database using SQLite’s backup facilities; copying only the main file while writes are running may miss WAL changes. A horizontally scaled or ephemeral/serverless deployment needs shared database, file storage, and rate-limiting infrastructure.

The repository originally contained only a README. No existing application, official logo file, student data, or backend was available to migrate. The current wordmark, compass symbol, and illustrations are original interface artwork; replace the wordmark with the official supplied logo when available. The learning character is animated SVG, not a rigged 3D asset. Learning exercises are interactive exploratory tools; completion is not represented as an official academic record.

No deployment has been published.

## Verification

```sh
npm run typecheck
npm run test:backend
npm run build
npm run test:e2e
```

The browser tests require Chromium at `/usr/bin/chromium` (or configure `PLAYWRIGHT_CHROMIUM_PATH`). They run a production server on port 3100 using an isolated temporary database and temporary test credentials, leaving the development database empty. They check public navigation, mobile overflow, the role gateway, inquiry composition, registration, administrator approval, authentication, academic data, file access, website editing, learning interactions, animation, and logout.

Generated browser captures are in `artifacts/` and are ignored by Git.

## Railway deployment

The root `railway.json` builds the optimized Next.js app, starts it with the Railway-assigned port, checks `/api/public`, and restarts failed processes. In the Railway service settings, attach a persistent volume at `/app/data`, set `EXPLORIUM_DB_PATH=/app/data/explorium.sqlite`, and keep a single running replica: student accounts, records, and uploaded files live in the SQLite database. Configure email and staff credentials through Railway's secure Variables settings. Provision the first administrator from the deployment shell with `npm run create:admin` after the volume is mounted; this script refuses duplicates and does not print passwords. Railway deployment requires the repository source in a Git commit and an authenticated Railway project; neither credentials nor public database data belong in this repository.
