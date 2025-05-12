import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getMotifRepartition, MotifRepartition } from '../services/api';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartFocusWrapper from './ChartFocusWrapper';

// S'assurer que ArcElement est enregistré pour les graphiques en camembert
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Configuration des couleurs pour les motifs
const MOTIF_COLORS = {
  'NULL': 'rgba(200, 200, 200, 0.8)', // Gris clair
  'A TITRE COMMERCIAL': 'rgba(255, 99, 132, 0.8)', // Rouge vif
  'Annulation de commande': 'rgba(54, 162, 235, 0.8)', // Bleu vif
  'Devis : Commandé': 'rgba(75, 192, 192, 0.8)', // Turquoise
  'Devis : En cours': 'rgba(255, 206, 86, 0.8)', // Jaune
  'Devis : Remplacé': 'rgba(153, 102, 255, 0.8)', // Violet
  'Garantie : NC Mécanique': 'rgba(255, 159, 64, 0.8)' // Orange
};

const MOTIF_BORDER_COLORS = {
  'NULL': 'rgba(200, 200, 200, 1)',
  'A TITRE COMMERCIAL': 'rgba(255, 99, 132, 1)',
  'Annulation de commande': 'rgba(54, 162, 235, 1)',
  'Devis : Commandé': 'rgba(75, 192, 192, 1)',
  'Devis : En cours': 'rgba(255, 206, 86, 1)',
  'Devis : Remplacé': 'rgba(153, 102, 255, 1)',
  'Garantie : NC Mécanique': 'rgba(255, 159, 64, 1)'
};

interface MotifPieChartProps {
  annee?: number;
  commercial?: string;
}

interface MotifData {
  motif: string;
  count: number;
  percentage: number;
}

const MotifPieChart: React.FC<MotifPieChartProps> = ({ annee, commercial }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [motifData, setMotifData] = useState<MotifData[]>([]);
  const chartRef = useRef<ChartJS<'pie'>>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Fonction pour charger les données
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getMotifRepartition(annee, commercial);
      console.log('Données de répartition des motifs reçues:', data);
      
      if (!data || data.length === 0) {
        console.warn('Aucune donnée de motif reçue');
        setMotifData([]);
        setIsLoading(false);
        return;
      }
      
      // Calculer le total des devis
      const totalDevis = data.reduce((sum, item) => sum + item.Nb_Devis, 0);
      
      // Formater les données
      const formattedData: MotifData[] = data.map(item => ({
        motif: item.Motif,
        count: item.Nb_Devis,
        percentage: Math.round((item.Nb_Devis / totalDevis) * 100)
      }));
      
      console.log('Données de motifs formatées:', formattedData);
      setMotifData(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des données de motifs:', error);
      setMotifData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les données quand les filtres changent
  useEffect(() => {
    loadData();
  }, [annee, commercial]);
  
  // Préparer les données pour le graphique
  const chartData: ChartData<'pie'> = {
    labels: motifData.map(item => item.motif),
    datasets: [
      {
        data: motifData.map(item => item.count),
        backgroundColor: motifData.map(item => {
          // Utiliser la couleur correspondante au motif ou une couleur par défaut
          const colorKey = item.motif as keyof typeof MOTIF_COLORS;
          return MOTIF_COLORS[colorKey] || 'rgba(200, 200, 200, 0.8)';
        }),
        borderColor: motifData.map(item => {
          // Utiliser la couleur de bordure correspondante au motif ou une couleur par défaut
          const colorKey = item.motif as keyof typeof MOTIF_BORDER_COLORS;
          return MOTIF_BORDER_COLORS[colorKey] || 'rgba(200, 200, 200, 1)';
        }),
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const index = context.dataIndex;
            return `${label}: ${value} devis (${motifData[index].percentage}%)`;
          }
        }
      },
      datalabels: {
        formatter: (value: number, ctx: any) => {
          const index = ctx.dataIndex;
          return `${motifData[index].percentage}%`;
        },
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 4,
        padding: 4,
        font: {
          weight: 'bold',
          size: isFocusMode ? 16 : 13
        },
        textShadowBlur: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textStrokeColor: '#000',
        textStrokeWidth: 0.5,
        align: 'center',
        anchor: 'center',
        offset: 0,
        display: function(ctx: any) {
          // N'afficher que si le segment est suffisamment large pour contenir l'étiquette
          return ctx.dataset.data[ctx.dataIndex] / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0) > 0.05;
        }
      } as any
    }
  };
  
  return (
    <ChartFocusWrapper 
      title="Répartition des motifs par année par commercial"
      onFocusChange={setIsFocusMode}
    >
      <div style={chartContentStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <span>Chargement des données...</span>
          </div>
        ) : motifData.length === 0 ? (
          <div style={noDataStyle}>
            <span>Aucune donnée disponible</span>
          </div>
        ) : (
          <Pie
            ref={chartRef}
            data={chartData}
            options={chartOptions}
            plugins={[ChartDataLabels]}
          />
        )}
      </div>
    </ChartFocusWrapper>
  );
};

// Styles
const chartContentStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  padding: '15px',
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

export default MotifPieChart; 