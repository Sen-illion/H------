import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 必须用 loadEnv + 前端目录，保证 .env.github 里的 VITE_BASE_PATH 参与 base（否则会变成 /assets/，GitHub Pages 全 404）
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  // GitHub Pages 必须用子路径；mode=github 时强制 base（避免 loadEnv 与系统环境变量冲突导致变成 /）
  const base =
    mode === 'github'
      ? (env.VITE_BASE_PATH && env.VITE_BASE_PATH !== '/' ? env.VITE_BASE_PATH : '/H------/')
      : env.VITE_BASE_PATH || '/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist'
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
        '/submissions': { target: 'http://localhost:3001', changeOrigin: true }
      }
    }
  };
});
