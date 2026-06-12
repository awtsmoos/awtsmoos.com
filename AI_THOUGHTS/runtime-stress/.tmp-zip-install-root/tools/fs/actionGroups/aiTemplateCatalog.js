// B"H
const templates = {
  checkJs: {
    description: "Syntax-check one JS file and surface obvious verifier hints.",
    action: "commandTreeRun",
    template: { do: [
      { action: "syntaxCheck", with: { p: "${file}" }, saveAs: "syntax" },
      { action: "nodeCheckFile", with: { p: "${file}" }, saveAs: "node" }
    ] }
  },
  inspectRoute: {
    description: "Tree, search, AST outline, and architecture scan for a route/folder.",
    action: "commandTreeRun",
    template: { do: [
      { action: "tree", with: { p: "${path}", depth: 3, limit: 180 }, saveAs: "tree" },
      { action: "bulkSearch", with: { p: "${path}", query: "${query}", maxFiles: 500, maxResults: 60 }, saveAs: "search" },
      { action: "inferArchitecture", with: { p: "${path}" }, saveAs: "arch" }
    ] }
  },
  merkavaStress: {
    description: "Run the MerkavaExecutor stress suite.",
    action: "commandRun",
    template: { cwd: "geelooy/scripts/awtsmoos/MerkavaExecutor", command: "node stress-merkava-thread-runtime.cjs; node stress-merkava-pure-vm.cjs; node stress-merkava-source-pure-vm.cjs; node stress-merkava-frontier-js.cjs; node stress-merkava-virtual-browser.cjs; node stress-merkava-semantic.cjs; node stress-merkava-full-js.cjs; node run-merkava-runtime-tests.js", timeoutMs: 120000, maxChars: 70000 }
  },
  safePatchCheck: {
    description: "Read, patch-preview, syntax-check, and hash-check a JS file.",
    action: "commandTreeRun",
    template: { do: [
      { action: "read", with: { p: "${file}", maxChars: 12000 }, saveAs: "before" },
      { action: "fileHashes", with: { p: "${file}" }, saveAs: "hashBefore" },
      { action: "syntaxCheck", with: { p: "${file}" }, saveAs: "syntax" }
    ] }
  },
  browserSmoke: {
    description: "Chrome/live browser state, logs, and scoped screenshot-ready status.",
    action: "commandTreeRun",
    template: { do: [
      { action: "chromeStatus", with: {}, saveAs: "status" },
      { action: "chromeLogs", with: { maxLogs: 30 }, saveAs: "logs" }
    ] }
  }
};
function names() { return Object.keys(templates).sort(); }
function get(name) { return templates[name] || null; }
function render(value, vars) {
  if (typeof value === "string") return value.replace(/\$\{([A-Za-z0-9_.-]+)\}/g, (_, k) => vars[k] ?? "");
  if (Array.isArray(value)) return value.map(v => render(v, vars));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, render(v, vars)]));
  return value;
}
module.exports = { templates, names, get, render };
