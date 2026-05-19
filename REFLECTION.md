# SecureGate — Reflection & Engineering Analysis

**Name:** Samuel Sunday
**Cohort:** Design to MVP Bootcamp
**Live URL:** https://securegate-app-omega.vercel.app
**GitHub Repo:** https://github.com/sunsam27/Secure-gate

---

## Part 1 — What I Built

I built SecureGate, a standalone authentication and security application using Next.js 16 with the App Router, TypeScript, PostgreSQL via Prisma, NextAuth.js for session management, bcryptjs for password hashing, Resend for transactional emails, Upstash Ratelimit for brute-force protection, Zod for validation, and Tailwind CSS for styling.

The app supports seven core flows: user sign-up with server-side Zod validation and bcrypt hashing (12 salt rounds), email verification using expiring tokens (15-minute expiry), login via the NextAuth Credentials provider with JWT sessions, a protected dashboard requiring both authentication and email verification, forgot-password with rate-limited requests and safe generic responses to prevent email enumeration, reset-password with expiring tokens (1-hour expiry), and logout with session destruction.

Security features include bcrypt password hashing, secure crypto-based token generation, token expiry and deletion after use, rate limiting on login (5 attempts per 10 minutes) and forgot-password (3 attempts per 15 minutes), safe error messages that never reveal whether an email exists, HTTP security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy), and server-side route protection via NextAuth middleware and dashboard-level session checks.

---

## Part 2 — What Surprised Me

Two things surprised me. First, the Zod v4 API change. The `.errors` property on `ZodError` was removed in v4 in favour of `.issues`. This broke my sign-up and reset-password validation handling during the build step and required a quick find-and-fix across two route files. It was a reminder that even well-known libraries change between major versions, and you should always check the actual installed version's API rather than relying on prior knowledge.

Second, how much of the security work is invisible. The user never sees bcrypt rounds, token expiry checks, or rate-limit sliding windows. But if any of these are wrong, the entire app becomes unsafe. The most important code is the code users never interact with directly.

---

## Part 3 — Engineering Laws Quiz

### Q1 — Murphy's Law
> Anything that can go wrong will go wrong.

**Code reference:** `src/lib/rate-limit.ts:39-45` and `src/lib/mail.tsx:21-24`

**My Answer:** In SecureGate, Murphy's Law is addressed in the rate-limiting and email-sending layers. The `checkLoginRateLimit` function wraps the Upstash Ratelimit call in a try-catch block. If the Redis instance is unavailable or the rate-limiter throws, the catch block returns `{ success: true }`, allowing the request to proceed safely instead of crashing the login flow. Similarly, `sendVerificationEmail` and `sendPasswordResetEmail` wrap the Resend API call in a try-catch, logging the error server-side but never exposing it to the user.

**What goes wrong if ignored:** If the rate-limiter fails and we don't catch it, a user who would otherwise get a valid login attempt would see a 500 error or crash. If the email service fails and we don't catch it, the sign-up or forgot-password endpoint would throw an unhandled exception. Both scenarios break the core user flows for reasons entirely outside the user's control.

---

### Q2 — Law of Leaky Abstractions
> All non-trivial abstractions leak some underlying complexity.

**Code reference:** `src/lib/prisma.ts:1-9` and `prisma/schema.prisma:7-10`

**My Answer:** Prisma abstracts PostgreSQL away behind a schema and a generated client, but the abstraction leaks when you need to understand the actual database connection string, connection pooling, or migration management. The `prisma.ts` file uses the global singleton pattern to prevent multiple Prisma clients during hot-reloading — a workaround for a leak in the abstraction where Next.js's development server would create multiple connections. The schema also defines the datasource URL as `env("DATABASE_URL")`, meaning the developer must understand environment variable configuration outside of Prisma's abstraction.

**What goes wrong if ignored:** Without the global singleton pattern, the app creates dozens of redundant Prisma clients during development, exhausting database connections. If the `DATABASE_URL` environment variable is missing or misconfigured, Prisma's error messages reference connection strings and socket timeouts — leaking the database layer's complexity rather than giving a clear "missing configuration" error.

---

### Q3 — YAGNI (You Aren't Gonna Need It)
> Don't build features until they are actually needed.

**Code reference:** `src/app/dashboard/DashboardClient.tsx:11-90` and `src/middleware.ts:1-5`

**My Answer:** SecureGate follows YAGNI by only building the authentication features actually required for the MVP. The dashboard is intentionally minimal: a welcome message, user info cards, and a list of active security features. There is no admin panel, no user management interface, no role-based access control, no audit logs, no profile editing, and no organisation management. The middleware only matches `/dashboard/:path*` — nothing more. The Prisma schema has exactly three models: `User`, `VerificationToken`, and `PasswordResetToken` — no extra tables for features that don't exist yet.

**What goes wrong if ignored:** Adding unnecessary features like social login, MFA, or admin dashboards before the core auth flow is stable would multiply the surface area for bugs and security issues. It would also waste the 3-hour time limit on features that aren't being assessed.

---

### Q4 — Kerckhoffs's Principle and Password Hashing
> A system should be secure even if everything about the system, except the key, is public knowledge.

**Code reference:** `src/app/api/signup/route.ts:40` and `src/lib/auth.ts:42`

**My Answer:** Kerckhoffs's Principle says security shouldn't depend on obscurity. SecureGate applies this through bcrypt with 12 salt rounds. Even if an attacker obtains the entire database, they cannot reverse the hashed passwords because bcrypt includes a unique salt per password and is computationally expensive by design. The hash comparison in `src/lib/auth.ts:42` uses `bcrypt.compare()` which performs constant-time comparison, preventing timing attacks. The salt rounds are intentionally high (12) to slow down brute-force attempts.

**What goes wrong if ignored:** If passwords were stored as plain text or unsalted hashes like MD5, a database breach would expose every user's password. Users often reuse passwords across services, so a single leak cascades into account takeover on other platforms.

---

### Q5 — Forgot-Password Privacy and Safe Responses
> The system must not reveal whether an email address is registered.

**Code reference:** `src/app/api/forgot-password/route.ts:37-51`

**My Answer:** The forgot-password endpoint always returns the same response regardless of whether the email exists:
```
"If an account exists for this email, a password reset link has been sent."
```
The code looks up the user, and if found, generates a reset token and sends an email. If not found, it simply skips those steps. But both paths return the identical JSON response. This prevents attackers from enumerating valid email addresses through the forgot-password flow.

**What goes wrong if ignored:** If the endpoint returned different messages for existing vs. non-existing emails (e.g., "Reset link sent" vs. "Email not found"), an attacker could scrape the endpoint to build a list of valid user emails, which then feeds into targeted phishing or credential-stuffing attacks.

---

### Q6 — Boy Scout Rule
> Always leave the codebase cleaner than you found it.

**Code reference:** `src/lib/rate-limit.ts:1-30` (after refactor) and `src/components/ui/FormError.tsx:1-10`

**My Answer:** I applied the Boy Scout Rule by refactoring the rate-limiter module, which originally had a misleading "in-memory fallback" comment that actually tried `Redis.fromEnv()` — guaranteed to throw when env vars weren't set. I simplified it to fail cleanly with a null check. I also extracted the FormError, FormSuccess, and PasswordStrengthIndicator components from inline markup across four pages into reusable `src/components/ui/` components, reducing duplication and making the pages easier to read.

**What goes wrong if ignored:** Without small improvements, technical debt accumulates silently. Misleading comments cause future developers to misunderstand the code, and duplicated markup means a UI fix has to be applied in four places instead of one.

---

### Q7 — Gall's Law
> A complex system that works evolved from a simple system that worked.

**Code reference:** `prisma/schema.prisma:12-34` (three simple models) and `src/app/api/` (six focused route files)

**My Answer:** SecureGate follows Gall's Law by keeping the data model minimal. There are exactly three database tables: `User`, `VerificationToken`, and `PasswordResetToken`. Each API route handles exactly one responsibility — signup creates users, verify-email validates tokens, login authenticates, etc. No route tries to do two things. The middleware is a single line: `export { auth as middleware }`. This simplicity means each piece can be tested, understood, and evolved independently.

**What goes wrong if ignored:** If I had started with a complex system (say, adding role-based access, audit logging, and organisation tables from day one), the auth flows would be tangled with these systems. Debugging a login failure would require understanding permissions, logging, and org membership, making the system fragile and hard to validate within the 3-hour window.

---

### Q8 — Prisma vs Database Table Reality
> The ORM abstraction may not perfectly match the actual database state after migrations.

**Code reference:** `prisma/schema.prisma:21-27` (VerificationToken unique constraint) and `src/lib/tokens.ts:14-25`

**My Answer:** The schema defines `VerificationToken` with `@@unique([identifier, token])`, meaning the pair must be unique. However, `token` alone is also marked `@unique`. When I delete an existing token before creating a new one (to handle re-sends), the Prisma abstraction hides the fact that there are actually two uniqueness constraints at the database level. If the `deleteMany` fails but the `create` succeeds, the database could have duplicate tokens — a state the Prisma client type system doesn't warn about.

**What goes wrong if ignored:** A developer might rely on the Prisma schema's uniqueness indicators and skip the manual `deleteMany` step, assuming the `@@unique` constraint is enforced at the application level. But it's only enforced at the database level via the generated migration. If the migration hasn't been run yet (no `prisma/migrations/` directory exists), there are no constraints at all.

---

### Q9 — Rate Limiting and Zawinski's Law
> Every program attempts to expand until it can read mail. Those who cannot so expand are replaced by those can.

**Code reference:** `src/lib/rate-limit.ts:26-30` and `src/app/api/forgot-password/route.ts:13-20`

**My Answer:** Zawinski's Law humorously describes how software tends to absorb adjacent features. Rate limiting is an example — authentication doesn't intrinsically require a Redis-backed rate-limiter, but without it, the login and forgot-password endpoints are vulnerable to brute-force attacks. SecureGate uses Upstash Ratelimit with a sliding window algorithm. The login endpoint limits to 5 attempts per IP per 10 minutes, and forgot-password limits to 3 attempts per IP per 15 minutes. The implementation falls back safely (fail-open with `success: true`) if the rate-limiting infrastructure is unavailable.

**What goes wrong if ignored:** Without rate limiting, an attacker can make unlimited login attempts, trying thousands of password combinations per minute until they find the right one. The forgot-password endpoint would also be spammable, potentially overwhelming the email service or allowing attackers to annoy users with unwanted reset emails.

---

### Q10 — Principle of Least Surprise in Login Errors
> The system should behave in a way that does not surprise the user.

**Code reference:** `src/lib/auth.ts:33-50` and `src/app/login/page.tsx:26`

**My Answer:** The login flow uses a single generic error message: "Invalid email or password." Whether the email doesn't exist, the password is wrong, or the user isn't verified, the message is the same. This follows the Principle of Least Surprise because:
1. A user who mistyped their password expects a generic error, not a security leak.
2. A user whose email isn't registered should not be told that — it's surprising and insecure.
3. The error is clear enough to act on ("I should try again") without revealing internal state.

**What goes wrong if ignored:** If the error said "Email does not exist" for unknown emails and "Password is incorrect" for known emails, users would see inconsistent behaviour. More importantly, attackers could map valid emails and focus their brute-force efforts on real accounts.

---

### Q11 — Dashboard Protection and Defensive Programming
> Assume inputs and access attempts are malicious until proven otherwise.

**Code reference:** `src/app/dashboard/page.tsx:6-22` and `src/middleware.ts:1-5`

**My Answer:** The dashboard is protected at two layers. First, the middleware (`src/middleware.ts`) runs before any request to `/dashboard` and checks for a valid NextAuth session, redirecting unauthenticated users to `/login`. Second, the dashboard page itself (`src/app/dashboard/page.tsx`) performs its own session check and additionally queries the database to confirm the user's `emailVerified` field is set. This double-check ensures that even if the middleware doesn't catch an unauthenticated request (e.g., during server-side rendering), the page-level check catches it.

**What goes wrong if ignored:** If only the middleware protects the dashboard, an unverified user could access protected content by having a valid NextAuth session. If only the page-level check protects it, the user would briefly load the dashboard before being redirected, leaking that the route exists. Both layers together provide defence in depth.

---

### Q12 — Secret Leakage and Recovery
> Secrets that are accidentally exposed must be rotated immediately.

**Code reference:** `.gitignore:34` (`.env*` pattern) and `src/lib/rate-limit.ts:7-10`

**My Answer:** The `.gitignore` file includes the `.env*` pattern, which prevents all `.env` files (including `.env.local`) from being committed to the repository. The rate-limit module reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from environment variables rather than hardcoding them. The Resend API key, database URL, and NextAuth secret are also stored exclusively in environment variables. To prevent accidental leakage during development, the `.env.local` uses placeholder values like `"your-upstash-url"` rather than real credentials.

**What goes wrong if ignored:** If `.env.local` is committed, anyone with repository access (including future team members, or if the repo becomes public) gets full access to the production database, email service, and session signing key. Once leaked, secrets cannot be "un-leaked" — they must be immediately revoked and replaced.

---

### Q13 — Conway's Law and Folder Structure
> Organisations design systems that mirror their communication structures.

**Code reference:** `src/app/` (route organisation), `src/lib/` (utilities), `src/components/` (UI), `src/emails/` (templates)

**My Answer:** Conway's Law predicts that the folder structure reflects the team's communication patterns. For a solo project, I organised the code by responsibility rather than by team. Routes in `src/app/` map directly to URL paths, library code in `src/lib/` groups shared utilities (auth, prisma, tokens, mail, rate-limit, validations), reusable UI components live in `src/components/ui/`, and email templates in `src/emails/`. This structure means a single developer can navigate from a URL path to its server logic to its shared dependencies without crossing team boundaries.

**What goes wrong if ignored:** A flat or poorly organised structure forces the developer to mentally reconstruct the architecture every time they need to find or change something. In a team setting, unclear boundaries cause merge conflicts, duplicated code, and "I didn't know that file existed" moments.

---

### Q14 — Technical Debt
> Shortcuts taken now will cost more to fix later.

**Code reference:** `src/lib/mail.tsx:1-5` (inline email styling) and `src/app/globals.css` (monolithic stylesheet)

**My Answer:** SecureGate has accumulated some technical debt within the 3-hour constraint. The email templates use inline styles (`src/lib/mail.tsx`) because setting up React Email with full component rendering added complexity. The global CSS file handles all styling — there are no CSS modules or component-scoped styles. The components directory (`src/components/ui/`) exists but isn't fully adopted; several pages still use inline markup for forms. These are deliberate shortcuts to meet the deadline, but they would need refactoring for a production application.

**What goes wrong if ignored:** Inline email styles make the templates harder to maintain and impossible to unit-test independently. A monolithic CSS file becomes unwieldy as the app grows — styles for unrelated components collide, and removing dead styles is risky because you can't tell what depends on them.

---

### Q15 — Payment Integration Synthesis Question
> If SecureGate needed to sell premium authentication features, what would change?

**Code reference:** `prisma/schema.prisma:12-19` (User model) and `src/lib/auth.ts:9-78` (NextAuth config)

**My Answer:** Adding paid features would require several changes. The `User` model would gain a `subscriptionTier` or `stripeCustomerId` field. The NextAuth `jwt` callback would embed the subscription tier so the frontend can show/hide premium features without an extra database lookup per request. A Stripe webhook handler would listen for `checkout.session.completed` events and update the user's tier. The dashboard would show a "Upgrade" CTA for free-tier users. The folder structure would gain `src/app/api/webhooks/stripe/route.ts`. The rate limits might be tiered — free users get 10 req/min, premium get 100 req/min. The `checkLoginRateLimit` function would accept a user ID in addition to IP to check tier-based limits.

**What goes wrong if ignored:** If payment integration were added without planning for it in the authentication architecture, you'd have to couple Stripe webhook logic into the auth config or duplicate user lookups. The JWT token would need regeneration after subscription changes, and the session handling would need to support real-time tier updates without forcing users to log out and back in.

---

## Part 4 — One Thing I Would Refactor

I would refactor the email-sending layer to use React Email's `render` function properly in a dedicated rendering module, separating template rendering from the Resend API calls. Currently, `src/lib/mail.tsx` contains both the Resend client initialisation and the send functions. I would create `src/emails/render.ts` to handle template-to-HTML conversion and keep `src/lib/mail.ts` solely for the Resend API dispatch. This would make the email templates unit-testable independently from the delivery mechanism.

---

## Part 5 — How This Changes How I Build

This project reinforced that authentication is not an afterthought — it's the security foundation of any user-facing application. Every decision, from how you validate input to how you respond to errors, has security implications. I learned to think in terms of failure modes: what happens if the database is down, if the email service is down, if rate limiting fails, if a token is reused. Building with defensive try-catch blocks and safe fallbacks is now instinctive.

I also learned that reading the actual installed library versions and their APIs, rather than relying on prior knowledge, saves significant debugging time. The Zod v4 `.errors` vs `.issues` change is a small example of a larger principle: always verify your assumptions against the code that's actually running.
