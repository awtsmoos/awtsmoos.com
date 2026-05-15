
// B"H
import { h, field, out } from "../ui/dom.js";

export function setup() {
  return h("section", { className: "pane", data: { pane: "setup" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Setup" }),
      h("h2", { text: "Root folder and live permissions" }),
      h("p", { text: "Pick a safe folder. Every switch saves instantly through the tunnel relay." })
    ]),

    h("article", { className: "panel stack" }, [
      h("div", { className: "form-grid" }, [
        field("rootPath", "Absolute local root folder", {
          className: "span-12",
          placeholder: "C:\\Users\\..."
        })
      ]),
      h("div", { className: "button-row" }, [
        btn("loadConfigBtn", "Reload config"),
        btn("saveConfigBtn", "Save now", "primary"),
        btn("chooseRootBtn", "Choose root"),
        btn("openRootBtn", "Open root"),
        btn("rootsBtn", "Show drives")
      ]),
      h("div", { id: "configSaveStatus", className: "notice", text: "Settings not loaded yet." })
    ]),

    h("article", { className: "panel stack" }, [
      h("h3", { text: "Permissions" }),
      h("p", { text: "Default is enabled. Changes save instantly." }),
      h("div", { className: "check-grid" }, [
        check("allowWrite", "Allow writes"),
        check("allowSecrets", "Allow secret-like files"),
        check("allowCommands", "Allow commands"),
        check("enableLocalHttpProxy", "Local proxy"),
        check("toolFsRead", "Read files"),
        check("toolFsWrite", "Write files"),
        check("toolFsBulk", "Bulk read/write"),
        check("toolCommand", "Terminal commands"),
        check("toolChrome", "Chrome browser"),
        check("toolNodeScript", "Node scripts")
      ])
    ]),

    h("details", {}, [
      h("summary", { text: "Raw config response" }),
      out("configOut")
    ])
  ]);
}

function btn(id, text, className = "") {
  return h("button", { id, text, className });
}

function check(id, text) {
  return h("label", {}, [
    h("input", { id, type: "checkbox", checked: true, data: { instantConfig: "1" } }),
    text
  ]);
}
