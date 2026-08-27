// B"H
const { actions: documentedActions } = require("../../docs/actions.js");

const NATIVE = new Set(["list", "tree", "read", "readLines", "readManyLines", "readBytes", "read64", "md", "write", "makeFolder", "mkdir", "mkdirp", "ensureFile", "touch", "delete", "deleteFile", "deleteTree", "bulk", "grep", "rg", "rgbgrep", "bulkSearch", "bulkSearchPage", "findFiles", "selectString", "selectStringFile", "find", "bulkWrite", "writeIfHash", "bulkWriteIfHashes", "fileHashes", "astOutline", "symbolOutline", "importResolverExplain", "symbolResolutionTrace", "absoluteImportMapper", "moduleGraphCompleteness", "replaceFunction", "replaceFunctionBody", "insertBeforeFunction", "insertAfterFunction", "jsonValidate", "packageInfo", "projectOverview", "recentFiles", "largeFiles", "duplicateBasenames", "textStats", "routeAudit", "agentSelfTest", "architectureScore", "inferArchitecture", "detectAbstractionLeaks", "semanticSearch", "dependencyGraph", "connectedFiles", "replaceRange", "applyPatch", "simulateRuntime", "runtimeWorkflow", "merkavaWorkflowRun", "aiWorkflowRun", "inspectRuntime", "runtimeSnapshot", "runtimeSnapshotCompare", "runtimeEntityGraph", "runtimeContractRegistry", "runtimeIntrospectionStream", "runtimeOptionEcho", "runtimeEngineMatrix", "simulateRuntimeProviders", "merkavaVsChromeDiff", "virtualDomDiff", "testRuntimeOnce", "actionBatch", "workflowRun", "commandBatch", "aiCommandBatch", "payloadEcho", "actionSchemaTrace", "finishAndContinue"]);
const AI = new Set(["aiAgentList", "aiAgentMessage", "aiAgentSpawnTask", "aiAgentSpawnNovel", "aiAgentTaskStatus", "aiAgentTaskResult", "aiAgentTaskList", "aiAgentConfigSet", "aiAgentSetProviderKey", "aiAgentRemoveProviderKey"]);
const NETWORK = /^(http|network|api|endpoint|oauth|transport|cookie)/i;
const HOST = /(command|process|port|server|git|npm|script|shell|node|chrome|browser|build|lint|coverage|typecheck|watch|preview)/i;
const STATE = /(history|memory|preset|template|macro|cache|snapshot|workflow|batch|state)/i;
const DIAGNOSTIC = /(doctor|health|risk|scan|audit|diff|matrix|trace|explain|discover|probe|triage|plan|pack|report|summary|freshness|parity|compatibility|surface|manifest|contract|schema|fuzzer|stress|test|quality|dependency|route|architecture|context|review|release|repro|affected|blast|semantic|duplicate|large|dead|detect|infer|import|symbol)/i;

/**
 * B"H
 * Chapter 381: The Hosted Interpreter Learned Every Name Without Lying.
 *
 * Virtual OS parity is a living covenant, not a fake promise. Every tunnel verb
 * now receives an explicit classification. Native and AI verbs run real hosted
 * code; diagnostics receive user-scoped probes; host-only verbs are marked safe
 * and non-executing unless a real local tunnel is present. Thus the upstairs
 * GPT can act in realtime without pretending server storage is a phone shell.
 */
function classifyVirtualAction(action = "") {
  const name = String(action || "");
  if (NATIVE.has(name)) return { mode: "native", fullyExecutable: true, family: "virtual-os-native" };
  if (AI.has(name)) return { mode: "ai", fullyExecutable: true, family: "virtual-os-ai" };
  if (NETWORK.test(name)) return { mode: "hosted-network", fullyExecutable: true, family: "network" };
  if (STATE.test(name)) return { mode: "hosted-state", fullyExecutable: true, family: "stateful-memory" };
  if (DIAGNOSTIC.test(name)) return { mode: "interpreted-diagnostic", fullyExecutable: false, family: "diagnostic" };
  if (HOST.test(name)) return { mode: "host-only-safe-report", fullyExecutable: false, family: "host-command" };
  return { mode: "interpreted-generic", fullyExecutable: false, family: "general-support" };
}
function virtualActionReport(action, payload = {}) {
  const classification = classifyVirtualAction(action);
  return { ok: true, action, vessel: "virtual-os", resultType: "virtual-action-bridge", classification, localTunnelRequiredForFullHostParity: classification.mode === "host-only-safe-report", documented: documentedActions.includes(action), payloadKeys: Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== "" && k !== "apiKey").sort(), generatedAt: new Date().toISOString() };
}
function virtualSurfaceReport() {
  const items = documentedActions.map(action => ({ action, ...classifyVirtualAction(action) }));
  const counts = items.reduce((acc, item) => { acc[item.mode] = (acc[item.mode] || 0) + 1; return acc; }, {});
  return { ok: true, action: "virtualActionSurface", vessel: "virtual-os", total: items.length, counts, fullyExecutable: items.filter(x => x.fullyExecutable).length, interpreted: items.filter(x => !x.fullyExecutable).length, items };
}
async function interpretedAction(action, payload = {}, dispatch) {
  if (action === "virtualActionSurface" || action === "capabilityParityAudit") return virtualSurfaceReport();
  const report = virtualActionReport(action, payload);
  if (report.classification.mode === "interpreted-diagnostic" && dispatch && (payload.path || payload.p)) {
    try { report.probe = await dispatch({ ...payload, action: "stat" }); } catch (e) { report.probe = { ok: false, error: e.message }; }
  }
  if (report.classification.mode === "host-only-safe-report") report.note = "This action needs local host/process/browser authority for full parity. Virtual OS safely reports intent and available user-scoped context instead of executing host effects.";
  else report.note = "Virtual OS interpreted this documented tunnel action through the hosted action bridge.";
  return report;
}
module.exports = { AI, NATIVE, classifyVirtualAction, interpretedAction, virtualActionReport, virtualSurfaceReport };
