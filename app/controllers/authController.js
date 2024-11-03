const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../schema/user');
const db = require('../config/db.js');
const JWT_SECRET = process.env.JWT_SECRET;



exports.signup = (req, res) => {
  const email = req.body.email;
  
  // Vérifier si l'utilisateur existe déjà
  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.log("Erreur lors de la vérification de l'utilisateur :", err);
      return res.status(500).json({ error: 'Erreur de serveur' });
    }

    // Si l'utilisateur existe déjà, renvoyer un message d'erreur
    if (results.length > 0) {
      return res.status(400).json({ error: 'Utilisateur déjà existant !' });
    }

    // Si l'utilisateur n'existe pas, continuer avec l'inscription
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const password = hash;

        // Insérer l'utilisateur dans la base de données
        const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(insertUserQuery, [email, password], (error, results) => {
          if (error) {
            console.log("Erreur lors de l'enregistrement de l'utilisateur :", error); 
            return res.status(400).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
          }
          res.status(201).json({ message: 'Utilisateur créé !' });
        });
      })
      .catch(error => {
        console.log("Erreur lors du hachage du mot de passe :", error); 
        res.status(500).json({ error: 'Erreur lors du hachage du mot de passe' });
      });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Recherche de l'utilisateur dans la base de données
  const findUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(findUserQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur de serveur' });
    if (results.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé !' });

    const user = results[0];

    // Vérification du mot de passe
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (!result) return res.status(401).json({ error: 'Mot de passe incorrect !' });

      // Génération du token JWT
      const token = jwt.sign(
        { userId: user.id }, // Assurez-vous que `user.id` correspond bien à la colonne `id` dans votre table `users`
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        userId: user.id,
        token: token
      });
    });
  });
};

exports.updatePassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
  }

  // Vérifier le mot de passe actuel
  const getUserQuery = 'SELECT password FROM users WHERE id = ?';
  db.query(getUserQuery, [userId], (error, results) => {
    if (error || results.length === 0) {
      console.log("Erreur lors de la récupération de l'utilisateur :", error);
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }

    const hashedPassword = results[0].password;

    // Comparer le mot de passe actuel avec le mot de passe stocké
    bcrypt.compare(currentPassword, hashedPassword, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      // Hacher le nouveau mot de passe
      bcrypt.hash(newPassword, 10, (hashError, hashedNewPassword) => {
        if (hashError) {
          console.log("Erreur lors du hachage du nouveau mot de passe :", hashError);
          return res.status(500).json({ error: 'Erreur lors du hachage du nouveau mot de passe' });
        }

        // Mettre à jour le mot de passe dans la base de données
        const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(updatePasswordQuery, [hashedNewPassword, userId], (updateError) => {
          if (updateError) {
            console.log("Erreur lors de la mise à jour du mot de passe :", updateError);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
          }

          res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
        });
      });
    });
  });
};

exports.getUserProfile = (req, res) => {
  const userId = req.user.id; // ID de l'utilisateur extrait du token

  const getUserQuery = 'SELECT email FROM users WHERE id = ?';
  db.query(getUserQuery, [userId], (error, results) => {
      if (error) {
          console.log("Erreur lors de la récupération des informations de l'utilisateur :", error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des informations utilisateur' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Retourne les informations de l'utilisateur (email)
      const user = results[0];
      res.status(200).json({
          email: user.email
      });
  });
};
