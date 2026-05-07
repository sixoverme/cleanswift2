import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Invert logic: Default to root (Netlify, Local, most hosts)
    // Only use subpath for GitHub Actions
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    const base = isGitHubActions ? '/cleanswift2/' : '/';

    console.log('--- Vite Build Info ---');
    console.log('Mode:', mode);
    console.log('Base Path:', base);
    console.log('Is GitHub Actions:', isGitHubActions);
    console.log('Is Netlify (Reserved Env):', process.env.NETLIFY);
    console.log('-----------------------');

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

