// B"H
/**
 * @file virtual-fs.js
 * @brief Browser-memory filesystem for offline AI/tunnel simulation.
 *
 * @description
 * When the live tunnel is absent, the Awtsmoos still grants a soft world where
 * code may be read, written, searched, and tested in miniature. This is not a
 * fake success: every result declares `virtual: true` so the UI can show the
 * user exactly which reality was touched.
 */

export class VirtualFilesystem {
  constructor(seed = {}) {
    this.files = new Map(Object.entries(seed));
    if (!this.files.size) this.write('/README.awt', 'B"H\nVirtual workspace ready.');
  }

  list(base = '/') {
    const prefix = base.endsWith('/') ? base : base + '/';
    return [...this.files.keys()]
      .filter(path => base === '/' || path.startsWith(prefix))
      .map(path => ({ name: path.split('/').pop(), path, kind: 'file', type: 'virtual-os', bytes: this.files.get(path).length }));
  }

  read(path = '/README.awt') {
    if (!this.files.has(path)) return { ok: false, virtual: true, error: 'Virtual file not found.', path };
    return { ok: true, virtual: true, path, content: this.files.get(path) };
  }

  write(path = '/draft.txt', content = '') {
    const cleanPath = this.cleanPath(path);
    this.files.set(cleanPath, String(content ?? ''));
    return { ok: true, virtual: true, path: cleanPath, bytes: this.files.get(cleanPath).length };
  }

  mkdirp(path = '/') {
    return { ok: true, virtual: true, path: this.cleanPath(path), directory: true };
  }

  stat(path = '/') {
    if (path === '/') return { ok: true, virtual: true, path, kind: 'directory', entries: this.files.size };
    if (!this.files.has(path)) return { ok: false, virtual: true, error: 'Virtual path not found.', path };
    return { ok: true, virtual: true, path, kind: 'file', bytes: this.files.get(path).length };
  }

  search(query = '') {
    const q = String(query || '').toLowerCase();
    const matches = [...this.files.entries()]
      .filter(([path, content]) => path.toLowerCase().includes(q) || content.toLowerCase().includes(q))
      .map(([path, content]) => ({ path, preview: content.slice(0, 200), bytes: content.length }));
    return { ok: true, virtual: true, matches };
  }

  bulk(paths = '') {
    return String(paths || '').split(/\n+/).filter(Boolean).map(path => this.read(path));
  }

  snapshot() {
    return Object.fromEntries(this.files.entries());
  }

  cleanPath(path = '') {
    const p = String(path || '/draft.txt').trim() || '/draft.txt';
    return p.startsWith('/') ? p : '/' + p;
  }
}

export const sharedVirtualFilesystem = new VirtualFilesystem();
