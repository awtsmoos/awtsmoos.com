// B"H
/** Browser-local file provider used by legacy Vibe modules in static mode. */
const storeKey = item => `awtsmoos:vibe:file:${item.workspaceId || item.id || 'root'}:${item.path}`;

export const FileSystemProvider = {
  async read(item) {
    const value = localStorage.getItem(storeKey(item));
    if (value === null) throw new Error(`B"H missing file vessel: ${item.path}`);
    return value;
  },

  async write(item, content) {
    localStorage.setItem(storeKey(item), String(content ?? ''));
    return item;
  },

  async delete(item) {
    localStorage.removeItem(storeKey(item));
    return item;
  },

  async create(parent, name, kind = 'file') {
    return { ...parent, name, kind, path: `${parent.path || ''}/${name}`.replace(/\/+/g, '/') };
  }
};
