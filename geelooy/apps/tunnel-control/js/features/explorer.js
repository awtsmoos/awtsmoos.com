
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs, buildFsUrl, buildCurl } from "../api/tunnel.js";
import { saveLocalSetting, readLocalSetting } from "../state/storage.js";
import { getActiveApiKey } from "../api/keySession.js";
import { renderRelativeCrumbs } from "./pathCrumbs.js";
import { log, error } from "../logger.js";

let selectedPath = ".";
let selectedItem = null;
let selectedPaths = new Set();
let viewMode = "list";
let lastItems = [];

function safeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&quot;");
}

function normalizePath(path) {
  return (path || ".").replace(/\\/g, "/").replace(/\/+/g, "/") || ".";
}

function joinPath(base, name) {
  base = normalizePath(base);
  name = String(name || "").replace(/\/$/, "");

  if (base === ".") return name;
  return base.replace(/\/$/, "") + "/" + name;
}

function parentPath(path) {
  path = normalizePath(path);
  if (path === "." || !path.includes("/")) return ".";
  return path.split("/").slice(0, -1).join("/") || ".";
}

function setPath(path) {
  const next = normalizePath(path);
  $("explorerPath").value = next;
  selectedPath = next;
  saveLocalSetting("lastExplorerPath:" + window.awtsGetTunnelName(), next);

  renderRelativeCrumbs($("crumb"), next, picked => {
    setPath(picked);
    loadList();
  });
}

function iconFor(item) {
  if (item.isDirectory || item.type === "directory") return "📁";
  if (/\.(js|mjs|cjs|ts|jsx|tsx)$/i.test(item.name)) return "🟨";
  if (/\.(html)$/i.test(item.name)) return "🌐";
  if (/\.(css)$/i.test(item.name)) return "🎨";
  if (/\.(json)$/i.test(item.name)) return "🧾";
  if (/\.(md|txt)$/i.test(item.name)) return "📄";
  return "📦";
}

function fromItemsFallback(got, basePath) {
  if (got?.detailedItems) return got.detailedItems;

  return (got?.items || []).map(name => {
    const isDirectory = String(name).endsWith("/");
    const clean = String(name).replace(/\/$/, "");

    return {
      name: clean,
      isDirectory,
      type: isDirectory ? "directory" : "file",
      path: joinPath(basePath, clean)
    };
  });
}

function showExplorerNotice(message, kind = "info") {
  const notice = $("explorerNotice");
  if (!notice) return;

  notice.className = "notice notice-" + kind;
  notice.textContent = message;
}

function setSelected(item, row, additive) {
  const fullPath = item.path;

  selectedItem = item;
  selectedPath = fullPath;

  if (!additive) {
    selectedPaths.clear();
    for (const el of document.querySelectorAll(".file-row")) el.classList.remove("selected");
  }

  if (selectedPaths.has(fullPath) && additive) {
    selectedPaths.delete(fullPath);
    row.classList.remove("selected");
  } else {
    selectedPaths.add(fullPath);
    row.classList.add("selected");
  }

  $("actionPath").value = fullPath;
  updateSelectedCount();
  showPreviewForSelection(item);
}

function showPreviewForSelection(item) {
  $("readablePreview").innerHTML = [
    '<div class="selection-card">',
    '<div class="selection-icon">' + iconFor(item) + "</div>",
    '<div>',
    '<strong>' + safeHtml(item.name) + "</strong>",
    '<span>' + safeHtml(item.path) + "</span>",
    '<em>' + (item.isDirectory ? "Folder selected. Double-click or press Open selected." : "File selected. Press Read or double-click.") + "</em>",
    "</div>",
    "</div>"
  ].join("");
}

function renderItems(got, basePath) {
  const items = fromItemsFallback(got, basePath);
  const list = $("fileList");

  lastItems = items;
  list.innerHTML = "";
  list.classList.toggle("icon-mode", viewMode === "icon");
  list.classList.toggle("list-mode", viewMode === "list");

  selectedPaths.clear();
  selectedItem = null;
  updateSelectedCount();

  if (!items || !items.length) {
    list.innerHTML = '<div class="empty-state"><strong>No files found.</strong><span>This folder may be empty, inaccessible, or filtered.</span></div>';
    return;
  }

  for (const item of items) {
    const fullPath = item.path || joinPath(basePath, item.name);
    item.path = fullPath;

    const row = document.createElement("button");
    row.type = "button";
    row.className = "file-row" + (item.isDirectory ? " dir" : "");
    row.dataset.path = fullPath;

    row.innerHTML = [
      '<span class="file-icon">' + iconFor(item) + "</span>",
      '<span class="file-name" title="' + safeHtml(fullPath) + '">' + safeHtml(item.name) + (item.isDirectory && !String(item.name).endsWith("/") ? "/" : "") + "</span>",
      '<span class="file-action">' + (item.isDirectory ? "open" : "read") + "</span>"
    ].join("");

    row.onclick = e => {
      setSelected(item, row, e.ctrlKey || e.metaKey || e.shiftKey);
    };

    row.ondblclick = async () => {
      selectedItem = item;
      selectedPath = fullPath;
      await openSelected();
    };

    row.querySelector(".file-action").onclick = async e => {
      e.stopPropagation();
      setSelected(item, row, false);
      await openSelected();
    };

    list.appendChild(row);
  }
}

function updateSelectedCount() {
  $("selectedCount").textContent = selectedPaths.size + " selected";
}

async function requireKey() {
  const key = await getActiveApiKey();

  if (!key) {
    const msg = "Create, paste, or select an API key first. File actions are locked until a key is active.";
    showExplorerNotice(msg, "warn");
    $("explorerOut").textContent = msg;
    $("readablePreview").innerHTML = '<div class="empty-state"><strong>API key required.</strong><span>' + safeHtml(msg) + "</span></div>";
    return false;
  }

  showExplorerNotice("API key active. File browser is ready.", "good");
  return true;
}

async function showCommand(opts) {
  const url = buildFsUrl(window.awtsGetTunnelName(), opts);
  const curl = await buildCurl(window.awtsGetTunnelName(), opts);
  $("currentCommandOut").textContent = curl + "\n\nURL:\n" + url;
  $("actionUrlOut").textContent = curl;
}

function showPreview(got) {
  if (!got || got.ok === false) {
    $("readablePreview").innerHTML =
      '<div class="empty-state danger-state"><strong>Request failed.</strong><span>' +
      safeHtml(got?.message || got?.error || "Unknown error") +
      "</span></div>";
    return;
  }

  if (typeof got.content === "string") {
    $("readablePreview").textContent = got.content;
    return;
  }

  if (got.treeText) {
    $("readablePreview").textContent = got.treeText;
    return;
  }

  if (got.items) {
    $("readablePreview").innerHTML =
      '<div class="simple-list">' +
      got.items.map(item => "<div>" + safeHtml(item) + "</div>").join("") +
      "</div>";
    return;
  }

  $("readablePreview").textContent = JSON.stringify(got, null, 2);
}

async function loadList() {
  if (!await requireKey()) return;

  const path = $("explorerPath").value || ".";
  setPath(path);

  const opts = { action: "list", path };
  await showCommand(opts);

  try {
    const got = await callFs(window.awtsGetTunnelName(), opts);
    jsonText("explorerOut", got);
    showPreview(got);
    renderItems(got, path);
  } catch (e) {
    error("loadList failed", e);
    showPreview({ ok: false, error: e.message });
  }
}

async function loadTree() {
  if (!await requireKey()) return;

  const opts = {
    action: "tree",
    path: $("explorerPath").value,
    depth: $("treeDepth").value,
    limit: $("treeLimit").value
  };

  await showCommand(opts);

  const got = await callFs(window.awtsGetTunnelName(), opts);
  jsonText("explorerOut", got);
  showPreview(got);
}

async function readSelected() {
  if (!await requireKey()) return;

  const path = selectedPath || $("explorerPath").value || ".";
  const opts = { action: "read", path };

  await showCommand(opts);

  const got = await callFs(window.awtsGetTunnelName(), opts);
  jsonText("explorerOut", got);
  showPreview(got);
}

async function readSelectedMd() {
  if (!await requireKey()) return;

  const path = selectedPath || $("explorerPath").value || ".";
  const opts = { action: "md", path };

  await showCommand(opts);

  const got = await callFs(window.awtsGetTunnelName(), opts);
  jsonText("explorerOut", got);
  showPreview(got);
}

async function bulkSelected() {
  if (!await requireKey()) return;

  const paths = [...selectedPaths];

  if (!paths.length) {
    showExplorerNotice("Select files first. Ctrl-click or Shift-click multiple files.", "warn");
    return;
  }

  const opts = {
    action: "bulk",
    path: ".",
    paths
  };

  await showCommand(opts);

  const got = await callFs(window.awtsGetTunnelName(), opts);
  jsonText("explorerOut", got);
  showPreview(got);
}

async function openSelected() {
  if (!selectedItem) {
    showExplorerNotice("Select a file or folder first.", "warn");
    return;
  }

  if (selectedItem.isDirectory) {
    setPath(selectedItem.path);
    await loadList();
    return;
  }

  await readSelected();
}

function activateViewer(name) {
  for (const one of document.querySelectorAll("[data-viewer]")) {
    one.classList.toggle("active", one.dataset.viewer === name);
  }

  $("explorerOut").classList.toggle("hidden", name !== "response");
  $("currentCommandOut").classList.toggle("hidden", name !== "command");
  $("readablePreview").classList.toggle("hidden", name !== "preview");
}

export function mountExplorer() {
  log("mountExplorer");

  $("listBtn").onclick = loadList;
  $("treeBtn").onclick = loadTree;
  $("openSelectedBtn").onclick = openSelected;
  $("readBtn").onclick = readSelected;
  $("mdBtn").onclick = readSelectedMd;
  $("bulkSelectedBtn").onclick = bulkSelected;
  $("copySelectedBtn").onclick = async () => navigator.clipboard.writeText([...selectedPaths].join("\n"));

  $("upBtn").onclick = () => {
    setPath(parentPath($("explorerPath").value));
    loadList();
  };

  $("listViewBtn").onclick = () => {
    viewMode = "list";
    $("listViewBtn").classList.add("active");
    $("iconViewBtn").classList.remove("active");
    $("fileList").classList.remove("icon-mode");
  };

  $("iconViewBtn").onclick = () => {
    viewMode = "icon";
    $("iconViewBtn").classList.add("active");
    $("listViewBtn").classList.remove("active");
    $("fileList").classList.add("icon-mode");
  };

  for (const tab of document.querySelectorAll("[data-viewer]")) {
    tab.onclick = () => activateViewer(tab.dataset.viewer);
  }

  $("explorerPath").addEventListener("keydown", e => {
    if (e.key === "Enter") loadList();
  });

  readLocalSetting("lastExplorerPath:" + window.awtsGetTunnelName(), ".").then(path => {
    setPath(path || ".");
  });

  $("fileList").innerHTML = '<div class="empty-state"><strong>Ready.</strong><span>Create/select an API key, then click List.</span></div>';
  activateViewer("preview");
}
