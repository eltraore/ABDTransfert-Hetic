const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware')

// Route d'inscription
router.post('/signup', authController.signup);

// Route de connexion
router.post('/login', authController.login);

router.put('/update-password', authMiddleware, authController.updatePassword);

// Route pour récupérer les informations de l'utilisateur
router.get('/profile', authMiddleware, authController.getUserProfile);

module.exports = router;


module.exports = router;
