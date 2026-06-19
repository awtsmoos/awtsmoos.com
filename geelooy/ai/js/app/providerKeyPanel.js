//B"H
/**
 * @file providerKeyPanel.js
 * Chapter 415: The key chamber receives a form, and Chrome stops whispering
 * that a password floated homeless through the void.
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
  panel.addEventListener("submit", event => handleSubmit(event, panel, selector, db));
}

async function handleSubmit(event, panel, selector, db) {
  event.preventDefault();
  const provider = PROVIDERS[selector.value];
  if (!provider) return;
  await saveKey(panel, provider, db);
  await refresh(panel, selector.value, db);
  flash(panel, "Key saved locally in IndexedDB.");
}

async function handleClick(event, panel, selector, db) {
  const action = event.target?.closest?.("[data-key-action]")?.dataset?.keyAction;
  if (!action || action === "save") return;
  if (action === "copy-win") return copy(SETUP.windows, panel, "Windows command copied.");
  if (action === "copy-unix") return copy(SETUP.unix, panel, "macOS/Linux command copied.");
  if (action === "copy-url") return copy(SETUP.extensionUrl, panel, "Setup link copied.");
  if (action === "open-setup") return window.open(SETUP.extensionUrl, "_blank", "noopener,noreferrer");
  const provider = PROVIDERS[selector.value];
  if (!provider) return;
  if (action === "open") window.open(provider.url, "_blank", "noopener,noreferrer");
  if (action === "clear") await clearKey(provider, db);
  if (action === "clear") await refresh(panel, selector.value, db);
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
  try { await navigator.clipboard?.writeText(text); flash(panel, message); }
  catch (_error) { flash(panel, "Copy failed; select the command manually."); }
}

function flash(panel, message) {
  const note = panel.querySelector("[data-key-note]") || panel.querySelector("[data-setup-note]") || panel.querySelector("small");
  if (note) note.textContent = message;
}

function providerMarkup(providerId, hasKey = false) {
  const provider = PROVIDERS[providerId];
  const inputId = `provider-key-input-${providerId}`;
  return `<form class="provider-key-form" autocomplete="off" aria-label="${provider.label} API key form">
    <label for="${inputId}">${provider.label} API Key</label>
    <div class="provider-key-row">
      <input id="${inputId}" name="${providerId}-api-key" class="provider-key-input" type="password" placeholder="${hasKey ? "Saved — paste new key to replace" : "Paste key for " + provider.label}" autocomplete="new-password" autocapitalize="none" spellcheck="false">
      <button type="submit" data-key-action="save">Save</button>
      <button type="button" data-key-action="open">Get</button>
      <button type="button" data-key-action="clear">Clear</button>
    </div>
    <small data-key-note>${hasKey ? "Key saved locally in IndexedDB." : "No key saved yet."}</small>
  </form>`;
}

function chatgptMarkup() {
  return `<section class="chatgpt-bridge-card" aria-label="ChatGPT bridge setup">
    <div class="bridge-card-head"><label>ChatGPT bridge setup</label><button type="button" data-key-action="open-setup">Open setup</button></div>
    <p class="bridge-summary">Use the Awtsmoos Tunnel / Chrome extension / Node relay so /ai can talk to ChatGPT and keep automation alive after tabs close.</p>
    ${commandBlock("Windows PowerShell", SETUP.windows, "copy-win")}${commandBlock("macOS / Linux Terminal", SETUP.unix, "copy-unix")}
    <div class="bridge-actions"><button type="button" data-key-action="copy-url">Copy setup link</button><a href="${SETUP.extensionUrl}" target="_blank" rel="noreferrer">awtsmoos.com setup</a></div>
    <small data-setup-note>Run the installer again any time to restart and reuse your saved tunnel.</small>
  </section>`;
}

function commandBlock(title, command, action) {
  return `<div class="bridge-command"><b>${title}</b><code>${command}</code><button type="button" data-key-action="${action}">Copy command</button></div>`;
}
