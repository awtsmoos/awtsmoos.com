
// B"H
import { h, field, out } from "../ui/dom.js";

export function keys() {
  return h("section", { className: "pane", data: { pane: "keys" } }, [
    head(),
    h("article", { className: "panel stack" }, [
      h("button", { id: "refreshKeysBtn", text: "Refresh keys" }),
      h("div", { className: "form-grid" }, [
        field("keyName", "Name", { value: "local-dev-key", className: "span-6" }),
        field("keyRate", "Req/min", { type: "number", value: "120", className: "span-3" }),
        field("keyBytes", "Bytes/day", { type: "number", value: "50000000", className: "span-3" })
      ]),
      h("button", { id: "createKeyBtn", className: "primary", text: "Create and activate key" }),
      field("apiKeyInput", "Paste API key", { type: "password", placeholder: "awt_key_..." }),
      h("div", { className: "button-row" }, [h("button", { id: "saveApiKeyBtn", text: "Save pasted key" }), h("button", { id: "clearApiKeyBtn", text: "Clear active key" })]),
      h("div", { id: "activeKeySummary", className: "notice", text: "No active key selected." })
    ]),
    h("details", { open: true }, [h("summary", { text: "Raw key response" }), out("keysOut")])
  ]);
}

function head() {
  return h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "API keys" }), h("h2", { text: "Access key vault" }), h("p", { text: "Create scoped keys or paste an existing key." })]);
}
