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
import ChartFocusWrapper from './ChartFocusWrapper';

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
  const [isFocusMode, setIsFocusMode] = useState(false);

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
        label: 'Temps moyen (en jours)',
        data: conversionData.map(item => item.Duree_Moyenne),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: isFocusMode ? 2 : 1,
      },
      {
        label: 'CA moyen (en K€)',
        data: conversionData.map(item => item.CA_Moyen),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: isFocusMode ? 2 : 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    layout: {
      padding: 0
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          circular: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        ticks: {
          stepSize: 20,
          font: {
            size: isFocusMode ? 14 : 10
          },
          backdropPadding: 1,
          showLabelBackdrop: false,
          maxTicksLimit: 5
        },
        pointLabels: {
          font: {
            size: isFocusMode ? 16 : 10,
            weight: 'bold' as const
          },
          padding: 0,
          centerPointLabels: true
        }
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          boxWidth: isFocusMode ? 16 : 10,
          boxHeight: isFocusMode ? 10 : 6,
          padding: isFocusMode ? 20 : 3,
          font: {
            size: isFocusMode ? 16 : 10,
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: false,
        font: {
          size: isFocusMode ? 18 : 14,
          weight: 'bold' as const
        },
        color: '#156082',
        padding: {
          top: isFocusMode ? 15 : 5,
          bottom: isFocusMode ? 15 : 5
        }
      },
      tooltip: {
        titleFont: {
          size: isFocusMode ? 16 : 12
        },
        bodyFont: {
          size: isFocusMode ? 15 : 11,
          weight: 'bold' as const
        },
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
    <ChartFocusWrapper 
      title="Transformation des offres en commandes par année par commercial"
      onFocusChange={setIsFocusMode}
    >
      <div style={{
        position: 'absolute',
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={loadingStyle}>
            <span style={{ fontSize: isFocusMode ? '18px' : '14px' }}>Chargement des données...</span>
          </div>
        ) : error ? (
          <div style={errorStyle}>
            <span style={{ fontSize: isFocusMode ? '18px' : '14px' }}>{error}</span>
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Radar data={data} options={options} />
          </div>
        )}
      </div>
    </ChartFocusWrapper>
  );
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