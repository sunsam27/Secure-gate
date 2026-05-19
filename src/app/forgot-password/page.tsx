"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validations";
import { FormError } from "@/components/ui/FormError";
import { FormSuccess } from "@/components/ui/FormSuccess";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validateField(value: string): string | undefined {
    const fieldSchema = forgotPasswordSchema.shape.email;
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return undefined;
  }

  function handleBlur(value: string) {
    const msg = validateField(value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next.email = msg;
      else delete next.email;
      return next;
    });
  }

  function validateAll(): boolean {
    const schema = forgotPasswordSchema.shape.email;
    const result = schema.safeParse(email);
    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0].message });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setFieldErrors({}); setMessage(""); setLoading(true);
    if (!validateAll()) { setLoading(false); return; }
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setMessage(data.message);
    } catch { setError("Something went wrong. Please try again."); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl shield-icon">🔐</span>
            <span className="text-2xl font-bold text-text-primary">SecureGate</span>
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Reset your password</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your email and we&apos;ll send a reset link</p>
        </div>
        <div className="glass-card p-8 pulse-glow">
          <form onSubmit={handleSubmit} className="space-y-5" id="forgot-password-form" noValidate>
            <FormError message={error} />
            <FormSuccess message={message} />
            <div>
              <label htmlFor="forgot-email" className="form-label">Email Address</label>
              <input id="forgot-email" type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur(email)} disabled={loading} autoComplete="email" />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={loading} id="forgot-submit">
              <span className="flex items-center justify-center gap-2">{loading && <span className="spinner" />}{loading ? "Sending..." : "Send Reset Link"}</span>
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-text-secondary text-sm">
          Remember your password?{" "}<Link href="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
