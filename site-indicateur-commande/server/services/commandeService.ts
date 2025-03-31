import sql from 'mssql';
import getConnection from '../config/db';
import db from '../config/db';

export interface CommandeObjectif {
  ID_Commercial: string;
  CA_Commande: number;
  CA_Objectif: number;
  Annee: number;
}

export interface Commercial {
  ID_Commercial: string;
  Nom: string;
}

export interface TauxConversion {
  ID: number;
  Annee_Commande: number;
  Commercial_ID: string;
  Nb_Devis: number;
  Nb_Commandes: number;
  Taux_Conversion: number;
}

export interface CAParPays {
  Pays: string;
  CA_Commande: number;
}

export interface MotifRepartition {
  Motif: string;
  Nb_Devis: number;
}

/**
 * Récupère les données de commandes et objectifs avec filtres optionnels
 */
export const getCommandesObjectifs = async (annee?: number, commercial?: string): Promise<CommandeObjectif[]> => {
  try {
    const pool = await getConnection();
    
    let query = `
      SELECT co.ID_Commercial, co.CA_Commande, co.CA_Objectif, co.Date_Annee as Annee
      FROM CA_Commande_Objectif co
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Ajouter les filtres si spécifiés
    if (annee) {
      query += ` AND co.Date_Annee = @annee`;
      params.push({ name: 'annee', value: annee });
    }
    
    if (commercial && commercial !== 'all') {
      query += ` AND co.ID_Commercial = @commercial`;
      params.push({ name: 'commercial', value: commercial });
    }
    
    // Créer la requête avec les paramètres
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset as CommandeObjectif[];
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return [];
  }
};

/**
 * Récupère la liste des commerciaux
 */
export const getCommerciaux = async (): Promise<Commercial[]> => {
  try {
    const pool = await getConnection();
    
    // Requête pour récupérer les commerciaux depuis la table KPI_Commercial
    const query = `
      SELECT ID_Commercial, Nom FROM KPI_Commercial
    `;
    
    const result = await pool.request().query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset as Commercial[];
  } catch (error) {
    console.error('Erreur lors de la récupération des commerciaux:', error);
    return [];
  }
};

/**
 * Récupère la liste des années disponibles
 */
export const getAnnees = async (): Promise<number[]> => {
  try {
    const pool = await getConnection();
    
    const query = `
      SELECT DISTINCT co.Date_Annee as Annee
      FROM CA_Commande_Objectif co
      ORDER BY co.Date_Annee DESC
    `;
    
    const result = await pool.request().query(query);
    
    // Fermer la connexion
    await pool.close();
    
    // Extraire les années du résultat
    return result.recordset.map(row => row.Annee);
  } catch (error) {
    console.error('Erreur lors de la récupération des années:', error);
    return [];
  }
};

/**
 * Récupère les données de taux de conversion avec filtres optionnels
 */
export const getTauxConversion = async (annee?: number, commercial?: string): Promise<TauxConversion[]> => {
  try {
    const pool = await getConnection();
    
    let query = `
      SELECT 
        ID,
        Annee_Commande,
        Commercial_ID,
        Nb_Devis,
        Nb_Commandes,
        Taux_Conversion
      FROM Taux_Conversion
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Ajouter les filtres si spécifiés
    if (annee) {
      query += ` AND Annee_Commande = @annee`;
      params.push({ name: 'annee', value: annee });
    }
    
    if (commercial && commercial !== 'all') {
      query += ` AND Commercial_ID = @commercial`;
      params.push({ name: 'commercial', value: commercial });
    }
    
    query += ` ORDER BY Commercial_ID, Annee_Commande`;
    
    // Créer la requête avec les paramètres
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset as TauxConversion[];
  } catch (error) {
    console.error('Erreur lors de la récupération des données de taux de conversion:', error);
    return [];
  }
};

/**
 * Récupère les données de CA par pays avec filtres par année et commercial
 */
export const getCAParPays = async (annee?: number, commercial?: string): Promise<CAParPays[]> => {
  try {
    const pool = await getConnection();
    
    let query = `
      SELECT 
        Pays,
        SUM(CA_Commande) as CA_Commande
      FROM [CSID].[dbo].[CA_Commande_Localite]
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (annee) {
      query += ` AND Date_Annee = @annee`;
      params.push({ name: 'annee', value: annee });
    }
    
    if (commercial && commercial !== 'all') {
      query += ` AND ID_Commercial = @commercial`;
      params.push({ name: 'commercial', value: commercial });
    }
    
    query += `
      GROUP BY Pays
    `;
    
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset as CAParPays[];
  } catch (error) {
    console.error('Erreur lors de la récupération des données de CA par pays:', error);
    return [];
  }
};

/**
 * Récupère le CA par mois
 * @param annee Année à filtrer (optionnel)
 * @param commercial ID du commercial à filtrer (optionnel)
 * @returns Données de CA par mois
 */
export const getCAParMois = async (annee?: number, commercial?: string) => {
  try {
    const pool = await getConnection();
    
    let query = `
      SELECT 
        Date_Mois as Mois,
        SUM(CA_Commande) as CA_Commande
      FROM 
        CA_Commande
      WHERE 
        1=1
    `;
    
    const params: any[] = [];
    
    // Ajouter les filtres si nécessaire
    if (annee) {
      query += ` AND Date_Annee = @annee`;
      params.push({ name: 'annee', value: annee });
    }
    
    if (commercial) {
      query += ` AND ID_Commercial = @commercial`;
      params.push({ name: 'commercial', value: commercial });
    }
    
    // Grouper par mois
    query += `
      GROUP BY 
        Date_Mois
      ORDER BY 
        Date_Mois
    `;
    
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Erreur lors de la récupération du CA par mois:', error);
    throw error;
  }
};

/**
 * Récupère la répartition des motifs avec filtres par année et commercial
 */
export const getMotifRepartition = async (annee?: number, commercial?: string): Promise<MotifRepartition[]> => {
  try {
    const pool = await getConnection();
    
    let query = `
      SELECT 
        ISNULL(Motif, 'NULL') as Motif,
        COUNT(*) as Nb_Devis
      FROM 
        [CSID].[dbo].[Taux_Motif]
      WHERE 
        1=1
    `;
    
    const params: any[] = [];
    
    if (annee) {
      query += ` AND Date_Annee = @annee`;
      params.push({ name: 'annee', value: annee });
    }
    
    if (commercial && commercial !== 'all') {
      query += ` AND ID_Commercial = @commercial`;
      params.push({ name: 'commercial', value: commercial });
    }
    
    query += `
      GROUP BY 
        ISNULL(Motif, 'NULL')
      ORDER BY 
        Nb_Devis DESC
    `;
    
    const request = pool.request();
    
    // Ajouter les paramètres à la requête
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset as MotifRepartition[];
  } catch (error) {
    console.error('Erreur lors de la récupération des données de répartition des motifs:', error);
    return [];
  }
};

/**
 * Récupère la prédiction du CA total
 */
export const getPredictionCA = async (): Promise<number> => {
  try {
    const pool = await getConnection();
    
    const query = `
      SELECT SUM([CA_Pondere]) as CA_Prediction 
      FROM [CSID].[dbo].[CA_Prediction]
    `;
    
    const result = await pool.request().query(query);
    
    // Fermer la connexion
    await pool.close();
    
    return result.recordset[0].CA_Prediction || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération de la prédiction du CA:', error);
    return 0;
  }
};

export const getTopSales = async (annee?: number, commercial?: string) => {
  try {
    const pool = await getConnection();
    let query = `
      SELECT TOP 5 
        valeur_nette As CA,
        V.Doc_vente As Document_De_Vente,
        KC.Nom AS Commercial,
        C.Designation_CLient_NAMEI as Client,
        V.Date_doc As Date,
        C.Pays_LAND1 As Pays
      FROM Vente V
      INNER JOIN kpi_Commercial KC ON V.GrVd = KC.ID_GRP_Vendeur
      INNER JOIN KPI_Date KD ON CAST(V.Date_doc AS date) = kd.Date_Complet
      INNER JOIN Client C ON V.Don_ordre = C.Code_Client_KUNNR
      WHERE LEFT(Doc_vente, 4) = '1201'
    `;

    const conditions: string[] = [];
    const request = pool.request();

    if (annee) {
      conditions.push('KD.Date_Annee = @annee');
      request.input('annee', sql.Int, annee);
    }

    if (commercial && commercial !== 'all') {
      conditions.push('KC.ID_Commercial = @commercial');
      request.input('commercial', sql.NVarChar, commercial);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY Valeur_nette DESC';

    const result = await request.query(query);

    return result.recordset.map(record => ({
      ca: record.CA,
      documentDeVente: record.Document_De_Vente,
      commercial: record.Commercial,
      client: record.Client,
      date: record.Date,
      pays: record.Pays
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des top ventes:', error);
    throw error;
  }
}; 