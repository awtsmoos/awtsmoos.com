// B"H — Extensions toolbar UI + the window.MerkavaExtensions integration seam.
//
// SEAM CONTRACT (for the ExtensionHost worker):
//   The host replaces `window.MerkavaExtensions` with its real implementation.
//   Every method below must keep its name, arguments and return shape.
//   This module and about:extensions always read `window.MerkavaExtensions`
//   at call time, so a late-loading host is picked up automatically.
//
//   {
//     available: boolean,              // true once the real host has loaded
//     list(): Array<{                  // all known extensions
//       id: string, name: string, version: string,
//       description: string, enabled: boolean, hasPopup: boolean
//     }>,
//     get(id): ext|null,
//     setEnabled(id, enabled): Promise<boolean>,
//     uninstall(id): Promise<boolean>,
//     loadUnpacked(files: FileList): Promise<{id: string}>,  // from a directory picker
//     openPopup(id, anchorEl: Element): Promise<void>,  // renders into #ext-popup
//     closePopup(): void,
//     on(event: "change", cb: () => void): void,
//     off(event: "change", cb: () => void): void,
//   }
//
// Until the host exists, a local fallback implements the same surface over
// unpacked extensions loaded in this session (kept in memory + metadata in
// localStorage), with popups rendered from the unpacked popup HTML file.
const META_KEY = "merkava.extensions.meta.v1";

function loadMeta() {
  try {
    const a = JSON.parse(localStorage.getItem(META_KEY) || "[]");
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}
function saveMeta(m) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {}
}

function fallbackSeam(ui) {
  const listeners = new Set();
  const emit = () => listeners.forEach((cb) => { try { cb(); } catch {} });
  return {
    available: false,
    list: () => ui.meta.map((m) => ({
      id: m.id, name: m.name, version: m.version || "",
      description: m.description || "", enabled: !!m.enabled,
      hasPopup: !!m.popupPath,
    })),
    get: (id) => ui.meta.find((m) => m.id === id) || null,
    setEnabled: async (id, enabled) => {
      const m = ui.meta.find((x) => x.id === id);
      if (!m) return false;
      m.enabled = !!enabled; saveMeta(ui.meta); emit(); return true;
    },
    uninstall: async (id) => {
      const i = ui.meta.findIndex((x) => x.id === id);
      if (i < 0) return false;
      ui.meta.splice(i, 1); ui.files.delete(id);
      saveMeta(ui.meta); emit(); return true;
    },
    loadUnpacked: async (files) => ui.loadUnpacked(files),
    openPopup: async (id, anchorEl) => ui.openPopupFallback(id, anchorEl),
    closePopup: () => ui.closePopup(),
    on: (ev, cb) => { if (ev === "change") listeners.add(cb); },
    off: (ev, cb) => { listeners.delete(cb); },
    // non-contract helper so the UI can subscribe even to the real host:
    _emit: emit,
  };
}

export class ExtensionUI {
  constructor({ buttonsEl, popupEl, notice }) {
    this.buttonsEl = buttonsEl;
    this.popupEl = popupEl;
    this.notice = notice;
    this.meta = loadMeta();          // [{id,name,version,description,enabled,popupPath}]
    this.files = new Map();          // id -> File[] (session only)
    this.currentPopupId = null;

    // Install the fallback seam ONLY if nothing provided one (the real host wins).
    if (!window.MerkavaExtensions) {
      window.MerkavaExtensions = fallbackSeam(this);
    }
    this.seenSeam = window.MerkavaExtensions;
    window.MerkavaExtensions.on("change", () => this.refresh());
    // The real host may load later and replace window.MerkavaExtensions;
    // pick it up automatically (the UI always reads the seam at call time).
    setInterval(() => {
      if (window.MerkavaExtensions !== this.seenSeam) {
        this.seenSeam = window.MerkavaExtensions;
        try { this.seenSeam.on("change", () => this.refresh()); } catch {}
        this.refresh();
      }
    }, 2000);
    document.addEventListener("click", (e) => {
      if (!this.popupEl.hidden && !this.popupEl.contains(e.target) &&
          !e.target.closest(".ext-btn")) this.closePopup();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.popupEl.hidden) this.closePopup();
    });
    this.refresh();
  }

  get seam() { return window.MerkavaExtensions; }

  refresh() {
    const s = this.seam;
    if (!s) return;
    let list = [];
    try { list = s.list() || []; } catch { list = []; }
    this.buttonsEl.innerHTML = "";
    for (const ext of list.filter((e) => e.enabled)) {
      const b = document.createElement("button");
      b.className = "ext-btn";
      b.title = ext.name + (ext.version ? " " + ext.version : "");
      b.textContent = "🧩";
      b.setAttribute("aria-label", "Open " + ext.name);
      b.addEventListener("click", () => this.togglePopup(ext.id, b));
      this.buttonsEl.appendChild(b);
    }
  }

  async togglePopup(id, anchorEl) {
    if (this.currentPopupId === id && !this.popupEl.hidden) { this.closePopup(); return; }
    try {
      await this.seam.openPopup(id, anchorEl);
      this.currentPopupId = id;
    } catch (e) {
      this.notice.show("<b>Extension popup failed:</b> " + escapeHtml(String((e && e.message) || e)));
    }
  }

  /** Fallback popup renderer (used until the real host implements openPopup). */
  async openPopupFallback(id, anchorEl) {
    const m = this.meta.find((x) => x.id === id);
    if (!m) throw new Error("unknown extension " + id);
    const files = this.files.get(id) || [];
    let body = "<p class='sub'>No popup page in this extension.</p>";
    if (m.popupPath) {
      const f = files.find((x) => (x.webkitRelativePath || x.name).endsWith(m.popupPath));
      if (f) body = await f.text();
      else body = "<p class='sub'>Popup file was loaded in an earlier session; reload the unpacked extension to see it.</p>";
    }
    this.popupEl.innerHTML =
      '<div class="ep-head"><span></span><button class="icon-btn ep-x" aria-label="Close">✕</button></div>' +
      '<div class="ep-body"></div>';
    this.popupEl.querySelector(".ep-head span").textContent = m.name;
    this.popupEl.querySelector(".ep-body").innerHTML = body;
    this.popupEl.querySelector(".ep-x").addEventListener("click", () => this.closePopup());
    this.popupEl.hidden = false;
  }

  closePopup() {
    this.popupEl.hidden = true;
    this.popupEl.innerHTML = "";
    this.currentPopupId = null;
  }

  /** Read an unpacked extension directory (manifest.json + files). */
  async loadUnpacked(fileList) {
    const files = [...fileList];
    const manifestFile = files.find((f) =>
      /(^|\/)manifest\.json$/.test(f.webkitRelativePath || f.name));
    if (!manifestFile) throw new Error("No manifest.json found in the selected folder.");
    let manifest;
    try { manifest = JSON.parse(await manifestFile.text()); }
    catch { throw new Error("manifest.json is not valid JSON."); }
    const id = "unpacked-" + (manifest.name || "ext").toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" + Date.now().toString(36);
    const meta = {
      id,
      name: manifest.name || "Unpacked extension",
      version: manifest.version || "",
      description: manifest.description || "",
      enabled: true,
      popupPath: (manifest.action && manifest.action.default_popup) ||
                 (manifest.browser_action && manifest.browser_action.default_popup) || "",
      unpacked: true,
    };
    this.meta = this.meta.filter((m) => m.id !== id);
    this.meta.unshift(meta);
    this.files.set(id, files);
    saveMeta(this.meta);
    this.refresh();
    if (this.seam && this.seam._emit) this.seam._emit();
    return { id };
  }

  /** True when the real ExtensionHost has replaced the fallback. */
  get hostAvailable() {
    return !!(this.seam && this.seam.available);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
