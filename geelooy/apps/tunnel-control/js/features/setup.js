
// B"H
import { h, field, out } from "../ui/dom.js";

export function setup() {
  const checks = ["allowWrite:Allow writes", "allowSecrets:Secret-like files", "allowCommands:Local commands", "toolChrome:Chrome", "toolFsRead:Read", "toolFsWrite:Write"];
  return h("section", { className: "pane", data: { pane: "setup" } }, [
    head("Setup", "Root folder and permissions", "Pick a safe project folder first."),
    h("article", { className: "panel" }, [
      h("div", { className: "form-grid" }, [field("rootPath", "Absolute local root folder", { className: "span-12", placeholder: "C:\\Users\\..." })]),
      h("div", { className: "button-row" }, ["loadConfigBtn:Load config", "saveConfigBtn:Save config", "chooseRootBtn:Choose root", "openRootBtn:Open root", "rootsBtn:Show drives"].map(btn))
    ]),
    h("article", { className: "panel" }, [h("h3", { text: "Live permissions" }), h("div", { className: "check-grid" }, checks.map(check))]),
    h("details", { open: true }, [h("summary", { text: "Config response" }), out("configOut")])
  ]);
}

function head(eyebrow, title, text) {
  return h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: eyebrow }), h("h2", { text: title }), h("p", { text })]);
}
function btn(x) {
  const [id, text] = x.split(":");
  return h("button", { id, text, className: id === "saveConfigBtn" ? "primary" : "" });
}
function check(x) {
  const [id, text] = x.split(":");
  return h("label", {}, [h("input", { id, type: "checkbox" }), text]);
}
