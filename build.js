/**
 * Script de build — exécuté par Cloudflare Pages via `npm run build`
 *
 * Pourquoi ce script ?
 * Lighthouse signale le fichier output.css comme render-blocking (il bloque
 * l'affichage initial de la page car le navigateur doit le télécharger avant
 * de pouvoir rendre quoi que ce soit). Comme le CSS fait ~7 KB minifié,
 * l'inliner directement dans le <head> supprime la requête réseau et sort
 * Tailwind de la critical path → améliore FCP et LCP.
 *
 * Workflow :
 *  - Développement local : `npm run dev` → génère assets/output.css, les
 *    HTML sources gardent leur <link rel="stylesheet"> pour le hot-reload.
 *  - Production (Cloudflare Pages) : `npm run build` → génère output.css,
 *    puis ce script copie tout dans dist/ en inlinant le CSS dans les HTML.
 *    Cloudflare publie dist/ et non la racine du repo.
 */

import { readFileSync, writeFileSync, cpSync, mkdirSync } from 'fs';

// Crée le dossier dist/
mkdirSync('./dist', { recursive: true });

// Copie les assets statiques (images, favicon, headers Cloudflare…)
cpSync('./assets', './dist/assets', { recursive: true });
cpSync('./favicon.svg', './dist/favicon.svg');
cpSync('./_headers', './dist/_headers');

// Inline le CSS dans chaque page HTML
const css = readFileSync('./assets/output.css', 'utf8');
const inlined = `<style>${css}</style>`;

for (const file of ['index.html', 'mentions-legales.html']) {
  const html = readFileSync(file, 'utf8');
  const result = html.replace(
    /<link rel="stylesheet" href="assets\/output\.css" \/>/,
    inlined
  );
  writeFileSync(`./dist/${file}`, result, 'utf8');
  console.log(`✓ ${file} → dist/${file}`);
}
