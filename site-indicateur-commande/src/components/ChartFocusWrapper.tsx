import React, { useState, useEffect, ReactNode } from 'react';

// Définition des animations CSS
const cssAnimations = `
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.9); }
  70% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.focus-button:hover {
  background-color: #f0f0f0;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
`;

interface ChartFocusWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
  onFocusChange?: (isFocused: boolean) => void;
}

const ChartFocusWrapper: React.FC<ChartFocusWrapperProps> = ({
  title,
  children,
  className = '',
  onFocusChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Injecter les animations CSS lors du premier rendu
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = cssAnimations;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Gérer l'action d'échappement pour sortir du mode focus
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocused) {
        setIsFocused(false);
        onFocusChange?.(false);
      }
    };

    // Bloquer le défilement du body quand le mode focus est actif
    if (isFocused) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isFocused, onFocusChange]);

  // Effet pour notifier les changements de focus
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  // Fonction pour activer/désactiver le mode focus
  const toggleFocus = () => {
    setIsFocused(!isFocused);
  };

  // Fonction pour fermer le mode focus
  const closeFocus = () => {
    setIsFocused(false);
  };

  return (
    <>
      {isFocused && (
        <div style={overlayStyle} onClick={closeFocus}>
          <div 
            style={focusedChartContainerStyle} 
            onClick={e => e.stopPropagation()} 
            className={className}
          >
            <div style={focusedHeaderStyle}>
              <div style={{ flex: 1 }}></div>
              <div style={{ flex: 8, textAlign: 'center' }}>{title}</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  style={closeButtonStyle} 
                  className="close-button"
                  onClick={closeFocus}
                >
                  ✖
                </button>
              </div>
            </div>
            <div style={focusedChartStyle}>
              {children}
            </div>
          </div>
        </div>
      )}
      
      <div style={chartContainerStyle} className={className}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ flex: 1 }}></div>
            <span style={{ flex: 8, textAlign: 'center' }}>{title}</span>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                style={focusButtonStyle}
                className="focus-button"
                onClick={toggleFocus}
                aria-label="Mode focus"
                title="Activer le mode focus"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
        <div style={chartStyle}>
          {children}
        </div>
      </div>
    </>
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
  flex: 1,
  padding: '15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  height: 'calc(100% - 40px)'
};

// Styles pour le mode focus
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(5px)',
  animation: 'fade-in 0.3s forwards'
};

const focusedChartContainerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  width: '85%',
  maxWidth: '1200px',
  height: '85vh',
  maxHeight: '800px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '2px solid #156082',
  animation: 'pop-in 0.4s forwards'
};

const focusedHeaderStyle: React.CSSProperties = {
  backgroundColor: '#156082',
  color: 'white',
  padding: '15px 20px',
  fontSize: '18px',
  fontWeight: 'bold',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const focusedChartStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  height: 'calc(100% - 50px)'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  transition: 'background-color 0.2s ease'
};

const focusButtonStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid white',
  color: '#156082',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '5px 10px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold'
};

export default ChartFocusWrapper; 