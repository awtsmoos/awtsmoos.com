// B"H

import { h, field, out, $, qsa } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";

/**
 * B"H
 * Chapter 901: The explorer became a tree, not a carnival.
 *
 * The Awtsmoos reveals files like a calm editor: path controls above, tree on
 * the left, preview below/in flow, JSON hidden unless the human asks for it.
 */
export function explorer() {
  return h("section", { className: "pane awt-explorer-console", data: { pane: "explorer" } }, [
    h("div", { className: "page-head awt-compact-head" }, [
      h("p", { className: "eyebrow", text: "FILES" }),
      h("h2", { text: "Project explorer" }),
      h("p", { text: "VS Code style project tree with a readable preview. One page, one scroll." })
    ]),
    h("article", { className: "panel awt-explorer-controls" }, [
      h("div", { className: "form-grid" }, [
        field("explorerPath", "Path", { value: ".", className: "span-6" }),
        field("treeDepth", "Depth", { type: "number", value: "2", className: "span-3" }),
        field("treeLimit", "Limit", { type: "number", value: "120", className: "span-3" })
      ]),
      h("div", { className: "button-row" }, [
        button("listBtn", "List", "primary"),
        button("treeBtn", "Tree"),
        button("readBtn", "Read"),
        button("mdBtn", "Markdown")
      ])
    ]),
    h("article", { className: "awt-explorer-grid" }, [
      h("section", { className: "panel stack" }, [
        h("div", { className: "awt-section-title", text: "Tree" }),
        h("div", { id: "explorerList", className: "file-list awt-file-tree" }, [h("div", { className: "empty-state", text: "Run List or Tree to load files." })])
      ]),
      h("section", { className: "panel stack" }, [
        h("div", { className: "awt-section-title", text: "Preview" }),
        out("explorerPreview", "Nothing loaded yet.")
      ])
    ]),
    h("details", { className: "panel stack awt-json-details" }, [h("summary", { text: "Explorer JSON" }), out("explorerOut")])
  ]);
}

export function mountExplorer() {
  if (!$("listBtn")) return;
  $("listBtn").onclick = () => run("list");
  $("treeBtn").onclick = () => run("tree");
  $("readBtn").onclick = () => run("read");
  $("mdBtn").onclick = () => run("md");
  $("explorerList")?.addEventListener("click", event => {
    const node = event.target.closest("[data-path]");
    if (!node) return;
    $("explorerPath").value = node.dataset.path;
    run("read");
  });
}

function button(id, text, className = "") {
  return h("button", { id, text, className });
}

async function run(action) {
  const got = await callFs({ action, path: $("explorerPath").value, depth: $("treeDepth").value, limit: $("treeLimit").value });
  show("explorerOut", got);
  renderTree(got);
  $("explorerPreview").textContent = got.content || got.text || JSON.stringify(got, null, 2);
}

function renderTree(got) {
  const root = $("explorerList");
  if (!root) return;
  const items = got.items || got.entries || got.files || [];
  if (!items.length && got.tree) return renderTreeText(root, got.tree);
  if (!items.length) return root.replaceChildren(h("div", { className: "empty-state", text: "No entries returned." }));
  root.replaceChildren(...items.map(item => treeRow(item)));
}

function renderTreeText(root, text) {
  const lines = String(text).split("\n").filter(Boolean).slice(0, 500);
  root.replaceChildren(...lines.map(line => h("button", { className: "awt-file-row", text: line })));
}

function treeRow(item) {
  const path = item.path || item.name || item;
  const isDir = item.type === "dir" || item.kind === "directory" || item.isDirectory;
  return h("button", { className: `awt-file-row ${isDir ? "is-dir" : "is-file"}`, data: { path }, text: `${isDir ? "▸" : "·"} ${path}` });
}
