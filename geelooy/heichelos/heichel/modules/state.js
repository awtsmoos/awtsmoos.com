// B"H
/**
 * @module StateOfExistence
 * @description The current Heichel breathes in one small state vessel.
 */
export const appState = {
  heichelId: null,
  currentSeries: "root",
  heichelData: {},
  breadcrumb: [],
  ownsIt: false,
  currentContent: { posts: [], subSeries: [], groupings: [] },
  isSelectionMode: false,
  selectedItems: new Map()
};

export function getItemKey(item) { return `${item.type}-${item.id}`; }
export function resetSelection() { appState.selectedItems.clear(); appState.isSelectionMode = false; }
