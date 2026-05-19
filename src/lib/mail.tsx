import { Resend } from "resend";
import { render } from "@react-email/components";
import { VerificationEmail } from "@/emails/VerificationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function sendWithRetry(
  fn: () => Promise<void>,
  label: string,
  retries = 3
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return true;
    } catch (error) {
      console.error(`${label} attempt ${i + 1}/${retries} failed:`, error);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  return false;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${BASE_URL}/verify-email/${token}`;

  const ok = await sendWithRetry(async () => {
    const html = await render(<VerificationEmail verificationLink={verificationLink} />);
    await resend.emails.send({
      from: "SecureGate <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email address — SecureGate",
      html,
    });
  }, "sendVerificationEmail");

  return { success: ok };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${BASE_URL}/reset-password/${token}`;

  const ok = await sendWithRetry(async () => {
    const html = await render(<PasswordResetEmail resetLink={resetLink} />);
    await resend.emails.send({
      from: "SecureGate <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password — SecureGate",
      html,
    });
  }, "sendPasswordResetEmail");

  return { success: ok };
}
