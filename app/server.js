require('dotenv').config();
const express = require('express');
const path = require('path'); // Ajouté: Importer le module path
const app = express();
const db = require('./config/db');
const PORT = 3000;
const authRoutes = require('./routes/authRoutes')
const fileRoutes = require('./routes/fileRoutes')


// Configuration de la base de données
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Impossible de se connecter à la base de données :', err.stack);
  } else {
    console.log('Connexion à la base de données réussie.');
  }
});

app.use(express.json()); // Pour analyser le JSON

// Ajouté: Servir les fichiers statiques depuis le dossier frontend
app.use(express.static(path.join(__dirname, 'frontend'))); // Nouvelle ligne pour servir les fichiers

app.use('/auth', authRoutes);
app.use(fileRoutes)

// Modifié: Route racine pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html')); // Modifié pour renvoyer index.html
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
