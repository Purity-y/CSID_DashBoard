import React, { useEffect, useState } from 'react';
import { TopSaleData, fetchTopSales } from '../services/api';

interface TopSalesTableProps {
  annee?: number | null;
  commercial?: string | null;
}

const TopSalesTable: React.FC<TopSalesTableProps> = ({ annee, commercial }) => {
  const [sales, setSales] = useState<TopSaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTopSales(annee, commercial);
        setSales(data);
        setError(null);
      } catch (error) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, [annee, commercial]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        {`Liste des meilleures ventes par année par commercial`}
      </div>
      <div style={contentStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <span>Chargement des données...</span>
          </div>
        ) : error ? (
          <div style={errorStyle}>
            <span>{error}</span>
          </div>
        ) : sales.length === 0 ? (
          <div style={noDataStyle}>
            <span>Aucune donnée disponible</span>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>CA</th>
                  <th style={thStyle}>Document</th>
                  <th style={thStyle}>Commercial</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Pays</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                    <td style={tdStyle}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sale.ca)}</td>
                    <td style={tdStyle}>{sale.documentDeVente}</td>
                    <td style={tdStyle}>{sale.commercial}</td>
                    <td style={tdStyle}>{sale.client}</td>
                    <td style={tdStyle}>{new Date(sale.date).toLocaleDateString('fr-FR')}</td>
                    <td style={tdStyle}>{sale.pays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  border: '1px solid #156082',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  marginTop: '20px'
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#156082',
  color: 'white',
  padding: '10px 15px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  minHeight: '300px'
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

const errorStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: '#dc3545',
  fontSize: '16px',
  padding: '20px'
};

const noDataStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  color: '#666',
  fontSize: '16px',
  padding: '20px'
};

const tableContainerStyle: React.CSSProperties = {
  padding: '15px',
  overflowX: 'auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  border: '1px solid #dee2e6'
};

const thStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '12px',
  textAlign: 'center',
  borderBottom: '2px solid #dee2e6',
  borderRight: '1px solid #dee2e6',
  color: '#156082',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #dee2e6',
  borderRight: '1px solid #dee2e6',
  whiteSpace: 'nowrap'
};

const evenRowStyle: React.CSSProperties = {
  backgroundColor: 'white'
};

const oddRowStyle: React.CSSProperties = {
  backgroundColor: 'rgba(21, 96, 130, 0.05)'
};

export default TopSalesTable; 