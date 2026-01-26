import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Para GitHub Pages: cambia 'BukzBrain' por el nombre de tu repositorio
  // Si usas un dominio personalizado o username.github.io, déjalo como '/'
  base: '/BukzBrain/',
  server: {
    host: "::",
    port: 8080,
    // Configuración para soportar History API en desarrollo
    // Esto redirige todas las solicitudes al index.html
    strictPort: false,
    open: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});