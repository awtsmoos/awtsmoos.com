// B"H
import { h, out, $ } from "../ui/dom.js";
import { apiGet } from "../ui/api.js";

function b64(value) { return btoa(unescape(encodeURIComponent(String(value || "")))); }

/**
 * B"H
 * Chapter: Tunnel Control gained the screen behind the chat.
 */
export function previewGateway() {
  return h("section", { className: "pane awt-preview-console", data: { pane: "previewGateway" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Preview Gateway" }), h("h2", { text: "Publish private screens from any vessel" }), h("p", { text: "Create protected view links for files, folders, generated pages, live streams, action results, or local project servers without pasting giant output into chat." })]),
    h("div", { className: "awt-preview-grid" }, [createPanel(), settingsPanel()]),
    h("article", { className: "panel stack awt-preview-list-panel" }, [h("h3", { text: "Active previews" }), h("div", { id: "previewList", className: "awt-preview-list" })]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Raw preview response" }), out("previewOut", "No preview response yet.")])
  ]);
}

function createPanel() {
  return h("article", { className: "panel stack" }, [
    h("h3", { text: "Create preview" }),
    h("div", { className: "form-grid" }, [
      labelSelect("previewKind", "Kind", [["file", "File"], ["folder", "Folder"], ["page", "Dynamic page"], ["live", "Live stream"], ["collection", "Collection"], ["proxy", "Local server URL"]]),
      labelSelect("previewVisibility", "Visibility", [["private", "Private"], ["public", "Public"], ["tunnel-open", "Tunnel-open"], ["one-time", "One-time"]]),
      labelInput("previewTitle", "Title", "Build report"),
      labelInput("previewPath", "Path / URL / port", "AI_THOUGHTS/report.html"),
      labelInput("previewTtl", "TTL seconds", "3600", "number")
    ]),
    h("label", {}, ["HTML for dynamic page", h("textarea", { id: "previewHtml", value: "<h1>B\"H Preview</h1><p>Dynamic output page.</p>" })]),
    h("div", { className: "button-row" }, [button("createPreviewBtn", "Create preview", "primary"), button("refreshPreviewsBtn", "Refresh list")])
  ]);
}

function settingsPanel() {
  return h("article", { className: "panel stack awt-preview-settings" }, [
    h("h3", { text: "AI permissions" }),
    h("p", { text: "Manual settings override AI. Default allows AI to create private previews, but public/local-server exposure stays guarded." }),
    ...["allowAiManagePreview", "allowAiCreatePrivate", "allowAiCreatePublic", "allowAiExtendTtl", "allowAiEnableDownload", "allowAiExposeFolders", "allowAiExposeLocalServers"].map(key => h("label", { className: "awt-preview-toggle" }, [h("input", { id: key, type: "checkbox" }), key])),
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
  loadSettings().then(loadPreviews).catch(show);
}

async function createPreview() {
  const kind = $("previewKind").value;
  const pathOrUrl = $("previewPath").value;
  const preview = { kind, title: $("previewTitle").value, visibility: $("previewVisibility").value, ttlSeconds: $("previewTtl").value, createdBy: "user" };
  if (kind === "page") preview.html = $("previewHtml").value;
  else if (kind === "proxy") preview.url = /^https?:/.test(pathOrUrl) ? pathOrUrl : `http://127.0.0.1:${pathOrUrl || 3000}/`;
  else preview.path = pathOrUrl;
  const got = await apiGet(`/api/tunnel/control/preview/create?preview64=${encodeURIComponent(b64(JSON.stringify(preview)))}`);
  show(got);
  await loadPreviews();
}

async function loadPreviews() {
  const got = await apiGet("/api/tunnel/control/preview/list");
  show(got);
  const box = $("previewList");
  if (!box) return;
  box.replaceChildren(...(got.previews || []).map(card));
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

function card(preview) {
  return h("article", { className: `awt-preview-card is-${preview.visibility}` }, [h("span", { text: preview.visibility }), h("strong", { text: preview.title || preview.id }), h("small", { text: `${preview.kind} · ${preview.targetVessel}` }), h("a", { attrs: { href: preview.viewUrl, target: "_blank", rel: "noopener" }, text: "Open view" }), h("button", { text: "Revoke", on: { click: async () => { await apiGet(`/api/tunnel/control/preview/revoke?previewId=${encodeURIComponent(preview.id)}`); await loadPreviews(); } } })]);
}

function show(got) { if ($("previewOut")) $("previewOut").textContent = JSON.stringify(got, null, 2); }
