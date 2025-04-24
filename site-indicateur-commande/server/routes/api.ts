import express from 'express';
import { getCommandesObjectifs, getCommerciaux, getAnnees, getTauxConversion, getCAParPays, getCAParMois, getMotifRepartition, getPredictionCA, getTopSales, getFunnelData, getTempsCAConversion } from '../services/commandeService';
import { Request, Response } from 'express';
import * as sql from 'mssql';
import getConnection from '../config/db';

interface SaleRecord {
  CA: number;
  Document_De_Vente: string;
  Commercial: string;
  Client: string;
  Date: Date;
  Pays: string;
}

const router = express.Router();

// Route pour obtenir les données de CA et objectifs
router.get('/commandes', async (req, res) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres de requête en types appropriés
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string;
    
    const data = await getCommandesObjectifs(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Route pour obtenir la liste des commerciaux
router.get('/commerciaux', async (req, res) => {
  try {
    const commerciaux = await getCommerciaux();
    res.json(commerciaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des commerciaux:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commerciaux' });
  }
});

// Route pour obtenir la liste des années
router.get('/annees', async (req, res) => {
  try {
    const annees = await getAnnees();
    res.json(annees);
  } catch (error) {
    console.error('Erreur lors de la récupération des années:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des années' });
  }
});

// Route pour obtenir les données de taux de conversion
router.get('/taux-conversion', async (req, res) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres de requête en types appropriés
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string;
    
    const data = await getTauxConversion(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des taux de conversion:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des taux de conversion' });
  }
});

// Route pour obtenir les données de CA par pays
router.get('/ca-par-pays', async (req, res) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres de requête en types appropriés
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string;
    
    const data = await getCAParPays(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de CA par pays:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données de CA par pays' });
  }
});

// Route pour récupérer le CA par mois
router.get('/ca-par-mois', async (req, res) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string | undefined;
    
    // Récupérer les données
    const data = await getCAParMois(anneeParam, commercialParam);
    
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération du CA par mois:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Route pour obtenir la répartition des motifs de commande
router.get('/motif-repartition', async (req, res) => {
  try {
    const anneeParam = req.query.annee ? parseInt(req.query.annee as string) : undefined;
    const commercialParam = req.query.commercial as string | undefined;
    
    const data = await getMotifRepartition(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des motifs de commande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir la prédiction du CA
router.get('/prediction-ca', async (req, res) => {
  try {
    const data = await getPredictionCA();
    res.json({ CA_Prediction: data });
  } catch (error) {
    console.error('Erreur lors de la récupération de la prédiction du CA:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la prédiction du CA' });
  }
});

// Route pour récupérer le top 5 des ventes
router.get('/top-sales', async (req: Request, res: Response) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres de requête en types appropriés
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string;
    
    const data = await getTopSales(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des top ventes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Route pour obtenir les données du funnel
router.get('/funnel-data', async (req, res) => {
  try {
    const data = await getFunnelData();
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données du funnel:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du funnel' });
  }
});

// Route pour obtenir les données de temps de conversion et CA
router.get('/temps-ca-conversion', async (req, res) => {
  try {
    const { annee, commercial } = req.query;
    
    // Convertir les paramètres de requête en types appropriés
    const anneeParam = annee ? parseInt(annee as string) : undefined;
    const commercialParam = commercial as string;
    
    const data = await getTempsCAConversion(anneeParam, commercialParam);
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de temps et CA:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données de temps et CA' });
  }
});

export default router; 