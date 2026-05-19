import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen auth-gradient flex flex-col relative overflow-hidden">
      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <span className="text-xl font-bold text-text-primary">
            SecureGate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Log In
          </Link>
          <Link
            href="/signup"
            className="btn-primary !w-auto px-6 py-2.5 text-sm"
          >
            <span>Get Started</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-glow border border-accent/20 text-accent text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Production-Ready Authentication
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-text-primary">Secure by</span>
            <br />
            <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              Design
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            A complete authentication system built with security at its core.
            Sign up, verify, log in, and manage access — the right way.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary !w-auto px-8 py-3.5 text-base"
            >
              <span>Create Account</span>
            </Link>
            <Link href="/login" className="btn-ghost px-8 py-3.5">
              Sign In →
            </Link>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left">
            {[
              {
                icon: "🛡️",
                title: "Bcrypt Hashing",
                desc: "12-round salted password hashing",
              },
              {
                icon: "📧",
                title: "Email Verification",
                desc: "Secure token-based verification",
              },
              {
                icon: "⚡",
                title: "Rate Limiting",
                desc: "Brute-force attack protection",
              },
            ].map((feature) => (
              <div key={feature.title} className="dashboard-card text-center">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-text-muted text-sm">
        Built for the Design to MVP Bootcamp
      </footer>
    </div>
  );
}
