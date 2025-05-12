import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { getFunnelData, FunnelData } from '../services/api';
import ChartFocusWrapper from './ChartFocusWrapper';

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Types pour Chart.js avec datalabels
interface ExtendedChartData extends ChartData<'bar', number[], string> {
  datasets: {
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth: number;
    barPercentage: number;
    categoryPercentage: number;
    stack: string;
  }[];
}

interface ExtendedChartOptions extends ChartOptions<'bar'> {
  plugins: {
    datalabels: {
      display: (context: any) => boolean;
      color: string;
      font: {
        weight: 'bold';
        size: number;
      };
      formatter: (value: any, context: any) => string;
      align: 'center';
      anchor: 'center';
    };
    legend: {
      display: boolean;
    };
    tooltip: {
      callbacks: {
        label: (context: any) => string;
      };
    };
  };
}

const FunnelChart: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Charger les données du funnel
  useEffect(() => {
    const loadFunnelData = async () => {
      try {
        const data = await getFunnelData();
        setFunnelData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données du funnel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnelData();
  }, []);

  // Configuration des données pour Chart.js
  const data: ExtendedChartData = {
    labels: funnelData.map(() => ''),
    datasets: [
      // Dataset pour l'espace à gauche (transparent)
      {
        data: funnelData.map((_, index) => {
          // Largeurs fixes pour créer l'effet d'entonnoir
          const widths = [100, 80, 60, 40];
          const totalSpace = 100 - widths[index];
          return totalSpace / 2;
        }),
        backgroundColor: 'transparent',
        borderWidth: 0,
        barPercentage: 1,
        categoryPercentage: 1,
        stack: 'stack1'
      },
      // Dataset principal
      {
        data: funnelData.map((_, index) => {
          // Largeurs fixes pour créer l'effet d'entonnoir
          const widths = [100, 80, 60, 40];
          return widths[index];
        }),
        backgroundColor: [
          'rgba(200, 220, 240, 0.8)',
          'rgba(150, 190, 230, 0.8)',
          'rgba(100, 160, 220, 0.8)',
          'rgba(50, 130, 210, 0.8)',
        ],
        borderColor: [
          'rgba(200, 220, 240, 1)',
          'rgba(150, 190, 230, 1)',
          'rgba(100, 160, 220, 1)',
          'rgba(50, 130, 210, 1)',
        ],
        borderWidth: 1,
        barPercentage: 1,
        categoryPercentage: 1,
        stack: 'stack1'
      },
      // Dataset pour l'espace à droite (transparent)
      {
        data: funnelData.map((_, index) => {
          // Largeurs fixes pour créer l'effet d'entonnoir
          const widths = [100, 80, 60, 40];
          const totalSpace = 100 - widths[index];
          return totalSpace / 2;
        }),
        backgroundColor: 'transparent',
        borderWidth: 0,
        barPercentage: 1,
        categoryPercentage: 1,
        stack: 'stack1'
      }
    ]
  };

  // Options de configuration
  const options: ExtendedChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
        stacked: true,
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        afterFit: (scale: any) => {
          // Ajuster la hauteur de l'échelle en fonction du mode focus
          scale.height = isFocusMode ? 400 : 200;
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: (context) => context.datasetIndex === 1,
        color: '#156082',
        font: {
          weight: 'bold',
          size: isFocusMode ? 22 : 14
        },
        formatter: (value, context) => {
          const data = funnelData[context.dataIndex];
          return `${data.Niveau} | ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
          }).format(data.CA_Prediction)}`;
        },
        align: 'center',
        anchor: 'center'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = funnelData[context.dataIndex];
            return `Niveau: ${data.Niveau} | CA Prédit: ${new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(data.CA_Prediction)} | Nombre de devis: ${data.Nombre_Devis}`;
          }
        }
      }
    },
    layout: {
      padding: {
        left: isFocusMode ? 40 : 20,
        right: isFocusMode ? 40 : 20,
        top: isFocusMode ? 60 : 20,
        bottom: isFocusMode ? 60 : 20
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <ChartFocusWrapper 
      title="Prédiction du CA - 2017"
      onFocusChange={setIsFocusMode}
    >
      <div style={chartContentStyle}>
        {isLoading ? (
          <div style={loadingStyle}>Chargement...</div>
        ) : funnelData.length === 0 ? (
          <div style={noDataStyle}>Aucune donnée disponible</div>
        ) : (
          <>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: isFocusMode ? '0 40px' : '0 20px'
            }}>
              <div style={{ 
                width: '100%', 
                // Adapter la taille du graphique en fonction du mode focus
                maxWidth: isFocusMode ? '1000px' : '600px',
                height: isFocusMode ? '550px' : '250px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <Bar data={data} options={options} />
              </div>
            </div>
            <div style={{
              ...predictionStyle,
              fontSize: isFocusMode ? '28px' : '20px',
              padding: isFocusMode ? '20px' : '10px',
              margin: isFocusMode ? '20px 40px' : '10px 0',
            }}>
              Total Prédit: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(funnelData.reduce((sum, item) => sum + item.CA_Prediction, 0))}
            </div>
          </>
        )}
      </div>
    </ChartFocusWrapper>
  );
};

// Styles
const chartContentStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
};

const predictionStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#156082',
  marginTop: '10px',
  backgroundColor: 'rgba(21, 96, 130, 0.1)',
  padding: '10px',
  borderRadius: '4px'
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: '#156082',
  fontSize: '16px'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: '#666',
  fontSize: '16px'
};

export default FunnelChart; 