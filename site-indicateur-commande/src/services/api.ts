import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

export interface Commercial {
  ID_Commercial: string;
  Nom: string;
}

export interface CommandeObjectif {
  ID_Commercial: string;
  Nom_Commercial: string;
  Date_Annee: number;
  CA_Commande: number;
  CA_Objectif: number;
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

// Récupérer les données de commandes et objectifs
export const getCommandesObjectifs = async (annee?: number, commercial?: string): Promise<CommandeObjectif[]> => {
  try {
    let url = `${API_URL}/commandes`;
    
    // Ajouter les paramètres de filtrage si nécessaire
    const params = new URLSearchParams();
    if (annee) params.append('annee', annee.toString());
    if (commercial) params.append('commercial', commercial);
    
    // Ajouter les paramètres à l'URL si au moins un est défini
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return [];
  }
};

export const getTauxConversion = async (annee?: number, commercial?: string): Promise<TauxConversion[]> => {
  try {
    let url = `${API_URL}/taux-conversion`;
    
    // Ajouter les paramètres de filtrage si nécessaire
    const params = new URLSearchParams();
    if (annee) params.append('annee', annee.toString());
    if (commercial) params.append('commercial', commercial);
    
    // Ajouter les paramètres à l'URL si au moins un est défini
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données de taux de conversion:", error);
    return [];
  }
};

export const getCAParPays = async (annee?: number, commercial?: string): Promise<CAParPays[]> => {
  try {
    let url = `${API_URL}/ca-par-pays`;
    
    // Ajouter les paramètres de filtrage si nécessaire
    const params = new URLSearchParams();
    if (annee) params.append('annee', annee.toString());
    if (commercial) params.append('commercial', commercial);
    
    // Ajouter les paramètres à l'URL si au moins un est défini
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données de CA par pays:", error);
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
    const searchParams = new URLSearchParams();
    if (annee) searchParams.append('annee', annee.toString());
    if (commercial) searchParams.append('commercial', commercial);
    
    const response = await fetch(`${API_URL}/ca-par-mois?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du CA par mois:', error);
    throw error;
  }
};

// Récupérer la liste des commerciaux
export const getCommerciaux = async (): Promise<Commercial[]> => {
  try {
    const response = await axios.get(`${API_URL}/commerciaux`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des commerciaux:', error);
    return [];
  }
};

// Récupérer la liste des années
export const getAnnees = async (): Promise<number[]> => {
  try {
    const response = await axios.get(`${API_URL}/annees`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des années:', error);
    return [];
  }
}; 