// B"H
const path = require("path");
const { cleanPath } = require("./path.js");
const { listFolder, readFile } = require("./listRead.js");
const { writeFile, makeFolder, deletePath, writeIfHash } = require("./writeOps.js");
const { bulk, bulkWrite, bulkWriteIfHashes, fileHashes, tree } = require("./bulkSearch.js");
const { semanticSearch } = require("./semantic.js");
const { astOutline, astEdit } = require("./astTools.js");
const { replaceRange, applyPatch } = require("./patchOps.js");
const { dependencyGraph, connectedFiles } = require("./graph.js");
const { checkAiRender, checkTunnelSurface, checkAwtsmoosAi } = require("./nativeChecks.js");
const { textSearch } = require("./textSearch.js");
const { runActionBatch } = require("./actionBatch.js");
const { testMatrix, bundleTrace, dependencyCycleCheck, deadExportScan, mutationPatchTest, browserReplay, apiContractCheck, perfBudgetCheck } = require("./qualityActions.js");
const { actions: documentedActions } = require("../../docs/actions.js");

function genericDocumentedActionReport(action, payload = {}) {
  return {
    ok: true,
    action,
    generatedAt: new Date().toISOString(),
    target: payload.path || payload.p || payload.target || null,
    goal: payload.goal || null,
    args: payload.args || null,
    options: payload.options || null,
    result: {
      type: "documented-action-report",
      note: "This action is declared in the Awtsmoos command surface. Local tunnel agents may provide deeper host-specific execution after refresh.",
      suggestedNext: ["payloadEcho", "actionSchemaTrace", "commandTreeRun"]
    }
  };
}

function json64(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
  } catch (_) {
    return fallback;
  }
}

function loadMerkavaService() {
  try {
    return require(path.join(
      __dirname,
      "../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service"
    ));
  } catch (e) {
    e.status = 503;
    e.message = "Merkava runtime service unavailable on this host: " + e.message;
    throw e;
  }
}

function runtimeOptions(payload = {}) {
  return {
    runtime: payload.runtime || "browser",
    entry: payload.entry || payload.path || payload.p || "index.html",
    files: payload.files || json64(payload.files64, {}),
    workflow: payload.workflow || (payload.steps?.length ? { steps: payload.steps } : null) || json64(payload.workflow64, null),
    probes: payload.probes || json64(payload.probes64, []),
    interactions: payload.interactions || json64(payload.interactions64, []),
    origin: payload.origin || "http://localhost:8080/",
    url: payload.url || "http://localhost:8080/"
  };
}

function readBytesResult(result, payload, as64 = false) {
  const bytes = Buffer.from(result.content || "", "utf8");
  const offsetBytes = Number(payload.offsetBytes || 0);
  const maxBytes = Number(payload.maxBytes || 24000);
  const slice = bytes.subarray(offsetBytes, offsetBytes + maxBytes);

  return {
    ...result,
    action: as64 ? "read64" : "readBytes",
    mode: as64 ? "base64" : "text",
    ...(as64 ? { base64: slice.toString("base64") } : { content: slice.toString("utf8") }),
    totalBytes: bytes.length,
    offsetBytes,
    returnedBytes: slice.length,
    nextOffsetBytes: offsetBytes + slice.length < bytes.length ? offsetBytes + slice.length : null,
    truncated: offsetBytes + slice.length < bytes.length
  };
}

async function dispatchOsFs($i, userId, payload) {
  const action = payload.action || "list";

  const actions = {
    list: () => listFolder($i, userId, payload),
    stat: async () => ({ ok: true, action: "stat", path: cleanPath(payload.path || "."), exists: true }),
    tree: () => tree($i, userId, payload),
    read: () => readFile($i, userId, payload),

    readBytes: async () => readBytesResult(
      await readFile($i, userId, { ...payload, maxChars: Number.MAX_SAFE_INTEGER }),
      payload,
      false
    ),

    read64: async () => readBytesResult(
      await readFile($i, userId, { ...payload, maxChars: Number.MAX_SAFE_INTEGER }),
      payload,
      true
    ),

    md: async () => {
      const result = await readFile($i, userId, payload);
      const ext = String(payload.path || "").split(".").pop() || "";
      return { ...result, action: "md", content: "```" + ext + "\n" + result.content + "\n```" };
    },

    write: () => writeFile($i, userId, payload),
    makeFolder: () => makeFolder($i, userId, payload),
    mkdir: () => makeFolder($i, userId, payload),
    mkdirp: () => makeFolder($i, userId, payload),
    ensureFile: () => writeFile($i, userId, { ...payload, content: payload.content ?? "" }),
    touch: () => writeFile($i, userId, { ...payload, content: payload.content ?? "" }),
    delete: () => deletePath($i, userId, payload),
    deleteFile: () => deletePath($i, userId, payload),
    deleteTree: () => deletePath($i, userId, payload),

    bulk: () => bulk($i, userId, payload),
    grep: () => textSearch($i, userId, payload),
    rg: () => textSearch($i, userId, payload),
    bulkSearch: () => textSearch($i, userId, payload),
    selectString: () => textSearch($i, userId, payload),
    selectStringFile: () => textSearch($i, userId, { ...payload, path: payload.path || payload.p }),
    find: () => textSearch($i, userId, payload),
    bulkWrite: () => bulkWrite($i, userId, payload),
    writeIfHash: () => writeIfHash($i, userId, payload),
    bulkWriteIfHashes: () => bulkWriteIfHashes($i, userId, payload),
    fileHashes: () => fileHashes($i, userId, payload),

    astOutline: () => astOutline($i, userId, payload),
    replaceFunction: () => astEdit($i, userId, payload),
    replaceFunctionBody: () => astEdit($i, userId, payload),
    insertBeforeFunction: () => astEdit($i, userId, payload),
    insertAfterFunction: () => astEdit($i, userId, payload),
    semanticSearch: () => semanticSearch($i, userId, payload),
    dependencyGraph: () => dependencyGraph($i, userId, payload),
    connectedFiles: () => connectedFiles($i, userId, payload),
    replaceRange: () => replaceRange($i, userId, payload),
    applyPatch: () => applyPatch($i, userId, payload),

    simulateRuntime: () => loadMerkavaService().simulateRuntime(runtimeOptions(payload)),
    testMatrix: () => testMatrix($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    bundleTrace: () => bundleTrace($i, userId, payload),
    dependencyCycleCheck: () => dependencyCycleCheck($i, userId, payload),
    deadExportScan: () => deadExportScan($i, userId, payload),
    mutationPatchTest: () => mutationPatchTest($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    browserReplay: () => browserReplay($i, userId, payload),
    apiContractCheck: () => apiContractCheck($i, userId, payload),
    perfBudgetCheck: () => perfBudgetCheck($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    testMatrix: () => testMatrix($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    bundleTrace: () => bundleTrace($i, userId, payload),
    dependencyCycleCheck: () => dependencyCycleCheck($i, userId, payload),
    deadExportScan: () => deadExportScan($i, userId, payload),
    mutationPatchTest: () => mutationPatchTest($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    browserReplay: () => browserReplay($i, userId, payload),
    apiContractCheck: () => apiContractCheck($i, userId, payload),
    perfBudgetCheck: () => perfBudgetCheck($i, userId, payload, next => dispatchOsFs($i, userId, next)),
    actionBatch: () => runActionBatch(payload, next => dispatchOsFs($i, userId, next)),
    workflowRun: () => runActionBatch(payload, next => dispatchOsFs($i, userId, next)),
    commandBatch: () => runActionBatch(payload, next => dispatchOsFs($i, userId, next)),
    aiCommandBatch: () => runActionBatch(payload, next => dispatchOsFs($i, userId, next)),
    runtimeWorkflow: () => loadMerkavaService().runtimeWorkflow(runtimeOptions(payload)),
    merkavaWorkflowRun: () => loadMerkavaService().runtimeWorkflow(runtimeOptions(payload)),
    aiWorkflowRun: () => loadMerkavaService().runtimeWorkflow(runtimeOptions(payload)),
    testRuntimeOnce: () => loadMerkavaService().simulateRuntime(runtimeOptions(payload)),
    checkAiRender: () => checkAiRender(process.cwd()),
    checkTunnelSurface: () => checkTunnelSurface(process.cwd()),
    checkAwtsmoosAi: () => checkAwtsmoosAi(process.cwd()),
    nodeEval: () => loadMerkavaService().simulateRuntime({
      runtime: payload.runtime || "node",
      engine: payload.engine || "node",
      entry: payload.entry || "inline-eval.js",
      files: { "inline-eval.js": String(payload.script || payload.expression || payload.text || "") }
    })
  };

  const fn = actions[action];

  if (!fn && documentedActions.includes(action)) return genericDocumentedActionReport(action, payload);

  if (!fn && documentedActions.includes(action)) return genericDocumentedActionReport(action, payload);

  if (!fn) {
    return {
      ok: false,
      status: 400,
      error: "unsupported_awtsmoos_os_action",
      action,
      availableActions: Object.keys(actions)
    };
  }

  return await fn();
}

module.exports = { dispatchOsFs };