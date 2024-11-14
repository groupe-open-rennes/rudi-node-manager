<br>
<p align="center">
  <a href="https://rudi.rennesmetropole.fr/">
  <img src="https://blog.rudi.bzh/wp-content/uploads/2020/11/logo_bleu_orange.svg" width=100px alt="Rudi logo" />  </a>
</p>

<h2 align="center" >RUDI Node Manager</h3>
<p align="center">Interface utilisateur du nœud producteur RUDI, une application open source permettant aux producteurs de données de publier leurs données dans le catalogue du portail Rudi tout en en gardant la maîtrise (stockage, renseignements et droits d’accès).</p>

<p align="center"><a href="https://rudi.rennesmetropole.fr/">🌐 Instance de Rennes Métropole</a> · <a href="doc.rudi.bzh">📚 Documentation</a> ·  <a href="https://blog.rudi.bzh/">📰 Blog</a><p>


## 🚀 Fonctionnalités

- Interface web pour la gestion du nœud RUDI
- Administration des utilisateurs et des droits
- Gestion des jeux de données
- Visualisation des métriques et logs
- Configuration du nœud

## 📋 Prérequis

- Node.js (version spécifiée dans `.nvmrc`)
- npm
- MongoDB

## 🛠 Installation

### Développement

1. Installation des dépendances backend :
```bash
npm install
```

2. Installation des dépendances frontend :
```bash
cd front
npm install
```

### Production

Installation complète pour la production :
```bash
npm install
npm run build
```

## 🚦 Démarrage

### Mode développement

1. Lancer le serveur backend :
```bash
# Sur Linux
npm run serverLinux

# Sur Windows
npm run serverWindow
```

2. Lancer le frontend :
```bash
npm run front
```

### Mode production

```bash
npm run startProd
```

## ⚙️ Configuration

Le fichier de configuration par défaut est `prodmanager-conf-default.ini`. Vous pouvez créer votre propre fichier de configuration en le copiant et en modifiant les valeurs selon vos besoins.


## Contribuer à Rudi

Nous accueillons et encourageons les contributions de la communauté. Voici comment vous pouvez participer :
- 🛣️ [Feuille de route](https://github.com/orgs/rudi-platform/projects/2)
- 🐞 [Signaler un bug du portail](https://github.com/rudi-platform/rudi-node-manager/issues)
- ✨ [Contribuer](https://github.com/rudi-platform/.github/blob/main/CONTRIBUTING.md)
- 🗣️ [Participer aux discussions](https://github.com/orgs/rudi-platform/discussions)
