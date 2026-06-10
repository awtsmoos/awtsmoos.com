//B"H
/**
 * @file providerKeyPanel.js
 * @brief Provider setup chamber for the AI cockpit sidebar.
 *
 * Chapter 3: The Awtsmoos no longer lets every provider knock on the same
 * wrong gate. ChatGPT receives bridge/install guidance; API providers receive
 * local IndexedDB key controls with clear save/get/clear actions.
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

/** B"H. Mounts the provider setup panel beside the service picker. */
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
  const action = event.target?.dataset?.keyAction;
  if (!action) return;
  if (action === "copy-win") return copy(SETUP.windows, panel);
  if (action === "copy-unix") return copy(SETUP.unix, panel);
  const provider = PROVIDERS[selector.value];
  if (!provider) return;
  if (action === "open") window.open(provider.url, "_blank", "noopener,noreferrer");
  if (action === "save") await saveKey(panel, provider, db);
  if (action === "clear") await clearKey(provider, db);
  await refresh(panel, selector.value, db);
}

async function refresh(panel, providerId, db) {
  if (providerId === "chatgpt") {
    panel.hidden = false;
    panel.innerHTML = chatgptMarkup();
    return;
  }
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

async function clearKey(provider, db) {
  await db.write("api-keys", provider.storageKey, "");
}

async function copy(text, panel) {
  await navigator.clipboard?.writeText(text);
  const note = panel.querySelector("small");
  if (note) note.textContent = "Copied install/restart command.";
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
  return `<label>ChatGPT bridge setup</label>
    <p>Use the Awtsmoos extension/relay for ChatGPT. Install once, or run the same command again to restart and reuse your saved tunnel.</p>
    <div class="provider-key-row provider-key-row-install">
      <a href="${SETUP.extensionUrl}" target="_blank" rel="noreferrer">Open setup</a>
      <button type="button" data-key-action="copy-win">Copy Windows</button>
      <button type="button" data-key-action="copy-unix">Copy macOS/Linux</button>
    </div>
    <small>When relay is active, /ai will prefer it for local tools.</small>`;
}
