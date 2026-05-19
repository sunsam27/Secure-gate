"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }
    verify();
  }, [token]);

  async function handleResend() {
    if (!resendEmail) return;
    setResending(true); setResendMessage("");
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      setResendMessage(data.message || data.error);
    } catch { setResendMessage("Something went wrong."); } finally { setResending(false); }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl shield-icon">🔐</span>
            <span className="text-2xl font-bold text-text-primary">SecureGate</span>
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Email Verification</h1>
        </div>
        <div className="glass-card p-8 text-center">
          {status === "loading" && (
            <div className="py-8">
              <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p className="text-text-secondary">Verifying your email...</p>
            </div>
          )}
          {status === "success" && (
            <div className="py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Email Verified!</h2>
              <p className="text-text-secondary text-sm mb-6">{message}</p>
              <Link href="/login" className="btn-primary inline-block !w-auto px-8">
                <span>Continue to Login</span>
              </Link>
            </div>
          )}
          {status === "error" && (
            <div className="py-4">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Verification Failed</h2>
              <p className="text-text-secondary text-sm mb-6">{message}</p>
              {/* Resend option */}
              <div className="border-t border-border pt-6 mt-6">
                <p className="text-text-secondary text-sm mb-3">Need a new verification link?</p>
                <div className="flex gap-2">
                  <input type="email" className="form-input flex-1" placeholder="Enter your email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
                  <button onClick={handleResend} disabled={resending || !resendEmail} className="btn-ghost whitespace-nowrap">{resending ? "Sending..." : "Resend"}</button>
                </div>
                {resendMessage && <p className="text-text-secondary text-xs mt-2">{resendMessage}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
