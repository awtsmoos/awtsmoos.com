//B"H
import { preservePanelScroll } from "./scrollAnchor.js";
import { readEventPayload } from "./eventPayloadVault.js";
import { renderEventBody } from "../eventBody.js";

/**
 * B"H
 * Chapter 178: The Tool Card Opened Its Own Window In The Night.
 *
 * Fullscreen is no longer a fragile in-page overlay that can hide beneath rails,
 * scroll masks, and nested details. A click opens a unique pop-out document,
 * hydrates the vaulted payload there, and leaves the chat river undisturbed.
 */
export function installPanelChrome(root) {
  if (!root || root.__awtsmoosPanelChrome) return;
  root.__awtsmoosPanelChrome = true;
  root.addEventListener("click", event => handlePanelClick(event));
  root.addEventListener("toggle", event => {
    const panel = event.target?.closest?.(".transport-details, .thought-envelope-card");
    if (panel) syncPanelChrome(panel);
  }, true);
  installEscapeHandler();
  root.querySelectorAll(".transport-details, .thought-envelope-card").forEach(syncPanelChrome);
}

function handlePanelClick(event) {
  const button = event.target?.closest?.("[data-panel-action]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const panel = button.closest(".transport-details, .thought-envelope-card");
  if (!panel) return;
  if (button.dataset.panelAction === "fullscreen") return popOutPanel(panel);
  preservePanelScroll(panel, () => actions[button.dataset.panelAction]?.(panel));
  syncPanelChrome(panel);
}

const actions = {
  minimize(panel) {
    panel.open = false;
    panel.classList.remove("is-maximized", "is-fullscreen");
    unlockFullscreenBody();
  },
  maximize(panel) {
    panel.open = true;
    panel.classList.toggle("is-maximized");
    panel.classList.remove("is-fullscreen");
    unlockFullscreenBody();
  }
};

async function popOutPanel(panel) {
  const popup = window.open("", `_awtsmoos_event_${Date.now()}`, "popup=yes,width=1120,height=820,noopener=no,noreferrer=no");
  if (!popup) return fallbackFullscreen(panel);
  const title = panel.querySelector("summary")?.textContent?.replace(/\s+/g, " ").trim() || "Awtsmoos event";
  popup.document.open();
  popup.document.write(popoutShell(title, `<div class="loading">Loading vaulted payload…</div>`));
  popup.document.close();
  const body = await popoutBody(panel);
  popup.document.body.innerHTML = `<header><b>B"H</b><span>${escapeHtml(title)}</span></header><main>${body}</main>`;
}

function fallbackFullscreen(panel) {
  preservePanelScroll(panel, () => {
    panel.open = true;
    panel.classList.toggle("is-fullscreen");
    panel.classList.remove("is-maximized");
    document.body.classList.toggle("has-event-fullscreen", panel.classList.contains("is-fullscreen"));
  });
  syncPanelChrome(panel);
}

async function popoutBody(panel) {
  if (panel.matches(".transport-details[data-event-payload-key]")) {
    const payload = await readEventPayload(panel.dataset.eventPayloadKey);
    return `<section class="card">${safeSummary(panel)}${renderEventBody(payload || {}, { rawKey: "popout::raw" })}</section>`;
  }
  const clone = panel.cloneNode(true);
  clone.querySelectorAll(".event-panel-actions").forEach(node => node.remove());
  clone.open = true;
  return `<section class="card">${clone.outerHTML}</section>`;
}

function safeSummary(panel) {
  const clone = panel.querySelector(":scope > summary")?.cloneNode(true);
  if (!clone) return "";
  clone.querySelectorAll(".event-panel-actions").forEach(node => node.remove());
  return `<h1>${escapeHtml(clone.textContent.replace(/\s+/g, " ").trim())}</h1>`;
}

function syncPanelChrome(panel) {
  if (!panel) return;
  const minimized = !panel.open;
  const maximized = panel.classList.contains("is-maximized");
  panel.dataset.panelState = maximized ? "maximized" : minimized ? "minimized" : "normal";
  syncButton(panel, "minimize", minimized ? "Restore" : "Minimize", minimized ? "+" : "−", minimized);
  syncButton(panel, "maximize", maximized ? "Normal size" : "Maximize", maximized ? "▢" : "□", maximized);
  syncButton(panel, "fullscreen", "Open in pop-out window", "↗", false);
}

function syncButton(panel, action, title, text, pressed) {
  const button = panel.querySelector(`[data-panel-action="${action}"]`);
  if (!button) return;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.setAttribute("aria-pressed", String(Boolean(pressed)));
  button.textContent = text;
}

let escapeInstalled = false;
function installEscapeHandler() {
  if (escapeInstalled) return;
  escapeInstalled = true;
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const fullscreen = document.querySelector(".transport-details.is-fullscreen, .thought-envelope-card.is-fullscreen");
    if (!fullscreen) return;
    preservePanelScroll(fullscreen, () => fullscreen.classList.remove("is-fullscreen"));
    syncPanelChrome(fullscreen);
    unlockFullscreenBody();
  });
}

function popoutShell(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${popoutCss()}</style></head><body>${body}</body></html>`;
}
function popoutCss() { return `body{margin:0;background:#020617;color:#dff8ff;font:15px/1.55 system-ui,Segoe UI,sans-serif}header{position:sticky;top:0;display:flex;gap:12px;align-items:center;padding:14px 18px;background:linear-gradient(135deg,#082f49,#020617);border-bottom:1px solid rgba(125,211,252,.25)}header b{color:#67e8f9}main{padding:18px}.card{border:1px solid rgba(125,211,252,.22);border-radius:22px;background:rgba(8,20,38,.88);box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}h1{font-size:1.05rem;padding:16px 18px;margin:0;border-bottom:1px solid rgba(125,211,252,.16)}details{margin:12px;border:1px solid rgba(125,211,252,.18);border-radius:16px;background:rgba(2,6,23,.52);overflow:hidden}summary{padding:12px;cursor:pointer;color:#bae6fd;font-weight:900}pre{overflow:auto;max-height:none;padding:14px;background:#020617;border-radius:14px;color:#e0f2fe}.event-field{display:grid;grid-template-columns:minmax(120px,220px) minmax(0,1fr);gap:10px;padding:10px;border-top:1px solid rgba(148,163,184,.12)}.event-field>b{color:#7dd3fc;overflow-wrap:anywhere}a{color:#67e8f9}.loading{padding:28px}`; }
function unlockFullscreenBody() { if (!document.querySelector(".transport-details.is-fullscreen, .thought-envelope-card.is-fullscreen")) document.body.classList.remove("has-event-fullscreen"); }
function escapeHtml(value = "") { return String(value).replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
