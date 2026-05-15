
// B"H
import { h, area, out, $ } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";

function field(id, label, attrs = {}, wide = "") {
  return h("label", { className: "chrome-field " + wide }, [
    h("span", { text: label }),
    h("input", { id, ...attrs })
  ]);
}

function btn(id, text, primary = false) {
  return h("button", { id, text, className: primary ? "primary" : "" });
}

export function chrome() {
  return h("section", { className: "pane", data: { pane: "chrome" } }, [
    h("div", { className: "page-head" }, [
      h("p", { className: "eyebrow", text: "Chrome" }),
      h("h2", { text: "Browser control lab" }),
      h("p", { text: "Find Chrome, save its path, launch/connect, then test navigation and evaluation." })
    ]),

    h("article", { className: "panel stack" }, [
      h("div", { className: "chrome-grid" }, [
        field("chromePath", "Chrome / Edge / Brave executable", {}, "span-9"),
        field("chromePort", "Port", { type: "number", value: localStorage.getItem("awtChromePort") || "9222" }, "span-3")
      ]),
      h("div", { className: "button-row" }, [
        btn("chromeFindBtn", "Find Chrome"),
        btn("chromeManualBtn", "Choose manually"),
        btn("chromeLaunchBtn", "Launch / Connect", true),
        btn("chromeStatusBtn", "Status")
      ]),
      h("div", { id: "chromeStatusCard", className: "notice", text: "Chrome not checked yet." }),
      h("div", { id: "chromeCandidates", className: "candidate-list hidden" })
    ]),

    h("article", { className: "panel stack" }, [
      field("chromeUrl", "URL", { value: "https://awtsmoos.com" }, "span-12"),
      h("div", { className: "button-row" }, [btn("chromeNavigateBtn", "Navigate"), btn("chromeEvalBtn", "Evaluate title")])
    ]),

    h("article", { className: "panel stack" }, [
      h("div", { className: "chrome-grid" }, [
        field("chromeSelector", "Selector", { value: "body" }, "span-6"),
        field("chromeText", "Text", {}, "span-6"),
        field("chromeExpression", "JS expression", { value: "document.title" }, "span-12")
      ]),
      area("chromeScript", "Script JSON", "[{\"type\":\"goto\",\"url\":\"https://awtsmoos.com\"},{\"type\":\"eval\",\"expression\":\"document.title\"}]"),
      h("div", { className: "button-row" }, [
        btn("chromeWaitBtn", "Wait"),
        btn("chromeClickBtn", "Click"),
        btn("chromeTypeBtn", "Type"),
        btn("chromeRunScriptBtn", "Run script")
      ])
    ]),

    h("details", {}, [h("summary", { text: "Raw Chrome response" }), out("chromeOut")])
  ]);
}

export function mountChrome() {
  restoreChrome();
  const map = [
    ["chromeFindBtn", "chromeFind"], ["chromeLaunchBtn", "chromeLaunch"],
    ["chromeStatusBtn", "chromeStatus"], ["chromeNavigateBtn", "chromeNavigate"],
    ["chromeWaitBtn", "chromeWaitForSelector"], ["chromeClickBtn", "chromeClick"],
    ["chromeTypeBtn", "chromeType"], ["chromeEvalBtn", "chromeEval"],
    ["chromeRunScriptBtn", "chromeRunScript"]
  ];

  map.forEach(([id, action]) => $(id).onclick = () => run(action));
  $("chromeManualBtn").onclick = () => openCandidates();
  $("chromePath").onchange = saveChromeLocal;
  $("chromePort").onchange = saveChromeLocal;
}

function restoreChrome() {
  $("chromePath").value = localStorage.getItem("awtChromePath") || "";
  $("chromePort").value = localStorage.getItem("awtChromePort") || $("chromePort").value || "9222";
}

function saveChromeLocal() {
  localStorage.setItem("awtChromePath", $("chromePath").value.trim());
  localStorage.setItem("awtChromePort", $("chromePort").value.trim() || "9222");
}

function statusText(got) {
  if (got.action === "chromeFind") {
    return got.found
      ? `Found browser: ${got.chromePath}. Existing choices: ${(got.existing || []).length}.`
      : `No browser found automatically. Searched ${(got.candidates || []).length} common paths.`;
  }

  if (got.action === "chromeStatus") {
    return got.connected
      ? `Connected on port ${got.port}. Pages: ${(got.pages || []).length}.`
      : `Not connected on port ${got.port}. ${got.error || ""}`;
  }

  if (got.ok) return `${got.action} succeeded.`;
  return `${got.action} failed: ${got.error || got.message || "unknown"}`;
}

function renderCandidates(list = []) {
  const host = $("chromeCandidates");
  const items = list.map(x => typeof x === "string" ? { path: x } : x).filter(x => x.path || x);

  host.classList.toggle("hidden", !items.length);
  host.replaceChildren(...items.map(item => {
    const p = item.path || item;
    return h("div", { className: "candidate" }, [
      h("code", { text: p }),
      h("button", { text: "Use", on: { click: () => { $("chromePath").value = p; saveChromeLocal(); } } })
    ]);
  }));
}

function openCandidates() {
  $("chromeCandidates").classList.remove("hidden");
  if (!$("chromeCandidates").children.length) {
    renderCandidates([
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    ]);
  }
}

async function run(action) {
  saveChromeLocal();
  $("chromeStatusCard").textContent = "Working: " + action + "...";

  let script = [];
  try { script = JSON.parse($("chromeScript").value || "[]"); }
  catch (_e) { script = []; }

  const got = await callFs({
    action,
    chromePath: $("chromePath").value,
    port: $("chromePort").value,
    url: $("chromeUrl").value,
    selector: $("chromeSelector").value,
    text: $("chromeText").value,
    expression: action === "chromeEval" && !$("chromeExpression").value ? "document.title" : $("chromeExpression").value,
    script
  });

  if (got.chromePath) {
    $("chromePath").value = got.chromePath;
    saveChromeLocal();
  }

  if (got.candidates || got.existing) renderCandidates(got.existing || got.candidates);
  $("chromeStatusCard").textContent = statusText(got);
  show("chromeOut", got);
}
