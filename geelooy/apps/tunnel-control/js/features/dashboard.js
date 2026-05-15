
// B"H
import { h, out } from "../ui/dom.js";
import { missions } from "../ui/pages.js";

export function dashboard() {
  return h("section", { className: "pane active", data: { pane: "dashboard" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Control center" }),
      h("h2", { text: "Awtsmoos Tunnel" }),
      h("p", { text: "Choose one focused mission. Each card opens a clean control page." })
    ]),
    h("div", { className: "kpi-grid" }, [
      kpi("Tunnel", "miniTunnel", "No tunnel selected"),
      kpi("Agent", "miniAgent", "Checking"),
      kpi("Login", "miniLogin", "Checking"),
      kpi("API key", "miniKey", "None")
    ]),
    h("div", { className: "mission-grid" }, missions.map(mission)),
    h("details", {}, [h("summary", { text: "Raw dashboard status" }), out("miniStatus")])
  ]);
}

function kpi(label, id, value) {
  return h("article", { className: "kpi-card" }, [h("span", { text: label }), h("strong", { id, text: value })]);
}

function mission([id, icon, title, desc]) {
  return h("button", { className: "mission-card", data: { go: id } }, [
    h("span", { className: "mission-icon", text: icon }),
    h("span", { className: "mission-copy" }, [h("strong", { text: title }), h("small", { text: desc })])
  ]);
}
