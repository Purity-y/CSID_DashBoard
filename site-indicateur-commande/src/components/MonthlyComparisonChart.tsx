import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getCAParMois } from '../services/api';

// Nous utilisons chartConfig.ts pour l'enregistrement global des composants Chart.js
// Ici, nous n'avons pas besoin de réenregistrer les composants

interface MonthlyComparisonChartProps {
  annee?: number;
  commercial?: string;
}

interface MonthData {
  mois: string | number;
  ca: number;
}

// Interface pour les données de l'API
interface CAParMoisData {
  Mois: string | number;
  CA_Commande: string | number;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ annee, commercial }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const chartRef = useRef<ChartJS<'bar'>>(null);

  // Liste des mois dans l'ordre
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Noms des mois en français
  const frenchMonths = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Fonction pour obtenir l'index du mois (0-11) à partir d'un chiffre (1-12) ou d'un nom
  const getMonthIndex = (month: string | number): number => {
    if (typeof month === 'number' || !isNaN(Number(month))) {
      // Si c'est un chiffre (1-12), convertir en index (0-11)
      const monthNumber = typeof month === 'number' ? month : parseInt(month);
      return monthNumber - 1; // Soustraire 1 car les index commencent à 0
    } else {
      // Si c'est un nom, rechercher l'index dans la liste des mois
      return months.findIndex(m => m.toLowerCase() === month.toLowerCase());
    }
  };

  // Fonction pour obtenir le nom français du mois à partir d'un index (0-11)
  const getFrenchMonth = (monthIndex: number): string => {
    if (monthIndex >= 0 && monthIndex < 12) {
      return frenchMonths[monthIndex];
    }
    return 'Mois inconnu';
  };

  // Fonction pour formater les valeurs monétaires
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fonction pour charger les données
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Chargement des données CA par mois avec les filtres:', { annee, commercial });
      
      const data = await getCAParMois(annee, commercial);
      console.log('Données CA par mois reçues:', data);
      
      if (!data || data.length === 0) {
        console.warn('Aucune donnée reçue de l\'API');
        setMonthlyData([]);
        setIsLoading(false);
        return;
      }
      
      // Formater les données
      const formattedData = data.map((item: CAParMoisData) => {
        // Convertir CA_Commande en nombre
        const ca = typeof item.CA_Commande === 'string' 
          ? parseFloat(item.CA_Commande) 
          : item.CA_Commande;
          
        return {
          mois: item.Mois,
          ca: ca
        };
      });
      
      console.log('Données formatées:', formattedData);
      
      // Trier par ordre des mois
      const sortedData = formattedData.sort((a: MonthData, b: MonthData) => {
        const indexA = getMonthIndex(a.mois);
        const indexB = getMonthIndex(b.mois);
        console.log(`Comparaison de mois: ${a.mois} (index ${indexA}) vs ${b.mois} (index ${indexB})`);
        return indexA - indexB;
      });
      
      console.log('Données triées:', sortedData);
      
      setMonthlyData(sortedData);
    } catch (error) {
      console.error('Erreur lors du chargement des données CA par mois:', error);
      setMonthlyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données quand les filtres changent
  useEffect(() => {
    loadData();
  }, [annee, commercial]);

  // Calculer les comparaisons avec le mois précédent
  const getComparisonData = () => {
    return monthlyData.map((item, index) => {
      if (index === 0) {
        // Premier mois (Janvier) toujours en vert
        return {
          month: getFrenchMonth(getMonthIndex(item.mois)),
          value: item.ca,
          color: 'rgba(75, 192, 75, 0.8)',
          comparison: null,
          label: `${formatCurrency(item.ca)}`
        };
      } else {
        // Pour les autres mois, comparer avec le mois précédent
        const prevMonth = monthlyData[index - 1];
        const diffPercent = ((item.ca - prevMonth.ca) / prevMonth.ca) * 100;
        
        // Si le CA a augmenté par rapport au mois précédent => vert
        // Si le CA a diminué par rapport au mois précédent => rouge
        const color = diffPercent >= 0 
          ? 'rgba(75, 192, 75, 0.8)' 
          : 'rgba(255, 99, 132, 0.8)';
        
        return {
          month: getFrenchMonth(getMonthIndex(item.mois)),
          value: item.ca,
          color: color,
          comparison: {
            percent: Math.abs(diffPercent),
            increased: diffPercent >= 0
          },
          label: `${formatCurrency(item.ca)} ${diffPercent >= 0 ? '↑' : '↓'}${Math.abs(diffPercent).toFixed(0)}%`
        };
      }
    });
  };

  // Préparer les données pour le graphique
  const comparisonData = getComparisonData();
  
  const chartData: ChartData<'bar'> = {
    labels: comparisonData.map(item => item.month),
    datasets: [
      {
        label: 'CA par mois',
        data: comparisonData.map(item => item.value),
        backgroundColor: comparisonData.map(item => item.color),
        borderColor: comparisonData.map(item => item.color.replace('0.8', '1')),
        borderWidth: 1
      }
    ]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return formatCurrency(context.parsed.y);
          }
        }
      },
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        formatter: (_: any, context: any) => {
          return comparisonData[context.dataIndex].label;
        },
        font: {
          weight: 'bold'
        },
        color: '#333'
      } as any // Cast as any pour éviter les problèmes de type avec le plugin datalabels
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
              return value / 1000 + 'K';
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div style={chartContainerStyle}>
      <div style={headerStyle}>
        {`CA commandé par date par année par commercial`}
      </div>
      <div style={chartStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <span>Chargement des données...</span>
          </div>
        ) : monthlyData.length === 0 ? (
          <div style={noDataStyle}>
            <span>Aucune donnée disponible</span>
          </div>
        ) : (
          <Chart 
            ref={chartRef}
            type='bar' 
            data={chartData} 
            options={chartOptions}
            plugins={[ChartDataLabels]}
          />
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
  height: '500px',
  padding: '15px',
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
};

const loadingStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#156082'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#999'
};

export default MonthlyComparisonChart; 