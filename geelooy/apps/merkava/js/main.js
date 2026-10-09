// B"H — Merkava browser app boot: wires tabs, toolbar, status, shortcuts.
import { engineSupport } from "./engine-adapter.js";
import { TabManager } from "./tabs.js";
import { Navigator } from "./navigation.js";
import { HistoryStore } from "./history.js";
import { BookmarkStore } from "./bookmarks.js";
import { DownloadManager } from "./downloads.js";
import { SettingsStore } from "./settings.js";
import { ExtensionUI } from "./extensions-ui.js";

const $ = (id) => document.getElementById(id);

const settings = new SettingsStore();
settings.applyTheme();

const notice = {
  show(html, ms = 9000) {
    const n = $("notice");
    n.querySelector(".n-body").innerHTML = html;
    n.classList.add("show");
    clearTimeout(notice.t);
    notice.t = setTimeout(() => n.classList.remove("show"), ms);
  },
  hide() { $("notice").classList.remove("show"); },
};

const status = {
  set(o) {
    if (o.ms != null) $("st-ms").textContent = Number(o.ms).toFixed(1) + " ms";
    if (o.items != null) $("st-items").textContent = o.items;
    if (o.backend) $("st-backend").textContent = o.backend;
    if (o.mode != null) $("st-mode").textContent = o.mode;
  },
};

const tabs = new TabManager({
  canvasesEl: $("canvases"),
  chromeLayerEl: $("chrome-layer"),
  onTabsChanged: drawTabs,
  onSwitch: onSwitchTab,
  // Host click on a tab's canvas -> guest hit-test; <a href> navigates.
  onCanvasClick: (tab, x, y) => nav.clickPageAt(tab, x, y),
});

const historyStore = new HistoryStore();
const bookmarks = new BookmarkStore();
const downloads = new DownloadManager({ shelfEl: $("shelf"), onChange: () => {} });
const extUI = new ExtensionUI({ buttonsEl: $("ext-buttons"), popupEl: $("ext-popup"), notice });

const nav = new Navigator({
  tabs, settings,
  history: historyStore,
  bookmarks, downloads, extUI,
  notice, status,
  viewportEl: $("viewport"),
});

/* ---------- tab strip ---------- */

function drawTabs() {
  const el = $("tabs");
  el.innerHTML = "";
  for (const t of tabs.tabs) {
    const d = document.createElement("div");
    d.className = "tab" + (t.id === tabs.activeId ? " active" : "");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-selected", t.id === tabs.activeId ? "true" : "false");
    d.title = t.url;
    const label = document.createElement("span");
    label.className = "tab-title";
    label.textContent = t.title;
    const x = document.createElement("button");
    x.className = "tab-close";
    x.textContent = "✕";
    x.title = "Close tab";
    x.setAttribute("aria-label", "Close tab " + t.title);
    x.addEventListener("click", (e) => {
      e.stopPropagation();
      tabs.closeTab(t.id);
      if (!tabs.tabs.length) newTab();
    });
    d.appendChild(label);
    d.appendChild(x);
    d.addEventListener("click", () => tabs.switchTo(t.id));
    d.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tabs.switchTo(t.id);
    });
    d.tabIndex = 0;
    el.appendChild(d);
  }
  const a = tabs.active;
  $("back").disabled = !nav.canBack(a);
  $("fwd").disabled = !nav.canForward(a);
}

function onSwitchTab(tab) {
  $("addr").value = tab.url === "about:blank" ? "" : tab.url;
  syncStar();
  extUI.closePopup();
  drawTabs();
}

function newTab(url) {
  const t = tabs.newTab();
  nav.navigate(t, url || settings.get("homepage"));
  return t;
}

function syncStar() {
  const t = tabs.active;
  $("bkm").classList.toggle("starred", !!t && bookmarks.isStarred(t.url));
}

/* ---------- toolbar wiring ---------- */

$("newtab").addEventListener("click", () => newTab());
$("back").addEventListener("click", () => nav.back(tabs.active));
$("fwd").addEventListener("click", () => nav.forward(tabs.active));
$("reload").addEventListener("click", () => nav.reload(tabs.active));
$("home").addEventListener("click", () => nav.navigate(tabs.active, settings.get("homepage")));
$("go").addEventListener("click", () => nav.navigate(tabs.active, $("addr").value));
$("addr").addEventListener("keydown", (e) => {
  if (e.key === "Enter") nav.navigate(tabs.active, $("addr").value);
});
$("addr").addEventListener("focus", (e) => e.target.select());
$("bkm").addEventListener("click", () => {
  const t = tabs.active;
  if (!t || t.hi < 0) return;
  const starred = bookmarks.toggle(t.url, t.title);
  syncStar();
  notice.show(starred ? "Bookmarked ★ — see <b>about:bookmarks</b>" : "Bookmark removed", 3500);
});
$("t-history").addEventListener("click", () => nav.navigate(tabs.active, "about:history"));
$("t-bookmarks").addEventListener("click", () => nav.navigate(tabs.active, "about:bookmarks"));
$("t-downloads").addEventListener("click", () => nav.navigate(tabs.active, "about:downloads"));
$("t-extensions").addEventListener("click", () => nav.navigate(tabs.active, "about:extensions"));
$("t-settings").addEventListener("click", () => nav.navigate(tabs.active, "about:settings"));
$("notice").querySelector(".n-close").addEventListener("click", () => notice.hide());

/* ---------- keyboard shortcuts ---------- */

document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "t") { e.preventDefault(); newTab(); }
  else if (mod && e.key.toLowerCase() === "w") { e.preventDefault(); tabs.closeTab(tabs.activeId); if (!tabs.tabs.length) newTab(); }
  else if (mod && e.key.toLowerCase() === "l") { e.preventDefault(); $("addr").focus(); }
  else if (mod && e.key.toLowerCase() === "r") { e.preventDefault(); nav.reload(tabs.active); }
  else if (e.key === "F5") { e.preventDefault(); nav.reload(tabs.active); }
  else if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); nav.back(tabs.active); }
  else if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); nav.forward(tabs.active); }
});

/* ---------- resize: re-render engine page at the new size ---------- */

let resizeT = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => nav.refreshViewport(tabs.active), 180);
});

/* ---------- boot ---------- */

(function boot() {
  const sup = engineSupport();
  if (!sup.ok) {
    notice.show("<b>Engine unavailable:</b> " + sup.problems.join(", "), 15000);
  }
  newTab();
  setInterval(() => {
    if (performance.memory) {
      $("st-heap").textContent = (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + " MB";
    }
  }, 2500);
})();
