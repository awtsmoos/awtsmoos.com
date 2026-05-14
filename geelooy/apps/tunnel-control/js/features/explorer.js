
// B"H

import { $, jsonText, text } from "../lib/dom.js";
import { callFs, buildFsUrl } from "../api/tunnel.js";

let selectedPath = ".";
let selectedPaths = new Set();
let viewMode = "list";

function normalizePath(path) {
  return (path || ".").replace(/\\/g, "/").replace(/\/+/g, "/") || ".";
}

function joinPath(base, name) {
  base = normalizePath(base);
  name = name.replace(/\/$/, "");

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
  $("crumb").textContent = next;
  selectedPath = next;
}

function iconFor(item) {
  if (item.isDirectory || item.type === "directory") return "📁";
  if (/\.(js|mjs|cjs|ts|jsx|tsx)$/i.test(item.name)) return "🟨";
  if (/\.(html|css)$/i.test(item.name)) return "🎨";
  if (/\.(json)$/i.test(item.name)) return "🧾";
  if (/\.(md|txt)$/i.test(item.name)) return "📄";
  return "📦";
}

function renderItems(items, basePath) {
  const list = $("fileList");
  list.innerHTML = "";
  list.classList.toggle("icon-mode", viewMode === "icon");
  list.classList.toggle("list-mode", viewMode === "list");

  if (!items || !items.length) {
    text("fileList", "No files.");
    return;
  }

  for (const item of items) {
    const fullPath = item.path || joinPath(basePath, item.name);
    const row = document.createElement("div");
    row.className = "file-row" + (item.isDirectory ? " dir" : "");
    row.dataset.path = fullPath;

    row.innerHTML = [
      '<span class="file-icon">' + iconFor(item) + "</span>",
      "<span>" + item.name + (item.isDirectory && !item.name.endsWith("/") ? "/" : "") + "</span>",
      "<span>" + (item.isDirectory ? "open" : "select") + "</span>"
    ].join("");

    row.onclick = async e => {
      selectedPath = fullPath;

      if (e.ctrlKey || e.metaKey) {
        if (selectedPaths.has(fullPath)) selectedPaths.delete(fullPath);
        else selectedPaths.add(fullPath);
        row.classList.toggle("selected", selectedPaths.has(fullPath));
        updateSelectedCount();
        return;
      }

      selectedPaths.clear();
      selectedPaths.add(fullPath);

      for (const el of document.querySelectorAll(".file-row")) el.classList.remove("selected");
      row.classList.add("selected");
      updateSelectedCount();

      $("actionPath").value = fullPath;

      if (item.isDirectory) {
        setPath(fullPath);
        await loadList();
      } else {
        await readSelected();
      }
    };

    list.appendChild(row);
  }
}

function updateSelectedCount() {
  const count = selectedPaths.size;
  $("crumb").textContent = normalizePath($("explorerPath").value) + " • selected " + count;
}

function showCommand(getTunnelName, opts) {
  const url = buildFsUrl(getTunnelName(), opts);
  $("currentCommandOut").textContent = url;
  $("actionUrlOut").textContent = url;
}

async function loadList() {
  const path = $("explorerPath").value || ".";
  setPath(path);

  const opts = { action: "list", path };
  showCommand(window.awtsGetTunnelName, opts);

  const got = await callFs(window.awtsGetTunnelName(), opts);
  jsonText("explorerOut", got);
  renderItems(got.detailedItems || null, path);
}

async function loadTree() {
  const opts = {
    action: "tree",
    path: $("explorerPath").value,
    depth: $("treeDepth").value,
    limit: $("treeLimit").value
  };

  showCommand(window.awtsGetTunnelName, opts);
  jsonText("explorerOut", await callFs(window.awtsGetTunnelName(), opts));
}

async function readSelected() {
  const path = selectedPath || $("explorerPath").value || ".";
  const opts = { action: "read", path };

  showCommand(window.awtsGetTunnelName, opts);
  jsonText("explorerOut", await callFs(window.awtsGetTunnelName(), opts));
}

async function readSelectedMd() {
  const path = selectedPath || $("explorerPath").value || ".";
  const opts = { action: "md", path };

  showCommand(window.awtsGetTunnelName, opts);
  jsonText("explorerOut", await callFs(window.awtsGetTunnelName(), opts));
}

async function bulkSelected() {
  const paths = [...selectedPaths];

  const opts = {
    action: "bulk",
    path: ".",
    paths
  };

  showCommand(window.awtsGetTunnelName, opts);
  jsonText("explorerOut", await callFs(window.awtsGetTunnelName(), opts));
}

export function mountExplorer() {
  $("listBtn").onclick = loadList;
  $("treeBtn").onclick = loadTree;
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
    tab.onclick = () => {
      for (const one of document.querySelectorAll("[data-viewer]")) one.classList.remove("active");
      tab.classList.add("active");
      $("explorerOut").classList.toggle("hidden", tab.dataset.viewer !== "response");
      $("currentCommandOut").classList.toggle("hidden", tab.dataset.viewer !== "command");
    };
  }

  $("explorerPath").addEventListener("keydown", e => {
    if (e.key === "Enter") loadList();
  });

  setPath($("explorerPath").value || ".");
  text("fileList", "Click List to load files.");
}
