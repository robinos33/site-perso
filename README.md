# robin-aldasoro.com — Site personnel

Site statique HTML/CSS déployé sur Cloudflare Pages.

## Stack

- **HTML** — pages statiques vanilla
- **Tailwind CSS** — généré via CLI (pas de CDN en production)
- **Cloudflare Pages** — hébergement et CDN
- **Scaleway Serverless Functions** — proxy pour le formulaire de contact (Brevo)

## Structure

```
.
├── index.html              # Page principale (source)
├── mentions-legales.html   # Mentions légales (source)
├── assets/
│   ├── input.css           # Point d'entrée Tailwind
│   ├── output.css          # CSS généré (ne pas éditer manuellement)
│   └── *.jpg / *.png       # Images
├── function/
│   └── handler.js          # Fonction Scaleway (formulaire de contact)
├── favicon.svg             # Favicon
├── _headers                # En-têtes HTTP Cloudflare Pages (CSP, etc.)
├── build.js                # Script de build production (voir ci-dessous)
├── tailwind.config.js      # Config Tailwind + design system
└── dist/                   # Sortie du build (ignorée par git, publiée par Cloudflare)
```

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
2. **`build.js`** copie les fichiers dans `dist/` en **inlinant le CSS** dans les HTML

### Pourquoi inliner le CSS ?

Le fichier `output.css` (~7 KB) chargé via `<link rel="stylesheet">` est
**render-blocking** : le navigateur bloque l'affichage de la page le temps de
le télécharger. En l'inlinant dans le `<head>`, on supprime la requête réseau
et on améliore les métriques **FCP** et **LCP** (Lighthouse / Core Web Vitals).

En développement, on garde le `<link>` pour profiter du hot-reload de Tailwind.

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
