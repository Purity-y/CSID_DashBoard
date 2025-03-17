# Indicateur Commande

Application web pour visualiser les indicateurs de commande et les objectifs des commerciaux.

## Fonctionnalités

- Affichage d'un graphique en barres des commandes par commercial
- Courbe de tendance des objectifs
- Filtrage par année et par commercial
- Interface responsive

## Technologies utilisées

- Frontend: React, TypeScript, Chart.js
- Backend: Node.js, Express

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

3. Installez ts-node globalement (si ce n'est pas déjà fait) :

```bash
npm run install-ts-node
```

## Démarrage

Pour démarrer l'application en mode développement :

```bash
npm run dev
```

Cette commande lance à la fois :
- Le serveur backend sur le port 5000
- L'application frontend sur le port 3000

## Structure du projet

- `/src` : Code source du frontend React
  - `/components` : Composants React
  - `/services` : Services pour les appels API
- `/server` : Code source du backend Express
  - `/routes` : Routes API

## Déploiement

Pour déployer l'application en production :

```bash
npm run build
```

Puis démarrez le serveur :

```bash
npm run server
```

Le serveur servira les fichiers statiques du build React.
