// B"H
/** Mirrors Vibe view state into DOM attributes for CSS and diagnostics. */
export const VibeStateSync = {
  apply(container, tab) {
    const state = tab?.vibeSession?.viewState || {};
    if (!container) return;
    container.dataset.vibeSidebarTab = state.activeSidebarTab || 'tree';
    container.dataset.vibeSidebarCollapsed = String(Boolean(state.isSidebarCollapsed));
  }
};
