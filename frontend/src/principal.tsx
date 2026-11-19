import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Aplicacion from "./Aplicacion";
import "./estilos.css";

// Cliente de TanStack Query: administra caché, reintentos y estados de carga
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Aplicacion />
    </QueryClientProvider>
  </StrictMode>,
);
