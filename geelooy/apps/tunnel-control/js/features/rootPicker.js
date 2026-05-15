
// B"H
import { h, $, qsa, out } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";
import { state } from "../ui/state.js";

export function rootPicker() {
  return h("div", { id: "rootPickerModal", className: "modal hidden" }, [
    h("div", { id: "rootPickerBackdrop", className: "modal-backdrop" }),
    h("div", { className: "root-dialog" }, [
      h("div", { className: "root-head" }, [h("div", {}, [h("p", { className: "eyebrow", text: "Root picker" }), h("h2", { text: "Choose local root folder" })]), h("button", { id: "closeRootPickerBtn", text: "Close" })]),
      h("div", { className: "root-toolbar" }, [h("input", { id: "rootPickerPath", value: "__ROOTS__" }), h("button", { id: "rootPickerRootsBtn", text: "Drives" }), h("button", { id: "rootPickerUpBtn", text: "Up" }), h("button", { id: "rootPickerGoBtn", text: "Go" }), h("button", { id: "rootPickerSelectBtn", className: "primary", text: "Use selected folder" })]),
      h("div", { id: "rootPickerLocation", className: "root-crumbs" }),
      h("div", { className: "root-main" }, [h("div", { id: "rootPickerNice", className: "root-status", text: "Open picker to load folders." }), h("div", { id: "rootPickerList", className: "root-list" })]),
      h("div", { className: "root-foot" }, [h("div", { id: "rootPickerSelected", text: "None selected." }), out("rootPickerOut")])
    ])
  ]);
}

export function mountRootPicker() {
  $("chooseRootBtn").onclick = () => open($("rootPath").value || "__ROOTS__");
  $("closeRootPickerBtn").onclick = close;
  $("rootPickerBackdrop").onclick = close;
  $("rootPickerRootsBtn").onclick = () => browse("__ROOTS__");
  $("rootPickerGoBtn").onclick = () => browse($("rootPickerPath").value);
  $("rootPickerSelectBtn").onclick = () => { $("rootPath").value = state.selectedRoot; close(); };
}

function open(path) {
  $("rootPickerModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  browse(path);
}
function close() {
  $("rootPickerModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}
async function browse(path) {
  $("rootPickerPath").value = path || "__ROOTS__";
  const got = await callFs({ action: "rootBrowse", absolutePath: $("rootPickerPath").value });
  show("rootPickerOut", got);
  render(Array.isArray(got.items) ? got.items : []);
}
function render(items) {
  const list = $("rootPickerList");
  list.replaceChildren(...items.map(item => row(item)));
}
function row(item) {
  const path = item.absolutePath || item.path || item.name;
  return h("button", { className: "root-row", on: { click: () => { state.selectedRoot = path; $("rootPickerSelected").textContent = path; } } }, [
    h("span", { text: "📁" }),
    h("span", { className: "root-copy" }, [h("span", { className: "root-name", text: item.name || path }), h("span", { className: "root-path", text: path })]),
    h("span", { text: "Open" })
  ]);
}
