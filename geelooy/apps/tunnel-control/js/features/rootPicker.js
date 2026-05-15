
// B"H

import { $, jsonText } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";
import { loadConfig } from "./config.js";
import { renderAbsoluteCrumbs } from "./pathCrumbs.js";
import { log, error } from "../logger.js";

let selectedRootPath = "";
let currentRootPath = "__ROOTS__";
let selectedRowPath = "";

/**
 * B"H
 * Escapes text for safe innerHTML.
 *
 * @param {unknown} value Value.
 * @returns {string} Safe HTML.
 */
function safeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&quot;");
}

/**
 * B"H
 * Gets an element by id.
 *
 * @param {string} id Element id.
 * @returns {HTMLElement|null} Element.
 */
function get(id) {
  return document.getElementById(id);
}

/**
 * B"H
 * Creates one modal button.
 *
 * @param {string} id Button id.
 * @param {string} text Button text.
 * @returns {HTMLButtonElement} Button.
 */
function modalButton(id, text) {
  const button = document.createElement("button");
  button.id = id;
  button.type = "button";
  button.textContent = text;
  return button;
}

/**
 * B"H
 * Ensures the modal exists even after the shell rebuilds the body.
 *
 * @returns {HTMLElement} Modal.
 */
function ensureModal() {
  let modal = get("rootPickerModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "rootPickerModal";
  modal.className = "awt-modal hidden";

  modal.innerHTML = `
    <div id="rootPickerBackdrop" class="awt-modal-backdrop"></div>
    <section class="awt-modal-card" role="dialog" aria-modal="true" aria-label="Choose root folder">
      <header class="awt-modal-head">
        <div>
          <div class="awt-pane-kicker">ROOT PICKER</div>
          <h2>Choose local root folder</h2>
          <p>Browse folders through the connected local agent. Pick a folder, then save config.</p>
        </div>
        <button id="closeRootPickerBtn" type="button">Close</button>
      </header>

      <div class="awt-root-tools">
        <input id="rootPickerPath" value="__ROOTS__" />
        <button id="rootPickerRootsBtn" type="button">Show drives / roots</button>
        <button id="rootPickerUpBtn" type="button">Up</button>
        <button id="rootPickerGoBtn" type="button">Go</button>
        <button id="rootPickerSelectBtn" type="button">Use selected folder</button>
      </div>

      <div id="rootPickerLocation" class="awt-root-crumbs"></div>
      <div id="rootPickerNice" class="awt-feedback-panel">Ready. Click “Show drives / roots” or browse the current path.</div>
      <div id="rootPickerSelected" class="awt-feedback-panel subtle">None selected.</div>
      <div id="rootPickerList" class="awt-root-list"></div>

      <details class="awt-raw-details">
        <summary>Raw root picker response</summary>
        <pre id="rootPickerOut"></pre>
      </details>
    </section>
  `;

  document.body.appendChild(modal);
  return modal;
}

/**
 * B"H
 * Opens modal.
 *
 * @returns {void}
 */
function openModal() {
  ensureModal().classList.remove("hidden");
  document.body.classList.add("modal-open");
}

/**
 * B"H
 * Closes modal.
 *
 * @returns {void}
 */
function closeModal() {
  const modal = get("rootPickerModal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

/**
 * B"H
 * Sets current browsing path.
 *
 * @param {string} path Path.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function setCurrent(path, getTunnelName) {
  currentRootPath = path || "__ROOTS__";

  if (get("rootPickerPath")) get("rootPickerPath").value = currentRootPath;

  const crumb = get("rootPickerLocation");
  if (crumb) {
    renderAbsoluteCrumbs(crumb, currentRootPath, picked => {
      browse(picked, getTunnelName);
    });
  }
}

/**
 * B"H
 * Sets selected folder.
 *
 * @param {string} path Selected path.
 * @returns {void}
 */
function setSelected(path) {
  selectedRootPath = path || "";

  if (get("rootPickerSelected")) {
    get("rootPickerSelected").textContent = selectedRootPath
      ? "Selected: " + selectedRootPath
      : "None selected.";
  }
}

/**
 * B"H
 * Shows friendly picker feedback.
 *
 * @param {object} got Response.
 * @returns {void}
 */
function friendly(got) {
  const box = get("rootPickerNice");
  if (!box) return;

  if (!got || got.ok === false) {
    box.textContent = got?.error || got?.message || "Could not browse folder.";
    box.classList.add("danger");
    return;
  }

  box.classList.remove("danger");
  box.textContent = "Showing " + (got.items || []).length + " folders in " + (got.current || currentRootPath);
}

/**
 * B"H
 * Selects a row.
 *
 * @param {HTMLElement} row Row.
 * @param {object} item Item.
 * @returns {void}
 */
function selectRow(row, item) {
  selectedRowPath = item.absolutePath || item.path || "";
  setSelected(selectedRowPath);

  for (const el of document.querySelectorAll(".root-row")) {
    el.classList.remove("selected");
  }

  row.classList.add("selected");
}

/**
 * B"H
 * Renders rows.
 *
 * @param {object} got Browse response.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function renderRows(got, getTunnelName) {
  const list = get("rootPickerList");
  if (!list) return;

  list.innerHTML = "";

  if (!got || got.ok === false) {
    list.innerHTML = `<div class="awt-empty-dashboard">Could not browse. ${safeHtml(got?.error || "Unknown error")}</div>`;
    return;
  }

  const items = got.items || [];

  if (!items.length) {
    list.innerHTML = `<div class="awt-empty-dashboard">No folders here. Try going up or choosing another root.</div>`;
    return;
  }

  for (const item of items) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "root-row";
    row.innerHTML = `
      <span class="root-row-icon">📁</span>
      <span class="root-row-name">${safeHtml(item.name || item.path || item.absolutePath)}</span>
      <span class="root-row-action">Open</span>
    `;

    row.onclick = () => selectRow(row, item);

    row.ondblclick = async () => {
      selectRow(row, item);
      await browse(item.absolutePath || item.path, getTunnelName);
    };

    row.querySelector(".root-row-action").onclick = async event => {
      event.stopPropagation();
      selectRow(row, item);
      await browse(item.absolutePath || item.path, getTunnelName);
    };

    list.appendChild(row);
  }
}

/**
 * B"H
 * Browses a root path.
 *
 * @param {string} path Path.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Done.
 */
async function browse(path, getTunnelName) {
  ensureModal();

  try {
    setCurrent(path || "__ROOTS__", getTunnelName);

    if (get("rootPickerNice")) {
      get("rootPickerNice").textContent = "Browsing " + currentRootPath + "...";
      get("rootPickerNice").classList.remove("danger");
    }

    const got = await callFs(getTunnelName(), {
      action: "rootBrowse",
      absolutePath: currentRootPath
    });

    if (get("rootPickerOut")) jsonText("rootPickerOut", got);

    friendly(got);

    if (got.current) setCurrent(got.current, getTunnelName);

    renderRows(got, getTunnelName);
  } catch (e) {
    error("root browse failed", e);

    if (get("rootPickerNice")) {
      get("rootPickerNice").textContent = e.message || String(e);
      get("rootPickerNice").classList.add("danger");
    }
  }
}

/**
 * B"H
 * Selects root into config.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<void>} Done.
 */
async function selectRoot(getTunnelName) {
  const target = selectedRootPath || currentRootPath;

  if (!target || target === "__ROOTS__") {
    if (get("rootPickerNice")) get("rootPickerNice").textContent = "Select a folder first.";
    return;
  }

  const got = await callFs(getTunnelName(), {
    action: "rootSelect",
    absolutePath: target
  });

  if (get("rootPickerOut")) jsonText("rootPickerOut", got);
  friendly(got);

  if (got.ok && got.config?.root) {
    if (get("rootPath")) get("rootPath").value = got.config.root;
    if (get("explorerPath")) get("explorerPath").value = ".";

    closeModal();

    try {
      await loadConfig(getTunnelName);
    } catch (e) {}
  }
}

/**
 * B"H
 * Wires root picker controls.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
export function mountRootPicker(getTunnelName) {
  log("mountRootPicker");

  if (!get("chooseRootBtn")) return;

  get("chooseRootBtn").onclick = async () => {
    log("open root picker clicked");
    ensureModal();
    wireModalButtons(getTunnelName);
    openModal();
    await browse(get("rootPath")?.value || "__ROOTS__", getTunnelName);
  };
}

/**
 * B"H
 * Wires modal buttons after modal creation.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function wireModalButtons(getTunnelName) {
  if (get("rootPickerModal")?.dataset.bound === "1") return;

  get("rootPickerModal").dataset.bound = "1";

  get("closeRootPickerBtn").onclick = closeModal;
  get("rootPickerBackdrop").onclick = closeModal;
  get("rootPickerRootsBtn").onclick = () => browse("__ROOTS__", getTunnelName);
  get("rootPickerGoBtn").onclick = () => browse(get("rootPickerPath")?.value, getTunnelName);

  get("rootPickerUpBtn").onclick = async () => {
    const got = await callFs(getTunnelName(), {
      action: "rootBrowse",
      absolutePath: currentRootPath
    });

    await browse(got.parent || "__ROOTS__", getTunnelName);
  };

  get("rootPickerSelectBtn").onclick = () => selectRoot(getTunnelName);

  get("rootPickerPath").addEventListener("keydown", event => {
    if (event.key === "Enter") browse(get("rootPickerPath").value, getTunnelName);
  });
}
