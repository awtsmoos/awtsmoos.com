
// B"H
import { h, field } from "./dom.js";
import { pages } from "./pages.js";
import { switchPane } from "./tabs.js";

export function hero() {
  return h("header", { className: "app-hero" }, [
    h("div", { className: "hero-topline" }, [
      h("span", { className: "badge", text: 'B"H' }),
      h("span", { className: "badge warn", id: "authPill", text: "Login: checking" }),
      h("span", { className: "badge warn", id: "agentPill", text: "Agent: checking" })
    ]),
    h("div", { className: "hero-grid" }, [
      h("div", {}, [
        h("p", { className: "eyebrow", text: "Local agent dashboard" }),
        h("h1", { text: "Tunnel Control" }),
        h("p", { className: "hero-copy", text: "Choose a root, manage keys, browse files, run commands, and control Chrome." })
      ]),
      h("section", { className: "hero-card" }, [
        field("tunnelName", "Tunnel name", { placeholder: "awt-yackov-yitzchak-3750" }),
        h("div", { className: "hero-actions" }, [
          h("button", { id: "refreshBtn", text: "Refresh" }),
          h("button", { id: "loginBtn", text: "Login" }),
          h("button", { id: "logoutBtn", text: "Logout" })
        ])
      ])
    ])
  ]);
}

export function tabs() {
  return h("nav", { className: "tabbar" }, pages.map(([id, icon, label]) =>
    h("button", {
      className: "tab" + (id === "dashboard" ? " active" : ""),
      text: icon + " " + label,
      data: { tab: id },
      on: { click: () => switchPane(id) }
    })
  ));
}
