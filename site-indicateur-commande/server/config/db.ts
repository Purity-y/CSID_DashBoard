import sql from 'mssql';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion à SQL Server
const dbConfig: sql.config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  options: {
    encrypt: false, // Désactivé pour les connexions locales
    trustServerCertificate: true, // Nécessaire pour les environnements locaux / auto-signés
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Fonction pour créer un pool de connexions
const getConnection = async (): Promise<sql.ConnectionPool> => {
  try {
    console.log('Tentative de connexion à la base de données avec les paramètres suivants:');
    console.log(`Serveur: ${dbConfig.server}`);
    console.log(`Base de données: ${dbConfig.database}`);
    console.log(`Utilisateur: ${dbConfig.user}`);
    
    const pool = new sql.ConnectionPool(dbConfig);
    return await pool.connect();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
};

export default getConnection; 