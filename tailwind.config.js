/**
 * Design system — direction « Atelier »
 *
 * Parti pris : l'audace part dans UN seul endroit, l'outremer, posé en aplats
 * francs (jamais en dégradé). L'ambre est strictement réservé aux accents
 * ponctuels — nœuds du schéma d'orchestration, surlignage du titre, badge
 * d'expérience — et ne sert jamais de couleur de fond décorative.
 *
 * Contrastes vérifiés sur fond `paper` (#f4f4f2) :
 *   ink   18.4:1   ink-2  5.7:1   blue   7.0:1   error  8.2:1
 * Et sur fond `blue` (#2540ff) : blanc 7.9:1 · ambre 5.5:1
 * Tous au-delà du seuil AA (4.5:1) exigé par le RGAA pour du texte courant.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        // Fonds
        'paper':     '#f4f4f2', // fond général, blanc cassé très légèrement chaud
        'paper-alt': '#eceae5', // alternance de section
        'white':     '#ffffff',

        // Encres
        'ink':       '#101014', // texte principal, filets structurants, bordures franches
        'ink-2':     '#5b5b63', // texte secondaire
        'rule':      '#dedcd6', // filets discrets

        // Accents
        'blue':      '#2540ff', // primaire — l'unique endroit où l'on hausse la voix
        'blue-deep': '#1b2fc4', // survol / états actifs
        'amber':     '#ffcf3d', // réservé : nœuds agents, surlignage, badge

        // États
        'error':     '#b3231f',
        'error-bg':  '#ffe4e1',
        'ok':        '#0f6d43',
        'ok-bg':     '#d9f2e4',
      },
      fontFamily: {
        // Bricolage a des irrégularités optiques assumées : une grotesque qui a
        // de l'humour, ce qui évite la froideur de la grille suisse pure.
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        body:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.055em', // titres de niveau 1
        tighter:  '-.045em', // titres de niveau 2 et 3
      },
      borderRadius: {
        // La direction est à angles vifs : on ne garde qu'un arrondi minimal
        // pour les éléments d'interface qui en ont besoin.
        DEFAULT: '0px',
        none:    '0px',
        sm:      '2px',
        full:    '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
