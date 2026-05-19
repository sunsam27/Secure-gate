interface VerificationEmailProps {
  verificationLink: string;
}

export function VerificationEmail({ verificationLink }: VerificationEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#0a0a0f", color: "#e2e8f0", padding: "40px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", backgroundColor: "#111827", borderRadius: 12, padding: 40, border: "1px solid #1e293b" }}>
          <h1 style={{ color: "#818cf8", fontSize: 24, textAlign: "center", marginBottom: 32 }}>🔐 SecureGate</h1>
          <h2 style={{ color: "#f1f5f9", fontSize: 20, marginBottom: 16 }}>Verify your email address</h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
            Thanks for signing up! Click the button below to verify your email address. This link will expire in{" "}
            <strong style={{ color: "#e2e8f0" }}>15 minutes</strong>.
          </p>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <a href={verificationLink} style={{ display: "inline-block", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", textDecoration: "none", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 16 }}>
              Verify Email
            </a>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
            If you didn&apos;t create an account, you can safely ignore this email.
          </p>
          <hr style={{ border: "none", borderTop: "1px solid #1e293b", margin: "24px 0" }} />
          <p style={{ color: "#475569", fontSize: 12, textAlign: "center" }}>SecureGate — Secure Authentication System</p>
        </div>
      </body>
    </html>
  );
}
