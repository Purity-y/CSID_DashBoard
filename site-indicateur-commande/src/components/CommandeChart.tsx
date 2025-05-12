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
import { getCommandesObjectifs, getCommerciaux, CommandeObjectif, Commercial } from '../services/api';
import ChartFocusWrapper from './ChartFocusWrapper';

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
  Nom_Commercial: string;
  CA_Commande: number;
  CA_Objectif: number;
}

const CommandeChart: React.FC<CommandeChartProps> = ({ annee, commercial }) => {
  const [commandesData, setCommandesData] = useState<CommandeObjectif[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les données des commerciaux
        const commerciauxData = await getCommerciaux();
        setCommerciaux(commerciauxData);
        
        // Récupérer les données des commandes
        const data = await getCommandesObjectifs(annee || undefined, commercial || undefined);
        setCommandesData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [annee, commercial]);

  // Fonction pour obtenir le nom d'un commercial à partir de son ID
  const getCommercialName = (id: string): string => {
    const commercial = commerciaux.find(c => c.ID_Commercial === id);
    return commercial ? commercial.Nom : id; // Retourne le nom s'il est trouvé, sinon l'ID
  };

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
          Nom_Commercial: getCommercialName(item.ID_Commercial),
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
    
    // Sinon, utiliser les données telles quelles mais ajouter le nom du commercial
    return commandesData.map(item => ({
      ...item,
      Nom_Commercial: getCommercialName(item.ID_Commercial)
    }));
  }, [commandesData, annee, commerciaux]);

  // Utilisation de useMemo pour éviter de recalculer les données du graphique à chaque rendu
  const chartData = useMemo(() => ({
    labels: processedData.map(item => item.Nom_Commercial || item.ID_Commercial),
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
        pointRadius: isFocusMode ? 5 : 3,
        pointHoverRadius: isFocusMode ? 7 : 4,
        fill: false,
        order: 1
      }
    ],
  }), [processedData, isFocusMode]);

  // Utilisation de useMemo pour éviter de recalculer les options du graphique à chaque rendu
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        bottom: isFocusMode ? 20 : 10,
        left: isFocusMode ? 20 : 10,
        right: isFocusMode ? 20 : 10
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: isFocusMode ? 16 : 12
          },
          padding: isFocusMode ? 20 : 10
        },
        margin: 0
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'nearest' as const,
        intersect: false,
        titleFont: {
          size: isFocusMode ? 16 : 12
        },
        bodyFont: {
          size: isFocusMode ? 14 : 12
        },
        padding: isFocusMode ? 12 : 8,
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
            size: isFocusMode ? 18 : 14
          },
          padding: isFocusMode ? 20 : 10
        },
        ticks: {
          font: {
            size: isFocusMode ? 14 : 12
          },
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
            size: isFocusMode ? 18 : 14
          },
          padding: isFocusMode ? 20 : 10
        },
        ticks: {
          font: {
            size: isFocusMode ? 14 : 12
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1,
        borderWidth: isFocusMode ? 3 : 2
      },
      point: {
        radius: isFocusMode ? 5 : 3,
        hoverRadius: isFocusMode ? 7 : 4
      },
      bar: {
        borderWidth: isFocusMode ? 2 : 1
      }
    }
  }), [annee, isFocusMode]);

  if (loading) {
    return <div style={loadingStyle}>Chargement des données...</div>;
  }

  if (commandesData.length === 0) {
    return <div style={noDataStyle}>Aucune donnée disponible pour les filtres sélectionnés.</div>;
  }

  return (
    <ChartFocusWrapper 
      title="Objectif de CA par année par commercial"
      onFocusChange={setIsFocusMode}
    >
      <div style={chartWrapperStyle}>
        <div style={{
          ...chartContainerStyle,
          height: isFocusMode ? '100%' : '100%',
          padding: isFocusMode ? '20px' : '5px 10px 10px 10px',
        }}>
          <Chart type='bar' data={chartData} options={options} />
        </div>
      </div>
    </ChartFocusWrapper>
  );
};

// Styles
const chartWrapperStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const chartContainerStyle: React.CSSProperties = {
  width: '100%',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexGrow: 1
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