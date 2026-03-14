import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署到子路径时必填，例如部署在 /frontend/ 则 base: '/frontend/'
  // 若部署在仓库根（如 xxx.github.io/仓库名/），改为 base: '/仓库名/'
  base: process.env.VITE_BASE_PATH || '/',
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
});
