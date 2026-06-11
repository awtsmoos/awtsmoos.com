//B"H
/**
 * @file providerKeyPanel.js
 * @brief Provider setup chamber for the AI cockpit sidebar.
 *
 * Chapter 384: The Installer Scroll Returned From Behind The Button.
 * The Awtsmoos would not let the human hunt through mist. The ChatGPT vessel
 * now shows the complete tunnel page, Windows command, macOS/Linux command,
 * restart meaning, and copy actions in the sidebar itself.
 */

import IndexedDBHandler from "../../IndexedDBHandler.js";

const SETUP = Object.freeze({
  extensionUrl: "https://awtsmoos.com/apps/tunnel-control/",
  windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
  unix: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"
});

const PROVIDERS = Object.freeze({
  gemini: { label: "Gemini", storageKey: "gemini", url: "https://aistudio.google.com/apikey" },
  minimax: { label: "MiniMax", storageKey: "minimax", url: "https://platform.minimaxi.com/" },
  openrouter: { label: "OpenRouter", storageKey: "openrouter", url: "https://openrouter.ai/keys" },
  groq: { label: "Groq", storageKey: "groq", url: "https://console.groq.com/keys" }
});

/**
 * B"H. Mounts the provider setup panel beside the service picker.
 * @returns {void}
 */
export function mountProviderKeyPanel() {
  const selector = document.getElementById("ai-service-select");
  if (!selector || document.getElementById("provider-key-panel")) return;
  const panel = document.createElement("div");
  panel.id = "provider-key-panel";
  panel.className = "provider-key-panel";
  selector.closest(".conversation-list")?.insertBefore(panel, selector.parentElement?.nextSibling || null);
  const db = new IndexedDBHandler("AIAppDB");
  db.init().then(() => refresh(panel, selector.value, db));
  selector.addEventListener("change", () => refresh(panel, selector.value, db));
  panel.addEventListener("click", event => handleClick(event, panel, selector, db));
}

async function handleClick(event, panel, selector, db) {
  const action = event.target?.closest?.("[data-key-action]")?.dataset?.keyAction;
  if (!action) return;
  if (action === "copy-win") return copy(SETUP.windows, panel, "Windows command copied.");
  if (action === "copy-unix") return copy(SETUP.unix, panel, "macOS/Linux command copied.");
  if (action === "copy-url") return copy(SETUP.extensionUrl, panel, "Setup link copied.");
  if (action === "open-setup") return window.open(SETUP.extensionUrl, "_blank", "noopener,noreferrer");
  const provider = PROVIDERS[selector.value];
  if (!provider) return;
  if (action === "open") window.open(provider.url, "_blank", "noopener,noreferrer");
  if (action === "save") await saveKey(panel, provider, db);
  if (action === "clear") await clearKey(provider, db);
  await refresh(panel, selector.value, db);
}

async function refresh(panel, providerId, db) {
  if (providerId === "chatgpt") { panel.hidden = false; panel.innerHTML = chatgptMarkup(); return; }
  const provider = PROVIDERS[providerId];
  panel.hidden = !provider;
  if (!provider) return;
  const key = await db.read("api-keys", provider.storageKey);
  panel.innerHTML = providerMarkup(providerId, Boolean(key));
}

async function saveKey(panel, provider, db) {
  const key = String(panel.querySelector(".provider-key-input")?.value || "").trim();
  if (key) await db.write("api-keys", provider.storageKey, key);
}

async function clearKey(provider, db) { await db.write("api-keys", provider.storageKey, ""); }

async function copy(text, panel, message) {
  await navigator.clipboard?.writeText(text);
  const note = panel.querySelector("[data-setup-note]") || panel.querySelector("small");
  if (note) note.textContent = message;
}

function providerMarkup(providerId, hasKey = false) {
  const provider = PROVIDERS[providerId];
  return `<label>${provider.label} API Key</label>
    <div class="provider-key-row">
      <input class="provider-key-input" type="password" placeholder="${hasKey ? "Saved — paste new key to replace" : "Paste key for " + provider.label}" autocomplete="off">
      <button type="button" data-key-action="save">Save</button>
      <button type="button" data-key-action="open">Get</button>
      <button type="button" data-key-action="clear">Clear</button>
    </div>
    <small>${hasKey ? "Key saved locally in IndexedDB." : "No key saved yet."}</small>`;
}

function chatgptMarkup() {
  return `<section class="chatgpt-bridge-card" aria-label="ChatGPT bridge setup">
    <div class="bridge-card-head"><label>ChatGPT bridge setup</label><button type="button" data-key-action="open-setup">Open setup</button></div>
    <p class="bridge-summary">Use the Awtsmoos Tunnel / Chrome extension / Node relay so /ai can talk to ChatGPT and keep automation alive after tabs close.</p>
    <ol class="bridge-steps">
      <li>Open the setup page or copy the command for your system.</li>
      <li>Run it once to install. Run the same command again to restart and reuse your saved tunnel.</li>
      <li>After OAuth login, reload this /ai page. The transport banner should say the extension, tunnel, or relay is connected.</li>
    </ol>
    ${commandBlock("Windows PowerShell", SETUP.windows, "copy-win")}
    ${commandBlock("macOS / Linux Terminal", SETUP.unix, "copy-unix")}
    <div class="bridge-actions"><button type="button" data-key-action="copy-url">Copy setup link</button><a href="${SETUP.extensionUrl}" target="_blank" rel="noreferrer">awtsmoos.com setup</a></div>
    <small data-setup-note>When relay is active, /ai prefers it for local tools and background automation.</small>
  </section>`;
}

function commandBlock(title, command, action) {
  return `<div class="bridge-command"><b>${title}</b><code>${command}</code><button type="button" data-key-action="${action}">Copy command</button></div>`;
}
