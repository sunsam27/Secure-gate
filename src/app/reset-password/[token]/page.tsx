"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema } from "@/lib/validations";
import { FormError } from "@/components/ui/FormError";
import { FormSuccess } from "@/components/ui/FormSuccess";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validateField(value: string): string | undefined {
    const fieldSchema = resetPasswordSchema.shape.password;
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
      if (msg) next.password = msg;
      else delete next.password;
      return next;
    });
  }

  function validateAll(): boolean {
    const schema = resetPasswordSchema.shape.password;
    const result = schema.safeParse(password);
    if (!result.success) {
      setFieldErrors({ password: result.error.issues[0].message });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setFieldErrors({}); setSuccess(""); setLoading(true);
    if (!validateAll()) { setLoading(false); return; }
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSuccess(data.message);
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
          <h1 className="text-xl font-semibold text-text-primary">Set new password</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your new password below</p>
        </div>
        <div className="glass-card p-8 pulse-glow">
          <form onSubmit={handleSubmit} className="space-y-5" id="reset-password-form" noValidate>
            <FormError message={error} />
            <FormSuccess message={success} />
            <div>
              <label htmlFor="new-password" className="form-label">New Password</label>
              <div className="relative">
                <input id="new-password" type={showPassword ? "text" : "password"} className="form-input pr-12" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur(password)} disabled={loading} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors text-sm" tabIndex={-1}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
              <PasswordStrengthIndicator password={password} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} id="reset-submit">
              <span className="flex items-center justify-center gap-2">{loading && <span className="spinner" />}{loading ? "Resetting..." : "Reset Password"}</span>
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-text-secondary text-sm">
          <Link href="/login" className="auth-link">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
