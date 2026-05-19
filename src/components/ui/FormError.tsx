interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="form-error" role="alert">
      ⚠️ {message}
    </div>
  );
}
