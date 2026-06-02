// B"H
import { $, jsonText } from "../lib/dom.js";
import { apiKeys, createApiKey } from "../api/control.js";
import { clearActiveApiKey, getActiveApiKey, getSavedRawApiKeys, saveRawApiKey, setActiveApiKey } from "../api/keySession.js";
import { log } from "../logger.js";

/**
 * B"H
 * Chapter 364: The Key Vault Hid The Sword And Showed The Seal.
 *
 * The Awtsmoos gives power without naked exposure. A raw tunnel key may live in
 * the browser vault for refresh survival, but the page shows only a mask, clear
 * status, and copy/use actions. The user sees confirmation instead of silence.
 */
function selectedScopes() {
  return [...document.querySelectorAll(".scopeBox")].filter(x => x.checked).map(x => x.value).join(" ");
}
function maskKey(key = "") { return key ? `${key.slice(0, 8)}…${key.slice(-8)}` : ""; }
function feedback(text, data = null) {
  const box = $("keysBox");
  if (!box) return;
  box.textContent = data ? `${text}\n\n${JSON.stringify(data, null, 2)}` : text;
}
function setKeyPill(active) {
  const pill = $("apiKeyPill");
  if (!pill) return;
  pill.classList.toggle("connected", !!active);
  pill.classList.toggle("warning", !active);
  $("apiKeyText").textContent = active ? "API key active" : "No API key selected";
  $("miniKey").textContent = active ? "Active" : "None";
  $("explorerNotice").textContent = active ? "API key active. File actions are enabled." : "Create, paste, or select an API key first. File actions are locked.";
}
async function renderSavedKeys(serverResult = null, note = "") {
  const saved = await getSavedRawApiKeys();
  const active = await getActiveApiKey();
  const list = $("savedKeysList");
  setKeyPill(active);
  $("activeKeyCard").textContent = active ? `Active key persists across refresh: ${maskKey(active)}` : "No active key selected.";
  list.innerHTML = "";
  if (!saved.length) list.innerHTML = '<div class="notice">No saved local keys yet. Create one or paste one above.</div>';
  for (const key of saved) list.appendChild(savedKeyCard(key, active));
  if (serverResult) jsonText("keysBox", serverResult);
  if (note) feedback(note);
}
function savedKeyCard(key, active) {
  const card = document.createElement("div");
  card.className = "saved-key-card" + (key.apiKey === active ? " active" : "");
  card.innerHTML = [
    `<h4>${escapeHtml(key.name || "Saved API key")}</h4>`,
    `<div class="muted-line">User: ${escapeHtml(key.userId || "local")}</div>`,
    `<div class="muted-line">Scopes: ${escapeHtml((key.scopes || []).join(" ") || "unknown")}</div>`,
    `<code title="Masked saved key">${escapeHtml(maskKey(key.apiKey))}</code>`,
    "<div class='saved-key-actions'><button class='button small use-key'>Use</button><button class='button small copy-key'>Copy raw key</button></div>"
  ].join("");
  card.querySelector(".use-key").onclick = async () => { await setActiveApiKey(key.apiKey); await renderSavedKeys(null, `Active key set: ${maskKey(key.apiKey)}`); };
  card.querySelector(".copy-key").onclick = async () => { await navigator.clipboard.writeText(key.apiKey); feedback(`Copied raw key for ${maskKey(key.apiKey)}.`); };
  return card;
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
}
export async function refreshKeyUi() { await renderSavedKeys(); }
export async function mountApiKeys() {
  log("mountApiKeys");
  $("loadKeysBtn").onclick = async () => renderSavedKeys(await apiKeys(), "Server key list loaded; local active key state refreshed.");
  $("createKeyBtn").onclick = async () => {
    const got = await createApiKey({ name: $("keyName").value, scopes: selectedScopes(), rateLimitPerMinute: $("keyRate").value, bytesPerDay: $("keyBytes").value });
    if (got.ok && got.apiKey && got.key) {
      await saveRawApiKey(got.key, got.apiKey);
      await renderSavedKeys(got, `Created, saved locally, and activated: ${maskKey(got.apiKey)}. Copy raw key from the card if needed.`);
      return;
    }
    jsonText("keysBox", got);
  };
  $("savePastedKeyBtn").onclick = async () => {
    const raw = $("pasteApiKey").value.trim();
    if (!raw) return feedback("Paste an API key first; nothing was saved.");
    await saveRawApiKey({ keyId: "pasted_" + Date.now(), name: "Pasted API Key", userId: "local", scopes: ["unknown"] }, raw);
    $("pasteApiKey").value = "";
    await renderSavedKeys(null, `Pasted key saved locally, activated, and will persist after refresh: ${maskKey(raw)}.`);
  };
  $("clearActiveKeyBtn").onclick = async () => { await clearActiveApiKey(); await renderSavedKeys(null, "Active key cleared. Saved keys remain available below."); };
  await renderSavedKeys(null, "Key vault loaded from local persistent storage.");
}
