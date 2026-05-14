
// B"H

import { $, jsonText, text } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

let selectedPath = ".";

function normalizePath(path) {
  return (path || ".").replace(/\\/g, "/").replace(/\/+/g, "/") || ".";
}

function joinPath(base, name) {
  base = normalizePath(base);
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

function row(name, fullPath) {
  const div = document.createElement("div");
  const isDir = name.endsWith("/");
  div.className = "file-row" + (isDir ? " dir" : "");
  div.innerHTML = "<span>" + name + "</span><span>" + (isDir ? "open" : "read") + "</span>";
  div.onclick = () => {
    selectedPath = fullPath.replace(/\/$/, "");
    for (const el of document.querySelectorAll(".file-row")) el.classList.remove("selected");
    div.classList.add("selected");

    if (isDir) {
      setPath(selectedPath);
      loadList();
    } else {
      $("actionPath").value = selectedPath;
      readSelected();
    }
  };
  return div;
}

async function loadList() {
  const path = $("explorerPath").value || ".";
  setPath(path);

  const got = await callFs(window.awtsGetTunnelName(), {
    action: "list",
    path
  });

  jsonText("explorerOut", got);

  const list = $("fileList");
  list.innerHTML = "";

  if (!got.items) return;

  for (const item of got.items) {
    list.appendChild(row(item, joinPath(path, item)));
  }
}

async function loadTree() {
  const got = await callFs(window.awtsGetTunnelName(), {
    action: "tree",
    path: $("explorerPath").value,
    depth: $("treeDepth").value,
    limit: $("treeLimit").value
  });

  jsonText("explorerOut", got);
}

async function readSelected() {
  const path = selectedPath || $("explorerPath").value || ".";

  const got = await callFs(window.awtsGetTunnelName(), {
    action: "read",
    path
  });

  jsonText("explorerOut", got);
}

async function readSelectedMd() {
  const path = selectedPath || $("explorerPath").value || ".";

  const got = await callFs(window.awtsGetTunnelName(), {
    action: "md",
    path
  });

  jsonText("explorerOut", got);
}

export function mountExplorer() {
  $("listBtn").onclick = loadList;
  $("treeBtn").onclick = loadTree;
  $("readBtn").onclick = readSelected;
  $("mdBtn").onclick = readSelectedMd;
  $("upBtn").onclick = () => {
    setPath(parentPath($("explorerPath").value));
    loadList();
  };

  $("explorerPath").addEventListener("keydown", e => {
    if (e.key === "Enter") loadList();
  });

  setPath($("explorerPath").value || ".");
  text("fileList", "Click List to load files.");
}
