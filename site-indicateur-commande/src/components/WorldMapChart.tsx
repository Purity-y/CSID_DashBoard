import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
// Importer les bibliothèques nécessaires pour la carte
import 'chartjs-chart-geo';
// @ts-ignore
import * as ChartGeo from 'chartjs-chart-geo';
// Import topojson-client
import * as topojson from 'topojson-client';
import { getCAParPays } from '../services/api';

// Enregistrer les composants nécessaires pour Chart.js
// Enregistrer d'abord les échelles et contrôleurs de base
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Puis enregistrer les composants geo séparément
// @ts-ignore
ChartJS.register(ChartGeo.ChoroplethController);
// @ts-ignore
ChartJS.register(ChartGeo.ProjectionScale);
// @ts-ignore
ChartJS.register(ChartGeo.ColorScale);
// @ts-ignore
ChartJS.register(ChartGeo.GeoFeature);

interface WorldMapChartProps {
  annee?: number;
  commercial?: string;
}

// Interface pour les données de CA par pays
interface CAByCountry {
  pays: string;
  ca: number;
}

// Table de correspondance entre les codes ISO alpha-2 et alpha-3
const countryCodeMap: {[key: string]: string} = {
  'FR': 'FRA', // France
  'US': 'USA', // États-Unis
  'CA': 'CAN', // Canada
  'DE': 'DEU', // Allemagne
  'GB': 'GBR', // Royaume-Uni
  'ES': 'ESP', // Espagne
  'IT': 'ITA', // Italie
  'CN': 'CHN', // Chine
  'JP': 'JPN', // Japon
  'AU': 'AUS', // Australie
  'BR': 'BRA', // Brésil
  'IN': 'IND', // Inde
  'RU': 'RUS', // Russie
  'ZA': 'ZAF', // Afrique du Sud
  'MX': 'MEX', // Mexique
  'AR': 'ARG', // Argentine
  'EG': 'EGY', // Égypte
  'SA': 'SAU', // Arabie Saoudite
  'TH': 'THA', // Thaïlande
  'NG': 'NGA', // Nigeria
  'DK': 'DNK', // Danemark
  'BE': 'BEL', // Belgique
  'NL': 'NLD', // Pays-Bas
  'PT': 'PRT', // Portugal
  'SE': 'SWE', // Suède
  'CH': 'CHE', // Suisse
  'AT': 'AUT', // Autriche
  'PL': 'POL', // Pologne
  'IE': 'IRL', // Irlande
  'FI': 'FIN', // Finlande
  'NO': 'NOR', // Norvège
  'GR': 'GRC', // Grèce
  'CZ': 'CZE', // République tchèque
  'HU': 'HUN', // Hongrie
  'RO': 'ROU', // Roumanie
  'BG': 'BGR', // Bulgarie
  'HR': 'HRV', // Croatie
  'SK': 'SVK', // Slovaquie
  'SI': 'SVN', // Slovénie
  'LT': 'LTU', // Lituanie
  'LV': 'LVA', // Lettonie
  'EE': 'EST', // Estonie
  'CY': 'CYP', // Chypre
  'MT': 'MLT', // Malte
  'DZ': 'DZA', // Algérie
  'TR': 'TUR', // Turquie
  'OM': 'OMN', // Oman
  'NC': 'NCL', // Nouvelle-Calédonie
  'LB': 'LBN', // Liban
  'MD': 'MDA', // Moldavie
  'LU': 'LUX', // Luxembourg
  'SN': 'SEN', // Sénégal
  'MQ': 'MTQ', // Martinique
  'MC': 'MCO', // Monaco
  'RE': 'REU'  // La Réunion
};

// Table de correspondance entre les codes ISO alpha-3 et les codes numériques
const alpha3ToNumericMap: {[key: string]: string} = {
  'FRA': '250', // France
  'USA': '840', // États-Unis
  'CAN': '124', // Canada
  'DEU': '276', // Allemagne
  'GBR': '826', // Royaume-Uni
  'ESP': '724', // Espagne
  'ITA': '380', // Italie
  'CHN': '156', // Chine
  'JPN': '392', // Japon
  'AUS': '036', // Australie
  'BRA': '076', // Brésil
  'IND': '356', // Inde
  'RUS': '643', // Russie
  'ZAF': '710', // Afrique du Sud
  'MEX': '484', // Mexique
  'ARG': '032', // Argentine
  'EGY': '818', // Égypte
  'SAU': '682', // Arabie Saoudite
  'THA': '764', // Thaïlande
  'NGA': '566', // Nigeria
  'DNK': '208', // Danemark
  'BEL': '056', // Belgique
  'NLD': '528', // Pays-Bas
  'PRT': '620', // Portugal
  'SWE': '752', // Suède
  'CHE': '756', // Suisse
  'AUT': '040', // Autriche
  'POL': '616', // Pologne
  'IRL': '372', // Irlande
  'FIN': '246', // Finlande
  'NOR': '578', // Norvège
  'GRC': '300', // Grèce
  'CZE': '203', // République tchèque
  'HUN': '348', // Hongrie
  'ROU': '642', // Roumanie
  'BGR': '100', // Bulgarie
  'HRV': '191', // Croatie
  'SVK': '703', // Slovaquie
  'SVN': '705', // Slovénie
  'LTU': '440', // Lituanie
  'LVA': '428', // Lettonie
  'EST': '233', // Estonie
  'CYP': '196', // Chypre
  'MLT': '470', // Malte
  'DZA': '012', // Algérie
  'TUR': '792', // Turquie
  'OMN': '512', // Oman
  'NCL': '540', // Nouvelle-Calédonie
  'LBN': '422', // Liban
  'MDA': '498', // Moldavie
  'LUX': '442', // Luxembourg
  'SEN': '686', // Sénégal
  'MTQ': '474', // Martinique
  'MCO': '492', // Monaco
  'REU': '638'  // La Réunion
};

// Table de correspondance entre les noms de pays en français et en anglais
// Non utilisée actuellement dans le code
/* 
const countryNameMap: {[key: string]: string[]} = {
  'France': ['france'],
  'États-Unis': ['united states', 'usa', 'united states of america', 'us'],
  'Canada': ['canada'],
  'Allemagne': ['germany', 'deutschland'],
  'Royaume-Uni': ['united kingdom', 'great britain', 'uk', 'england'],
  'Espagne': ['spain', 'españa'],
  'Italie': ['italy', 'italia'],
  'Chine': ['china'],
  'Japon': ['japan'],
  'Australie': ['australia'],
  'Brésil': ['brazil', 'brasil'],
  'Inde': ['india'],
  'Russie': ['russia', 'russian federation'],
  'Afrique du Sud': ['south africa'],
  'Mexique': ['mexico'],
  'Argentine': ['argentina'],
  'Égypte': ['egypt'],
  'Arabie Saoudite': ['saudi arabia'],
  'Thaïlande': ['thailand'],
  'Nigeria': ['nigeria'],
  'Danemark': ['denmark'],
  'Belgique': ['belgium'],
  'Pays-Bas': ['netherlands'],
  'Portugal': ['portugal'],
  'Suède': ['sweden'],
  'Suisse': ['switzerland'],
  'Autriche': ['austria'],
  'Pologne': ['poland'],
  'Irlande': ['ireland'],
  'Finlande': ['finland'],
  'Norvège': ['norway'],
  'Grèce': ['greece'],
  'Algérie': ['algeria'],
  'Turquie': ['turkey'],
  'Oman': ['oman'],
  'Nouvelle-Calédonie': ['new caledonia'],
  'Liban': ['lebanon'],
  'Moldavie': ['moldova'],
  'Luxembourg': ['luxembourg'],
  'Sénégal': ['senegal']
};
*/

// Table de correspondance entre les codes ISO alpha-2 et les noms français
const alpha2ToFrenchName: {[key: string]: string} = {
  'FR': 'France',
  'US': 'États-Unis',
  'CA': 'Canada',
  'DE': 'Allemagne',
  'GB': 'Royaume-Uni',
  'ES': 'Espagne',
  'IT': 'Italie',
  'CN': 'Chine',
  'JP': 'Japon',
  'AU': 'Australie',
  'BR': 'Brésil',
  'IN': 'Inde',
  'RU': 'Russie',
  'ZA': 'Afrique du Sud',
  'MX': 'Mexique',
  'AR': 'Argentine',
  'EG': 'Égypte',
  'SA': 'Arabie Saoudite',
  'TH': 'Thaïlande',
  'NG': 'Nigeria',
  'DK': 'Danemark',
  'BE': 'Belgique',
  'NL': 'Pays-Bas',
  'PT': 'Portugal',
  'SE': 'Suède',
  'CH': 'Suisse',
  'AT': 'Autriche',
  'PL': 'Pologne',
  'IE': 'Irlande',
  'FI': 'Finlande',
  'NO': 'Norvège',
  'GR': 'Grèce',
  'DZ': 'Algérie',
  'TR': 'Turquie',
  'OM': 'Oman',
  'NC': 'Nouvelle-Calédonie',
  'LB': 'Liban',
  'MD': 'Moldavie',
  'LU': 'Luxembourg',
  'SN': 'Sénégal'
};

const WorldMapChart: React.FC<WorldMapChartProps> = (props) => {
  // Extraire les props et ajouter des logs
  const { annee, commercial } = props;
  
  // Lors du premier montage, consigner les props reçues
  useEffect(() => {
    console.log('🚀 PROPS REÇUES AU MONTAGE:', { props });
  }, []);
  
  // Surveiller les changements de props
  useEffect(() => {
    console.log('📣 PROPS CHANGÉES:', { annee, commercial });
  }, [annee, commercial]);
  
  const chartRef = useRef<any>(null);
  const worldAtlasRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const filtersRef = useRef({ annee, commercial });
  
  // Fonction pour traiter et normaliser les filtres
  const processFilters = useCallback(() => {
    const rawAnnee = annee;
    const rawCommercial = commercial;
    
    // Normaliser l'année (convertir en nombre si c'est une chaîne)
    let processedAnnee = undefined;
    if (rawAnnee !== null && rawAnnee !== undefined) {
      if (typeof rawAnnee === 'string') {
        // Tenter de convertir en nombre
        const parsed = parseInt(rawAnnee);
        if (!isNaN(parsed)) {
          processedAnnee = parsed;
        }
      } else if (typeof rawAnnee === 'number') {
        processedAnnee = rawAnnee;
      }
    }
    
    // Normaliser le commercial
    let processedCommercial = undefined;
    if (rawCommercial && 
        rawCommercial !== 'all' && 
        rawCommercial !== 'undefined' && 
        rawCommercial !== 'null' && 
        rawCommercial !== '') {
      processedCommercial = rawCommercial;
    }
    
    return {
      annee: processedAnnee,
      commercial: processedCommercial
    };
  }, [annee, commercial]);
  
  // Fonction pour initialiser la carte avec des données vides
  const initializeEmptyChart = useCallback(() => {
    if (!worldAtlasRef.current || !chartRef.current) return;
    
    try {
      // @ts-ignore
      const countries = topojson.feature(worldAtlasRef.current, worldAtlasRef.current.objects.countries).features;
      
      const emptyData = {
        labels: countries.map((d: any) => d.properties.name),
        datasets: [{
          label: 'CA par pays',
          data: countries.map((d: any) => ({
            feature: d,
            value: 0
          })),
          backgroundColor: 'rgba(220, 220, 220, 0.5)',
          borderColor: '#156082',
          borderWidth: 0.5,
        }]
      };
      
      chartRef.current.data = emptyData;
      chartRef.current.update('none');
      console.log('📊 Carte initialisée avec des données vides');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la carte:', error);
    }
  }, []);
  
  // Fonction pour mettre à jour le graphique avec des données
  const updateChart = useCallback((data: any[]) => {
    if (!worldAtlasRef.current || !chartRef.current) return;
    
    try {
      // Si pas de données, réinitialiser la carte avec des données vides
      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune donnée reçue');
        initializeEmptyChart();
        return;
      }
      
      // Transformer les données reçues
      const formattedData: CAByCountry[] = data.map((item: any) => ({
        pays: item.Pays,
        ca: parseFloat(item.CA_Commande)
      }));
      
      console.log('📊 Données formatées:', formattedData);
      
      // Convertir les données GeoJSON
      // @ts-ignore
      const countries = topojson.feature(worldAtlasRef.current, worldAtlasRef.current.objects.countries).features;
      
      // Créer un dictionnaire des valeurs par code de pays
      const valueByCountryCode: {[key: string]: number} = {};
      
      formattedData.forEach(item => {
        if (!item.pays) {
          console.warn('⚠️ Pays manquant dans les données:', item);
          return;
        }
        
        const alpha3 = countryCodeMap[item.pays];
        if (!alpha3) {
          console.warn(`⚠️ Code alpha-3 non trouvé pour ${item.pays}`);
          return;
        }
        
        const numericCode = alpha3ToNumericMap[alpha3];
        if (!numericCode) {
          console.warn(`⚠️ Code numérique non trouvé pour ${alpha3} (${item.pays})`);
          return;
        }
        
        valueByCountryCode[numericCode] = item.ca;
      });
      
      // Trouver les valeurs min et max pour l'échelle de couleur
      const values = Object.values(valueByCountryCode);
      if (values.length === 0) {
        console.warn('⚠️ Aucune valeur valide trouvée pour la carte');
        initializeEmptyChart();
        return;
      }
      
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      
      console.log('📊 Valeurs min/max:', { minValue, maxValue });
      
      // Créer les nouvelles données du graphique
      const newChartData = {
        labels: countries.map((d: any) => d.properties.name),
        datasets: [{
          label: 'CA par pays',
          data: countries.map((d: any) => {
            const value = valueByCountryCode[d.id] || 0;
            return {
              feature: d,
              value: value
            };
          }),
          backgroundColor: (context: any) => {
            const value = context.raw?.value || 0;
            if (value === 0) return 'rgba(220, 220, 220, 0.5)';
            const intensity = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue)));
            return `rgba(0, 100, 255, ${0.2 + intensity * 0.8})`;
          },
          borderColor: '#156082',
          borderWidth: 0.5,
        }]
      };
      
      // Mettre à jour le graphique
      chartRef.current.data = newChartData;
      chartRef.current.update('none');
      console.log('✅ Graphique mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du graphique:', error);
      initializeEmptyChart();
    }
  }, [initializeEmptyChart]);
  
  // Fonction pour charger et formater les données du graphique
  const loadChartData = useCallback(async () => {
    if (!worldAtlasRef.current) {
      console.warn('⚠️ Données géographiques non disponibles');
      return;
    }
    
    setIsLoading(true);
    
    // Obtenir les filtres normalisés
    const filters = processFilters();
    console.log('🔄 Chargement des données avec les filtres bruts:', { annee, commercial });
    console.log('🔄 Filtres normalisés:', filters);
    
    try {
      // Appel API avec les filtres normalisés
      console.log('🔍 Appel API avec les filtres:', filters);
      console.log('🔍 URL API simulée:', 
        `/api/ca-par-pays?annee=${filters.annee || ''}&commercial=${filters.commercial || ''}`);
      
      const data = await getCAParPays(filters.annee, filters.commercial);
      console.log('📊 Données reçues de l\'API:', data);
      
      // Mettre à jour la référence des filtres actuels
      filtersRef.current = { annee, commercial };
      
      updateChart(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      // En cas d'erreur, afficher une carte vide
      initializeEmptyChart();
    } finally {
      setIsLoading(false);
    }
  }, [annee, commercial, initializeEmptyChart, processFilters, updateChart]);
  
  // Fonction pour charger les données géographiques
  const loadGeoData = useCallback(async () => {
    try {
      const worldRes = await fetch('https://unpkg.com/world-atlas/countries-110m.json');
      if (!worldRes.ok) {
        throw new Error(`Erreur lors du chargement des données de la carte: ${worldRes.status}`);
      }
      
      worldAtlasRef.current = await worldRes.json();
      console.log('📊 Données géographiques chargées avec succès');
      
      // Initialiser la carte avec des données vides
      initializeEmptyChart();
      
      // Charger les données initiales
      loadChartData();
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données géographiques:', error);
      setIsLoading(false);
    }
  }, [initializeEmptyChart, loadChartData]);
  
  // Effet pour charger les données géographiques une seule fois au montage
  useEffect(() => {
    console.log('🔄 MONTAGE DU COMPOSANT - Chargement des données géographiques');
    loadGeoData();
  }, [loadGeoData]); // Dépendance sur loadGeoData
  
  // Effet pour détecter les changements de filtres
  useEffect(() => {
    console.log('🔍 FILTRES ACTUELS:', { annee, commercial });
    
    // Vérifier si les filtres ont réellement changé
    const prevFilters = filtersRef.current;
    const hasChanged = 
      prevFilters.annee !== annee || 
      prevFilters.commercial !== commercial;
      
    console.log('🔄 Changement détecté:', { 
      hasChanged,
      previous: prevFilters,
      current: { annee, commercial } 
    });
    
    if (hasChanged && worldAtlasRef.current) {
      console.log('🔄 Chargement des données après changement de filtres');
      loadChartData();
    }
  }, [annee, commercial, loadChartData]); // Dépendances sur les filtres et la fonction de chargement
  
  // Fonction pour formater les valeurs monétaires
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Fonction pour trouver le nom français d'un pays
  const getFrenchCountryName = (countryId: string, countryName: string) => {
    // Chercher le code alpha-3 correspondant au code numérique
    let alpha3 = '';
    for (const [code, numeric] of Object.entries(alpha3ToNumericMap)) {
      if (numeric === countryId) {
        alpha3 = code;
        break;
      }
    }
    
    // Chercher le code alpha-2 correspondant au code alpha-3
    let alpha2 = '';
    if (alpha3) {
      for (const [code, alpha3Value] of Object.entries(countryCodeMap)) {
        if (alpha3Value === alpha3) {
          alpha2 = code;
          break;
        }
      }
    }
    
    // Chercher le nom français correspondant au code alpha-2
    if (alpha2 && alpha2ToFrenchName[alpha2]) {
      return alpha2ToFrenchName[alpha2];
    }
    
    return countryName;
  };

  return (
    <div style={chartContainerStyle}>
      <div style={headerStyle}>
        {`CA commandé par pays${annee ? ` - ${annee}` : ''}${commercial ? ` - Commercial: ${commercial}` : ''}`}
      </div>
      <div style={chartStyle}>
        {isLoading && (
          <div style={loadingStyle}>
            <span>Chargement des données...</span>
          </div>
        )}
        <Chart 
          ref={chartRef}
          type="choropleth" 
          data={chartRef.current?.data || {
            labels: [],
            datasets: [{
              label: 'CA par pays',
              data: [],
              backgroundColor: 'rgba(220, 220, 220, 0.5)',
              borderColor: '#156082',
              borderWidth: 0.5,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const countryId = context.raw?.feature?.id;
                    const countryName = context.raw?.feature?.properties?.name || 'Pays inconnu';
                    const value = context.raw?.value || 0;
                    const frenchName = getFrenchCountryName(countryId, countryName);
                    return `${frenchName}: ${formatCurrency(value)}`;
                  }
                }
              }
            },
            scales: {
              projection: {
                axis: 'x',
                projection: 'equalEarth'
              },
              color: {
                axis: 'y',
                display: false,
                interpolate: (v: number) => {
                  return `rgba(0, 100, 255, ${0.2 + (v || 0) * 0.8})`;
                }
              }
            },
            animation: false,
            devicePixelRatio: 2,
            elements: {
              point: {
                radius: 0
              }
            }
          }}
        />
      </div>
      <div style={legendStyle}>
        <div style={legendItemStyle}>
          <div style={{...legendColorStyle, backgroundColor: 'rgba(0, 100, 255, 0.2)'}}></div>
          <span>Faible</span>
        </div>
        <div style={legendItemStyle}>
          <div style={{...legendColorStyle, backgroundColor: 'rgba(0, 100, 255, 0.5)'}}></div>
          <span>Moyen</span>
        </div>
        <div style={legendItemStyle}>
          <div style={{...legendColorStyle, backgroundColor: 'rgba(0, 100, 255, 0.8)'}}></div>
          <span>Élevé</span>
        </div>
        <div style={legendItemStyle}>
          <div style={{...legendColorStyle, backgroundColor: 'rgba(0, 100, 255, 1)'}}></div>
          <span>Très élevé</span>
        </div>
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

const legendStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: '10px',
  gap: '15px',
  borderTop: '1px solid #eee'
};

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px',
  gap: '5px'
};

const legendColorStyle: React.CSSProperties = {
  width: '15px',
  height: '15px',
  borderRadius: '3px'
};

export default WorldMapChart; 