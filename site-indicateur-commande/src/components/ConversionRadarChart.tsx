import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getTempsCAConversion, TempsCAConversion } from '../services/api';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ConversionRadarChartProps {
  annee?: number;
  commercial?: string;
}

// Noms des mois pour les labels
const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const ConversionRadarChart: React.FC<ConversionRadarChartProps> = ({ annee, commercial }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [conversionData, setConversionData] = useState<TempsCAConversion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getTempsCAConversion(annee, commercial);
        setConversionData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [annee, commercial]);

  // Préparation des données pour le graphique
  const data = {
    labels: months,
    datasets: [
      {
        label: 'Temps moyen entre le passage de la demande en commande (en J)',
        data: conversionData.map(item => item.Duree_Moyenne),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'CA moyen par commande (en K€)',
        data: conversionData.map(item => item.CA_Moyen),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Taux de transformation des offres en commandes',
        font: {
          size: 14,
          weight: 'bold' as const
        },
        color: '#156082',
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            
            if (label.includes('Temps')) {
              return `${label}: ${value.toFixed(1)} jours`;
            } else if (label.includes('CA')) {
              return `${label}: ${value.toFixed(1)} K€`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        Transformation des offres en commandes par année par commercial
      </div>
      <div style={chartStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <span>Chargement des données...</span>
          </div>
        ) : error ? (
          <div style={errorStyle}>
            <span>{error}</span>
          </div>
        ) : (
          <Radar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  border: '1px solid #156082',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#156082',
  color: 'white',
  padding: '10px 15px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const chartStyle: React.CSSProperties = {
  flex: 1,
  padding: '15px',
  position: 'relative',
  minHeight: '300px'
};

const loadingStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  color: '#156082'
};

const errorStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  color: '#dc3545'
};

export default ConversionRadarChart; 