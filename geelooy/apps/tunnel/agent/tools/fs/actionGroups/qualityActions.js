// B"H
const fs = require("fs");
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { readText } = require("../readWrite.js");
const { runActionBatch } = require("../actionBatch.js");
const { scopeOutlineFromText } = require("../semantic/scopeOutline.js");
const { scopeEdit } = require("../semantic/scopeEdit.js");

async function astOutline(config, payload) {
  const p = payload.path || payload.p || ".";
  const got = await readText(config, p, payload.maxChars || 1000000, 0);
  return { action: "astOutline", ...scopeOutlineFromText(got.content || "", p) };
}

async function semanticEdit(config, payload) {
  return await scopeEdit(config, payload);
}

function report(action, config, payload) {
  const root = safePath(config, payload.path || payload.p || ".");
  const packageJson = path.join(root, "package.json");
  const hasPackage = fs.existsSync(packageJson);
  return {
    ok: true,
    action,
    target: root,
    checks: { hasPackageJson: hasPackage, exists: fs.existsSync(root) },
    suggestedNext: ["astOutline", "semanticEditPreview", "replaceScope", "dependencyGraph"]
  };
}

function buildQualityActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const simple = name => async () => report(name, config, payload);
  return {
    astOutline: async () => astOutline(config, payload),
    semanticEditPreview: async () => semanticEdit(config, { ...payload, preview: true }),
    replaceScope: async () => semanticEdit(config, payload),
    replaceScopeBody: async () => semanticEdit(config, payload),
    replaceSymbol: async () => semanticEdit(config, payload),
    replaceMethod: async () => semanticEdit(config, { ...payload, kind: "method" }),
    replaceFunction: async () => semanticEdit(config, payload),
    replaceFunctionBody: async () => semanticEdit(config, payload),
    insertBeforeFunction: async () => semanticEdit(config, payload),
    insertAfterFunction: async () => semanticEdit(config, payload),
    insertBeforeScope: async () => semanticEdit(config, payload),
    insertAfterScope: async () => semanticEdit(config, payload),
    testMatrix: async () => runActionBatch({ ...payload, steps: payload.cases || payload.steps || [] }, async next => buildActions(config, next, ws)[next.action]()),
    bundleTrace: simple("bundleTrace"),
    dependencyCycleCheck: simple("dependencyCycleCheck"),
    deadExportScan: simple("deadExportScan"),
    mutationPatchTest: simple("mutationPatchTest"),
    browserReplay: async () => buildActions(config, { ...payload, action: "simulateRuntime", runtime: "browser" }, ws).simulateRuntime(),
    apiContractCheck: simple("apiContractCheck"),
    perfBudgetCheck: simple("perfBudgetCheck")
  };
}

module.exports = { buildQualityActions, astOutline };
