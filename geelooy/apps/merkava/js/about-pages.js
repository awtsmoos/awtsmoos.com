// B"H — Chrome (about:) pages. These render as native DOM in the shared
// chrome layer (fully interactive), while remote pages render via the engine
// onto per-tab canvases. Each renderer returns an HTMLElement.
import { SEARCH_ENGINES, VIEWPORTS, DEFAULTS } from "./settings.js";
import { ENGINE_MAX_VIEWPORT, ENGINE_BACKEND } from "./engine-adapter.js";

export const CHROME_PAGES = {
  home: renderHome, history: renderHistory, bookmarks: renderBookmarks,
  downloads: renderDownloads, settings: renderSettings, extensions: renderExtensions,
  version: renderVersion, blank: () => { const d = document.createElement("div"); return d; },
};

export function renderChromePage(name, ctx) {
  const fn = CHROME_PAGES[name] || CHROME_PAGES.blank;
  const wrap = document.createElement("div");
  wrap.className = "page";
  wrap.appendChild(fn(ctx));
  return wrap;
}

/* ---------- shared helpers ---------- */

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtTime(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const hm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return sameDay ? hm : d.toLocaleDateString() + " " + hm;
}
function card(title, sub) {
  const c = h('<section class="card"><h3></h3><p class="sub"></p><div class="c-body"></div></section>');
  c.querySelector("h3").textContent = title;
  if (sub) c.querySelector("p").textContent = sub; else c.querySelector("p").remove();
  return c;
}

/* ---------- about:home ---------- */

function renderHome(ctx) {
  const root = h("<div></div>");
  const hero = h(`<div class="hero">
      <div class="logo">MERKAVA</div>
      <div class="tagline">A browser rendered from scratch — HTML → DOM → layout → paint → WASM pixels.</div>
      <div class="hero-search">
        <input class="input" id="home-q" type="text" spellcheck="false" placeholder="Search the web or type a URL" aria-label="Search or enter address">
        <button class="btn primary" id="home-go">Search</button>
      </div>
    </div>`);
  root.appendChild(hero);
  const go = () => {
    const q = hero.querySelector("#home-q").value.trim();
    if (q) ctx.navigate(q);
  };
  hero.querySelector("#home-go").addEventListener("click", go);
  hero.querySelector("#home-q").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });

  const quick = card("Quick links", "Handy destinations. Remote pages fetch with the host fetch() — CORS applies.");
  const grid = h('<div class="quick-grid"></div>');
  const links = [
    ["Version", "about:version"], ["Extensions", "about:extensions"],
    ["Settings", "about:settings"], ["Downloads", "about:downloads"],
    ["httpbin HTML demo", "https://httpbin.org/html"],
    ["example.com", "https://example.com"],
  ];
  for (const [name, url] of links) {
    const t = h('<button class="quick-tile"><span class="qt-name"></span><span class="qt-url"></span></button>');
    t.querySelector(".qt-name").textContent = name;
    t.querySelector(".qt-url").textContent = url;
    t.addEventListener("click", () => ctx.navigate(url));
    grid.appendChild(t);
  }
  quick.querySelector(".c-body").appendChild(grid);
  root.appendChild(quick);

  const stats = card("This browser", "");
  const sg = h('<div class="stat-grid"></div>');
  const items = [
    [String(ctx.history.count), "history entries"],
    [String(ctx.bookmarks.list().length), "bookmarks"],
    [ENGINE_BACKEND, "engine"],
    [ENGINE_MAX_VIEWPORT.width + "×" + ENGINE_MAX_VIEWPORT.height, "max viewport"],
  ];
  for (const [v, l] of items) {
    const s = h('<div class="stat"><b></b><span></span></div>');
    s.querySelector("b").textContent = v;
    s.querySelector("span").textContent = l;
    sg.appendChild(s);
  }
  stats.querySelector(".c-body").appendChild(sg);
  root.appendChild(stats);
  return root;
}

/* ---------- about:history ---------- */

function renderHistory(ctx) {
  const root = h(`<div>
    <h1>History</h1><p class="sub">Stored locally in this browser. Nothing leaves the device.</p>
    <div class="hero-search" style="max-width:none">
      <input class="input" id="hq" type="search" placeholder="Search history" aria-label="Search history">
      <button class="btn danger" id="hclear">Clear all</button>
    </div>
    <div id="hlist"></div>
  </div>`);
  const listEl = root.querySelector("#hlist");
  const draw = () => {
    const q = root.querySelector("#hq").value;
    const rows = ctx.history.search(q, 300);
    listEl.innerHTML = "";
    if (!rows.length) {
      listEl.appendChild(h('<div class="empty-note">No history yet. Pages you visit will appear here.</div>'));
      return;
    }
    for (const e of rows) {
      const r = h(`<div class="list-row"><div class="lr-main">
          <div class="lr-title"></div><div class="lr-sub"></div></div>
        <span class="pill"></span>
        <button class="icon-btn h-open" title="Open">↗</button>
        <button class="icon-btn danger h-del" title="Remove">✕</button></div>`);
      r.querySelector(".lr-title").textContent = e.title || e.url;
      r.querySelector(".lr-sub").textContent = e.url;
      r.querySelector(".pill").textContent = fmtTime(e.visitedAt);
      r.querySelector(".h-open").addEventListener("click", () => ctx.navigate(e.url));
      r.querySelector(".h-del").addEventListener("click", () => { ctx.history.remove(e.url); draw(); });
      listEl.appendChild(r);
    }
  };
  root.querySelector("#hq").addEventListener("input", draw);
  root.querySelector("#hclear").addEventListener("click", () => {
    if (confirm("Clear all browsing history?")) { ctx.history.clear(); draw(); }
  });
  draw();
  return root;
}

/* ---------- about:bookmarks ---------- */

function renderBookmarks(ctx) {
  const root = h(`<div>
    <h1>Bookmarks</h1><p class="sub">Star any page from the toolbar. Stored locally.</p>
    <div class="hero-search" style="max-width:none">
      <input class="input" id="bq" type="search" placeholder="Search bookmarks" aria-label="Search bookmarks">
      <select class="select" id="bf" style="max-width:180px" aria-label="Filter by folder"></select>
    </div>
    <div id="blist"></div>
  </div>`);
  const listEl = root.querySelector("#blist");
  const folderSel = root.querySelector("#bf");
  const drawFolders = () => {
    folderSel.innerHTML = '<option value="">All folders</option>';
    for (const f of ctx.bookmarks.folders()) {
      const o = document.createElement("option");
      o.value = f; o.textContent = f;
      folderSel.appendChild(o);
    }
  };
  const draw = () => {
    drawFolders();
    const q = root.querySelector("#bq").value;
    const folder = folderSel.value;
    let rows = ctx.bookmarks.search(q);
    if (folder) rows = rows.filter((b) => b.folder === folder);
    listEl.innerHTML = "";
    if (!rows.length) {
      listEl.appendChild(h('<div class="empty-note">No bookmarks yet. Press ★ in the toolbar to bookmark a page.</div>'));
      return;
    }
    for (const b of rows) {
      const r = h(`<div class="list-row"><div class="lr-main">
          <div class="lr-title"></div><div class="lr-sub"></div></div>
        <input class="input b-folder" style="max-width:130px" placeholder="folder" aria-label="Folder">
        <button class="icon-btn b-open" title="Open">↗</button>
        <button class="icon-btn danger b-del" title="Remove">✕</button></div>`);
      r.querySelector(".lr-title").textContent = b.title || b.url;
      r.querySelector(".lr-sub").textContent = b.url;
      const fi = r.querySelector(".b-folder");
      fi.value = b.folder || "";
      fi.addEventListener("change", () => { ctx.bookmarks.setFolder(b.id, fi.value); drawFolders(); });
      r.querySelector(".b-open").addEventListener("click", () => ctx.navigate(b.url));
      r.querySelector(".b-del").addEventListener("click", () => { ctx.bookmarks.remove(b.id); draw(); });
      listEl.appendChild(r);
    }
  };
  root.querySelector("#bq").addEventListener("input", draw);
  folderSel.addEventListener("change", draw);
  draw();
  return root;
}

/* ---------- about:downloads ---------- */

function renderDownloads(ctx) {
  const root = h(`<div>
    <h1>Downloads</h1><p class="sub">Files fetched with the host fetch() API — CORS applies. Blobs live for this session.</p>
  </div>`);
  const form = card("Download a file", "Paste a direct file URL. Binary pages navigated to in the address bar land here automatically.");
  const row = h(`<div class="hero-search" style="max-width:none">
      <input class="input" id="dl-url" type="url" spellcheck="false" placeholder="https://…/file.zip" aria-label="File URL">
      <button class="btn primary" id="dl-go">Download</button></div>`);
  form.querySelector(".c-body").appendChild(row);
  root.appendChild(form);
  const go = () => {
    const u = row.querySelector("#dl-url").value.trim();
    if (u) ctx.downloads.download(u);
  };
  row.querySelector("#dl-go").addEventListener("click", go);
  row.querySelector("#dl-url").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });

  const listCard = card("Session downloads", "");
  const body = listCard.querySelector(".c-body");
  const draw = () => {
    body.innerHTML = "";
    const items = ctx.downloads.list();
    if (!items.length) {
      body.appendChild(h('<div class="empty-note">Nothing downloaded yet.</div>'));
      return;
    }
    const clear = h('<div style="margin-bottom:8px"><button class="btn" id="dl-clear">Clear finished</button></div>');
    clear.querySelector("#dl-clear").addEventListener("click", () => { ctx.downloads.clearFinished(); draw(); });
    body.appendChild(clear);
    for (const it of items) {
      const r = h(`<div class="list-row"><div class="lr-main">
          <div class="lr-title"></div><div class="lr-sub"></div></div>
        <button class="icon-btn dl-open" title="Open">↗</button>
        <button class="icon-btn danger dl-x" title="Dismiss">✕</button></div>`);
      r.querySelector(".lr-title").textContent = it.name;
      r.querySelector(".lr-sub").textContent =
        it.state === "done" ? "done" : it.state === "error" ? "failed: " + it.error : "downloading…";
      if (it.state !== "done") r.querySelector(".dl-open").disabled = true;
      else r.querySelector(".dl-open").addEventListener("click", () => ctx.downloads.open(it.id));
      r.querySelector(".dl-x").addEventListener("click", () => { ctx.downloads.dismiss(it.id); draw(); });
      body.appendChild(r);
    }
  };
  draw();
  root.appendChild(listCard);
  return root;
}

/* ---------- about:settings ---------- */

function renderSettings(ctx) {
  const s = ctx.settings;
  const root = h(`<div><h1>Settings</h1><p class="sub">Stored locally. Changes apply immediately.</p></div>`);

  const app = card("Appearance", "");
  const themeRow = h(`<div class="toggle-row"><div><div class="t-label">Theme</div>
    <div class="t-desc">Dream dark, or a light theme.</div></div>
    <select class="select" id="s-theme" style="max-width:160px" aria-label="Theme">
    <option value="dark">Dark</option><option value="light">Light</option></select></div>`);
  themeRow.querySelector("#s-theme").value = s.get("theme");
  themeRow.querySelector("#s-theme").addEventListener("change", (e) => {
    s.set("theme", e.target.value); s.applyTheme();
  });
  app.querySelector(".c-body").appendChild(themeRow);
  root.appendChild(app);

  const eng = card("Engine", "Flags forwarded to the engine adapter. Page-JS and the WASM software fallback are being wired by the engine worker; toggles take effect as that support lands.");
  const jsRow = switchRow("JavaScript", "Allow pages to run JavaScript once the engine supports it.", "s-js", s.get("jsEnabled"));
  jsRow.querySelector("input").addEventListener("change", (e) => s.set("jsEnabled", e.target.checked));
  const wasmRow = switchRow("WASM acceleration", "Use the WASM pixel module for clear/fill/gradient. Off = software fallback (pending).", "s-wasm", s.get("wasmAccel"));
  wasmRow.querySelector("input").addEventListener("change", (e) => s.set("wasmAccel", e.target.checked));
  const vpRow = h(`<div class="toggle-row"><div><div class="t-label">Viewport size</div>
    <div class="t-desc">Render resolution handed to the engine. Auto fits the window.</div></div>
    <select class="select" id="s-vp" style="max-width:220px" aria-label="Viewport size"></select></div>`);
  for (const [k, v] of Object.entries(VIEWPORTS)) {
    const o = document.createElement("option");
    o.value = k; o.textContent = v.name;
    vpRow.querySelector("#s-vp").appendChild(o);
  }
  vpRow.querySelector("#s-vp").value = s.get("viewport");
  vpRow.querySelector("#s-vp").addEventListener("change", (e) => {
    s.set("viewport", e.target.value);
    ctx.navigate(ctx.tab.url, { push: false }); // re-render at new size
  });
  eng.querySelector(".c-body").append(jsRow, wasmRow, vpRow);
  root.appendChild(eng);

  const nav = card("Navigation", "");
  const homeField = field("Homepage", "s-home", s.get("homepage"), "Opened for new tabs and the home button.");
  homeField.querySelector("input").addEventListener("change", (e) => s.set("homepage", e.target.value.trim() || DEFAULTS.homepage));
  const seRow = h(`<div class="field"><label for="s-se">Search engine</label>
    <select class="select" id="s-se"></select>
    <div class="hint">Used when the address bar gets text that is not a URL. Remote search pages are subject to CORS.</div></div>`);
  for (const [k, v] of Object.entries(SEARCH_ENGINES)) {
    const o = document.createElement("option");
    o.value = k; o.textContent = v.name;
    seRow.querySelector("#s-se").appendChild(o);
  }
  seRow.querySelector("#s-se").value = s.get("searchEngine");
  const customWrap = h(`<div class="field" id="s-custom-wrap"><label for="s-custom">Custom search template</label>
    <input class="input" id="s-custom" spellcheck="false" placeholder="https://search.example/?q={q}">
    <div class="hint">{q} is replaced with the encoded query.</div></div>`);
  customWrap.querySelector("#s-custom").value = s.get("customSearch");
  customWrap.querySelector("#s-custom").addEventListener("change", (e) => s.set("customSearch", e.target.value.trim()));
  const syncCustom = () => { customWrap.style.display = seRow.querySelector("#s-se").value === "custom" ? "" : "none"; };
  seRow.querySelector("#s-se").addEventListener("change", (e) => { s.set("searchEngine", e.target.value); syncCustom(); });
  syncCustom();
  const resetRow = h('<div class="field"><button class="btn danger" id="s-reset">Reset all settings</button></div>');
  resetRow.querySelector("#s-reset").addEventListener("click", () => {
    if (!confirm("Reset all settings to defaults?")) return;
    for (const [k, v] of Object.entries(DEFAULTS)) s.set(k, v);
    s.applyTheme();
    ctx.navigate("about:settings", { push: false });
  });
  nav.querySelector(".c-body").append(homeField, seRow, customWrap, resetRow);
  root.appendChild(nav);
  return root;
}

function switchRow(label, desc, id, checked) {
  const r = h(`<div class="toggle-row"><div><div class="t-label"></div><div class="t-desc"></div></div>
    <label class="switch"><input type="checkbox"><span class="track"></span></label></div>`);
  r.querySelector(".t-label").textContent = label;
  r.querySelector(".t-desc").textContent = desc;
  const inp = r.querySelector("input");
  inp.id = id; inp.checked = !!checked;
  return r;
}
function field(label, id, value, hint) {
  const f = h(`<div class="field"><label></label><input class="input" spellcheck="false"><div class="hint"></div></div>`);
  f.querySelector("label").textContent = label;
  f.querySelector("label").htmlFor = id;
  const inp = f.querySelector("input");
  inp.id = id; inp.value = value;
  f.querySelector(".hint").textContent = hint;
  return f;
}

/* ---------- about:extensions ---------- */

function renderExtensions(ctx) {
  const root = h(`<div><h1>Extensions</h1><p class="sub">Toolbar buttons appear for enabled extensions with popups.</p></div>`);
  const ui = ctx.extUI;
  const seam = () => window.MerkavaExtensions;

  const hostCard = card("Extension host", "");
  const hb = hostCard.querySelector(".c-body");
  const drawHost = () => {
    hb.innerHTML = "";
    const ok = ui.hostAvailable;
    const p = h(`<p style="margin:0 0 10px 0"></p>`);
    const pill = h(`<span class="pill ${ok ? "on" : "off"}"></span>`);
    pill.textContent = ok ? "connected" : "not loaded";
    p.append("Host status: ", pill, document.createTextNode(
      ok ? " — the ExtensionHost worker is driving extensions."
         : " — unpacked extensions below run in limited local mode until the ExtensionHost worker loads."));
    hb.appendChild(p);
    const btn = h(`<button class="btn primary" id="x-load">Load unpacked…</button>
      <input type="file" id="x-files" webkitdirectory multiple hidden>`);
    hb.appendChild(btn);
    const fi = hb.querySelector("#x-files");
    btn.addEventListener("click", () => fi.click());
    fi.addEventListener("change", async () => {
      if (!fi.files.length) return;
      try {
        const { id } = await seam().loadUnpacked(fi.files);
        ctx.notice.show("Extension loaded: <b>" + esc(id) + "</b>");
      } catch (e) {
        ctx.notice.show("<b>Load failed:</b> " + esc(String((e && e.message) || e)));
      }
      fi.value = "";
      drawList();
    });
  };
  root.appendChild(hostCard);

  const listCard = card("Installed", "");
  const lb = listCard.querySelector(".c-body");
  const drawList = () => {
    lb.innerHTML = "";
    let list = [];
    try { list = seam().list() || []; } catch { list = []; }
    if (!list.length) {
      lb.appendChild(h('<div class="empty-note">No extensions installed. Use “Load unpacked…” to add one from a folder.</div>'));
      return;
    }
    for (const x of list) {
      const r = h(`<div class="list-row"><div class="lr-main">
          <div class="lr-title"></div><div class="lr-sub"></div></div>
        <span class="pill"></span>
        <button class="btn x-toggle"></button>
        <button class="icon-btn danger x-del" title="Uninstall">✕</button></div>`);
      r.querySelector(".lr-title").textContent = x.name + (x.version ? " " + x.version : "");
      r.querySelector(".lr-sub").textContent = x.description || x.id;
      const pill = r.querySelector(".pill");
      pill.textContent = x.enabled ? "enabled" : "disabled";
      pill.classList.add(x.enabled ? "on" : "off");
      const tg = r.querySelector(".x-toggle");
      tg.textContent = x.enabled ? "Disable" : "Enable";
      tg.addEventListener("click", async () => { await seam().setEnabled(x.id, !x.enabled); drawList(); });
      r.querySelector(".x-del").addEventListener("click", async () => {
        if (confirm("Uninstall " + x.name + "?")) { await seam().uninstall(x.id); drawList(); }
      });
      lb.appendChild(r);
    }
  };
  if (seam()) seam().on("change", drawList);
  drawHost();
  drawList();
  root.appendChild(listCard);
  return root;
}

/* ---------- about:version ---------- */

function renderVersion(ctx) {
  const root = h(`<div><h1>Version</h1><p class="sub">What this browser is built from.</p></div>`);
  const c = card("Merkava", "");
  const b = c.querySelector(".c-body");
  const rows = [
    ["Engine backend", ENGINE_BACKEND],
    ["Max viewport", ENGINE_MAX_VIEWPORT.width + " × " + ENGINE_MAX_VIEWPORT.height],
    ["WASM accel", ctx.settings.get("wasmAccel") ? "on" : "off"],
    ["Page JS", ctx.settings.get("jsEnabled") ? "on (engine support pending)" : "off"],
    ["History entries", String(ctx.history.count)],
    ["Bookmarks", String(ctx.bookmarks.list().length)],
    ["Extension host", ctx.extUI.hostAvailable ? "connected" : "not loaded"],
  ];
  for (const [k, v] of rows) {
    const r = h('<div class="list-row"><div class="lr-main"><div class="lr-title"></div></div><span class="pill"></span></div>');
    r.querySelector(".lr-title").textContent = k;
    r.querySelector(".pill").textContent = v;
    b.appendChild(r);
  }
  root.appendChild(c);
  return root;
}
