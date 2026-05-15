
// B"H

import { $, el, jsonText, replaceChildren, text } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { loadConfig } from "./config.js";
import { renderAbsoluteCrumbs } from "./pathCrumbs.js";
import { log, error } from "../logger.js";

let selectedRootPath = "";
let currentRootPath = "__ROOTS__";
let selectedRowPath = "";
let lastBrowsePayload = null;

/**
 * B"H
 * Lists the required root picker ids.
 *
 * Each id is a vessel. If even one vessel is missing, the old code crashed
 * into silence. This list lets the feature diagnose itself with clarity.
 *
 * @returns {string[]} Required ids.
 */
function requiredIds() {
  return [
    "chooseRootBtn",
    "rootPickerModal",
    "closeRootPickerBtn",
    "rootPickerBackdrop",
    "rootPickerRootsBtn",
    "rootPickerGoBtn",
    "rootPickerUpBtn",
    "rootPickerSelectBtn",
    "rootPickerPath",
    "rootPickerLocation",
    "rootPickerList",
    "rootPickerNice",
    "rootPickerSelected",
    "rootPickerOut"
  ];
}

/**
 * B"H
 * Checks if the picker can mount.
 *
 * @returns {boolean} True when all required nodes exist.
 */
function canMount() {
  const missing = requiredIds().filter(id => !$(id));
  if (!missing.length) return true;
  console.error("[AwtsmoosTunnelControl] Root picker missing ids:", missing);
  return false;
}

/**
 * B"H
 * Adds the professional layout classes to existing markup.
 *
 * The HTML can remain old and simple. The JS blesses it with the grid names
 * that the new CSS understands.
 *
 * @returns {void}
 */
function normalizePickerMarkup() {
  const modal = $("rootPickerModal");
  if (!modal) return;

  const dialog =
    modal.querySelector(".root-picker-dialog") ||
    modal.querySelector(".modal-dialog") ||
    modal.querySelector(".dialog") ||
    Array.from(modal.children).find(child => child !== $("rootPickerBackdrop"));

  if (dialog) dialog.classList.add("root-picker-dialog");

  const list = $("rootPickerList");
  if (list) list.classList.add("root-picker-list");

  const out = $("rootPickerOut");
  if (out) {
    out.classList.add("compact");
    const details = out.closest("details");
    if (details) details.classList.add("root-picker-raw");
  }
}

/**
 * B"H
 * Opens the modal safely.
 *
 * @returns {boolean} True when opened.
 */
function openModal() {
  const modal = $("rootPickerModal");
  if (!modal) {
    console.error("[AwtsmoosTunnelControl] Cannot open root picker. Missing #rootPickerModal");
    return false;
  }
  modal.classList.remove("hidden");
  modal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  return true;
}

/**
 * B"H
 * Closes the modal safely.
 *
 * @returns {void}
 */
function closeModal() {
  const modal = $("rootPickerModal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

/**
 * B"H
 * Sets the current browse path and breadcrumb.
 *
 * @param {string} path Absolute path or __ROOTS__.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function setCurrent(path, getTunnelName) {
  currentRootPath = path || "__ROOTS__";

  const pathInput = $("rootPickerPath");
  if (pathInput) pathInput.value = currentRootPath;

  const crumbHost = $("rootPickerLocation");
  if (crumbHost) {
    renderAbsoluteCrumbs(crumbHost, currentRootPath, picked => {
      browse(picked, getTunnelName);
    });
  }
}

/**
 * B"H
 * Sets the selected root display.
 *
 * @param {string} path Absolute path.
 * @returns {void}
 */
function setSelected(path) {
  selectedRootPath = path || "";
  text("rootPickerSelected", selectedRootPath || "None selected.");
}

/**
 * B"H
 * Writes a friendly browse status.
 *
 * @param {object} got Browse response.
 * @returns {void}
 */
function friendly(got) {
  if (!got || !got.ok) {
    text("rootPickerNice", got?.message || got?.error || "Could not browse folder.");
    return;
  }

  const count = Array.isArray(got.items) ? got.items.length : 0;
  const current = got.current || currentRootPath;
  text("rootPickerNice", "Showing " + count + " folders in " + current);
}

/**
 * B"H
 * Clears selected row styles.
 *
 * @returns {void}
 */
function clearRowSelection() {
  for (const node of document.querySelectorAll(".root-row.selected")) {
    node.classList.remove("selected");
  }
}

/**
 * B"H
 * Selects one row and records its absolute path.
 *
 * @param {HTMLElement} row Row element.
 * @param {object} item Browse item.
 * @returns {void}
 */
function selectRow(row, item) {
  selectedRowPath = item.absolutePath || "";
  setSelected(selectedRowPath);
  clearRowSelection();
  row.classList.add("selected");
}

/**
 * B"H
 * Creates a folder row.
 *
 * @param {object} item Folder item.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {HTMLButtonElement} Row button.
 */
function makeRow(item, getTunnelName) {
  const name = item.name || item.absolutePath || "Folder";
  const path = item.absolutePath || "";

  const action = el("button", {
    type: "button",
    className: "root-row-action btn-sm",
    text: "Open",
    on: {
      click: async event => {
        event.stopPropagation();
        selectRow(row, item);
        await browse(path, getTunnelName);
      }
    }
  });

  const row = el("button", {
    type: "button",
    className: "root-row",
    attrs: {
      title: path,
      "aria-label": "Select folder " + name
    },
    children: [
      el("span", { className: "root-row-icon", text: "📁" }),
      el("span", {
        className: "root-row-copy",
        children: [
          el("span", { className: "root-row-name", text: name }),
          el("span", { className: "root-row-path", text: path })
        ]
      }),
      action
    ],
    on: {
      click: () => selectRow(row, item),
      dblclick: async () => {
        selectRow(row, item);
        await browse(path, getTunnelName);
      }
    }
  });

  return row;
}

/**
 * B"H
 * Renders folder rows.
 *
 * @param {object} got Browse response.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function renderRows(got, getTunnelName) {
  const list = $("rootPickerList");
  if (!list) return;

  if (!got || !got.ok) {
    replaceChildren(list, [
      el("div", {
        className: "root-picker-empty",
        text: got?.message || got?.error || "Could not browse this folder."
      })
    ]);
    return;
  }

  const items = Array.isArray(got.items) ? got.items : [];
  if (!items.length) {
    replaceChildren(list, [
      el("div", {
        className: "root-picker-empty",
        text: "No folders here. Go up, choose drives, or type another path."
      })
    ]);
    return;
  }

  replaceChildren(list, items.map(item => makeRow(item, getTunnelName)));
}

/**
 * B"H
 * Browses the local filesystem through the connected agent.
 *
 * @param {string} path Absolute path or __ROOTS__.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Resolves after render.
 */
async function browse(path, getTunnelName) {
  try {
    setCurrent(path || "__ROOTS__", getTunnelName);
    text("rootPickerNice", "Loading folders from local agent...");
    const got = await callFs(getTunnelName(), {
      action: "rootBrowse",
      absolutePath: currentRootPath
    });

    lastBrowsePayload = got;
    jsonText("rootPickerOut", got);
    friendly(got);

    if (got?.current) {
      setCurrent(got.current, getTunnelName);
    }

    renderRows(got, getTunnelName);
  } catch (e) {
    error("root browse failed", e);
    text("rootPickerNice", e.message || String(e));
    jsonText("rootPickerOut", {
      BH: "B\"H",
      ok: false,
      error: "root_browse_failed",
      message: e.message || String(e)
    });
  }
}

/**
 * B"H
 * Selects the current highlighted folder as the agent root.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Resolves after config refresh.
 */
async function selectRoot(getTunnelName) {
  const target = selectedRootPath || selectedRowPath || currentRootPath;

  if (!target || target === "__ROOTS__") {
    text("rootPickerNice", "Select a real folder first.");
    return;
  }

  text("rootPickerNice", "Saving root folder...");
  const got = await callFs(getTunnelName(), {
    action: "rootSelect",
    absolutePath: target
  });

  jsonText("rootPickerOut", got);
  friendly(got);

  if (got?.ok && got.config?.root) {
    const rootPath = $("rootPath");
    const explorerPath = $("explorerPath");
    if (rootPath) rootPath.value = got.config.root;
    if (explorerPath) explorerPath.value = ".";
    closeModal();

    try {
      await loadConfig(getTunnelName);
    } catch (e) {
      error("load config after root select failed", e);
    }
  }
}

/**
 * B"H
 * Opens the parent folder.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Resolves after browse.
 */
async function goUp(getTunnelName) {
  const parent = lastBrowsePayload?.parent;
  if (parent) {
    await browse(parent, getTunnelName);
    return;
  }

  const got = await callFs(getTunnelName(), {
    action: "rootBrowse",
    absolutePath: currentRootPath
  });

  await browse(got?.parent || "__ROOTS__", getTunnelName);
}

/**
 * B"H
 * Mounts the root picker.
 *
 * @param {Function} getTunnelName Tunnel name reader.
 * @returns {void}
 */
export function mountRootPicker(getTunnelName) {
  log("mountRootPicker");
  if (!canMount()) return;

  normalizePickerMarkup();

  $("chooseRootBtn").onclick = async () => {
    log("open root picker clicked");
    if (!openModal()) return;
    await browse($("rootPath")?.value || "__ROOTS__", getTunnelName);
  };

  $("closeRootPickerBtn").onclick = closeModal;
  $("rootPickerBackdrop").onclick = closeModal;
  $("rootPickerRootsBtn").onclick = () => browse("__ROOTS__", getTunnelName);
  $("rootPickerGoBtn").onclick = () => browse($("rootPickerPath")?.value || "__ROOTS__", getTunnelName);
  $("rootPickerUpBtn").onclick = () => goUp(getTunnelName);
  $("rootPickerSelectBtn").onclick = () => selectRoot(getTunnelName);

  $("rootPickerPath").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      browse($("rootPickerPath")?.value || "__ROOTS__", getTunnelName);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("rootPickerModal")?.classList.contains("hidden")) {
      closeModal();
    }
  });
}
