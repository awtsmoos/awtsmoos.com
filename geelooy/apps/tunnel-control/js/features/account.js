
// B"H
import { h, out } from "../ui/dom.js";

export function account() {
  return h("section", { className: "pane", data: { pane: "account" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Account" }), h("h2", { text: "Login status and connection" })]),
    h("div", { className: "two-grid" }, [
      h("article", { className: "panel stack" }, [h("h3", { text: "Login status" }), h("button", { id: "accountLoginBtn", text: "Login" }), h("div", { id: "identitySummary", className: "notice", text: "Checking login..." })]),
      h("article", { className: "panel stack" }, [h("h3", { text: "Connection" }), h("button", { id: "deviceRefreshBtn", text: "Check" }), h("div", { id: "deviceSummary", className: "notice", text: "Checking agent..." })])
    ]),
    out("statusBox", "Loading...")
  ]);
}
