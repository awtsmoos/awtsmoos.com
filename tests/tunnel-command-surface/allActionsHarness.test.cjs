// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { actions } = require("../../geelooy/API/tunnel/control/docs/actions.js");
const { dispatchOsFs } = require("../../geelooy/API/tunnel/control/routes/osFs/index.js");

const ROOT = path.resolve(__dirname, "../..");
const reportDir = path.join(__dirname, "reports");
fs.mkdirSync(reportDir, { recursive: true });

const ALIAS = "testAlias";
const osFiles = {
  [`${ALIAS}/sample.js`]: "// B'H\nconst child = require('./child.js');\nfunction hi(){ return child.value; }\nmodule.exports={hi};\n",
  [`${ALIAS}/child.js`]: "// B'H\nexports.value = 1;\n",
  [`${ALIAS}/sample.json`]: JSON.stringify({ ok: true }, null, 2),
  [`${ALIAS}/index.html`]: "<main id='app'>B'H</main><script>window.__ok=1</script>",
  [`${ALIAS}/openapi.yaml`]: "openapi: 3.0.0\npaths:\n  /bh:\n    get:\n      operationId: getBh\n      responses:\n        '200':\n          description: ok\n",
  [`${ALIAS}/openapi.yaml`]: "openapi: 3.0.0\npaths:\n  /bh:\n    get:\n      operationId: getBh\n      responses:\n        '200':\n          description: ok\n"
};

const destructive = new Set([
  "write", "bulkWrite", "writeIfHash", "bulkWriteIfHashes", "findReplace", "replaceRange", "applyPatch",
  "mkdirp", "ensureFile", "touch", "copyFile", "copyTree", "moveFile", "moveTree", "deleteFile", "deleteTree", "emptyDir",
  "jsonFormat", "replaceFunction", "replaceFunctionBody", "insertBeforeFunction", "insertAfterFunction", "configSet", "rootSelect", "openRoot", "staticServerStart", "staticServerStop", "serverStart", "serverStop",
  "serverRestart", "processKillSafe", "portKillSafe", "safeInstall", "packageScriptRunner", "templatePatchRun", "macroPatch"
]);
const chrome = new Set(actions.filter(a => a.startsWith("chrome") || a.includes("Browser") || a === "httpUseChromeCookies" || a === "chromeUseHttpCookies"));
const commandish = new Set(actions.filter(a => a.startsWith("command") || a.startsWith("node") || a.endsWith("Runner") || ["testRunner","lintRunner","typecheckRunner","buildRunner","coverageRunner"].includes(a)));

function os(name = "") { return [ALIAS, name].filter(Boolean).join("/"); }

function payloadFor(action) {
  const sample = os("sample.js");
  const folder = ALIAS;
  const base = { action, p: folder, path: folder, maxText: 4000, maxChars: 4000, maxResults: 5, maxFiles: 20, limit: 20, depth: 2, dryRun: true };
  if (["read", "readLines", "readBytes", "read64", "md", "astOutline", "symbolOutline", "fileHashes", "stat"].includes(action)) return { ...base, path: sample, p: sample, paths: [sample] };
  if (["grep", "rg", "rgbgrep", "bulkSearch", "bulkSearchPage", "find", "findFiles"].includes(action)) return { ...base, p: folder, path: folder, query: "B'H" };
  if (action === "semanticSearch") return { ...base, p: sample, path: sample, query: "B'H" };
  if (["dependencyGraph", "connectedFiles", "importResolverExplain", "symbolResolutionTrace"].includes(action)) return { ...base, path: sample, p: sample, entry: sample, target: sample };
  if (["jsonValidate", "packageInfo"].includes(action)) return { ...base, path: os("sample.json"), p: os("sample.json") };
  if (["deadExportScan", "mutationPatchTest"].includes(action)) return { ...base, path: sample, p: sample };
  if (action === "apiContractCheck") return { ...base, path: os("openapi.yaml"), p: os("openapi.yaml"), getOnly: true };
  if (["deadExportScan", "mutationPatchTest"].includes(action)) return { ...base, path: sample, p: sample };
  if (action === "apiContractCheck") return { ...base, path: os("openapi.yaml"), p: os("openapi.yaml"), getOnly: true };
  if (["actionBatch", "workflowRun", "commandBatch", "aiCommandBatch"].includes(action)) return { ...base, steps: [{ action: "stat", payload: { path: sample } }] };
  if (action.includes("Runtime") || action.includes("runtime") || action.includes("Merkava") || action === "simulateRuntime") return { ...base, entry: os("index.html"), files: { "index.html": osFiles[os("index.html")] }, engine: "merkava", runtime: "browser" };
  if (commandish.has(action)) return { ...base, command: "echo BH", scriptText: "return {ok:true}", expression: "1+1" };
  return base;
}

function makeDb() {
  return {
    async get(key) {
      if (key === `/users/all-actions-test/aliases/` || key === `/users/all-actions-test/aliases`) return { [ALIAS]: { aliasId: ALIAS, name: ALIAS } };
      if (key === `/users/all-actions-test/aliases/${ALIAS}` || key === `/users/all-actions-test/aliases/${ALIAS}.awtsmoosJSON`) return true;
      return undefined;
    },
    async read(key) {
      const marker = `/aliases/${ALIAS}/fileSystem/`;
      const index = String(key).indexOf(marker);
      if (index === -1) return undefined;
      const inner = String(key).slice(index + marker.length).replace(/\/$/, "");
      if (!inner) return Object.keys(osFiles).map(x => x.slice(ALIAS.length + 1));
      return osFiles[`${ALIAS}/${inner}`];
    }
  };
}

function makeContext() {
  return { db: makeDb(), response: { setHeader() {}, statusCode: 200 }, request: {}, paramKinds: { GET: {}, POST: {} }, $_GET: {}, $_POST: {} };
}

function classify(action, result, error) {
  if (destructive.has(action)) return "skipped_destructive";
  if (chrome.has(action)) return "skipped_chrome";
  if (error) return "threw";
  if (!result || typeof result !== "object") return "bad_shape";
  if (result.result?.type === "documented-action-report") return "generic_stub";
  if (result.ok === false && /Merkava runtime service unavailable|Cannot find module/.test(String(result.message || result.error || ""))) return "missing_runtime";
  if (result.ok === false && /unsupported|unavailable|disabled|alias_not_owned/i.test(String(result.error || result.message || ""))) return "explicit_unavailable";
  if (Object.prototype.hasOwnProperty.call(result, "ok")) return "real_result";
  return "missing_ok";
}

(async () => {
  assert.equal(new Set(actions).size, actions.length, "catalog duplicates");
  const rows = [];
  for (const action of actions) {
    let result = null;
    let error = null;
    if (!destructive.has(action) && !chrome.has(action)) {
      try { result = await dispatchOsFs(makeContext(), "all-actions-test", payloadFor(action)); }
      catch (e) { error = { message: e.message, stack: e.stack }; }
    }
    const status = classify(action, result, error);
    rows.push({ action, status, ok: result?.ok ?? null, keys: result && typeof result === "object" ? Object.keys(result).slice(0, 20) : [], error: error?.message || result?.error || result?.message || null, type: result?.result?.type || null });
  }
  const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});
  const report = { generatedAt: new Date().toISOString(), total: actions.length, counts, rows };
  const out = path.join(reportDir, "all-actions-report.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ BH: "B'H", report: path.relative(ROOT, out), total: actions.length, counts }, null, 2));
  if (process.env.AWTSMOOS_STRICT_ALL_ACTIONS === "1") {
    const bad = rows.filter(r => !["real_result", "skipped_destructive", "skipped_chrome", "explicit_unavailable", "missing_runtime"].includes(r.status));
    assert.equal(bad.length, 0, `${bad.length} actions need real implementation; see ${out}`);
  }
})();
