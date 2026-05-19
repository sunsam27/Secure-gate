import { evaluatePasswordStrength } from "@/lib/validations";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  return (
    <div className="mt-3">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${(strength.score / 6) * 100}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <p
        className="text-xs mt-1.5 font-medium"
        style={{ color: strength.color }}
      >
        {strength.label}
      </p>
    </div>
  );
}
