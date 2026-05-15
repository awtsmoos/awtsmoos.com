
// B"H
import { h, $, out } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";
import { state } from "../ui/state.js";

export function rootPicker() {
  return h("div", { id: "rootPickerModal", className: "modal hidden" }, [
    h("div", { id: "rootPickerBackdrop", className: "modal-backdrop" }),
    h("div", { className: "root-dialog" }, [
      h("div", { className: "root-head" }, [
        h("div", {}, [h("p", { className: "eyebrow", text: "Root picker" }), h("h2", { text: "Choose local root folder" })]),
        h("button", { id: "closeRootPickerBtn", text: "Close" })
      ]),
      h("div", { className: "root-toolbar" }, [
        h("input", { id: "rootPickerPath", value: "__ROOTS__" }),
        h("button", { id: "rootPickerRootsBtn", text: "Drives" }),
        h("button", { id: "rootPickerUpBtn", text: "Up" }),
        h("button", { id: "rootPickerGoBtn", text: "Go" }),
        h("button", { id: "rootPickerOpenBtn", text: "Open selected" }),
        h("button", { id: "rootPickerSelectBtn", className: "primary", text: "Use selected folder" })
      ]),
      h("div", { id: "rootPickerLocation", className: "root-crumbs" }),
      h("div", { className: "root-main" }, [
        h("div", { id: "rootPickerNice", className: "root-status", text: "Open picker to load folders." }),
        h("div", { id: "rootPickerList", className: "root-list" })
      ]),
      h("div", { className: "root-foot" }, [
        h("div", { id: "rootPickerSelected", text: "None selected." }),
        h("details", {}, [h("summary", { text: "Raw response" }), out("rootPickerOut")])
      ])
    ])
  ]);
}

export function mountRootPicker() {
  $("chooseRootBtn").onclick = () => open($("rootPath").value || "__ROOTS__");
  $("closeRootPickerBtn").onclick = close;
  $("rootPickerBackdrop").onclick = close;
  $("rootPickerRootsBtn").onclick = () => browse("__ROOTS__");
  $("rootPickerGoBtn").onclick = () => browse($("rootPickerPath").value || "__ROOTS__");
  $("rootPickerOpenBtn").onclick = () => browse(state.selectedRoot || $("rootPickerPath").value);
  $("rootPickerUpBtn").onclick = () => browse(state.rootPickerParent || "__ROOTS__");
  $("rootPickerSelectBtn").onclick = () => select();
  $("rootPickerPath").onkeydown = e => { if (e.key === "Enter") browse($("rootPickerPath").value); };
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
  $("rootPickerNice").textContent = "Loading...";
  const got = await callFs({ action: "rootBrowse", absolutePath: $("rootPickerPath").value });
  show("rootPickerOut", got);
  state.rootPickerParent = got.parent || "__ROOTS__";
  $("rootPickerPath").value = got.current || path || "__ROOTS__";
  $("rootPickerNice").textContent = got.ok ? `Showing ${(got.items || []).length} folders in ${got.current}` : got.error || "Could not browse.";
  render(Array.isArray(got.items) ? got.items : []);
}

function render(items) {
  const list = $("rootPickerList");
  list.replaceChildren(...items.map(item => row(item)));
  if (!items.length) list.append(h("div", { className: "empty-state", text: "No folders here. Try Drives or Up." }));
}

function row(item) {
  const full = item.absolutePath || item.path || item.name;
  const name = item.name || full;
  return h("button", { className: "root-row", on: { click: () => pick(full), dblclick: () => browse(full) } }, [
    h("span", { className: "root-icon", text: "📁" }),
    h("span", { className: "root-copy" }, [h("span", { className: "root-name", text: name }), h("span", { className: "root-path", text: full })]),
    h("span", { text: "Open" })
  ]);
}

function pick(path) {
  state.selectedRoot = path;
  $("rootPickerSelected").textContent = path || "None selected.";
}

function select() {
  const target = state.selectedRoot || $("rootPickerPath").value;
  if (!target || target === "__ROOTS__") return;
  $("rootPath").value = target;
  callFs({ action: "rootSelect", absolutePath: target }).then(got => show("configOut", got));
  close();
}
