// B"H
import { h, field, out, $ } from "../ui/dom.js";
import { apiGet, apiPostForm, show } from "../ui/api.js";
import { saveRawApiKey, setActiveApiKey, clearActiveApiKey, getActiveApiKey } from "../api/keySession.js";

/**
 * B"H
 * Chapter 369: The Active Vault Joined Every Hallway.
 *
 * The Awtsmoos seals raw power behind a mask and synchronizes the old and new
 * key rivers. Refresh shows persistence, save speaks confirmation, and every
 * pane reads the same active key after the page is born again.
 */
export function keys() {
  return h("section", { className: "pane", data: { pane: "keys" } }, [head(), h("article", { className: "panel stack" }, [h("div", { className: "button-row" }, [h("button", { id: "refreshKeysBtn", text: "Refresh keys" })]), h("div", { className: "form-grid" }, [field("keyName", "Name", { value: "local-control-key", className: "span-6" }), field("keyRate", "Req/min", { type: "number", value: "120", className: "span-3" }), field("keyBytes", "Bytes/day", { type: "number", value: "50000000", className: "span-3" })]), scopes(), h("div", { className: "button-row" }, [h("button", { id: "createKeyBtn", className: "primary", text: "Create and save key" }), h("button", { id: "clearApiKeyBtn", text: "Clear saved key" })]), field("apiKeyInput", "Paste existing API key", { type: "password", placeholder: "awt_..." }), h("button", { id: "saveApiKeyBtn", text: "Save pasted key" }), h("div", { id: "activeKeySummary", className: "notice", text: "No key loaded yet." }), h("div", { id: "savedKeysList", className: "stack" })]), h("details", { open: false }, [h("summary", { text: "Raw key response" }), out("keysOut")])]);
}
export function mountKeys() {
  $("refreshKeysBtn").onclick = loadKeys;
  $("createKeyBtn").onclick = createKey;
  $("saveApiKeyBtn").onclick = savePasted;
  $("clearApiKeyBtn").onclick = clearKey;
  updateSummary("Key vault loaded from persistent browser storage.");
  loadKeys().catch(error => feedback("Could not refresh server key list.", { error: String(error) }));
}
function head() { return h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "API keys" }), h("h2", { text: "Access key vault" }), h("p", { text: "Create or paste one key. It persists across refresh and is shown only as a mask." })]); }
function scopes() { return h("div", { className: "check-grid" }, ["tunnel.read", "tunnel.write", "tunnel.command", "tunnel.browser", "tunnel.admin"].map(scope => h("label", {}, [h("input", { type: "checkbox", className: "scopeBox", value: scope, checked: scope === "tunnel.read" }), scope]))); }
function pickedScopes() { return Array.from(document.querySelectorAll(".scopeBox:checked")).map(x => x.value).join(" "); }
async function loadKeys() {
  const got = await apiGet("/api/tunnel/control/api-keys");
  show("keysOut", redact(got));
  const keys = Array.isArray(got.keys) ? got.keys : [];
  $("savedKeysList").replaceChildren(...keys.map(serverKeyCard));
  await updateSummary(`Server list refreshed. Active local key: ${mask(await getActiveApiKey()) || "none"}.`);
}
async function createKey() {
  const got = await apiPostForm("/api/tunnel/control/api-keys/create", { name: $("keyName").value, scopes: pickedScopes(), rateLimitPerMinute: $("keyRate").value, bytesPerDay: $("keyBytes").value });
  show("keysOut", redact(got));
  if (got.apiKey) { await saveRawApiKey(got.key || { name: $("keyName").value, scopes: pickedScopes().split(" ") }, got.apiKey); await updateSummary(`Created and saved active key: ${mask(got.apiKey)}.`); }
  else await updateSummary("Create key returned no raw key to save; inspect raw response.");
  await loadKeys();
}
async function savePasted() {
  const raw = $("apiKeyInput").value.trim();
  if (!raw) return updateSummary("Paste an API key first; nothing was saved.");
  await saveRawApiKey({ keyId: "pasted_" + Date.now(), name: "Pasted API Key", userId: "local", scopes: ["unknown"] }, raw);
  $("apiKeyInput").value = "";
  await updateSummary(`Pasted key saved and will persist after refresh: ${mask(raw)}.`);
}
async function clearKey() { await clearActiveApiKey(); $("apiKeyInput").value = ""; await updateSummary("Active local API key cleared."); }
async function updateSummary(note = "") {
  const key = await getActiveApiKey();
  $("activeKeySummary").textContent = key ? `${note}\nActive key persists across refresh: ${mask(key)}.` : `${note}\nNo saved API key. Create or paste one.`;
}
function serverKeyCard(k) { return h("div", { className: "notice" }, [h("b", { text: k.name || k.keyId || "Server key" }), h("br"), h("span", { text: `${k.keyId || ""} ${String(k.scopes || []).replaceAll(",", " ")}` })]); }
function feedback(text, data = null) { $("keysOut").textContent = data ? `${text}\n\n${JSON.stringify(data, null, 2)}` : text; }
function mask(key = "") { return key ? `${key.slice(0, 8)}…${key.slice(-8)}` : ""; }
function redact(value) { return JSON.parse(JSON.stringify(value || {}, (key, val) => key === "apiKey" && typeof val === "string" ? mask(val) : val)); }
