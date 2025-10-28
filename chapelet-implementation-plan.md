# Interactive Rosary (Chapelet) Implementation Plan

## Overview

This document outlines the plan for reimplementing the interactive rosary ("chapelet interactif") component to improve its visual appeal, interactivity, and user experience.

## Current Implementation Analysis

There are currently three implementations of the interactive rosary in the codebase:

1. **app/Chapelet.js** - The main component that's currently being used
   - Uses an SVG to render the rosary beads
   - Has simple navigation with "Previous", "Next", and "Restart" buttons
   - Shows the current prayer text and mystery information
   - Uses state to track the current position in the rosary

2. **ChapeletInteractif** in page.js
   - Simpler implementation with a popup interface
   - Shows the prayer text and mystery information
   - Uses a "Next" button to progress through the rosary
   - Has a visual indicator for the 10 beads in each decade

3. **ChapeletGraphiqueInteractif** in page.js
   - More advanced implementation with a full-screen interface
   - Has a more detailed SVG representation of the rosary
   - Includes animations for the beads
   - Has a more interactive approach where users click on beads to progress

## Requirements for the New Implementation

1. **Visual Representation**:
   - Create a visually appealing SVG representation of the rosary
   - Include all parts: cross, large beads, small beads, and medal
   - Use appropriate colors and styling to match the site's aesthetic
   - Ensure the rosary is properly structured with the intro branch and the five decades

2. **Interactivity**:
   - Allow users to click directly on beads to progress through the rosary
   - Provide button navigation as an alternative (Previous, Next, Restart)
   - Highlight the current bead to show progress
   - Add visual feedback when interacting with beads (animations, color changes)

3. **Prayer Content**:
   - Display the current prayer text clearly
   - Show the mystery information for each decade
   - Include all necessary prayers: Sign of the Cross, Apostles' Creed, Our Father, Hail Mary, Glory Be
   - Support both French and Latin versions of prayers

4. **User Experience**:
   - Create a responsive design that works on different screen sizes
   - Add smooth transitions between prayer steps
   - Provide clear visual indicators of progress
   - Make the component accessible with keyboard navigation and proper ARIA attributes

5. **Integration**:
   - Ensure the component can be easily integrated into the main page
   - Make it compatible with the existing mystère data structure
   - Allow for customization of mysteries based on the day of the week

## Implementation Details

### Component Structure

```jsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

// Prayers of the rosary
const prayers = {
  fr: [
    {
      label: "Signe de croix",
      text: "Au nom du Père, du Fils et du Saint-Esprit. Amen.",
    },
    {
      label: "Je crois en Dieu",
      text: `Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d'où il viendra juger les vivants et les morts. Je crois en l'Esprit-Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen.`,
    },
    {
      label: "Notre Père",
      text: `Notre Père qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous soumets pas à la tentation, mais délivre-nous du mal. Amen.`,
    },
    {
      label: "Je vous salue Marie",
      text: `Je vous salue Marie, pleine de grâce, le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous pauvres pécheurs, maintenant et à l'heure de notre mort. Amen.`,
    },
    {
      label: "Gloire au Père",
      text: `Gloire au Père, au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Amen.`,
    },
  ],
  la: [
    {
      label: "Signum Crucis",
      text: "In nomine Patris, et Filii, et Spiritus Sancti. Amen.",
    },
    {
      label: "Credo",
      text: `Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.`,
    },
    {
      label: "Pater Noster",
      text: `Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.`,
    },
    {
      label: "Ave Maria",
      text: `Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.`,
    },
    {
      label: "Gloria Patri",
      text: `Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.`,
    },
  ]
};
```

### Key Features

1. **SVG Visualization**:
   - Render the rosary as an SVG with proper structure
   - Highlight the current bead
   - Show completed beads differently
   - Allow clicking on beads to progress

2. **State Management**:
   - Track the current position in the rosary
   - Support language switching (French/Latin)
   - Handle animations and transitions

3. **User Interface**:
   - Display the current prayer text
   - Show mystery information when relevant
   - Provide navigation buttons
   - Add a progress indicator
   - Support fullscreen mode

4. **Accessibility**:
   - Add keyboard navigation
   - Include proper ARIA attributes
   - Ensure focus management

## Implementation Steps

1. **Replace app/Chapelet.js** with the new implementation
2. **Update page.js** to:
   - Remove the old ChapeletInteractif and ChapeletGraphiqueInteractif implementations
   - Update any references to use the new implementation

## Testing Plan

1. **Functionality Testing**:
   - Verify all navigation methods work (buttons, bead clicking, keyboard)
   - Test language switching
   - Ensure all prayers and mysteries display correctly

2. **Visual Testing**:
   - Check the appearance on different screen sizes
   - Verify animations and transitions work smoothly

3. **Accessibility Testing**:
   - Test keyboard navigation
   - Verify screen reader compatibility

## Potential Improvements for Future Versions

1. Add audio for prayers
2. Include more detailed animations
3. Add a tutorial mode for first-time users
4. Support more languages
5. Add customization options for colors and appearance