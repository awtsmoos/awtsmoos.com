// B"H
const path = require("path");
const { cleanPath } = require("./path.js");
const { listFolder, readFile, readLines, readManyLines } = require("./listRead.js");
const { writeFile, makeFolder, deletePath, writeIfHash } = require("./writeOps.js");
const { bulk, bulkWrite, bulkWriteIfHashes, fileHashes, tree } = require("./bulkSearch.js");
const { semanticSearch } = require("./semantic.js");
const { astOutline, astEdit } = require("./astTools.js");
const { replaceRange, applyPatch } = require("./patchOps.js");
const { dependencyGraph, connectedFiles } = require("./graph.js");
const { checkAiRender, checkTunnelSurface, checkAwtsmoosAi } = require("./nativeChecks.js");
const { textSearch } = require("./textSearch.js");
const { runActionBatch } = require("./actionBatch.js");
const { commandTreeHandlers } = require("./commandTree.js");
const { testMatrix, bundleTrace, dependencyCycleCheck, deadExportScan, mutationPatchTest, browserReplay, apiContractCheck, perfBudgetCheck } = require("./qualityActions.js");
const { actions: documentedActions } = require("../../docs/actions.js");
const { actionRegistrationReport } = require("./actionRegistrationReport.js");
const projectDiagnostics = require("./projectDiagnostics.js");
const { supportAction } = require("./supportActions.js");
const {
  isVirtualWebsiteMissionAction,
  rejectVirtualWebsiteMission
} = require("./virtualAiAgents.js");
const { dispatchCommandSupport } = require("./commandSupport.js");
const { dispatchNetworkSupport } = require("./networkSupport.js");

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

let merkavaServicePromise = null;

/**
 * B"H
 * Chapter 7: The old gate tried to seize lightning with CommonJS hands.
 *
 * Merkava's runtime service is an ES module in the hosted vessel, so this
 * loader imports it dynamically and caches the promise. The Awtsmoos does not
 * force the light backward into require(); it opens an async gate and lets the
 * runtime arrive as itself.
 *
 * @returns {Promise<object>} Loaded Merkava runtime service namespace.
 */
async function loadMerkavaService() {
  if (!merkavaServicePromise) {
    const servicePath = path.join(
      __dirname,
      "../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"
    );
    merkavaServicePromise = import(servicePath).catch(error => {
      merkavaServicePromise = null;
      error.status = 503;
      error.message = "Merkava runtime service unavailable on this host: " + error.message;
      throw error;
    });
  }
  return await merkavaServicePromise;
}

function jsonText(value, fallback) {
  if (!value || value === "[object Object]") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); }
  catch (_) { return fallback; }
}

function arrayFromPayload(...values) {
  for (const value of values) {
    const parsed = jsonText(value, value);
    if (Array.isArray(parsed)) return parsed;
  }
  return [];
}

function actionsFromPayload(payload = {}) {
  return arrayFromPayload(
    payload.interactions,
    payload.browserActions,
    payload.pageActions,
    payload.actions,
    payload.actionsJson,
    json64(payload.interactions64, null),
    json64(payload.browserActions64, null),
    json64(payload.pageActions64, null),
    json64(payload.actions64, null),
    json64(payload.actionsJson64, null)
  );
}

function runtimeFiles(payload = {}) {
  const parsed = jsonText(payload.files, null) || json64(payload.files64, null);
  if (parsed && typeof parsed === "object") return parsed;
  if (payload.html) return { [payload.entry || "index.html"]: String(payload.html) };
  if (payload.content && payload.entry) return { [payload.entry]: String(payload.content) };
  return {};
}

function runtimeOptions(payload = {}) {
  const entry = payload.entry || (payload.path && payload.path !== "." ? payload.path : "index.html");
  return {
    runtime: payload.runtime || "browser",
    entry,
    files: runtimeFiles(payload),
    workflow: payload.workflow || (payload.steps?.length ? { steps: payload.steps } : null) || json64(payload.workflow64, null),
    probes: payload.probes || json64(payload.probes64, []),
    interactions: actionsFromPayload(payload),
    actions: actionsFromPayload(payload),
    browserActions: actionsFromPayload(payload),
    pageActions: actionsFromPayload(payload),
    returnValues: jsonText(payload.returnValues || payload.values, payload.returnValues || payload.values || json64(payload.returnValues64, []) || json64(payload.values64, [])),
    values: jsonText(payload.values || payload.returnValues, payload.values || payload.returnValues || json64(payload.values64, []) || json64(payload.returnValues64, [])),
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

  if (isVirtualWebsiteMissionAction(action)) {
    return rejectVirtualWebsiteMission(action, payload);
  }

  const actions = {
    list: () => listFolder($i, userId, payload),
    stat: async () => ({ ok: true, action: "stat", path: cleanPath(payload.path || "."), exists: true }),
    configGet: () => ({ ok: true, action: "configGet", config: { root: payload.path || payload.p || ".", maxFiles: payload.maxFiles, maxText: payload.maxText } }),
    roots: () => listFolder($i, userId, { ...payload, path: "." }),
    rootBrowse: () => listFolder($i, userId, { ...payload, path: payload.path || payload.p || "." }),
    tree: () => tree($i, userId, payload),
    read: () => readFile($i, userId, payload),
    readLines: () => readLines($i, userId, payload),
    readManyLines: () => readManyLines($i, userId, payload),
    readLines: () => readLines($i, userId, payload),
    readManyLines: () => readManyLines($i, userId, payload),

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
    rgbgrep: () => textSearch($i, userId, payload),
    bulkSearch: () => textSearch($i, userId, payload),
    bulkSearchPage: () => textSearch($i, userId, payload),
    findFiles: () => textSearch($i, userId, payload),
    selectString: () => textSearch($i, userId, payload),
    selectStringFile: () => textSearch($i, userId, { ...payload, path: payload.path || payload.p }),
    find: () => textSearch($i, userId, payload),
    bulkWrite: () => bulkWrite($i, userId, payload),
    writeIfHash: () => writeIfHash($i, userId, payload),
    bulkWriteIfHashes: () => bulkWriteIfHashes($i, userId, payload),
    fileHashes: () => fileHashes($i, userId, payload),

    astOutline: () => astOutline($i, userId, payload),
    symbolOutline: () => astOutline($i, userId, payload),
    importResolverExplain: () => dependencyGraph($i, userId, payload),
    symbolResolutionTrace: () => dependencyGraph($i, userId, payload),
    absoluteImportMapper: () => dependencyGraph($i, userId, payload),
    moduleGraphCompleteness: () => dependencyGraph($i, userId, payload),
    symbolOutline: () => astOutline($i, userId, payload),
    importResolverExplain: () => dependencyGraph($i, userId, payload),
    symbolResolutionTrace: () => dependencyGraph($i, userId, payload),
    absoluteImportMapper: () => dependencyGraph($i, userId, payload),
    moduleGraphCompleteness: () => dependencyGraph($i, userId, payload),
    replaceFunction: () => astEdit($i, userId, payload),
    replaceFunctionBody: () => astEdit($i, userId, payload),
    insertBeforeFunction: () => astEdit($i, userId, payload),
    insertAfterFunction: () => astEdit($i, userId, payload),
    jsonValidate: () => projectDiagnostics.jsonValidate($i, userId, payload),
    packageInfo: () => projectDiagnostics.packageInfo($i, userId, payload),
    projectOverview: () => projectDiagnostics.projectOverview($i, userId, payload),
    recentFiles: () => projectDiagnostics.recentFiles($i, userId, payload),
    largeFiles: () => projectDiagnostics.largeFiles($i, userId, payload),
    duplicateBasenames: () => projectDiagnostics.duplicateBasenames($i, userId, payload),
    textStats: () => projectDiagnostics.textStats($i, userId, payload),
    routeAudit: () => projectDiagnostics.routeAudit($i, userId, payload),
    agentSelfTest: () => projectDiagnostics.agentSelfTest($i, userId, payload),
    architectureScore: () => projectDiagnostics.architectureScore($i, userId, payload),
    inferArchitecture: () => projectDiagnostics.inferArchitecture($i, userId, payload),
    detectAbstractionLeaks: () => projectDiagnostics.detectAbstractionLeaks($i, userId, payload),
    jsonValidate: () => projectDiagnostics.jsonValidate($i, userId, payload),
    packageInfo: () => projectDiagnostics.packageInfo($i, userId, payload),
    projectOverview: () => projectDiagnostics.projectOverview($i, userId, payload),
    recentFiles: () => projectDiagnostics.recentFiles($i, userId, payload),
    largeFiles: () => projectDiagnostics.largeFiles($i, userId, payload),
    duplicateBasenames: () => projectDiagnostics.duplicateBasenames($i, userId, payload),
    textStats: () => projectDiagnostics.textStats($i, userId, payload),
    routeAudit: () => projectDiagnostics.routeAudit($i, userId, payload),
    agentSelfTest: () => projectDiagnostics.agentSelfTest($i, userId, payload),
    architectureScore: () => projectDiagnostics.architectureScore($i, userId, payload),
    inferArchitecture: () => projectDiagnostics.inferArchitecture($i, userId, payload),
    detectAbstractionLeaks: () => projectDiagnostics.detectAbstractionLeaks($i, userId, payload),
    semanticSearch: () => semanticSearch($i, userId, payload),
    dependencyGraph: () => dependencyGraph($i, userId, payload),
    connectedFiles: () => connectedFiles($i, userId, payload),
    replaceRange: () => replaceRange($i, userId, payload),
    applyPatch: () => applyPatch($i, userId, payload),

    simulateRuntime: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
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
    ...commandTreeHandlers(runActionBatch, next => dispatchOsFs($i, userId, next), payload),
    runtimeWorkflow: async () => (await loadMerkavaService()).runtimeWorkflow(runtimeOptions(payload)),
    merkavaWorkflowRun: async () => (await loadMerkavaService()).runtimeWorkflow(runtimeOptions(payload)),
    aiWorkflowRun: async () => (await loadMerkavaService()).runtimeWorkflow(runtimeOptions(payload)),
    inspectRuntime: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeSnapshot: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeSnapshotCompare: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeEntityGraph: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeContractRegistry: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeIntrospectionStream: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    runtimeOptionEcho: () => ({ ok: true, action: 'runtimeOptionEcho', options: runtimeOptions(payload) }),
    runtimeEngineMatrix: () => ({ ok: true, action: 'runtimeEngineMatrix', available: ['browser','node','merkava'] }),
    simulateRuntimeProviders: () => ({ ok: true, action: 'simulateRuntimeProviders', providers: ['merkava-service'] }),
    merkavaVsChromeDiff: () => ({ ok: true, action: 'merkavaVsChromeDiff', chromeEnabled: false, recommendation: 'Enable Chrome for diff testing' }),
    virtualDomDiff: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    testRuntimeOnce: async () => (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload)),
    checkAiRender: () => checkAiRender(process.cwd()),
    checkTunnelSurface: () => checkTunnelSurface(process.cwd()),
    checkAwtsmoosAi: () => checkAwtsmoosAi(process.cwd()),
    nodeEval: async () => (await loadMerkavaService()).simulateRuntime({
      runtime: payload.runtime || "node",
      engine: payload.engine || "node",
      entry: payload.entry || "inline-eval.js",
      files: { "inline-eval.js": String(payload.script || payload.expression || payload.text || "") }
    }),
    httpRequest: () => dispatchNetworkSupport("httpRequest", payload),
    httpJson: () => dispatchNetworkSupport("httpJson", payload),
    httpDownload: () => dispatchNetworkSupport("httpDownload", payload),
    httpCookieJarList: () => dispatchNetworkSupport("httpCookieJarList", payload),
    httpCookies: () => dispatchNetworkSupport("httpCookies", payload),
    httpCookieSet: () => dispatchNetworkSupport("httpCookieSet", payload),
    httpCookieDelete: () => dispatchNetworkSupport("httpCookieDelete", payload),
    httpSessionClear: () => dispatchNetworkSupport("httpSessionClear", payload),
    httpTrace: () => dispatchNetworkSupport("httpTrace", payload),
    apiSmokeTest: () => dispatchNetworkSupport("apiSmokeTest", payload),
    endpointDiscovery: () => dispatchNetworkSupport("endpointDiscovery", payload),
    apiContractDiscover: () => dispatchNetworkSupport("apiContractDiscover", payload),
    endpointMethodProbe: () => dispatchNetworkSupport("endpointMethodProbe", payload),
    transportMethodProbe: () => dispatchNetworkSupport("transportMethodProbe", payload),
    oauthStateDoctor: () => dispatchNetworkSupport("oauthStateDoctor", payload),
    networkReplaySummary: () => dispatchNetworkSupport("networkReplaySummary", payload),
    httpRequest: () => dispatchNetworkSupport("httpRequest", payload),
    httpJson: () => dispatchNetworkSupport("httpJson", payload),
    httpDownload: () => dispatchNetworkSupport("httpDownload", payload),
    httpCookieJarList: () => dispatchNetworkSupport("httpCookieJarList", payload),
    httpCookies: () => dispatchNetworkSupport("httpCookies", payload),
    httpCookieSet: () => dispatchNetworkSupport("httpCookieSet", payload),
    httpCookieDelete: () => dispatchNetworkSupport("httpCookieDelete", payload),
    httpSessionClear: () => dispatchNetworkSupport("httpSessionClear", payload),
    httpTrace: () => dispatchNetworkSupport("httpTrace", payload),
    apiSmokeTest: () => dispatchNetworkSupport("apiSmokeTest", payload),
    endpointDiscovery: () => dispatchNetworkSupport("endpointDiscovery", payload),
    apiContractDiscover: () => dispatchNetworkSupport("apiContractDiscover", payload),
    endpointMethodProbe: () => dispatchNetworkSupport("endpointMethodProbe", payload),
    transportMethodProbe: () => dispatchNetworkSupport("transportMethodProbe", payload),
    oauthStateDoctor: () => dispatchNetworkSupport("oauthStateDoctor", payload),
    networkReplaySummary: () => dispatchNetworkSupport("networkReplaySummary", payload),
    commandRun: () => dispatchCommandSupport("commandRun", payload),
    nodeScriptRun: () => dispatchCommandSupport("nodeScriptRun", payload),
    nodeCheck: () => dispatchCommandSupport("nodeCheck", payload),
    nodeInstantTests: () => dispatchCommandSupport("nodeInstantTests", payload),
    instantTests: () => dispatchCommandSupport("instantTests", payload),
    nodeCheckMany: () => dispatchCommandSupport("nodeCheckMany", payload),
    nodeCheckTree: () => dispatchCommandSupport("nodeCheckTree", payload),
    testRunner: () => dispatchCommandSupport("testRunner", payload),
    testMatrixRunner: () => dispatchCommandSupport("testMatrixRunner", payload),
    watchTestOnce: () => dispatchCommandSupport("watchTestOnce", payload),
    lintRunner: () => dispatchCommandSupport("lintRunner", payload),
    typecheckRunner: () => dispatchCommandSupport("typecheckRunner", payload),
    buildRunner: () => dispatchCommandSupport("buildRunner", payload),
    previewBuildRunner: () => dispatchCommandSupport("previewBuildRunner", payload),
    coverageRunner: () => dispatchCommandSupport("coverageRunner", payload),
    processList: () => dispatchCommandSupport("processList", payload),
    processFind: () => dispatchCommandSupport("processFind", payload),
    portList: () => dispatchCommandSupport("portList", payload),
    portFind: () => dispatchCommandSupport("portFind", payload),
    gitStatusDeep: () => dispatchCommandSupport("gitStatusDeep", payload),
    gitDiffSmart: () => dispatchCommandSupport("gitDiffSmart", payload),
    gitPatchSummary: () => dispatchCommandSupport("gitPatchSummary", payload),
    gitSafeCommitPlan: () => dispatchCommandSupport("gitSafeCommitPlan", payload),
    httpRequest: () => dispatchNetworkSupport("httpRequest", payload),
    httpJson: () => dispatchNetworkSupport("httpJson", payload),
    httpDownload: () => dispatchNetworkSupport("httpDownload", payload),
    httpCookieJarList: () => dispatchNetworkSupport("httpCookieJarList", payload),
    httpCookies: () => dispatchNetworkSupport("httpCookies", payload),
    httpCookieSet: () => dispatchNetworkSupport("httpCookieSet", payload),
    httpCookieDelete: () => dispatchNetworkSupport("httpCookieDelete", payload),
    httpSessionClear: () => dispatchNetworkSupport("httpSessionClear", payload),
    httpTrace: () => dispatchNetworkSupport("httpTrace", payload),
    apiSmokeTest: () => dispatchNetworkSupport("apiSmokeTest", payload),
    endpointDiscovery: () => dispatchNetworkSupport("endpointDiscovery", payload),
    apiContractDiscover: () => dispatchNetworkSupport("apiContractDiscover", payload),
    endpointMethodProbe: () => dispatchNetworkSupport("endpointMethodProbe", payload),
    transportMethodProbe: () => dispatchNetworkSupport("transportMethodProbe", payload),
    oauthStateDoctor: () => dispatchNetworkSupport("oauthStateDoctor", payload),
    networkReplaySummary: () => dispatchNetworkSupport("networkReplaySummary", payload),
    httpRequest: () => dispatchNetworkSupport("httpRequest", payload),
    httpJson: () => dispatchNetworkSupport("httpJson", payload),
    httpDownload: () => dispatchNetworkSupport("httpDownload", payload),
    httpCookieJarList: () => dispatchNetworkSupport("httpCookieJarList", payload),
    httpCookies: () => dispatchNetworkSupport("httpCookies", payload),
    httpCookieSet: () => dispatchNetworkSupport("httpCookieSet", payload),
    httpCookieDelete: () => dispatchNetworkSupport("httpCookieDelete", payload),
    httpSessionClear: () => dispatchNetworkSupport("httpSessionClear", payload),
    httpTrace: () => dispatchNetworkSupport("httpTrace", payload),
    apiSmokeTest: () => dispatchNetworkSupport("apiSmokeTest", payload),
    endpointDiscovery: () => dispatchNetworkSupport("endpointDiscovery", payload),
    apiContractDiscover: () => dispatchNetworkSupport("apiContractDiscover", payload),
    endpointMethodProbe: () => dispatchNetworkSupport("endpointMethodProbe", payload),
    transportMethodProbe: () => dispatchNetworkSupport("transportMethodProbe", payload),
    oauthStateDoctor: () => dispatchNetworkSupport("oauthStateDoctor", payload),
    networkReplaySummary: () => dispatchNetworkSupport("networkReplaySummary", payload),
    commandRun: () => dispatchCommandSupport("commandRun", payload),
    nodeScriptRun: () => dispatchCommandSupport("nodeScriptRun", payload),
    nodeCheck: () => dispatchCommandSupport("nodeCheck", payload),
    nodeInstantTests: () => dispatchCommandSupport("nodeInstantTests", payload),
    instantTests: () => dispatchCommandSupport("instantTests", payload),
    nodeCheckMany: () => dispatchCommandSupport("nodeCheckMany", payload),
    nodeCheckTree: () => dispatchCommandSupport("nodeCheckTree", payload),
    testRunner: () => dispatchCommandSupport("testRunner", payload),
    testMatrixRunner: () => dispatchCommandSupport("testMatrixRunner", payload),
    watchTestOnce: () => dispatchCommandSupport("watchTestOnce", payload),
    lintRunner: () => dispatchCommandSupport("lintRunner", payload),
    typecheckRunner: () => dispatchCommandSupport("typecheckRunner", payload),
    buildRunner: () => dispatchCommandSupport("buildRunner", payload),
    previewBuildRunner: () => dispatchCommandSupport("previewBuildRunner", payload),
    coverageRunner: () => dispatchCommandSupport("coverageRunner", payload),
    processList: () => dispatchCommandSupport("processList", payload),
    processFind: () => dispatchCommandSupport("processFind", payload),
    portList: () => dispatchCommandSupport("portList", payload),
    portFind: () => dispatchCommandSupport("portFind", payload),
    gitStatusDeep: () => dispatchCommandSupport("gitStatusDeep", payload),
    gitDiffSmart: () => dispatchCommandSupport("gitDiffSmart", payload),
    gitPatchSummary: () => dispatchCommandSupport("gitPatchSummary", payload),
    gitSafeCommitPlan: () => dispatchCommandSupport("gitSafeCommitPlan", payload)
  };

  const fn = actions[action];

  if (!fn && documentedActions.includes(action)) {
    return supportAction(action, payload, next => dispatchOsFs($i, userId, next));
  }

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
