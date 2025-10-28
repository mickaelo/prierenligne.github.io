# Plan for Updating page.js

## Overview

This document outlines the changes needed in `app/page.js` to use the new Chapelet implementation.

## Current State

Currently, `app/page.js` contains:

1. An import of the Chapelet component:
   ```jsx
   import Chapelet from "./Chapelet";
   ```

2. Two additional implementations of the interactive rosary:
   - `ChapeletInteractif` (lines 691-743)
   - `ChapeletGraphiqueInteractif` (lines 749-955)

3. References to these implementations in the UI:
   ```jsx
   {showChapeletInteractif && <Chapelet />}
   ```

## Required Changes

1. **Keep the existing import**:
   ```jsx
   import Chapelet from "./Chapelet";
   ```

2. **Remove the redundant implementations**:
   - Remove the `ChapeletInteractif` function (lines 691-743)
   - Remove the `ChapeletGraphiqueInteractif` function (lines 749-955)

3. **Update the usage**:
   - Keep the existing usage of `<Chapelet />` in the UI
   - Update any references to the removed implementations
   - Ensure the `mysteres` prop is passed correctly to the Chapelet component

## Specific Code Changes

1. **Find and remove the ChapeletInteractif function**:
   ```jsx
   function ChapeletInteractif({ open, onClose, mystere }) {
     // ... entire function implementation
   }
   ```

2. **Find and remove the ChapeletGraphiqueInteractif function**:
   ```jsx
   function ChapeletGraphiqueInteractif({ mystere }) {
     // ... entire function implementation
   }
   ```

3. **Update the usage in the return statement**:
   ```jsx
   {showChapeletInteractif && <Chapelet mysteres={mystereChapelet?.mysteres || defaultMysteries} />}
   ```

4. **Update any event handlers or state that reference the removed components**:
   - Check for any references to `setShowChapeletInteractif` and ensure they still work with the new implementation

## Testing After Implementation

1. **Verify the UI**:
   - Ensure the Chapelet component renders correctly
   - Check that the mysteries are displayed properly
   - Verify that navigation works as expected

2. **Test Interactions**:
   - Test clicking on beads
   - Test the navigation buttons
   - Test keyboard navigation

3. **Check Responsiveness**:
   - Test on different screen sizes
   - Verify that the component adapts correctly

## Implementation Steps

1. Switch to Code mode to make these changes
2. Make the changes to `app/page.js` as outlined above
3. Test the implementation to ensure everything works correctly