interface FormSuccessProps {
  message?: string | null;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;
  return (
    <div className="form-success" role="status">
      ✅ {message}
    </div>
  );
}
