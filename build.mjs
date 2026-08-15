/**
 * Script de build — exécuté par Cloudflare Pages via `npm run build`
 *
 * Pourquoi ce script ?
 * Lighthouse signale le fichier output.css comme render-blocking (il bloque
 * l'affichage initial de la page car le navigateur doit le télécharger avant
 * de pouvoir rendre quoi que ce soit). Comme le CSS reste petit une fois
 * minifié, l'inliner directement dans le <head> supprime la requête réseau et
 * sort Tailwind de la critical path → améliore FCP et LCP.
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

// Copie les assets statiques (images, polices, favicon, headers Cloudflare…)
cpSync('./assets', './dist/assets', { recursive: true });
cpSync('./favicon.svg', './dist/favicon.svg');
cpSync('./_headers', './dist/_headers');

let css = readFileSync('./assets/output.css', 'utf8');

/*
 * Réécriture des chemins de polices.
 *
 * Dans input.css les @font-face pointent vers `fonts/…`, un chemin relatif à
 * assets/output.css — correct en développement, où le CSS est chargé via
 * <link> depuis assets/. Une fois le CSS inliné dans le <head>, les URLs
 * deviennent relatives au document HTML, à la racine : il faut donc les
 * préfixer par `assets/`. Sans cette étape, les polices renvoient un 404 en
 * production et le navigateur retombe silencieusement sur system-ui.
 */
const before = css;
css = css.replace(/url\((['"]?)fonts\//g, 'url($1assets/fonts/');
if (css === before) {
  throw new Error(
    "Aucun chemin de police réécrit : les @font-face de input.css ont dû " +
    "changer de forme. Vérifier avant de déployer, sinon les polices " +
    "tomberont en 404 en production."
  );
}

const inlined = `<style>${css}</style>`;

for (const file of ['index.html', 'mentions-legales.html']) {
  const html = readFileSync(file, 'utf8');
  const result = html.replace(
    /<link rel="stylesheet" href="assets\/output\.css" \/>/,
    inlined
  );
  if (result === html) {
    throw new Error(`CSS non inliné dans ${file} : balise <link> introuvable.`);
  }
  writeFileSync(`./dist/${file}`, result, 'utf8');
  console.log(`✓ ${file} → dist/${file}`);
}
