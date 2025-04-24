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
          scale.height = 200;
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
          size: 14
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
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <div style={chartContainerStyle}>
      <div style={headerStyle}>
        Prédiction du CA - 2017
      </div>
      <div style={chartStyle}>
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
              padding: '0 20px'
            }}>
              <div style={{ 
                width: '100%', 
                maxWidth: '600px',
                height: '250px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <Bar data={data} options={options} />
              </div>
            </div>
            <div style={predictionStyle}>
              Total Prédit: {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(funnelData.reduce((sum, item) => sum + item.CA_Prediction, 0))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles
const chartContainerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  margin: '0',
  padding: '0',
  overflow: 'hidden',
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
  height: '300px',
  padding: '10px',
  flex: 1,
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