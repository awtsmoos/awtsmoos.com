// B"H — Bookmarks: star toggle + manager data, localStorage-backed.
const KEY = "merkava.bookmarks.v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

let seq = Date.now();

export class BookmarkStore {
  constructor() { this.items = load(); }

  #save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch {}
  }

  isStarred(url) {
    return this.items.some((b) => b.url === String(url));
  }

  /** Toggle the star. Returns true when the page is now bookmarked. */
  toggle(url, title, folder = "") {
    url = String(url || "").trim();
    if (!url) return false;
    const i = this.items.findIndex((b) => b.url === url);
    if (i >= 0) {
      this.items.splice(i, 1);
      this.#save();
      return false;
    }
    this.items.unshift({
      id: "b" + (++seq).toString(36),
      url,
      title: String(title || url).slice(0, 120),
      folder: String(folder || "").slice(0, 60),
      created: Date.now(),
    });
    this.#save();
    return true;
  }

  add(url, title, folder = "") {
    if (!this.isStarred(url)) this.toggle(url, title, folder);
  }

  remove(id) {
    this.items = this.items.filter((b) => b.id !== id);
    this.#save();
  }

  setFolder(id, folder) {
    const b = this.items.find((x) => x.id === id);
    if (b) { b.folder = String(folder || "").slice(0, 60); this.#save(); }
  }

  list() { return this.items.slice(); }

  folders() {
    const s = new Set();
    for (const b of this.items) if (b.folder) s.add(b.folder);
    return [...s].sort();
  }

  search(q) {
    q = String(q || "").trim().toLowerCase();
    if (!q) return this.list();
    return this.items.filter((b) =>
      b.url.toLowerCase().includes(q) ||
      (b.title || "").toLowerCase().includes(q) ||
      (b.folder || "").toLowerCase().includes(q)
    );
  }
}
