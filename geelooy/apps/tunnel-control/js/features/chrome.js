
// B"H
import { h, field, area, out, $, qsa } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";
import { chromePaths } from "../ui/state.js";

export function chrome() {
  return h("section", { className: "pane", data: { pane: "chrome" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Chrome" }), h("h2", { text: "Browser control lab" })]),
    h("article", { className: "panel stack" }, [
      h("div", { className: "form-grid" }, [field("chromePath", "Chrome path", { className: "span-7" }), field("chromePort", "Port", { type: "number", value: "9222", className: "span-2" })]),
      h("div", { className: "button-row" }, ["chromeFindBtn:Find Chrome", "chromeManualBtn:Manual", "chromeLaunchBtn:Launch / Connect", "chromeStatusBtn:Status"].map(b))
    ]),
    h("article", { className: "panel stack" }, [field("chromeUrl", "URL", { value: "https://awtsmoos.com" }), h("button", { id: "chromeNavigateBtn", text: "Navigate" })]),
    h("article", { className: "panel stack" }, [field("chromeSelector", "Selector", { value: "body" }), field("chromeText", "Text"), field("chromeExpression", "JS expression", { value: "document.title" }), area("chromeScript", "Script JSON", "[]"), h("div", { className: "button-row" }, ["chromeWaitBtn:Wait", "chromeClickBtn:Click", "chromeTypeBtn:Type", "chromeEvalBtn:Evaluate JS", "chromeRunScriptBtn:Run script"].map(b))]),
    h("div", { id: "chromeDiagnostics", className: "diagnostics" }),
    out("chromeOut")
  ]);
}

export function mountChrome() {
  const map = [["chromeFindBtn","chromeFind"],["chromeLaunchBtn","chromeLaunch"],["chromeStatusBtn","chromeStatus"],["chromeNavigateBtn","chromeNavigate"],["chromeWaitBtn","chromeWaitForSelector"],["chromeClickBtn","chromeClick"],["chromeTypeBtn","chromeType"],["chromeEvalBtn","chromeEval"],["chromeRunScriptBtn","chromeRunScript"]];
  map.forEach(([id, action]) => $(id).onclick = () => run(action));
  $("chromeManualBtn").onclick = () => alert(chromePaths.join("\n"));
}
function b(x) { const [id,text] = x.split(":"); return h("button", { id, text, className: id === "chromeLaunchBtn" ? "primary" : "" }); }
async function run(action) {
  show("chromeOut", { ok: true, status: "working", action });
  const got = await callFs({ action, chromePath: $("chromePath").value, port: $("chromePort").value, url: $("chromeUrl").value, selector: $("chromeSelector").value, text: $("chromeText").value, expression: $("chromeExpression").value, script: $("chromeScript").value });
  show("chromeOut", got);
}
