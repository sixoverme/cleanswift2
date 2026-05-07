import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Netlify sets NETLIFY=true, GitHub Actions sets GITHUB_ACTIONS=true
    const isNetlify = process.env.NETLIFY === 'true' || env.NETLIFY === 'true';
    const base = isNetlify ? '/' : '/cleanswift2/';

    console.log(`--- Build Environment: ${isNetlify ? 'Netlify' : 'Other'} ---`);
    console.log(`--- Base Path: ${base} ---`);

    return {
      base: base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'docs',
        emptyOutDir: true,
      }
    };
});

