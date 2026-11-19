import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Alerta roja reutilizable para errores HTTP / validaciones
export default function AlertaError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
