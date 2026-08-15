# robin-aldasoro.com — Site personnel

Site statique HTML/CSS déployé sur Cloudflare Pages.

## Stack

- **HTML** — pages statiques vanilla
- **Tailwind CSS** — généré via CLI (pas de CDN en production)
- **Polices auto-hébergées** — Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono
- **Cloudflare Pages** — hébergement et CDN
- **Scaleway Serverless Functions** — proxy pour le formulaire de contact (Brevo)

## Structure

```
.
├── index.html              # Page principale (source)
├── mentions-legales.html   # Mentions légales (source)
├── assets/
│   ├── input.css           # Point d'entrée Tailwind : @font-face + socle a11y
│   ├── output.css          # CSS généré (ne pas éditer manuellement)
│   ├── fonts/*.woff2       # Polices auto-hébergées (sous-ensemble latin)
│   └── *.jpg / *.png       # Images
├── function/
│   └── handler.js          # Fonction Scaleway (formulaire de contact)
├── favicon.svg             # Favicon
├── _headers                # En-têtes HTTP Cloudflare Pages (CSP, cache…)
├── build.mjs               # Script de build production (voir ci-dessous)
├── tailwind.config.js      # Config Tailwind + design system
└── dist/                   # Sortie du build (ignorée par git, publiée par Cloudflare)
```

## Design system

La direction visuelle s'appelle **« Atelier »**. Son principe : toute l'audace
part dans **un seul endroit**, l'outremer `#2540ff`, posé en aplats francs et
jamais en dégradé. L'ambre `#ffcf3d` est strictement réservé aux accents
ponctuels — nœuds du schéma d'orchestration, surlignage du titre, badge
d'expérience. Tout le reste est de l'encre sur du papier, à angles vifs.

Les jetons vivent dans `tailwind.config.js`, avec les ratios de contraste
vérifiés en commentaire. Deux composants demandent une explication et sont
documentés dans `assets/input.css` :

- **`.duotone`** — le traitement bleu du portrait est porté par le *conteneur*
  (fond outremer + `mix-blend-mode: luminosity`), pas par l'image. Toute image
  qu'on y injecte hérite donc du traitement : les coiffures de l'easter egg
  konami n'ont pas besoin d'être retouchées.
- **`.hl-amber`** — le surlignage du titre est un dégradé à paliers francs, qui
  suit chaque ligne quand le titre se réenroule sans recouvrir les jambages.

## Développement local

```bash
npm install
npm run dev       # Génère assets/output.css en watch mode
```

Ouvrir `index.html` directement dans le navigateur ou via un serveur local.

## Build production

```bash
npm run build
```

Ce script fait deux choses :
1. **Tailwind CLI** génère `assets/output.css` minifié
2. **`build.mjs`** copie les fichiers dans `dist/` en **inlinant le CSS** dans les HTML

### Pourquoi inliner le CSS ?

Le fichier `output.css` chargé via `<link rel="stylesheet">` est
**render-blocking** : le navigateur bloque l'affichage de la page le temps de
le télécharger. En l'inlinant dans le `<head>`, on supprime la requête réseau
et on améliore les métriques **FCP** et **LCP** (Lighthouse / Core Web Vitals).

En développement, on garde le `<link>` pour profiter du hot-reload de Tailwind.

### Attention aux chemins de polices

Dans `input.css`, les `@font-face` pointent vers `fonts/…`, un chemin relatif à
`assets/output.css` — correct en développement. Une fois le CSS inliné dans le
`<head>`, ces URLs deviennent relatives au document HTML : `build.mjs` les
réécrit donc en `assets/fonts/…`. Sans cette étape, les polices renvoient un
404 en production et le navigateur retombe silencieusement sur `system-ui`.
Le script échoue explicitement si plus aucun chemin n'est réécrit.

## Accessibilité

Le site vise la conformité **RGAA** ([rapport
d'audit](https://ara.numerique.gouv.fr/rapport/fslsjIsnBRP-H9hHdzjpK/)). Points
d'attention lors de toute modification :

- **Contrastes** — minimum 4,5:1 pour le texte courant, 3:1 pour les gros
  titres et les contours de composants d'interface (bordures de champs).
  Attention aux couleurs semi-transparentes (`text-paper/50`) : c'est la
  couleur *composée* sur le fond qui compte.
- **Focus clavier** — visible partout, y compris sur les champs de formulaire
  où `@tailwindcss/forms` tente d'écraser `:focus-visible`.
- **Mouvement** — toute animation est neutralisée sous
  `prefers-reduced-motion: reduce`.
- **Schéma d'orchestration** — son `aria-label` doit décrire le parcours
  complet, pas seulement nommer l'image.

## Déploiement

Cloudflare Pages est configuré ainsi :

| Paramètre | Valeur |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Branch | `main` |

Chaque push sur `main` déclenche un déploiement automatique.

## Formulaire de contact

Le formulaire appelle une **Scaleway Serverless Function** (Node.js 22, ES modules)
qui proxifie l'envoi vers l'API Brevo. Les variables d'environnement sont
configurées directement dans la console Scaleway :

| Variable | Description | Secret |
|---|---|---|
| `BREVO_API_KEY` | Clé API Brevo | ✅ |
| `RECIPIENT_EMAIL` | Email destinataire | non |
| `RECIPIENT_NAME` | Nom destinataire | non |
| `ALLOWED_ORIGIN` | Origine autorisée CORS | non |
