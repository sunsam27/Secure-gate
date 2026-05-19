"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validations";
import { FormError } from "@/components/ui/FormError";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unverified") {
      setError("Please verify your email before logging in.");
    }
  }, [searchParams]);

  function validateField(field: "email" | "password", value: string): string | undefined {
    const fieldSchema = loginSchema.shape[field];
    if (!fieldSchema) return;
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return undefined;
  }

  function handleBlur(field: "email" | "password", value: string) {
    const msg = validateField(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  }

  function validateAll(): boolean {
    const fields = { email, password } as const;
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      const fieldSchema = loginSchema.shape[key as "email" | "password"];
      const result = fieldSchema.safeParse(value);
      if (!result.success) errors[key] = result.error.issues[0].message;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setFieldErrors({}); setLoading(true);
    if (!validateAll()) { setLoading(false); return; }
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch { setError("Something went wrong. Please try again."); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="login-form" noValidate>
      <FormError message={error} />
      <div>
        <label htmlFor="login-email" className="form-label">Email Address</label>
        <input id="login-email" type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email", email)} disabled={loading} autoComplete="email" />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="form-label">Password</label>
        <input id="login-password" type="password" className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password", password)} disabled={loading} autoComplete="current-password" />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
      </div>
      <button type="submit" className="btn-primary" disabled={loading} id="login-submit">
        <span className="flex items-center justify-center gap-2">{loading && <span className="spinner" />}{loading ? "Signing in..." : "Sign In"}</span>
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl shield-icon">🔐</span>
            <span className="text-2xl font-bold text-text-primary">SecureGate</span>
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to access your dashboard</p>
        </div>
        <div className="glass-card p-8 pulse-glow">
          <Suspense fallback={<div className="text-text-secondary text-center py-8">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="text-center mt-6 space-y-2">
          <p className="text-text-secondary text-sm">
            <Link href="/forgot-password" className="auth-link">Forgot your password?</Link>
          </p>
          <p className="text-text-secondary text-sm">
            Don&apos;t have an account?{" "}<Link href="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
