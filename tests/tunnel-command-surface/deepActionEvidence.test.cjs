// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { actions } = require("../../geelooy/API/tunnel/control/docs/actions.js");
const { dispatchOsFs } = require("../../geelooy/API/tunnel/control/routes/osFs/index.js");
const { attachActionGuidance } = require("../../geelooy/API/tunnel/control/core/actionGuidance.js");

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(__dirname, "reports");
fs.mkdirSync(REPORT_DIR, { recursive: true });

const ALIAS = "deepAlias";
const files = {
  [`${ALIAS}/sample.js`]: "// B'H\nconst child = require('./child.js');\nfunction hi(){ return child.value; }\nmodule.exports={hi};\n",
  [`${ALIAS}/child.js`]: "// B'H\nexports.value = 1;\n",
  [`${ALIAS}/sample.json`]: JSON.stringify({ ok: true, name: "deep", items: [1,2,3] }, null, 2),
  [`${ALIAS}/openapi.yaml`]: "openapi: 3.0.0\npaths:\n  /bh:\n    get:\n      operationId: getBh\n      responses:\n        '200':\n          description: ok\n",
  [`${ALIAS}/index.html`]: "<main id='app'>B'H</main><script>window.__ok=1</script>"
};

const destructive = new Set([
  "write", "bulkWrite", "writeIfHash", "bulkWriteIfHashes", "findReplace", "replaceRange", "applyPatch",
  "mkdirp", "ensureFile", "touch", "copyFile", "copyTree", "moveFile", "moveTree", "deleteFile", "deleteTree", "emptyDir",
  "jsonFormat", "replaceFunction", "replaceFunctionBody", "insertBeforeFunction", "insertAfterFunction", "configSet", "rootSelect", "openRoot", "staticServerStart", "staticServerStop", "serverStart", "serverStop",
  "serverRestart", "processKillSafe", "portKillSafe", "safeInstall", "packageScriptRunner", "templatePatchRun", "macroPatch"
]);
const chrome = new Set(actions.filter(a => a.startsWith("chrome") || a.includes("Browser") || a === "httpUseChromeCookies" || a === "chromeUseHttpCookies"));

function os(name = "") { return [ALIAS, name].filter(Boolean).join("/"); }

function payloadFor(action) {
  const sample = os("sample.js");
  const folder = ALIAS;
  const base = {
    action, p: folder, path: folder, target: sample, entry: os("index.html"),
    maxText: 8000, maxChars: 8000, maxResults: 10, maxFiles: 30, limit: 20, depth: 3,
    dryRun: true, query: "B'H", url: "https://awtsmoos.example.test/bh", method: "GET",
    command: "echo BH", scriptText: "return { ok: true };", expression: "1+1",
    continuationPrompt: "Keep going. List remaining work and do it one by one."
  };
  if (/md$|read|stat|hash|ast|symbol|dependency|graph|bundle|export|semantic|line|mutationPatchTest/i.test(action)) return { ...base, path: sample, p: sample, paths: [sample], startLine: 1, endLine: 3 };
  if (/json|package/i.test(action)) return { ...base, path: os("sample.json"), p: os("sample.json") };
  if (/apiContract|openApi/i.test(action)) return { ...base, path: os("openapi.yaml"), p: os("openapi.yaml"), getOnly: true };
  if (/grep|search|find|overview|files|stats|audit|doctor|scan|diff|pack|context|affected/i.test(action)) return { ...base, path: folder, p: folder };
  if (/Batch|Workflow|commandTree|assert|retry|snapshotBeforeAfter|policyGuard|destructiveIntentGate/i.test(action)) return { ...base, steps: [{ name: "stat", action: "stat", payload: { path: sample }}] };
  if (/runtime|Runtime|merkava|preview|browserReplay|virtualDom/i.test(action)) return { ...base, runtime: "browser", engine: "merkava", files: { "index.html": files[os("index.html")] } };
  return base;
}

function makeDb() {
  return {
    async get(key) {
      if (key === `/users/deep-test/aliases/` || key === `/users/deep-test/aliases`) return { [ALIAS]: { aliasId: ALIAS, name: ALIAS } };
      if (key === `/users/deep-test/aliases/${ALIAS}` || key === `/users/deep-test/aliases/${ALIAS}.awtsmoosJSON`) return true;
      return undefined;
    },
    async read(key) {
      const marker = `/aliases/${ALIAS}/fileSystem/`;
      const index = String(key).indexOf(marker);
      if (index === -1) return undefined;
      const inner = String(key).slice(index + marker.length).replace(/\/$/, "");
      if (!inner) return Object.keys(files).map(x => x.slice(ALIAS.length + 1));
      return files[`${ALIAS}/${inner}`];
    }
  };
}
function makeContext() { return { db: makeDb(), response: { setHeader(){}, statusCode: 200 }, request: {}, paramKinds: { GET:{}, POST:{} }, $_GET:{}, $_POST:{} }; }

function assertGuidance(result, action) {
  const guided = attachActionGuidance(result, { action });
  assert.equal(guided.aiGuidance.keepGoing, true, action + " missing keepGoing");
  assert.ok(Array.isArray(guided.aiGuidance.prompts), action + " missing prompt pack");
  assert.ok(guided.aiGuidance.prompts.length >= 5, action + " prompt pack too small");
  assert.match(guided.aiGuidance.confusingActionPrompt, /confusing action/i, action + " missing confusing action prompt");
  return guided.aiGuidance;
}

function classify(result, error, action) {
  if (destructive.has(action)) return "skipped_destructive";
  if (chrome.has(action)) return "skipped_chrome";
  if (error) return "threw";
  if (!result || typeof result !== "object") return "bad_shape";
  if (result.result?.type === "documented-action-report") return "generic_stub";
  if (result.implemented === false) return "registration_only";
  if (result.ok === false) return "explicit_false";
  return "real_result";
}

function assertByFamily(action, result) {
  if (destructive.has(action) || chrome.has(action)) return [];
  const checks = [];
  assert.ok(result && typeof result === "object", `${action} must return object`); checks.push("object");
  assert.notEqual(result.result?.type, "documented-action-report", `${action} generic stub forbidden`); checks.push("not_generic_stub");
  assert.notEqual(result.implemented, false, `${action} registration-only forbidden`); checks.push("not_registration_only");
  assertGuidance(result, action); checks.push("guidance_pack");
  if (/readLines/.test(action)) { assert.ok(result.lines || result.results, `${action} needs line results`); checks.push("line_results"); }
  if (/http|api|endpoint|oauth|network|transport/i.test(action)) { assert.ok(result.resultType || result.checks || result.request || result.response || result.family, `${action} needs network detail`); checks.push("network_detail"); }
  if (/^(commandRun|nodeScriptRun|nodeCheck|nodeInstantTests|instantTests|nodeCheckMany|nodeCheckTree|testRunner|testMatrixRunner|watchTestOnce|lintRunner|typecheckRunner|buildRunner|previewBuildRunner|coverageRunner|processList|processFind|portList|portFind|gitStatusDeep|gitDiffSmart|gitPatchSummary|gitSafeCommitPlan)$/.test(action)) { assert.ok(result.resultType || result.executable || result.checks || result.selectedFiles || result.family, `${action} needs command detail`); checks.push("command_detail"); }
  if (/finishAndContinue/.test(action)) { assert.match(result.finalInstruction?.content || "", /Keep going|remaining/i); checks.push("finish_prompt"); }
  return checks;
}

(async () => {
  const rows = [];
  for (const action of actions) {
    const payload = payloadFor(action);
    let result = null, error = null, checks = [];
    if (!destructive.has(action) && !chrome.has(action)) {
      try { result = await dispatchOsFs(makeContext(), "deep-test", payload); checks = assertByFamily(action, result); }
      catch (e) { error = { message: e.message, stack: e.stack }; }
    }
    rows.push({ action, status: classify(result, error, action), payload, checks, keys: result && typeof result === "object" ? Object.keys(result).sort() : [], sample: result ? JSON.parse(JSON.stringify(result, (k,v)=> typeof v === 'string' && v.length>500 ? v.slice(0,500)+'…' : v)) : null, error: error?.message || null });
  }
  const counts = rows.reduce((a,r)=>((a[r.status]=(a[r.status]||0)+1),a),{});
  const report = { generatedAt: new Date().toISOString(), total: actions.length, counts, rows };
  fs.writeFileSync(path.join(REPORT_DIR, "deep-action-evidence.json"), JSON.stringify(report, null, 2));
  const failures = rows.filter(r => !["real_result", "skipped_destructive", "skipped_chrome", "explicit_false"].includes(r.status));
  console.log(JSON.stringify({ total: report.total, counts, failures: failures.slice(0,20).map(f => ({ action:f.action, status:f.status, error:f.error })) }, null, 2));
  assert.equal(failures.length, 0, `${failures.length} deep action evidence failures`);
})();
