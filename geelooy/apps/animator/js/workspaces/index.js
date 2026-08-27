// B"H
/** Workspace refresh bridge for legacy Vibe directory updates. */
export const Workspaces = {
  async refreshNode(item) {
    document.dispatchEvent(new CustomEvent('awtsmoos:workspace-refresh', { detail: item }));
    return item;
  }
};
