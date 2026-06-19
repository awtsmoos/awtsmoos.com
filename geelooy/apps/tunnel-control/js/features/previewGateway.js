// B"H
import { h, out, $ } from "../ui/dom.js";
import { apiGet } from "../ui/api.js";

function b64(value) { return btoa(unescape(encodeURIComponent(String(value || "")))); }
function defaultConversationName() { return "Build " + new Date().toISOString().slice(0, 16).replace("T", " "); }

/**
 * B"H
 * Chapter 492: The preview room became a mission control table.
 *
 * @returns {HTMLElement} Preview gateway pane.
 */
export function previewGateway() {
  return h("section", { className: "pane awt-preview-console", data: { pane: "previewGateway" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Preview Gateway" }),
      h("h2", { text: "Publish live screens from any vessel" }),
      h("p", { text: "Create protected view links for files, folders, generated pages, WebSocket/live placeholders, action results, or local Node/static servers." })
    ]),
    h("div", { className: "awt-preview-grid" }, [conversationPanel(), createPanel(), settingsPanel()]),
    h("article", { className: "panel stack awt-preview-stage" }, [
      h("h3", { text: "Current view" }),
      h("iframe", { id: "previewFrame", title: "Preview output", attrs: { sandbox: "allow-scripts allow-forms allow-same-origin allow-popups" } })
    ]),
    h("article", { className: "panel stack awt-preview-list-panel" }, [
      h("h3", { text: "Active previews" }),
      h("div", { id: "previewList", className: "awt-preview-list" })
    ]),
    h("article", { className: "panel stack awt-preview-history-panel" }, [
      h("h3", { text: "Conversation history" }),
      h("div", { id: "conversationHistory", className: "awt-conversation-history" })
    ]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Raw preview response" }), out("previewOut", "No preview response yet.")])
  ]);
}

function conversationPanel() {
  return h("article", { className: "panel stack awt-conversation-panel" }, [
    h("h3", { text: "Conversation" }),
    h("p", { text: "Register a mission name before asking GPT to work. Actions and previews can carry this name and stay grouped by date." }),
    h("div", { className: "form-grid" }, [
      labelInput("conversationName", "Conversation name", defaultConversationName()),
      labelInput("conversationId", "Stable id", "")
    ]),
    h("div", { className: "button-row" }, [
      button("registerConversationBtn", "Register conversation", "primary"),
      button("refreshConversationsBtn", "Refresh history")
    ])
  ]);
}

function createPanel() {
  return h("article", { className: "panel stack" }, [
    h("h3", { text: "Create preview" }),
    h("div", { className: "form-grid" }, [
      labelSelect("previewKind", "Kind", [["proxy", "Live local/server URL"], ["file", "File"], ["folder", "Folder"], ["page", "Dynamic page"], ["live", "Live stream"], ["collection", "Collection"], ["action", "Action result"]]),
      labelSelect("previewVisibility", "Visibility", [["private", "Private"], ["public", "Public"], ["tunnel-open", "Tunnel-open"], ["one-time", "One-time"]]),
      labelInput("previewTitle", "Title", "Build report"),
      labelInput("previewPath", "Path / URL / port", "3000"),
      labelInput("previewTtl", "TTL seconds", "3600", "number"),
      labelInput("previewTunnelName", "Tunnel name", "auto"),
      labelSelect("previewTargetVessel", "Target vessel", [["native-local", "Native local"], ["browser-tab", "Browser tab"], ["virtual-os", "Virtual OS"], ["auto", "Auto"]])
    ]),
    h("label", {}, ["HTML for dynamic page", h("textarea", { id: "previewHtml", value: "<h1>B\"H Preview</h1><p>Dynamic output page.</p>" })]),
    h("div", { className: "button-row" }, [button("createPreviewBtn", "Create preview", "primary"), button("refreshPreviewsBtn", "Refresh list")])
  ]);
}

function settingsPanel() {
  const keys = ["allowAiManagePreview", "allowAiCreatePrivate", "allowAiCreatePublic", "allowAiExtendTtl", "allowAiEnableDownload", "allowAiExposeFolders", "allowAiExposeLocalServers"];
  return h("article", { className: "panel stack awt-preview-settings" }, [
    h("h3", { text: "AI permissions" }),
    h("p", { text: "Manual settings override AI. Public and local-server exposure stay guarded unless you explicitly allow them." }),
    keys.map(key => h("label", { className: "awt-preview-toggle" }, [h("input", { id: key, type: "checkbox" }), labelFromKey(key)])),
    h("div", { className: "button-row" }, [button("loadPreviewSettingsBtn", "Load settings"), button("savePreviewSettingsBtn", "Save settings", "primary")])
  ]);
}

function labelInput(id, text, value = "", type = "text") { return h("label", {}, [text, h("input", { id, type, value })]); }
function labelSelect(id, text, options) { return h("label", {}, [text, h("select", { id }, options.map(([value, label]) => h("option", { value, text: label }))) ]); }
function button(id, text, className = "") { return h("button", { id, text, className }); }

export function mountPreviewGateway() {
  if (!$("createPreviewBtn")) return;
  $("createPreviewBtn").onclick = createPreview;
  $("refreshPreviewsBtn").onclick = loadPreviews;
  $("loadPreviewSettingsBtn").onclick = loadSettings;
  $("savePreviewSettingsBtn").onclick = saveSettings;
  $("registerConversationBtn").onclick = registerConversation;
  $("refreshConversationsBtn").onclick = loadConversations;
  loadSettings().then(loadPreviews).then(loadConversations).catch(show);
}

async function createPreview() {
  const kind = $("previewKind").value;
  const pathOrUrl = $("previewPath").value;
  const preview = basePreview(kind);
  if (kind === "page") preview.html = $("previewHtml").value;
  else if (kind === "proxy") preview.url = normalizeServerUrl(pathOrUrl);
  else preview.path = pathOrUrl || ".";
  const got = await apiGet(`/api/tunnel/control/preview/create?preview64=${encodeURIComponent(b64(JSON.stringify(preview)))}`);
  show(got);
  openFrame(got.viewUrl || got.url);
  await loadPreviews();
  await loadConversations();
}

function basePreview(kind) {
  return {
    kind,
    title: $("previewTitle").value,
    visibility: $("previewVisibility").value,
    ttlSeconds: $("previewTtl").value,
    tunnelName: $("previewTunnelName").value || "auto",
    targetVessel: $("previewTargetVessel").value || "native-local",
    conversationId: $("conversationId").value,
    conversationName: $("conversationName").value,
    createdBy: "user"
  };
}

function normalizeServerUrl(value) {
  const raw = String(value || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const port = raw.match(/^\d+$/) ? raw : "3000";
  return `http://127.0.0.1:${port}/`;
}

async function loadPreviews() {
  const got = await apiGet("/api/tunnel/control/preview/list");
  show(got);
  $("previewList")?.replaceChildren(...(got.previews || []).map(previewCard));
}

async function registerConversation() {
  const qs = new URLSearchParams({ conversationName: $("conversationName").value, conversationId: $("conversationId").value });
  const got = await apiGet(`/api/tunnel/control/conversations/register?${qs}`);
  show(got);
  if (got.conversation?.id) $("conversationId").value = got.conversation.id;
  await loadConversations();
}

async function loadConversations() {
  const got = await apiGet("/api/tunnel/control/conversations/list");
  $("conversationHistory")?.replaceChildren(...(got.conversations || []).map(conversationCard));
}

async function loadSettings() {
  const got = await apiGet("/api/tunnel/control/preview/settings");
  show(got);
  const s = got.settings || {};
  Object.keys(s).forEach(key => { if ($(key) && $(key).type === "checkbox") $(key).checked = !!s[key]; });
}

async function saveSettings() {
  const patch = {};
  ["allowAiManagePreview", "allowAiCreatePrivate", "allowAiCreatePublic", "allowAiExtendTtl", "allowAiEnableDownload", "allowAiExposeFolders", "allowAiExposeLocalServers"].forEach(key => { if ($(key)) patch[key] = !!$(key).checked; });
  const got = await apiGet(`/api/tunnel/control/preview/settings/set?settings64=${encodeURIComponent(b64(JSON.stringify(patch)))}`);
  show(got);
}

function previewCard(preview) {
  return h("article", { className: `awt-preview-card is-${preview.visibility}` }, [
    h("span", { text: preview.visibility }),
    h("strong", { text: preview.title || preview.id }),
    h("small", { text: `${preview.kind} - ${preview.targetVessel}` }),
    h("small", { text: preview.conversationName || preview.conversationId || "Ungrouped" }),
    h("a", { attrs: { href: preview.viewUrl, target: "_blank", rel: "noopener" }, text: "Open view" }),
    h("button", { text: "Dock", on: { click: () => openFrame(preview.viewUrl) } }),
    h("button", { text: "Revoke", on: { click: async () => { await apiGet(`/api/tunnel/control/preview/revoke?previewId=${encodeURIComponent(preview.id)}`); await loadPreviews(); } } })
  ]);
}

function conversationCard(conversation) {
  return h("article", { className: "awt-conversation-card" }, [
    h("button", { className: "awt-conversation-pick", text: conversation.name, on: { click: () => selectConversation(conversation) } }),
    h("small", { text: `${conversation.eventCount} events - ${new Date(conversation.updatedAt).toLocaleString()}` }),
    h("div", { className: "awt-conversation-events" }, (conversation.events || []).map(event => h("a", { attrs: { href: event.viewUrl || "#", target: event.viewUrl ? "_blank" : "_self", rel: "noopener" }, text: `${event.kind}: ${event.title || event.action}` })))
  ]);
}

function selectConversation(conversation) {
  $("conversationName").value = conversation.name || "";
  $("conversationId").value = conversation.id || "";
}

function openFrame(url) {
  if (url && $("previewFrame")) $("previewFrame").src = url;
}

function labelFromKey(key) {
  return key.replace(/^allowAi/, "").replace(/[A-Z]/g, x => " " + x).trim();
}

function show(got) {
  if ($("previewOut")) $("previewOut").textContent = JSON.stringify(got, null, 2);
}
