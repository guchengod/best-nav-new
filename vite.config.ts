import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import svgr from "vite-plugin-svgr"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
export default defineConfig({
  plugins: [svgr({
      svgrOptions: {
          icon: true,
      },}), react(), cloudflare(),tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src/react-app"),
        },
    },
    build: {
        sourcemap: true,
            minify: 'terser',
            terserOptions: {
            compress: {
                drop_console: true,
                    drop_debugger: true
            }
        },
        chunkSizeWarningLimit: 800,
            rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': [
                        'react',
                        'react-dom',
                        'framer-motion',
                        'i18next',
                        'react-i18next'
                    ],
                        'utils': [
                        'class-variance-authority',
                        'clsx',
                        'tailwind-merge'
                    ]
                }
            }
        }
    }
});
