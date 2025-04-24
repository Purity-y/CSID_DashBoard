import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import CommandeChart from './components/CommandeChart';
import ObjectifGauge from './components/ObjectifGauge';
import ConversionGauge from './components/ConversionGauge';
import WorldMapChart from './components/WorldMapChart';
import MonthlyComparisonChart from './components/MonthlyComparisonChart';
import MotifPieChart from './components/MotifPieChart';
import FunnelChart from './components/FunnelChart';
import TopSalesTable from './components/TopSalesTable';
import ConversionRadarChart from './components/ConversionRadarChart';

function App() {
  const [filters, setFilters] = useState<{
    annee: number | null;
    commercial: string | null;
  }>({
    annee: null,
    commercial: null
  });

  const handleFilterChange = (annee: number | null, commercial: string | null) => {
    setFilters({ annee, commercial });
  };

  return (
    <div className="App" style={appStyle}>
      <Header onFilterChange={handleFilterChange} />
      <main style={mainStyle}>
        <div style={dashboardStyle}>
          <div style={topRowStyle}>
            <div style={barChartContainerStyle}>
              <CommandeChart annee={filters.annee} commercial={filters.commercial} />
            </div>
            <div style={gaugesRowStyle}>
              <div style={gaugeContainerStyle}>
                <ObjectifGauge annee={filters.annee} commercial={filters.commercial} />
              </div>
              <div style={gaugeContainerStyle}>
                <ConversionGauge annee={filters.annee} commercial={filters.commercial} />
              </div>
            </div>
          </div>
          <div style={middleRowStyle}>
            <div style={chartContainerStyle}>
              <MonthlyComparisonChart 
                annee={filters.annee ?? undefined} 
                commercial={filters.commercial ?? undefined} 
              />
            </div>
            <div style={mapContainerStyle}>
              <WorldMapChart 
                annee={filters.annee ?? undefined} 
                commercial={filters.commercial ?? undefined} 
              />
            </div>
          </div>
          <div style={bottomRowStyle}>
            <div style={radarChartContainerStyle}>
              <ConversionRadarChart 
                annee={filters.annee ?? undefined} 
                commercial={filters.commercial ?? undefined} 
              />
            </div>
            <div style={pieChartContainerStyle}>
              <MotifPieChart 
                annee={filters.annee ?? undefined} 
                commercial={filters.commercial ?? undefined} 
              />
            </div>
            <div style={funnelChartContainerStyle}>
              <FunnelChart />
            </div>
          </div>
        </div>
        <TopSalesTable 
          annee={filters.annee} 
          commercial={filters.commercial} 
        />
      </main>
    </div>
  );
}

// Styles
const appStyle: React.CSSProperties = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5'
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px'
};

const dashboardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  maxWidth: '90%',
  margin: '0 auto'
};

const topRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  alignItems: 'stretch'
};

const barChartContainerStyle: React.CSSProperties = {
  gridColumn: '1 / span 1',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  height: 'auto'
};

const gaugesRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  gridColumn: '2 / span 1',
  alignContent: 'stretch',
  height: '100%'
};

const gaugeContainerStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const middleRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  alignItems: 'stretch'
};

const chartContainerStyle: React.CSSProperties = {
  flex: 1
};

const mapContainerStyle: React.CSSProperties = {
  height: '550px',
  gridColumn: '2 / span 1',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const bottomRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '15px',
  alignItems: 'stretch'
};

const radarChartContainerStyle: React.CSSProperties = {
  height: '400px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const pieChartContainerStyle: React.CSSProperties = {
  height: '400px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const funnelChartContainerStyle: React.CSSProperties = {
  height: '400px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

export default App; 