// B"H
/** Applies sidebar panel visibility from the single Vibe viewState vessel. */
export const VibeSidebarPanels = {
  sync(container, tab) {
    const active = tab?.vibeSession?.viewState?.activeSidebarTab || 'tree';
    const tree = container?.querySelector?.('#vibe-tree-container');
    const manifest = container?.querySelector?.('#vibe-manifest-container');
    if (tree) tree.hidden = active !== 'tree';
    if (manifest) manifest.hidden = active !== 'manifest';
  }
};
