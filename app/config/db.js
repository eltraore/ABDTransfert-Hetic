const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'database',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tdHeticDB',
    port: 3306
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err.stack);
      return;
    }
    console.log('Connecté à la base de données.');
  });

  module.exports = db;