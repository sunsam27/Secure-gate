import crypto from "crypto";
import { prisma } from "./prisma";

// Generate a secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create a verification token (expires in 15 minutes)
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

// Verify an email verification token
export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { success: false, error: "Invalid token" };
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false, error: "Token has expired" };
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true };
}

// Create a password reset token (expires in 1 hour)
export async function createPasswordResetToken(
  email: string
): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

// Verify a password reset token
export async function verifyResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { success: false, error: "Invalid token", email: null };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    return { success: false, error: "Token has expired", email: null };
  }

  return { success: true, email: resetToken.email };
}

// Delete a used reset token
export async function deleteResetToken(token: string) {
  await prisma.passwordResetToken.delete({
    where: { token },
  });
}
