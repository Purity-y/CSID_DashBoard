import React, { useEffect, useState, useMemo, useRef } from 'react';
import { getTauxConversion, TauxConversion } from '../services/api';
import ChartFocusWrapper from './ChartFocusWrapper';

interface ConversionGaugeProps {
  annee: number | null;
  commercial: string | null;
}

const ConversionGauge: React.FC<ConversionGaugeProps> = ({ annee, commercial }) => {
  const [conversionData, setConversionData] = useState<TauxConversion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const gaugeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTauxConversion(annee || undefined, commercial || undefined);
        setConversionData(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données de conversion:", err);
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };

    fetchData();
  }, [annee, commercial]);

  // Calculer les statistiques et le taux de conversion global
  const { tauxConversion, totalDevis, totalCommandes } = useMemo(() => {
    if (conversionData.length === 0) {
      return { tauxConversion: 0, totalDevis: 0, totalCommandes: 0 };
    }
    
    // Calculer les totaux
    const totalDevis = conversionData.reduce((sum, item) => sum + item.Nb_Devis, 0);
    const totalCommandes = conversionData.reduce((sum, item) => sum + item.Nb_Commandes, 0);
    
    // Calculer le taux de conversion global
    const tauxConversion = totalDevis > 0 
      ? (totalCommandes / totalDevis) * 100 
      : 0;
    
    return { tauxConversion, totalDevis, totalCommandes };
  }, [conversionData]);

  // Calculer la position de la flèche en pourcentage (0-100%)
  const needlePosition = useMemo(() => {
    // Limiter entre 0 et 100%
    return Math.max(0, Math.min(100, tauxConversion));
  }, [tauxConversion]);

  if (loading) {
    return <div style={loadingStyle}>Chargement des données...</div>;
  }

  if (error) {
    return <div style={errorStyle}>{error}</div>;
  }

  if (conversionData.length === 0) {
    return <div style={noDataStyle}>Aucune donnée disponible pour les filtres sélectionnés.</div>;
  }

  return (
    <ChartFocusWrapper 
      title="Taux de transformation des offres en commandes par année par commercial"
      onFocusChange={setIsFocusMode}
    >
      <div style={gaugeWrapperStyle}>
        {/* Étiquettes */}
        <div style={labelsContainerStyle}>
          <div style={{
            ...labelStyle,
            fontSize: isFocusMode ? '18px' : '14px'
          }}>Low</div>
          <div style={{
            ...labelStyle,
            fontSize: isFocusMode ? '18px' : '14px'
          }}>Medium</div>
          <div style={{
            ...labelStyle,
            fontSize: isFocusMode ? '18px' : '14px'
          }}>High</div>
        </div>
        
        {/* Jauge avec dégradé */}
        <div style={{
          ...gaugeStyle,
          height: isFocusMode ? '35px' : '25px'
        }} ref={gaugeRef}>
          {/* Flèche indicatrice */}
          <div style={{
            ...needleStyle,
            left: `${needlePosition}%`
          }}>
            <div style={{
              ...needleTriangleStyle,
              borderLeft: isFocusMode ? '10px solid transparent' : '8px solid transparent',
              borderRight: isFocusMode ? '10px solid transparent' : '8px solid transparent',
              borderTop: isFocusMode ? '15px solid black' : '12px solid black'
            }}></div>
            <div style={{
              ...needleLineStyle,
              height: isFocusMode ? '45px' : '35px',
              width: isFocusMode ? '3px' : '2px'
            }}></div>
          </div>
        </div>
        
        {/* Statistiques supplémentaires */}
        <div style={statsContainerStyle}>
          <div style={statsRowStyle}>
            <div style={statItemStyle}>
              <span style={{
                ...statLabelStyle,
                fontWeight: 'bold',
                fontSize: isFocusMode ? '18px' : '14px'
              }}>Devis:</span> 
              <span style={{
                ...statValueStyle,
                fontSize: isFocusMode ? '18px' : '14px'
              }}>{totalDevis}</span>
            </div>
            <div style={statItemStyle}>
              <span style={{
                ...statLabelStyle,
                fontWeight: 'bold',
                fontSize: isFocusMode ? '18px' : '14px'
              }}>Commandes:</span> 
              <span style={{
                ...statValueStyle,
                fontSize: isFocusMode ? '18px' : '14px'
              }}>{totalCommandes}</span>
            </div>
          </div>
          <div style={statsRowStyle}>
            <div style={statItemStyle}>
              <span style={{
                ...statLabelStyle,
                fontWeight: 'bold',
                fontSize: isFocusMode ? '18px' : '14px'
              }}>Taux de transformation:</span> 
              <span style={{
                ...statValueStyle,
                fontSize: isFocusMode ? '20px' : '16px'
              }}>{tauxConversion.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </ChartFocusWrapper>
  );
};

// Styles
const gaugeWrapperStyle: React.CSSProperties = {
  padding: '20px 15px 30px',
  position: 'relative',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
};

const labelsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '5px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  fontWeight: 'bold'
};

const gaugeStyle: React.CSSProperties = {
  height: '25px',
  background: 'linear-gradient(to right, #F44336, #FFEB3B, #4CAF50)',
  borderRadius: '4px',
  position: 'relative',
  marginBottom: '25px',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
};

const needleStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-5px',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'left 0.5s ease-out',
  zIndex: 10
};

const needleTriangleStyle: React.CSSProperties = {
  width: '0',
  height: '0',
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderTop: '12px solid black'
};

const needleLineStyle: React.CSSProperties = {
  width: '2px',
  height: '35px',
  backgroundColor: 'black'
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '14px',
  color: '#666'
};

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '14px',
  color: '#e74c3c'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  fontSize: '14px',
  color: '#666'
};

const statsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '10px',
  paddingLeft: '10px'
};

const statsRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '20px'
};

const statItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#666'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333'
};

export default ConversionGauge; 