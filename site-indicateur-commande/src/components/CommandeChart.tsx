import React, { useEffect, useState, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { getCommandesObjectifs, CommandeObjectif } from '../services/api';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Désactiver les animations par défaut pour éviter les erreurs
ChartJS.defaults.animation = false;

interface CommandeChartProps {
  annee: number | null;
  commercial: string | null;
}

// Interface pour les données agrégées par commercial
interface AggregatedData {
  ID_Commercial: string;
  CA_Commande: number;
  CA_Objectif: number;
}

const CommandeChart: React.FC<CommandeChartProps> = ({ annee, commercial }) => {
  const [commandesData, setCommandesData] = useState<CommandeObjectif[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getCommandesObjectifs(annee || undefined, commercial || undefined);
      setCommandesData(data);
      setLoading(false);
    };

    fetchData();
  }, [annee, commercial]);

  // Fonction pour agréger les données par commercial
  const aggregateDataByCommercial = (data: CommandeObjectif[]): AggregatedData[] => {
    const aggregatedMap = new Map<string, AggregatedData>();
    
    data.forEach(item => {
      if (aggregatedMap.has(item.ID_Commercial)) {
        // Ajouter les valeurs au commercial existant
        const existingData = aggregatedMap.get(item.ID_Commercial)!;
        existingData.CA_Commande += item.CA_Commande;
        existingData.CA_Objectif += item.CA_Objectif;
      } else {
        // Créer une nouvelle entrée pour ce commercial
        aggregatedMap.set(item.ID_Commercial, {
          ID_Commercial: item.ID_Commercial,
          CA_Commande: item.CA_Commande,
          CA_Objectif: item.CA_Objectif
        });
      }
    });
    
    // Convertir la Map en tableau
    return Array.from(aggregatedMap.values());
  };

  // Déterminer les données à utiliser en fonction du filtre d'année
  const processedData = useMemo(() => {
    // Si aucune année n'est sélectionnée (toutes les années), agréger par commercial
    if (annee === null) {
      return aggregateDataByCommercial(commandesData);
    }
    // Sinon, utiliser les données telles quelles
    return commandesData;
  }, [commandesData, annee]);

  // Utilisation de useMemo pour éviter de recalculer les données du graphique à chaque rendu
  const chartData = useMemo(() => ({
    labels: processedData.map(item => item.ID_Commercial),
    datasets: [
      {
        type: 'bar' as const,
        label: 'CA Commande',
        data: processedData.map(item => item.CA_Commande),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.7
      },
      {
        type: 'line' as const,
        label: 'CA Objectif',
        data: processedData.map(item => item.CA_Objectif),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.1,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 3,
        pointHoverRadius: 4,
        fill: false,
        order: 1
      }
    ],
  }), [processedData]);

  // Utilisation de useMemo pour éviter de recalculer les options du graphique à chaque rendu
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `CA Commandes vs Objectifs ${annee ? `- ${annee}` : '- Toutes années'}`,
        font: {
          size: 16
        },
        color: 'white',
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        enabled: true,
        mode: 'nearest' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CA (€)',
          font: {
            size: 14
          }
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(value);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Commercial',
          font: {
            size: 14
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      },
      point: {
        radius: 3,
        hoverRadius: 4
      }
    }
  }), [annee]);

  if (loading) {
    return <div style={loadingStyle}>Chargement des données...</div>;
  }

  if (commandesData.length === 0) {
    return <div style={noDataStyle}>Aucune donnée disponible pour les filtres sélectionnés.</div>;
  }

  return (
    <div style={chartContainerStyle}>
      <div style={headerStyle}>
        CA Commandes vs Objectifs {annee ? `- ${annee}` : '- Toutes années'}
      </div>
      <div style={chartStyle}>
        <Chart type='bar' data={chartData} options={options} />
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
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#156082',
  padding: '10px 15px'
};

const chartStyle: React.CSSProperties = {
  height: '450px',
  padding: '20px'
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '500px',
  fontSize: '18px',
  color: '#666'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '500px',
  fontSize: '18px',
  color: '#666',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  margin: '20px'
};

export default CommandeChart; 