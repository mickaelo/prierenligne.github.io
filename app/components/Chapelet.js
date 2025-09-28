'use client';

import { useState, useEffect } from 'react';

const Chapelet = ({ 
  currentMystery = 0, 
  currentChapeletPrayer = 'intro', 
  currentDecade = 0,
  onPrayerComplete 
}) => {
  const [activeBead, setActiveBead] = useState(null);

  // Structure du vrai chapelet catholique : 3 grains d'introduction + 5 dizaines + gros grains
  const centerX = 400;
  const centerY = 300;
  const mainRadius = 180; // Rayon du cercle principal

  // 3 grains d'introduction (en haut à gauche du cercle principal)
  const introBeads = [
    { id: 'intro-1', x: centerX - 60, y: centerY - 100, prayer: 'notre-pere' },
    { id: 'intro-2', x: centerX - 40, y: centerY - 80, prayer: 'ave-maria' },
    { id: 'intro-3', x: centerX - 20, y: centerY - 60, prayer: 'ave-maria' }
  ];

  // Médaille d'introduction (entre les 3 grains et le cercle principal)
  const introMedal = { id: 'intro-medal', x: centerX, y: centerY - 40 };

  // 5 gros grains (pour les Notre Père) en cercle
  const getBigBeads = () => {
    const beads = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 360 / 5) - 90; // Commencer en haut
      const x = centerX + Math.cos(angle * Math.PI / 180) * mainRadius;
      const y = centerY + Math.sin(angle * Math.PI / 180) * mainRadius;
      
      beads.push({
        id: `big-${i + 1}`,
        x: Math.round(x),
        y: Math.round(y),
        mystery: i + 1,
        prayer: 'notre-pere'
      });
    }
    return beads;
  };

  // 10 petits grains pour chaque dizaine (entre les gros grains)
  const getDecadeBeads = (decadeIndex) => {
    const beads = [];
    const startAngle = (decadeIndex * 360 / 5) - 90; // Commencer en haut
    const endAngle = ((decadeIndex + 1) * 360 / 5) - 90;
    const angleStep = (endAngle - startAngle) / 11; // 10 grains + 1 espace
    
    for (let i = 1; i <= 10; i++) {
      const angle = startAngle + (i * angleStep);
      const x = centerX + Math.cos(angle * Math.PI / 180) * mainRadius;
      const y = centerY + Math.sin(angle * Math.PI / 180) * mainRadius;
      
      beads.push({
        id: `decade-${decadeIndex + 1}-${i}`,
        x: Math.round(x),
        y: Math.round(y),
        decade: decadeIndex + 1,
        position: i,
        prayer: 'ave-maria'
      });
    }
    return beads;
  };

  // Médaille centrale
  const centerMedal = { id: 'center-medal', x: centerX, y: centerY };

  // Générer toutes les perles
  const bigBeads = getBigBeads();
  const allDecadeBeads = [];
  for (let i = 0; i < 5; i++) {
    allDecadeBeads.push(...getDecadeBeads(i));
  }

  // Déterminer quelle perle est active
  useEffect(() => {
    if (currentMystery === 0) {
      // Introduction - grains d'introduction actifs
      if (currentChapeletPrayer === 'notre-pere') {
        setActiveBead('intro-1');
      } else if (currentChapeletPrayer === 'ave-maria') {
        setActiveBead(`intro-${currentDecade + 1}`);
      } else if (currentChapeletPrayer === 'gloire') {
        setActiveBead('intro-medal');
      } else {
        setActiveBead(null);
      }
    } else {
      // Mystères - gros grains et dizaines actifs
      if (currentChapeletPrayer === 'notre-pere') {
        setActiveBead(`big-${currentMystery}`);
      } else if (currentChapeletPrayer === 'ave-maria') {
        setActiveBead(`decade-${currentMystery}-${currentDecade}`);
      } else if (currentChapeletPrayer === 'gloire') {
        setActiveBead(`big-${currentMystery}`);
      }
    }
  }, [currentMystery, currentChapeletPrayer, currentDecade]);

  return (
    <div className="relative w-full h-96 mx-auto flex items-center justify-center">
      <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="beadGradient" cx="30%" cy="30%">
            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id="medalGradient" cx="30%" cy="30%">
            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
          </radialGradient>
          
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
          
          <filter id="depth" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
          </filter>
          
          <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fde047" floodOpacity="0.8"/>
          </filter>
        </defs>
        
        {/* Médaille centrale */}
        <g id="center-medal" transform={`translate(${centerMedal.x}, ${centerMedal.y})`}>
          <circle 
            cx="0" cy="0" r="20" 
            fill="url(#medalGradient)" 
            stroke="#92400e" 
            strokeWidth="2" 
            filter="url(#depth)"
          />
          <circle cx="0" cy="0" r="15" fill="none" stroke="#92400e" strokeWidth="1"/>
          <text x="0" y="5" textAnchor="middle" fontFamily="serif" fontSize="12" fontWeight="bold" fill="#92400e">
            M
          </text>
        </g>
        
        {/* 3 grains d'introduction */}
        {introBeads.map((bead) => (
          <circle 
            key={bead.id}
            cx={bead.x} cy={bead.y} r="12" 
            fill="url(#beadGradient)" 
            stroke="#92400e" 
            strokeWidth="2" 
            filter={activeBead === bead.id ? "url(#activeGlow)" : "url(#shadow)"}
            className={activeBead === bead.id ? "animate-pulse" : ""}
          />
        ))}
        
        {/* Médaille d'introduction */}
        <g id="intro-medal" transform={`translate(${introMedal.x}, ${introMedal.y})`}>
          <circle 
            cx="0" cy="0" r="18" 
            fill="url(#medalGradient)" 
            stroke="#92400e" 
            strokeWidth="2" 
            filter={activeBead === introMedal.id ? "url(#activeGlow)" : "url(#depth)"}
            className={activeBead === introMedal.id ? "animate-pulse" : ""}
          />
          <text x="0" y="5" textAnchor="middle" fontFamily="serif" fontSize="12" fontWeight="bold" fill="#92400e">
            M
          </text>
        </g>
        
        {/* 5 gros grains (Notre Père) */}
        {bigBeads.map((bead) => (
          <g key={bead.id}>
            <circle 
              cx={bead.x} cy={bead.y} r="18" 
              fill="white" 
              stroke="#92400e" 
              strokeWidth="2.5" 
              filter={activeBead === bead.id ? "url(#activeGlow)" : "url(#shadow)"}
              className={activeBead === bead.id ? "animate-pulse" : ""}
            />
            <text 
              x={bead.x} y={bead.y + 6} 
              textAnchor="middle" 
              fontFamily="serif" 
              fontSize="14" 
              fontWeight="bold" 
              fill="#92400e"
            >
              {bead.mystery}
            </text>
          </g>
        ))}
        
        {/* 10 petits grains pour chaque dizaine (Ave Maria) */}
        {allDecadeBeads.map((bead) => (
          <circle 
            key={bead.id}
            cx={bead.x} cy={bead.y} r="10" 
            fill="url(#beadGradient)" 
            stroke="#92400e" 
            strokeWidth="1.5" 
            filter={activeBead === bead.id ? "url(#activeGlow)" : "url(#shadow)"}
            className={activeBead === bead.id ? "animate-pulse" : ""}
          />
        ))}
      </svg>
    </div>
  );
};

export default Chapelet; 