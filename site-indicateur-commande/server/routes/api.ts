import express from 'express';
import { getCommandesObjectifs, getCommerciaux, getAnnees, getTauxConversion, getCAParPays, getCAParMois } from '../services/commandeService';

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

export default router; 