// B"H
import { h, out } from "../ui/dom.js";
import { VIRTUAL_OS_TUNNEL } from "./vessels/selector.js";

/**
 * B"H
 * Chapter 4: The Account Chamber Received A Vessel Compass.
 *
 * The Awtsmoos reveals connection not as rumor, but as visible summaries, raw
 * JSON vessels, and a target selector. The selector is the same cup used by AI
 * actions, filesystem calls, and hosted Virtual OS fallback.
 *
 * @returns {HTMLElement} Account and connection pane source.
 */
export function account() {
  return h("section", { className: "pane", data: { pane: "account" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Account" }), h("h2", { text: "Login status and connection" })]),
    h("div", { className: "two-grid" }, [
      h("article", { className: "panel stack" }, [h("h3", { text: "Login status" }), h("button", { id: "refreshBtn", text: "Refresh login" }), h("div", { id: "identitySummary", className: "notice", text: "Checking login..." }), out("identityBox", "No identity response yet.")]),
      h("article", { className: "panel stack" }, [
        h("h3", { text: "Connection" }),
        h("label", {}, ["Tunnel name", h("input", { id: "tunnelName", placeholder: "auto-discovered" })]),
        h("label", {}, ["Target vessel", h("select", { id: "targetVesselSelect" }, [h("option", { value: VIRTUAL_OS_TUNNEL, text: "Hosted Virtual OS" })])]),
        h("div", { className: "notice", text: "Native, browser-tab, and hosted Virtual OS vessels share one action surface. Select where future tool calls should land." }),
        h("p", {}, ["Selected target: ", h("strong", { id: "selectedTargetVessel", text: VIRTUAL_OS_TUNNEL })]),
        h("button", { id: "refreshDeviceBtn", text: "Refresh device" }),
        h("div", { id: "deviceSummary", className: "notice", text: "Checking agent..." }),
        out("deviceBox", "No device response yet."),
        out("miniStatus", "No mini status yet."),
        h("div", { className: "button-row" }, [
          h("button", { id: "revokeDeviceBtn", text: "Revoke and forget this device" }),
          h("button", { id: "logoutBtn", text: "Log out of Tunnel Control" })
        ]),
        h("p", { className: "notice", text: "Revoking closes the tunnel and instructs the Mac agent to delete its credential and private key from Keychain. Logging out only ends this browser session." })
      ])
    ])
  ]);
}
