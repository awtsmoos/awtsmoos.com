
// B"H
import { h, field, out, $, qsa } from "../ui/dom.js";
import { callFs, show } from "../ui/api.js";

export function explorer() {
  return h("section", { className: "pane", data: { pane: "explorer" } }, [
    h("div", { className: "page-head" }, [h("p", { className: "eyebrow", text: "File explorer" }), h("h2", { text: "Project browser" })]),
    h("article", { className: "panel" }, [
      h("div", { className: "form-grid" }, [field("explorerPath", "Path inside root", { value: ".", className: "span-6" }), field("treeDepth", "Depth", { type: "number", value: "2", className: "span-3" }), field("treeLimit", "Limit", { type: "number", value: "80", className: "span-3" })]),
      h("div", { className: "button-row" }, ["listBtn:List", "treeBtn:Tree", "readBtn:Read", "mdBtn:Read Markdown"].map(x => h("button", { id: x.split(":")[0], text: x.split(":")[1] }))),
      h("div", { id: "explorerList", className: "file-list" }, [h("div", { className: "empty-state", text: "Run List or Tree to load files." })])
    ]),
    out("explorerPreview", "Nothing loaded yet."),
    h("details", { open: true }, [h("summary", { text: "Explorer JSON" }), out("explorerOut")])
  ]);
}

export function mountExplorer() {
  $("listBtn").onclick = () => run("list");
  $("treeBtn").onclick = () => run("tree");
  $("readBtn").onclick = () => run("read");
  $("mdBtn").onclick = () => run("md");
}

async function run(action) {
  const got = await callFs({ action, path: $("explorerPath").value, depth: $("treeDepth").value, limit: $("treeLimit").value });
  show("explorerOut", got);
  $("explorerPreview").textContent = got.content || got.text || JSON.stringify(got, null, 2);
}
