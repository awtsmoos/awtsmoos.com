// B"H
/** Renders a compact workspace tree projection for the legacy Vibe sidebar. */
export const VibeSidebarTree = {
  async refresh(container, root, controller) {
    const mount = container?.querySelector?.('#vibe-tree-container');
    if (!mount) return null;
    const children = await controller?.listChildren?.(root).catch?.(() => []) || root?.children || [];
    mount.textContent = '';

    const title = document.createElement('div');
    title.className = 'vibe-tree-root';
    title.textContent = root?.name || root?.path || 'Root';
    mount.appendChild(title);

    for (const item of children) {
      const row = document.createElement('button');
      row.className = 'vibe-tree-row';
      row.textContent = item.name || item.path || 'item';
      row.onclick = () => controller?.openItem?.(item);
      mount.appendChild(row);
    }
    return mount;
  }
};
