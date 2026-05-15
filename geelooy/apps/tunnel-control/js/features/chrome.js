
// B"H
import { h, field, area, out, $ } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";
import { chromePaths } from "../ui/state.js";

export function chrome() {
  return h("section", { className: "pane", data: { pane: "chrome" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "Chrome" }), h("h2", { text: "Browser control lab" })]),
    h("article", { className: "panel stack" }, [
      h("div", { className: "form-grid" }, [field("chromePath", "Chrome / Edge executable path", { className: "span-7" }), field("chromePort", "Port", { type: "number", value: "9222", className: "span-2" })]),
      h("div", { className: "button-row" }, ["chromeFindBtn:Find Chrome", "chromeManualBtn:Choose manually", "chromeLaunchBtn:Launch / Connect", "chromeStatusBtn:Status"].map(btn))
    ]),
    h("article", { className: "panel stack" }, [
      field("chromeUrl", "URL", { value: "https://awtsmoos.com" }),
      h("div", { className: "button-row" }, [btn("chromeNavigateBtn:Navigate"), btn("chromeEvalBtn:Evaluate title")])
    ]),
    h("article", { className: "panel stack" }, [
      field("chromeSelector", "Selector", { value: "body" }), field("chromeText", "Text"),
      field("chromeExpression", "JS expression", { value: "document.title" }),
      area("chromeScript", "Script JSON", "[{\"type\":\"goto\",\"url\":\"https://awtsmoos.com\"},{\"type\":\"eval\",\"expression\":\"document.title\"}]"),
      h("div", { className: "button-row" }, ["chromeWaitBtn:Wait", "chromeClickBtn:Click", "chromeTypeBtn:Type", "chromeRunScriptBtn:Run script"].map(btn))
    ]),
    h("div", { id: "chromeDiagnostics", className: "diagnostics" }),
    out("chromeOut"),
    chromeManualModal()
  ]);
}

function chromeManualModal() {
  return h("div", { id: "chromeManualModal", className: "modal hidden" }, [
    h("div", { id: "chromeManualBackdrop", className: "modal-backdrop" }),
    h("div", { className: "manual-dialog" }, [
      h("div", { className: "root-head" }, [h("div", {}, [h("p", { className: "eyebrow", text: "Chrome executable" }), h("h2", { text: "Choose Chrome manually" })]), btn("closeChromeManualBtn:Close")]),
      h("div", { className: "manual-body stack" }, [field("chromeManualPathInput", "Paste chrome.exe / msedge.exe path"), h("div", { id: "chromeCandidates", className: "candidate-list" })]),
      h("div", { className: "root-foot" }, [h("span", { className: "muted", text: "Pick a candidate or paste a path." }), h("button", { id: "useChromeManualPathBtn", className: "primary", text: "Use path" })])
    ])
  ]);
}

export function mountChrome() {
  [["chromeFindBtn","chromeFind"],["chromeLaunchBtn","chromeLaunch"],["chromeStatusBtn","chromeStatus"],["chromeNavigateBtn","chromeNavigate"],["chromeWaitBtn","chromeWaitForSelector"],["chromeClickBtn","chromeClick"],["chromeTypeBtn","chromeType"],["chromeEvalBtn","chromeEval"],["chromeRunScriptBtn","chromeRunScript"]].forEach(([id, action]) => $(id).onclick = () => run(action));
  $("chromeManualBtn").onclick = openManual;
  $("closeChromeManualBtn").onclick = closeManual;
  $("chromeManualBackdrop").onclick = closeManual;
  $("useChromeManualPathBtn").onclick = () => { $("chromePath").value = $("chromeManualPathInput").value; closeManual(); };
  renderCandidates(chromePaths);
}

function btn(x) {
  const [id, text] = x.split(":");
  return h("button", { id, text, className: id === "chromeLaunchBtn" ? "primary" : "" });
}

function openManual() { $("chromeManualModal").classList.remove("hidden"); $("chromeManualPathInput").value = $("chromePath").value; }
function closeManual() { $("chromeManualModal").classList.add("hidden"); }

function renderCandidates(paths) {
  const host = $("chromeCandidates");
  host.replaceChildren(...paths.map(path => h("div", { className: "candidate" }, [h("code", { text: path }), h("button", { text: "Use", on: { click: () => { $("chromePath").value = path; closeManual(); } } })])));
}

async function run(action) {
  show("chromeOut", { ok: true, status: "working", action });
  const got = await callFs({ action, chromePath: $("chromePath").value, port: $("chromePort").value, url: $("chromeUrl").value, selector: $("chromeSelector").value, text: $("chromeText").value, expression: $("chromeExpression").value, script: JSON.parse($("chromeScript").value || "[]") });
  if (action === "chromeFind" && got.chromePath) $("chromePath").value = got.chromePath;
  if (got.candidates) renderCandidates(got.candidates.map(x => x.path || x));
  show("chromeOut", got);
}
