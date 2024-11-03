const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé, token manquant' });
  }

  const token = authHeader.split(' ')[1];

  // Vérifier et décoder le token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }

    // Stocker l'ID de l'utilisateur décodé dans req.user
    req.user = { id: decoded.userId };
    next();
  });
};