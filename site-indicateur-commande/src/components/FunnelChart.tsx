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
import { getPredictionCA } from '../services/api';

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
  const [prediction, setPrediction] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger la prédiction
  useEffect(() => {
    const loadPrediction = async () => {
      try {
        const data = await getPredictionCA();
        setPrediction(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la prédiction:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrediction();
  }, []);

  // Données de l'entonnoir avec largeurs ajustées
  const funnelData = [
    { label: 'Proba > 30%', percentage: 80, width: 1 },
    { label: 'Proba > 50%', percentage: 50, width: 0.8 },
    { label: 'Proba > 80%', percentage: 30, width: 0.6 },
    { label: 'Commandé', percentage: 20, width: 0.4 }
  ];

  // Configuration des données pour Chart.js
  const data: ExtendedChartData = {
    labels: funnelData.map(() => ''),
    datasets: [
      // Dataset pour l'espace à gauche (transparent)
      {
        data: funnelData.map((item) => {
          const totalSpace = 100 - item.percentage;
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
        data: funnelData.map(item => item.percentage),
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
        data: funnelData.map((item) => {
          const totalSpace = 100 - item.percentage;
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
          scale.height = 200; // Réduire la hauteur de l'axe Y
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
        formatter: (value, context) => funnelData[context.dataIndex].label,
        align: 'center',
        anchor: 'center'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const originalValue = funnelData[context.dataIndex].percentage;
            const predictedValue = (prediction * originalValue / 100);
            return `${originalValue}% - ${new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(predictedValue)}`;
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
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(prediction)}
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

export default FunnelChart; 