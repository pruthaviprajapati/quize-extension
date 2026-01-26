import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'quiz-overlay': resolve(__dirname, 'src/quiz-overlay.jsx')
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        name: 'QuizOverlay'
      }
    }
  }
});
