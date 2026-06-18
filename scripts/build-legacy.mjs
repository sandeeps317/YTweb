import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

if (!existsSync('dist')) {
  throw new Error('dist directory is missing. Run vite build before the legacy build step.');
}

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/assets/legacy.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2015',
  jsx: 'automatic',
  sourcemap: true,
  logLevel: 'info',
  loader: {
    '.css': 'empty',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

const indexPath = 'dist/index.html';
let html = readFileSync(indexPath, 'utf8');
if (!html.includes('assets/legacy.js')) {
  html = html.replace('</body>', '  <script nomodule src="./assets/legacy.js"></script>\n</body>');
  writeFileSync(indexPath, html);
}
