# TD-backend-nodejs

Prérequis:

Node.js (v14 ou supérieure)
Docker et Docker Compose
Make pour utiliser les commandes Makefile

Installation
Clonez le dépôt :

```
git clone https://github.com/abdallahsaoud/TD-backend-nodejs.git
```

Configuration
Créez un fichier .env à la racine du projet avec les variables suivantes :

```
JWT_SECRET=d4f0c7f7a36f8a0d9d21c7dce4b0f71c3e4a6c8e2432d3a7db8b0b6e2d6d3c5e83f6d3b6a8d7f0a1f0b6e7c5d2f4a3b8
DB_HOST=database
DB_USER=root
DB_PASSWORD=root
DB_NAME=tdHeticDB
```
Lancer et Arrêter l'Application
```
cd TD-backend-nodejs
cd app
```
Assurez-vous que Docker est installé et fonctionnel.


Utilisez les commandes Makefile pour gérer les conteneurs Docker.

Pour lancer l'application :

```
make up
```
Pour arrêter l'application :

```
make down
```
Ces commandes vont :

Construire les conteneurs Docker définis dans docker-compose.yml.
Lancer ou arrêter l'application Node.js ainsi que le service de base de données MariaDB.

L'application sera accessible sur http://localhost:3000.
