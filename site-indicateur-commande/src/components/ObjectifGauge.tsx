import React, { useEffect, useState } from 'react';
import { getCommandesObjectifs, CommandeObjectif } from '../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ObjectifGaugeProps {
  annee: number | null;
  commercial: string | null;
}

const ObjectifGauge: React.FC<ObjectifGaugeProps> = ({ annee, commercial }) => {
  const [data, setData] = useState<CommandeObjectif[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [caCommande, setCaCommande] = useState<number>(0);
  const [caObjectif, setCaObjectif] = useState<number>(0);
  const [animationPercentage, setAnimationPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedData = await getCommandesObjectifs(annee || undefined, commercial || undefined);
        setData(fetchedData);
        
        // Calculer le total des commandes et des objectifs
        let totalCommande = 0;
        let totalObjectif = 0;
        
        fetchedData.forEach(item => {
          totalCommande += item.CA_Commande;
          totalObjectif += item.CA_Objectif;
        });
        
        setCaCommande(totalCommande);
        setCaObjectif(totalObjectif);
        
        // Calculer le pourcentage d'atteinte de l'objectif
        let calculatedPercentage = 0;
        
        if (totalObjectif <= 0) {
          // Si l'objectif est négatif ou nul et qu'il y a des commandes, on considère que l'objectif est dépassé à 200%
          calculatedPercentage = totalCommande > 0 ? 200 : 0;
        } else {
          // Calcul normal avec limitation à 200%
          calculatedPercentage = Math.min(200, (totalCommande / totalObjectif) * 100);
        }
        
        setPercentage(calculatedPercentage);
        
        // Animation de remplissage progressif
        setAnimationPercentage(0);
        let startPercentage = 0;
        const animationDuration = 1000; // 1.5 secondes
        const framesPerSecond = 60;
        const totalFrames = animationDuration / 1000 * framesPerSecond;
        const incrementPerFrame = calculatedPercentage / totalFrames;
        
        const animationInterval = setInterval(() => {
          startPercentage += incrementPerFrame;
          if (startPercentage >= calculatedPercentage) {
            startPercentage = calculatedPercentage;
            clearInterval(animationInterval);
          }
          setAnimationPercentage(startPercentage);
        }, 1000 / framesPerSecond);
        
        setLoading(false);
        
        return () => clearInterval(animationInterval);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [annee, commercial]);

  // Fonction pour déterminer la couleur en fonction du pourcentage
  const getColor = (percent: number): string => {
    if (percent <= 50) {
      // De rouge à orange (0% à 50%)
      const r = 255;
      const g = Math.round((percent / 50) * 165);
      return `rgb(${r}, ${g}, 0)`;
    } else if (percent <= 100) {
      // D'orange à vert (50% à 100%)
      const r = Math.round(255 - ((percent - 50) / 50) * 255);
      const g = Math.round(165 + ((percent - 50) / 50) * 90);
      return `rgb(${r}, ${g}, 0)`;
    } else {
      // De vert à bleu (100% à 200%)
      const factor = (percent - 100) / 100;
      const r = Math.round(Math.max(0, 0 - factor * 0));
      const g = Math.round(Math.max(0, 255 - factor * 155));
      const b = Math.round(Math.min(255, 0 + factor * 255));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Préparer les données pour le gauge chart
  const chartData: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [animationPercentage, 200 - animationPercentage],
        backgroundColor: [
          getColor(animationPercentage),
          '#f0f0f0' // Couleur de fond
        ],
        borderWidth: 0,
        circumference: 180, // Demi-cercle (180 degrés)
        rotation: 270 // Rotation pour que le demi-cercle soit en bas
      }
    ],
    labels: ['Atteinte', 'Restant']
  };

  // Options du gauge chart
  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Réduction de l'épaisseur de l'anneau
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    layout: {
      padding: {
        top: 10, // Réduction du padding
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };

  // Formater les valeurs monétaires
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div style={loadingStyle}>Chargement des données...</div>;
  }

  if (error) {
    return <div style={errorStyle}>{error}</div>;
  }

  if (data.length === 0) {
    return <div style={noDataStyle}>Aucune donnée disponible pour les filtres sélectionnés.</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        Atteinte des objectifs
      </div>
      <div style={contentStyle}>
        <div style={gaugeContainerStyle}>
          <div style={gaugeWrapperStyle}>
            <Doughnut data={chartData} options={chartOptions} />
            <div style={percentageOverlayStyle}>
              <div style={percentageValueStyle}>{animationPercentage.toFixed(1)}%</div>
              <div style={percentageLabelStyle}>
                {caObjectif <= 0 ? "objectif dépassé" : "des objectifs"}
              </div>
            </div>
            <div style={markersContainerStyle}>
              <div style={{...markerStyle, left: '0%'}}>0%</div>
              <div style={{...markerStyle, left: '25%'}}>50%</div>
              <div style={{...markerStyle, left: '50%'}}>100%</div>
              <div style={{...markerStyle, left: '75%'}}>150%</div>
              <div style={{...markerStyle, left: '100%'}}>200%</div>
            </div>
          </div>
        </div>
        
        <div style={detailsContainerStyle}>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>CA Commande:</span>
            <span style={detailValueStyle}>{formatCurrency(caCommande)}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>CA Objectif:</span>
            <span style={detailValueStyle}>
              {caObjectif <= 0 
                ? <span style={{color: '#F44336'}}>{formatCurrency(caObjectif)} (non défini)</span> 
                : formatCurrency(caObjectif)
              }
            </span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Différence:</span>
            {caObjectif <= 0 ? (
              <span style={{...detailValueStyle, color: caCommande > 0 ? '#4CAF50' : '#666'}}>
                {caCommande > 0 ? "Objectif dépassé" : "Aucune commande"}
              </span>
            ) : (
              <span style={{
                ...detailValueStyle, 
                color: caCommande >= caObjectif ? '#4CAF50' : '#F44336'
              }}>
                {formatCurrency(caCommande - caObjectif)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  border: '1px solid #156082',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#156082',
  padding: '10px 15px'
};

const contentStyle: React.CSSProperties = {
  padding: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  flex: 1
};

const gaugeContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  height: '160px'
};

const gaugeWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%'
};

const percentageOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center'
};

const percentageValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333'
};

const percentageLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666'
};

const markersContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-5px', // Ajustement de la position pour mieux s'adapter à la taille réduite
  left: '0',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 10%'
};

const markerStyle: React.CSSProperties = {
  position: 'absolute',
  fontSize: '10px', // Réduction de la taille de police
  color: '#666',
  transform: 'translateX(-50%)'
};

const detailsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '5px'
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px'
};

const detailLabelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#555'
};

const detailValueStyle: React.CSSProperties = {
  fontWeight: 'bold'
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '16px',
  color: '#666'
};

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '16px',
  color: '#d32f2f',
  padding: '20px',
  textAlign: 'center'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '16px',
  color: '#666'
};

export default ObjectifGauge; 