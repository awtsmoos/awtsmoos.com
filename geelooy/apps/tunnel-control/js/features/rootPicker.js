
// B"H
import { h, $, out } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";
import { state } from "../ui/state.js";

export function rootPicker() {
  return h("div", { id: "rootPickerModal", className: "modal hidden" }, [
    h("div", { id: "rootPickerBackdrop", className: "modal-backdrop" }),
    h("div", { className: "root-dialog" }, [
      h("div", { className: "root-head" }, [
        h("div", {}, [
          h("p", { className: "eyebrow", text: "Root picker" }),
          h("h2", { text: "Choose local root folder" })
        ]),
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

      h("div", { className: "root-main" }, [
        h("div", { id: "rootPickerNice", className: "root-status", text: "Open picker to load folders." }),
        h("div", { id: "rootPickerCrumbs", className: "root-crumbs" }),
        h("div", { id: "rootPickerList", className: "root-list" })
      ]),

      h("div", { className: "root-foot" }, [
        h("div", { id: "rootPickerSelected", className: "root-selected", text: "None selected." }),
        h("details", {}, [
          h("summary", { text: "Raw response" }),
          out("rootPickerOut")
        ])
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
  $("rootPickerUpBtn").onclick = () => browse(state.rootPickerParent || parentOf($("rootPickerPath").value));
  $("rootPickerSelectBtn").onclick = selectCurrentOrSelected;
  $("rootPickerPath").onkeydown = e => { if (e.key === "Enter") browse($("rootPickerPath").value); };
}

function open(path) {
  state.selectedRoot = "";
  $("rootPickerSelected").textContent = "None selected.";
  $("rootPickerModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  browse(path || "__ROOTS__");
}

function close() {
  $("rootPickerModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function browse(path) {
  const target = cleanSpecial(path || "__ROOTS__");
  $("rootPickerPath").value = target;
  $("rootPickerNice").textContent = "Loading " + target + "...";
  $("rootPickerList").replaceChildren(h("div", { className: "empty-state", text: "Loading..." }));

  const got = await callFs({ action: "rootBrowse", absolutePath: target });
  show("rootPickerOut", got);

  const current = cleanSpecial(got.current || target);
  state.rootPickerCurrent = current;
  state.rootPickerParent = cleanSpecial(got.parent || parentOf(current));
  $("rootPickerPath").value = current;

  const items = normalizeItems(got);
  $("rootPickerNice").textContent = got.ok
    ? `Showing ${items.length} folders in ${current}`
    : got.error || got.message || "Could not browse.";

  renderCrumbs(current);
  render(items);
}

function normalizeItems(got) {
  const arr = Array.isArray(got.items) ? got.items : [];

  return arr.map(item => {
    if (typeof item === "string") return { name: item, path: item, absolutePath: item, isDirectory: true };
    const full = item.absolutePath || item.path || item.fullPath || item.name || "";
    return {
      ...item,
      name: item.name || full,
      path: item.path || full,
      absolutePath: full,
      isDirectory: item.isDirectory !== false && item.type !== "file"
    };
  }).filter(item => item.absolutePath || item.path || item.name);
}

function render(items) {
  const list = $("rootPickerList");
  list.replaceChildren();

  if (!items.length) {
    list.append(h("div", { className: "empty-state", text: "No folders here. Try Drives, Up, or paste a path." }));
    return;
  }

  for (const item of items) list.append(row(item));
}

function row(item) {
  const full = cleanSpecial(item.absolutePath || item.path || item.name);
  const name = item.name || full;

  return h("div", { className: "root-row-wrap" }, [
    h("button", {
      className: "root-row",
      data: { rootPath: full },
      on: {
        click: () => pick(full),
        dblclick: () => browse(full)
      }
    }, [
      h("span", { className: "root-icon", text: "📁" }),
      h("span", { className: "root-copy" }, [
        h("span", { className: "root-name", text: name }),
        h("span", { className: "root-path", text: full })
      ])
    ]),
    h("button", {
      className: "root-open",
      text: "Open",
      on: { click: () => browse(full) }
    })
  ]);
}

function pick(path) {
  state.selectedRoot = cleanSpecial(path);
  $("rootPickerSelected").textContent = state.selectedRoot || "None selected.";

  document.querySelectorAll(".root-row").forEach(row => {
    row.classList.toggle("selected", row.dataset.rootPath === state.selectedRoot);
  });
}

function selectCurrentOrSelected() {
  const target = cleanSpecial(state.selectedRoot || state.rootPickerCurrent || $("rootPickerPath").value);
  if (!target || target === "__ROOTS__") return;

  $("rootPath").value = target;
  $("rootPath").dispatchEvent(new Event("change", { bubbles: true }));
  callFs({ action: "rootSelect", absolutePath: target }).then(got => show("configOut", got));
  close();
}

function renderCrumbs(current) {
  const host = $("rootPickerCrumbs");
  host.replaceChildren();

  const value = cleanSpecial(current);
  host.append(h("button", { className: "crumb", text: "Drives", on: { click: () => browse("__ROOTS__") } }));

  if (!value || value === "__ROOTS__") return;

  const parts = value.replaceAll("\\", "/").split("/").filter(Boolean);
  let built = value.match(/^[A-Za-z]:/) ? parts.shift() + "\\" : "";

  if (built) {
    host.append(h("button", { className: "crumb", text: built, on: { click: () => browse(built) } }));
  }

  for (const part of parts) {
    built = built ? built.replace(/[\\/]?$/, "\\") + part : part;
    host.append(h("button", { className: "crumb", text: part, on: { click: () => browse(built) } }));
  }
}

function cleanSpecial(value) {
  value = String(value || "__ROOTS__").trim();
  return value === "_ROOTS_" ? "__ROOTS__" : value;
}

function parentOf(value) {
  value = cleanSpecial(value);
  if (!value || value === "__ROOTS__") return "__ROOTS__";

  const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
  if (/^[A-Za-z]:$/.test(normalized)) return "__ROOTS__";

  const parts = normalized.split("/");
  if (parts.length <= 1) return "__ROOTS__";
  parts.pop();

  const joined = parts.join("\\");
  return /^[A-Za-z]:$/.test(joined) ? joined + "\\" : joined;
}
