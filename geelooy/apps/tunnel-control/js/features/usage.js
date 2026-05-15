
// B"H
import { h, out } from "../ui/dom.js";

export function usage() {
  return h("section", { className: "pane", data: { pane: "usage" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Usage" }), h("h2", { text: "Usage and raw actions" })]),
    h("article", { className: "panel" }, [h("button", { id: "loadUsageBtn", text: "Load usage" })]),
    out("usageOut"),
    out("actionUrlOut"),
    out("actionOut")
  ]);
}
