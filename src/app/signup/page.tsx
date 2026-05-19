"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/lib/validations";
import { FormError } from "@/components/ui/FormError";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validateField(field: "name" | "email" | "password", value: string): string | undefined {
    const fieldSchema = signUpSchema.shape[field];
    if (!fieldSchema) return;
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return undefined;
  }

  function handleBlur(field: "name" | "email" | "password", value: string) {
    const msg = validateField(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  }

  function validateAll(): boolean {
    const fields = { name, email, password } as const;
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      const msg = validateField(key as "name" | "email" | "password", value);
      if (msg) errors[key] = msg;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setFieldErrors({}); setSuccess(""); setLoading(true);
    if (!validateAll()) { setLoading(false); return; }
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          data.details.forEach((d: { field: string; message: string }) => (errors[d.field] = d.message));
          setFieldErrors(errors);
        } else { setError(data.error || "Something went wrong."); }
        return;
      }
      setSuccess(data.message);
      if (data.emailWarning) {
        setError(data.emailWarning);
      }
      setTimeout(() => router.push("/login"), 3000);
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
          <h1 className="text-xl font-semibold text-text-primary">Create your account</h1>
          <p className="text-text-secondary text-sm mt-1">Join SecureGate and secure your access</p>
        </div>
        <div className="glass-card p-8 pulse-glow">
          <form onSubmit={handleSubmit} className="space-y-5" id="signup-form" noValidate>
            <FormError message={error} />
            <FormSuccess message={success} />
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" type="text" className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => handleBlur("name", name)} disabled={loading} autoComplete="name" />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input id="email" type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email", email)} disabled={loading} autoComplete="email" />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} className="form-input pr-12" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password", password)} disabled={loading} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors text-sm" tabIndex={-1}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
              <PasswordStrengthIndicator password={password} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} id="signup-submit">
              <span className="flex items-center justify-center gap-2">{loading && <span className="spinner" />}{loading ? "Creating account..." : "Create Account"}</span>
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-text-secondary text-sm">Already have an account?{" "}<Link href="/login" className="auth-link">Log in</Link></p>
      </div>
    </div>
  );
}
