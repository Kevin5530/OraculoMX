import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Permite importar desde src con rutas.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
