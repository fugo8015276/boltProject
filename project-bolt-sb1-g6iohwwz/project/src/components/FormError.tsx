interface Props {
  message: string;
}

export function FormError({ message }: Props) {
  return (
    <p className="mt-1 text-sm text-red-600">{message}</p>
  );
}