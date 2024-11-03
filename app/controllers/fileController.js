const multer = require('multer');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Configuration de Multer pour gérer l'upload de fichiers
const upload = multer({
  dest: '../uploads/', // dossier de stockage des fichiers
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // Limite de 2 Go par fichier
});

exports.getUserFiles = (req, res) => {
  const userId = req.user.id;

  const getUserFilesQuery = 'SELECT id, filename, path, size, upload_date FROM files WHERE user_id = ?';
  db.query(getUserFilesQuery, [userId], (error, results) => {
    if (error) {
      console.log("Erreur lors de la récupération des fichiers :", error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
    }
    res.status(200).json(results);
  });
};

exports.deleteUserFile = (req, res) => {
  const userId = req.user.id;
  const fileId = req.params.fileId;

  // Vérifier que le fichier appartient à l'utilisateur
  const checkFileOwnershipQuery = 'SELECT * FROM files WHERE id = ? AND user_id = ?';
  db.query(checkFileOwnershipQuery, [fileId, userId], (error, results) => {
    if (error || results.length === 0) {
      console.log("Erreur : Fichier introuvable ou accès non autorisé");
      return res.status(404).json({ error: 'Fichier introuvable ou accès non autorisé' });
    }

    // Supprimer le fichier de la base de données
    const deleteFileQuery = 'DELETE FROM files WHERE id = ? AND user_id = ?';
    db.query(deleteFileQuery, [fileId, userId], (error, results) => {
      if (error) {
        console.log("Erreur lors de la suppression du fichier :", error);
        return res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
      }
      res.status(200).json({ message: 'Fichier supprimé avec succès' });
    });
  });
};

exports.uploadFile = (req, res) => {
  const userId = req.user.id; // ID de l'utilisateur authentifié
  const file = req.file; // Fichier uploadé
  console.log("ID de l'utilisateur authentifié :", req.user.id);

  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  // Enregistrer les informations du fichier dans la base de données
  const insertFileQuery = 'INSERT INTO files (user_id, filename, path, size) VALUES (?, ?, ?, ?)';
  db.query(insertFileQuery, [userId, file.originalname, file.path, file.size], (error, results) => {
    if (error) {
      console.log("Erreur lors de l'enregistrement du fichier :", error);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du fichier' });
    }

    // Stocker l'ID du fichier
    const fileId = results.insertId;

    // Vérification que le fichier est bien associé à l'utilisateur
    const checkFileQuery = 'SELECT user_id FROM files WHERE id = ?';
    db.query(checkFileQuery, [fileId], (error, results) => {
      if (error) {
        console.log("Erreur lors de la vérification du fichier :", error);
        return res.status(500).json({ error: 'Erreur lors de la vérification du fichier' });
      }

      const fileRecord = results[0];
      if (fileRecord.user_id !== userId) {
        console.log("Problème de liaison : user_id non associé correctement au fichier.");
        return res.status(500).json({ error: 'Erreur : user_id non associé correctement au fichier' });
      }

      // Utiliser la variable fileId dans la réponse JSON
      res.status(201).json({ 
        message: 'Fichier uploadé avec succès et associé à l\'utilisateur',
        fileId: fileId
      });
    });
  });
};


// Route pour créer un lien de téléchargement temporaire
exports.generateDownloadLink = (req, res) => {
  const fileId = req.params.fileId; // ID du fichier
  const expiresIn = '1h'; // Durée de validité du lien

  // Génération du token pour le lien de téléchargement
  const token = jwt.sign({ fileId }, process.env.JWT_SECRET, { expiresIn });

  // Création du lien de téléchargement
  const downloadLink = `${req.protocol}://${req.get('host')}/files/download/${fileId}?token=${token}`;
  res.json({ link: downloadLink });
};

// Route pour télécharger un fichier via un lien temporaire
exports.downloadFile = (req, res) => {
  const token = req.query.token;

  // Vérification du token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Lien de téléchargement expiré ou invalide' });
    }

    const fileId = decoded.fileId;

    // Recherche des informations du fichier dans la base de données
    const getFileQuery = 'SELECT * FROM files WHERE id = ?';
    db.query(getFileQuery, [fileId], (error, results) => {
      if (error || results.length === 0) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      const file = results[0];
      res.download(file.path, file.filename);
    });
  });
};

// Route pour récupérer tous les fichiers d'un utilisateur
exports.getUserFiles = (req, res) => {
  const userId = req.user.id; // ID de l'utilisateur authentifié

  // Requête pour récupérer les fichiers de l'utilisateur
  const getFilesQuery = 'SELECT * FROM files WHERE user_id = ?';
  db.query(getFilesQuery, [userId], (error, results) => {
    if (error) {
      console.log("Erreur lors de la récupération des fichiers :", error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
    }

    res.status(200).json(results); // Renvoyer les fichiers de l'utilisateur
  });
};