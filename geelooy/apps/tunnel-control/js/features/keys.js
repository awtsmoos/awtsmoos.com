
// B"H
import { h, field, out, $ } from "../ui/dom.js";
import { apiGet, apiPostForm, show } from "../ui/api.js";

export function keys() {
  return h("section", { className: "pane", data: { pane: "keys" } }, [
    head(),
    h("article", { className: "panel stack" }, [
      h("div", { className: "button-row" }, [h("button", { id: "refreshKeysBtn", text: "Refresh keys" })]),
      h("div", { className: "form-grid" }, [
        field("keyName", "Name", { value: "local-control-key", className: "span-6" }),
        field("keyRate", "Req/min", { type: "number", value: "120", className: "span-3" }),
        field("keyBytes", "Bytes/day", { type: "number", value: "50000000", className: "span-3" })
      ]),
      scopes(),
      h("div", { className: "button-row" }, [h("button", { id: "createKeyBtn", className: "primary", text: "Create and save key" }), h("button", { id: "clearApiKeyBtn", text: "Clear saved key" })]),
      field("apiKeyInput", "Paste existing API key", { type: "password", placeholder: "awt_..." }),
      h("button", { id: "saveApiKeyBtn", text: "Save pasted key" }),
      h("div", { id: "activeKeySummary", className: "notice", text: "No key loaded yet." }),
      h("div", { id: "savedKeysList", className: "stack" })
    ]),
    h("details", { open: false }, [h("summary", { text: "Raw key response" }), out("keysOut")])
  ]);
}

export function mountKeys() {
  $("refreshKeysBtn").onclick = loadKeys;
  $("createKeyBtn").onclick = createKey;
  $("saveApiKeyBtn").onclick = savePasted;
  $("clearApiKeyBtn").onclick = clearKey;
  updateSummary();
  loadKeys().catch(() => {});
}

function head() {
  return h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "API keys" }), h("h2", { text: "Access key vault" }), h("p", { text: "Create one key, save it locally, and the control panel will send it with file, command, and browser actions." })]);
}

function scopes() {
  return h("div", { className: "check-grid" }, ["tunnel.read", "tunnel.write", "tunnel.command", "tunnel.browser", "tunnel.admin"].map(scope =>
    h("label", {}, [h("input", { type: "checkbox", className: "scopeBox", value: scope, checked: scope === "tunnel.read" }), scope])
  ));
}

function pickedScopes() {
  return Array.from(document.querySelectorAll(".scopeBox:checked")).map(x => x.value).join(" ");
}

async function loadKeys() {
  const got = await apiGet("/api/tunnel/control/api-keys");
  show("keysOut", got);
  const list = $("savedKeysList");
  const keys = Array.isArray(got.keys) ? got.keys : [];
  list.replaceChildren(...keys.map(k => h("div", { className: "notice" }, [h("b", { text: k.name || k.keyId }), h("br"), h("span", { text: `${k.keyId || ""} ${String(k.scopes || []).replaceAll(",", " ")}` })])));
}

async function createKey() {
  const got = await apiPostForm("/api/tunnel/control/api-keys/create", {
    name: $("keyName").value,
    scopes: pickedScopes(),
    rateLimitPerMinute: $("keyRate").value,
    bytesPerDay: $("keyBytes").value
  });
  show("keysOut", got);
  if (got.apiKey) localStorage.setItem("awtTunnelApiKey", got.apiKey);
  updateSummary();
  await loadKeys();
}

function savePasted() {
  localStorage.setItem("awtTunnelApiKey", $("apiKeyInput").value.trim());
  updateSummary();
}

function clearKey() {
  localStorage.removeItem("awtTunnelApiKey");
  $("apiKeyInput").value = "";
  updateSummary();
}

function updateSummary() {
  const key = localStorage.getItem("awtTunnelApiKey") || "";
  $("activeKeySummary").textContent = key ? `Saved key loaded. Length: ${key.length}.` : "No saved API key. Create or paste one.";
}
