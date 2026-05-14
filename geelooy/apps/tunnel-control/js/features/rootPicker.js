
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { loadConfig } from "./config.js";
import { log, error } from "../logger.js";

let selectedRootPath = "";
let currentRootPath = "__ROOTS__";

function exists(id) {
  const el = $(id);
  if (!el) {
    console.error("[AwtsmoosTunnelControl] Missing element #" + id);
    return false;
  }
  return true;
}

function openModal() {
  $("rootPickerModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal() {
  $("rootPickerModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function setCurrent(path) {
  currentRootPath = path || "__ROOTS__";
  $("rootPickerPath").value = currentRootPath;
  $("rootPickerLocation").textContent = currentRootPath;
}

function setSelected(path) {
  selectedRootPath = path || "";
  $("rootPickerSelected").textContent = selectedRootPath || "None selected.";
}

function friendly(got) {
  if (!got.ok) {
    $("rootPickerNice").textContent = got.error || "Could not browse folder.";
    return;
  }

  $("rootPickerNice").textContent = "Showing " + (got.items || []).length + " folders in " + got.current;
}

function renderRows(got, getTunnelName) {
  const list = $("rootPickerList");
  list.innerHTML = "";

  if (!got.ok) {
    list.textContent = got.error || "Could not browse this folder.";
    return;
  }

  const items = got.items || [];

  if (!items.length) {
    list.textContent = "No folders here.";
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "root-row";
    row.innerHTML = [
      '<span class="root-row-icon">📁</span>',
      '<span class="root-row-name" title="' + item.absolutePath + '">' + item.name + '</span>',
      '<span>open</span>'
    ].join("");

    row.onclick = async e => {
      setSelected(item.absolutePath);

      for (const el of document.querySelectorAll(".root-row")) {
        el.classList.remove("selected");
      }

      row.classList.add("selected");

      if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
        await browse(item.absolutePath, getTunnelName);
      }
    };

    list.appendChild(row);
  }
}

async function browse(path, getTunnelName) {
  try {
    setCurrent(path || "__ROOTS__");

    const got = await callFs(getTunnelName(), {
      action: "rootBrowse",
      absolutePath: currentRootPath
    });

    jsonText("rootPickerOut", got);
    friendly(got);

    if (got.current) setCurrent(got.current);

    renderRows(got, getTunnelName);
  } catch (e) {
    error("root browse failed", e);
    $("rootPickerNice").textContent = e.message;
  }
}

async function selectRoot(getTunnelName) {
  const target = selectedRootPath || currentRootPath;

  if (!target || target === "__ROOTS__") {
    $("rootPickerNice").textContent = "Select a folder first.";
    return;
  }

  const got = await callFs(getTunnelName(), {
    action: "rootSelect",
    absolutePath: target
  });

  jsonText("rootPickerOut", got);
  friendly(got);

  if (got.ok && got.config?.root) {
    $("rootPath").value = got.config.root;
    $("explorerPath").value = ".";
    closeModal();

    try {
      await loadConfig(getTunnelName);
    } catch (e) {}
  }
}

export function mountRootPicker(getTunnelName) {
  log("mountRootPicker");

  const needed = [
    "chooseRootBtn",
    "rootPickerModal",
    "closeRootPickerBtn",
    "rootPickerBackdrop",
    "rootPickerRootsBtn",
    "rootPickerGoBtn",
    "rootPickerUpBtn",
    "rootPickerSelectBtn",
    "rootPickerPath"
  ];

  if (!needed.every(exists)) return;

  $("chooseRootBtn").onclick = async () => {
    log("open root picker clicked");
    openModal();
    await browse($("rootPath").value || "__ROOTS__", getTunnelName);
  };

  $("closeRootPickerBtn").onclick = closeModal;
  $("rootPickerBackdrop").onclick = closeModal;
  $("rootPickerRootsBtn").onclick = () => browse("__ROOTS__", getTunnelName);
  $("rootPickerGoBtn").onclick = () => browse($("rootPickerPath").value, getTunnelName);

  $("rootPickerUpBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), {
      action: "rootBrowse",
      absolutePath: currentRootPath
    });

    await browse(got.parent || "__ROOTS__", getTunnelName);
  };

  $("rootPickerSelectBtn").onclick = () => selectRoot(getTunnelName);

  $("rootPickerPath").addEventListener("keydown", e => {
    if (e.key === "Enter") browse($("rootPickerPath").value, getTunnelName);
  });
}
