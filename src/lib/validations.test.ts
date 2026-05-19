import { describe, it, expect } from "vitest";
import { signUpSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, evaluatePasswordStrength } from "./validations";

describe("signUpSchema", () => {
  it("accepts valid input", () => {
    const result = signUpSchema.safeParse({
      name: "John Doe",
      email: "John@Example.com",
      password: "StrongPass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("rejects short name", () => {
    const result = signUpSchema.safeParse({ name: "", email: "a@b.com", password: "StrongPass1" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signUpSchema.safeParse({ name: "John", email: "notanemail", password: "StrongPass1" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signUpSchema.safeParse({ name: "John", email: "a@b.com", password: "Ab1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = signUpSchema.safeParse({ name: "John", email: "a@b.com", password: "lowercase1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signUpSchema.safeParse({ name: "John", email: "a@b.com", password: "UPPERCASEa" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "any" });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("evaluatePasswordStrength", () => {
  it("returns Weak for short password", () => {
    expect(evaluatePasswordStrength("a").label).toBe("Weak");
  });

  it("returns Strong for complex password", () => {
    expect(evaluatePasswordStrength("Str0ng!Pass!").label).toBe("Strong");
  });

  it("returns Fair for moderate password", () => {
    expect(evaluatePasswordStrength("Password1").label).toBe("Fair");
  });
});
