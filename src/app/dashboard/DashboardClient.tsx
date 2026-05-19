"use client";

import { signOut } from "next-auth/react";

interface DashboardClientProps {
  name: string;
  email: string;
  createdAt: string;
}

export default function DashboardClient({ name, email, createdAt }: DashboardClientProps) {
  const joinDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen auth-gradient">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <span className="text-xl font-bold text-text-primary">SecureGate</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-danger" id="logout-btn">
          Sign Out
        </button>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="animate-fade-in">
          {/* Welcome banner */}
          <div className="glass-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Welcome back, {name}!</h1>
                <p className="text-text-secondary text-sm">You are securely authenticated</p>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="dashboard-card">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success font-semibold text-sm">Verified</span>
              </div>
            </div>
            <div className="dashboard-card">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Email</p>
              <p className="text-text-primary font-medium text-sm truncate">{email}</p>
            </div>
            <div className="dashboard-card">
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-text-primary font-medium text-sm">{joinDate}</p>
            </div>
          </div>

          {/* Security features */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">🛡️ Security Features Active</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Password Hashing", desc: "bcrypt with 12 salt rounds" },
                { label: "Email Verification", desc: "Token-based verification" },
                { label: "Session Management", desc: "JWT-based secure sessions" },
                { label: "Rate Limiting", desc: "Brute-force protection active" },
                { label: "Security Headers", desc: "XSS, clickjacking protection" },
                { label: "Input Validation", desc: "Server-side Zod validation" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50">
                  <span className="text-success mt-0.5">✓</span>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{item.label}</p>
                    <p className="text-text-muted text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
