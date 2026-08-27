// B"H
/** Keeps the Vibe sidebar resizable without owning application truth. */
export const VibeResizer = {
  bind(container) {
    const sidebar = container?.querySelector?.('.vibe-sidebar');
    if (!sidebar || sidebar.dataset.resizerBound === 'yes') return;
    sidebar.dataset.resizerBound = 'yes';
    sidebar.style.resize = 'horizontal';
    sidebar.style.overflow = 'auto';
    sidebar.style.minWidth = sidebar.style.minWidth || '220px';
    sidebar.style.maxWidth = sidebar.style.maxWidth || '70vw';
  }
};
