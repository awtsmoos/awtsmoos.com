// /heichelos/heichel/state.js
// B"H
// The shared state, a single point of truth from which all manifestations emerge.

export const appState = {
    heichelId: null,
    currentSeries: "root",
    heichelData: {}, // To store main heichel info
    breadcrumb: [], // Track navigation path
    ownsIt: false,
    
    // UI State
    isSelectionMode: false,
    selectedItems: new Map(), // Map of 'type-id' -> itemObject
};

// Utility to generate a unique key for an item
export function getItemKey(item) {
    return `${item.type}-${item.id}`;
}