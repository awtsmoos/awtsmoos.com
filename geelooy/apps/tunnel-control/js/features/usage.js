
// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { usage as readUsage } from "../api/control.js";
import { show } from "../ui/api.js";

/**
 * B"H
 * Chapter 3: The Raw Action Furnace Opens Its Iron Mouth.
 *
 * Usage is not a ghost pane anymore. It exposes usage loading and advanced
 * tunnel actions with real inputs that match mountActions: action, path,
 * maxChars, write content, bulk paths, bulk-write JSON, URL preview, output.
 *
 * @returns {HTMLElement} Usage and raw actions pane source.
 */
export function usage() {
  return h("section", { className: "pane", data: { pane: "usage" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Usage" }),
      h("h2", { text: "Usage and raw actions" })
    ]),
    h("article", { className: "panel stack" }, [
      h("button", { id: "loadUsageBtn", text: "Load usage" }),
      out("usageBox", "Usage not loaded yet.")
    ]),
    h("article", { className: "panel stack" }, [
      h("h3", { text: "Raw tunnel action" }),
      h("div", { className: "form-grid" }, [
        field("actionName", "Action", { value: "list", className: "span-4" }),
        field("actionPath", "Path", { value: ".", className: "span-5" }),
        field("maxChars", "Max chars", { type: "number", value: "12000", className: "span-3" }),
        area("writeContent", "Write content", ""),
        area("bulkPaths", "Bulk paths", ""),
        area("bulkWriteJson", "Bulk write JSON", "[]")
      ]),
      h("div", { className: "button-row" }, [
        h("button", { id: "runActionBtn", className: "primary", text: "Run action" }),
        h("button", { id: "copyActionUrlBtn", text: "Copy action URL" })
      ])
    ]),
    out("actionUrlOut", "No action URL yet."),
    out("actionOut", "No action response yet.")
  ]);
}

/**
 * B"H
 * Mounts the real usage reader.
 *
 * @returns {void}
 */
export function mountUsage() {
  const button = $("loadUsageBtn");
  if (!button) return;

  button.onclick = async () => {
    $("usageBox").textContent = "Loading usage...";
    show("usageBox", await readUsage());
  };
}
