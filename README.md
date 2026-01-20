# BukzDocs

Documentación construida con React + Vite + TypeScript + TailwindCSS + shadcn/ui.

## 🚀 Deploy en GitHub Pages

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages.

### Pasos para desplegar:

1. **Crea un repositorio en GitHub** llamado `bukzdocs` (o el nombre que prefieras)

2. **Sube el código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/bukzdocs.git
   git push -u origin main
   ```

3. **Configura GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: selecciona **"GitHub Actions"**

4. **¡Listo!** El deploy se ejecutará automáticamente. Tu sitio estará en:
   ```
   https://TU_USUARIO.github.io/bukzdocs/
   ```

### ⚠️ Si cambias el nombre del repositorio:

Edita `vite.config.ts` y cambia la línea `base`:
```ts
base: '/NOMBRE_DE_TU_REPO/',
```

### 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Tecnologías

- ⚡ [Vite](https://vitejs.dev/)
- ⚛️ [React 18](https://react.dev/)
- 📘 [TypeScript](https://www.typescriptlang.org/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- 🧩 [shadcn/ui](https://ui.shadcn.com/)
