const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware'); // middleware pour vérifier l'authentification
const multer = require('multer');

const upload = multer({
    dest: 'uploads/', // dossier où les fichiers seront stockés
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // Limite de 2 Go par fichier
  });

// Route d'upload de fichier (authentification requise)
router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);

// Route pour générer un lien de téléchargement temporaire
router.post('/files/:fileId/share', authMiddleware, fileController.generateDownloadLink);

// Route pour télécharger un fichier via un lien temporaire
router.get('/files/download/:fileId', fileController.downloadFile);

router.get('/files/myfiles', authMiddleware, fileController.getUserFiles);

router.delete('/files/myfiles/:fileId', authMiddleware, fileController.deleteUserFile);


module.exports = router;
