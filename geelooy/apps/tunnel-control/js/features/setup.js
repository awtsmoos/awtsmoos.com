// B"H
import { h, field, out } from "../ui/dom.js";

export function setup() {
  return h("section", { className: "pane", data: { pane: "setup" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Setup" }),
      h("h2", { text: "Root folder, live permissions, and repo hygiene" }),
      h("p", { text: "Pick a safe folder. Tunnel temp artifacts can be ignored automatically when the root is a git repo." })
    ]),
    h("article", { className: "panel stack" }, [
      h("div", { className: "form-grid" }, [field("rootPath", "Absolute local root folder", { className: "span-12", placeholder: "C:\\Users\\..." })]),
      h("div", { className: "button-row" }, [btn("loadConfigBtn", "Reload config"), btn("saveConfigBtn", "Save now", "primary"), btn("chooseRootBtn", "Choose root"), btn("openRootBtn", "Open root"), btn("rootsBtn", "Show drives")]),
      h("div", { id: "configSaveStatus", className: "notice", text: "Settings not loaded yet." }),
      h("label", { className: "stack" }, [h("span", { text: "End-of-run auto response" }), h("textarea", { id: "continuationPrompt", rows: 4, data: { instantConfig: "1" }, text: "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully." })])
    ]),
    h("article", { className: "panel stack" }, [
      h("h3", { text: "Permissions" }),
      h("p", { text: "Default is enabled. Changes save instantly." }),
      h("div", { className: "check-grid" }, [check("allowWrite", "Allow writes"), check("allowSecrets", "Allow secret-like files"), check("allowCommands", "Allow commands"), check("enableLocalHttpProxy", "Local proxy"), check("toolFsRead", "Read files"), check("toolFsWrite", "Write files"), check("toolFsBulk", "Bulk read/write"), check("toolCommand", "Terminal commands"), check("toolChrome", "Chrome browser"), check("toolNodeScript", "Node scripts")])
    ]),
    h("article", { className: "panel stack awt-git-hygiene-panel" }, [
      h("h3", { text: "Git hygiene for generated folders" }),
      h("p", { text: "When the selected root contains .git, Awtsmoos can maintain a small .gitignore block for generated tunnel artifacts. AI_THOUGHTS is opt-in because some projects want to commit the planning novel." }),
      h("div", { className: "check-grid" }, [
        check("gitAutoUpdateGitignore", "Auto-update .gitignore in git repos"),
        check("gitIgnoreAwtsmoosTemp", "Ignore .awtsmoos temp/action folders"),
        check("gitIgnoreAiThoughts", "Also ignore AI_THOUGHTS/", false)
      ]),
      h("div", { className: "notice", text: "Default: .awtsmoos ignored, AI_THOUGHTS not ignored." })
    ]),
    h("details", {}, [h("summary", { text: "Raw config response" }), out("configOut")])
  ]);
}

function btn(id, text, className = "") { return h("button", { id, text, className }); }
function check(id, text, checked = true) { return h("label", {}, [h("input", { id, type: "checkbox", checked, data: { instantConfig: "1" } }), text]); }
