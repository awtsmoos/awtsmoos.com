
// B"H
import { h, out } from "../ui/dom.js";

/**
 * B"H
 * Chapter 3: The Account Chamber Receives Its Witness Scrolls.
 *
 * The Awtsmoos reveals connection not as rumor, but as visible summaries and
 * raw JSON vessels. These controls match the live status module contract so the
 * unified shell can move them into the account page without losing behavior.
 *
 * @returns {HTMLElement} Account and connection pane source.
 */
export function account() {
  return h("section", { className: "pane", data: { pane: "account" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Account" }),
      h("h2", { text: "Login status and connection" })
    ]),
    h("div", { className: "two-grid" }, [
      h("article", { className: "panel stack" }, [
        h("h3", { text: "Login status" }),
        h("button", { id: "refreshBtn", text: "Refresh login" }),
        h("div", { id: "identitySummary", className: "notice", text: "Checking login..." }),
        out("identityBox", "No identity response yet.")
      ]),
      h("article", { className: "panel stack" }, [
        h("h3", { text: "Connection" }),
        h("label", {}, ["Tunnel name", h("input", { id: "tunnelName", placeholder: "auto-discovered" })]),
        h("button", { id: "refreshDeviceBtn", text: "Refresh device" }),
        h("div", { id: "deviceSummary", className: "notice", text: "Checking agent..." }),
        out("deviceBox", "No device response yet."),
        out("miniStatus", "No mini status yet.")
      ])
    ])
  ]);
}
