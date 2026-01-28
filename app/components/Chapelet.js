'use client';

import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  G,
  Text as SvgText,
} from 'react-native-svg';

const Chapelet = ({
  currentMystery = 0,
  currentChapeletPrayer = 'intro',
  currentDecade = 0,
  onPrayerComplete,
}) => {
  const [activeBead, setActiveBead] = useState(null);

  // Structure du vrai chapelet catholique : 3 grains d'introduction + 5 dizaines + gros grains
  // Coordonnées adaptées pour mobile / React Native
  const centerX = 200;
  const centerY = 150;
  const mainRadius = 90; // Rayon du cercle principal

  // 3 grains d'introduction (en haut à gauche du cercle principal)
  const introBeads = [
    { id: 'intro-1', x: centerX - 30, y: centerY - 50, prayer: 'notre-pere' },
    { id: 'intro-2', x: centerX - 20, y: centerY - 40, prayer: 'ave-maria' },
    { id: 'intro-3', x: centerX - 10, y: centerY - 30, prayer: 'ave-maria' },
  ];

  // Médaille d'introduction (entre les 3 grains et le cercle principal)
  const introMedal = { id: 'intro-medal', x: centerX, y: centerY - 20 };

  // 5 gros grains (pour les Notre Père) en cercle
  const getBigBeads = () => {
    const beads = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 360) / 5 - 90; // Commencer en haut
      const x = centerX + Math.cos((angle * Math.PI) / 180) * mainRadius;
      const y = centerY + Math.sin((angle * Math.PI) / 180) * mainRadius;

      beads.push({
        id: `big-${i + 1}`,
        x: Math.round(x),
        y: Math.round(y),
        mystery: i + 1,
        prayer: 'notre-pere',
      });
    }
    return beads;
  };

  // 10 petits grains pour chaque dizaine (entre les gros grains)
  const getDecadeBeads = (decadeIndex) => {
    const beads = [];
    const startAngle = (decadeIndex * 360) / 5 - 90; // Commencer en haut
    const endAngle = ((decadeIndex + 1) * 360) / 5 - 90;
    const angleStep = (endAngle - startAngle) / 11; // 10 grains + 1 espace

    for (let i = 1; i <= 10; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + Math.cos((angle * Math.PI) / 180) * mainRadius;
      const y = centerY + Math.sin((angle * Math.PI) / 180) * mainRadius;

      beads.push({
        id: `decade-${decadeIndex + 1}-${i}`,
        x: Math.round(x),
        y: Math.round(y),
        decade: decadeIndex + 1,
        position: i,
        prayer: 'ave-maria',
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

  const isActive = (id) => activeBead === id;

  return (
    <View style={styles.container}>
      <Svg width={400} height={300} viewBox="0 0 400 300">
        <Defs>
          <RadialGradient id="beadGradient" cx="30%" cy="30%">
            <Stop offset="0%" stopColor="#fef3c7" stopOpacity={1} />
            <Stop offset="50%" stopColor="#fbbf24" stopOpacity={1} />
            <Stop offset="100%" stopColor="#d97706" stopOpacity={1} />
          </RadialGradient>

          <RadialGradient id="medalGradient" cx="30%" cy="30%">
            <Stop offset="0%" stopColor="#fef3c7" stopOpacity={1} />
            <Stop offset="70%" stopColor="#fbbf24" stopOpacity={1} />
            <Stop offset="100%" stopColor="#d97706" stopOpacity={1} />
          </RadialGradient>
        </Defs>

        {/* Médaille centrale */}
        <G transform={`translate(${centerMedal.x}, ${centerMedal.y})`}>
          <Circle
            cx={0}
            cy={0}
            r={20}
            fill="url(#medalGradient)"
            stroke="#92400e"
            strokeWidth={2}
            opacity={isActive(centerMedal.id) ? 1 : 0.9}
          />
          <Circle cx={0} cy={0} r={15} fill="none" stroke="#92400e" strokeWidth={1} />
          <SvgText
            x={0}
            y={5}
            fontFamily="serif"
            fontSize={12}
            fontWeight="bold"
            fill="#92400e"
            textAnchor="middle"
          >
            M
          </SvgText>
        </G>

        {/* 3 grains d'introduction */}
        {introBeads.map((bead) => (
          <Circle
            key={bead.id}
            cx={bead.x}
            cy={bead.y}
            r={12}
            fill="url(#beadGradient)"
            stroke="#92400e"
            strokeWidth={2}
            opacity={isActive(bead.id) ? 1 : 0.7}
          />
        ))}

        {/* Médaille d'introduction */}
        <G transform={`translate(${introMedal.x}, ${introMedal.y})`}>
          <Circle
            cx={0}
            cy={0}
            r={18}
            fill="url(#medalGradient)"
            stroke="#92400e"
            strokeWidth={2}
            opacity={isActive(introMedal.id) ? 1 : 0.9}
          />
          <SvgText
            x={0}
            y={5}
            fontFamily="serif"
            fontSize={12}
            fontWeight="bold"
            fill="#92400e"
            textAnchor="middle"
          >
            M
          </SvgText>
        </G>

        {/* 5 gros grains (Notre Père) */}
        {bigBeads.map((bead) => (
          <G key={bead.id}>
            <Circle
              cx={bead.x}
              cy={bead.y}
              r={18}
              fill="white"
              stroke="#92400e"
              strokeWidth={2.5}
              opacity={isActive(bead.id) ? 1 : 0.7}
            />
            <SvgText
              x={bead.x}
              y={bead.y + 6}
              fontFamily="serif"
              fontSize={14}
              fontWeight="bold"
              fill="#92400e"
              textAnchor="middle"
            >
              {bead.mystery}
            </SvgText>
          </G>
        ))}

        {/* 10 petits grains pour chaque dizaine (Ave Maria) */}
        {allDecadeBeads.map((bead) => (
          <Circle
            key={bead.id}
            cx={bead.x}
            cy={bead.y}
            r={10}
            fill="url(#beadGradient)"
            stroke="#92400e"
            strokeWidth={1.5}
            opacity={isActive(bead.id) ? 1 : 0.7}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chapelet;