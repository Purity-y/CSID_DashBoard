import React, { useEffect, useState, useCallback } from 'react';
import { getAnnees, getCommerciaux } from '../services/api';
import { Commercial } from '../services/api';

interface HeaderProps {
  onFilterChange: (annee: number | null, commercial: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onFilterChange }) => {
  const [annees, setAnnees] = useState<number[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<number | null>(null);
  const [selectedCommercial, setSelectedCommercial] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const anneesData = await getAnnees();
        const commerciauxData = await getCommerciaux();
        
        setAnnees(anneesData);
        setCommerciaux(commerciauxData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newValue = value === '' ? null : parseInt(value);
    setSelectedAnnee(newValue);
    onFilterChange(newValue, selectedCommercial);
  };

  const handleCommercialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newValue = value === 'all' ? null : value;
    setSelectedCommercial(newValue);
    onFilterChange(selectedAnnee, newValue);
  };

  return (
    <header style={headerStyle}>
      <div style={logoContainerStyle}>
        <div style={logoStyle}>Indicateur commande</div>
      </div>
      <div style={filtersContainerStyle}>
        <div style={filterStyle}>
          <label htmlFor="annee-select">Année:</label>
          <select 
            id="annee-select" 
            value={selectedAnnee?.toString() || ''} 
            onChange={handleAnneeChange}
            style={selectStyle}
            disabled={isLoading}
          >
            <option value="">Toutes les années</option>
            {annees.map(annee => (
              <option key={annee} value={annee.toString()}>{annee}</option>
            ))}
          </select>
        </div>
        <div style={filterStyle}>
          <label htmlFor="commercial-select">Commercial:</label>
          <select 
            id="commercial-select" 
            value={selectedCommercial || 'all'} 
            onChange={handleCommercialChange}
            style={selectStyle}
            disabled={isLoading}
          >
            <option value="all">Tous les commerciaux</option>
            {commerciaux.map(commercial => (
              <option key={commercial.ID_Commercial} value={commercial.ID_Commercial}>
                {commercial.Nom}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

// Styles
const headerStyle: React.CSSProperties = {
  backgroundColor: '#156082',
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%'
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const logoStyle: React.CSSProperties = {
  backgroundColor: 'white',
  color: '#156082',
  padding: '8px 15px',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '18px'
};

const filtersContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px'
};

const filterStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const selectStyle: React.CSSProperties = {
  padding: '8px',
  borderRadius: '4px',
  border: 'none',
  minWidth: '150px',
  cursor: 'pointer',
  appearance: 'menulist',
  backgroundColor: 'white'
};

export default Header; 