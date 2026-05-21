// B"H

const FAMILY_RULES = [
  ["runtime", /runtime|merkava|virtualDom|preview|render/i, ["simulateRuntime", "runtimeWorkflow", "testRuntimeOnce"]],
  ["workflow", /workflow|commandTree|Batch|condition|assert|retry|template|macro/i, ["actionBatch", "workflowRun", "commandTreeRun"]],
  ["graphAst", /ast|symbol|dependency|graph|import|bundle|export|module/i, ["astOutline", "dependencyGraph", "connectedFiles"]],
  ["diagnostic", /doctor|health|fuzzer|schema|parity|surface|telemetry|freshness|drift|risk|audit|scan|lint|typecheck|build|test/i, ["checkTunnelSurface", "checkAwtsmoosAi", "bundleTrace"]],
  ["network", /http|oauth|network|api|endpoint|contract|transport|cookie/i, ["apiContractCheck"]],
  ["memoryHistory", /memory|history|snapshot|handoff|cache|state/i, ["snapshotBeforeAfter", "runtimeSnapshot"]],
  ["searchRead", /search|grep|find|read|list|tree|stat|outline/i, ["grep", "bulkSearch", "read"]],
  ["browser", /chrome|browser/i, ["browserReplay"]],
  ["gitProcess", /git|process|port|server|log|stack|console/i, ["commandTreeRun"]]
];

function familyFor(action) {
  const text = String(action || "");
  const hit = FAMILY_RULES.find(([, re]) => re.test(text));
  return hit ? { name: hit[0], relatedImplementedActions: hit[2] } : { name: "general", relatedImplementedActions: ["actionBatch", "payloadEcho", "actionSchemaTrace"] };
}

function inferExpectedInputs(action, payload = {}) {
  const text = String(action || "");
  const inputs = [];
  if (/read|file|path|ast|symbol|dependency|graph|grep|search|bundle|lint|build|test/i.test(text)) inputs.push("path/p");
  if (/runtime|preview|browser|html|chrome/i.test(text)) inputs.push("entry", "runtime", "files");
  if (/workflow|Batch|commandTree|macro|template/i.test(text)) inputs.push("steps/workflow");
  if (/http|api|endpoint|oauth|network/i.test(text)) inputs.push("url/method/headers");
  if (/git|command|process|server|port|log/i.test(text)) inputs.push("command/cwd/port");
  const supplied = Object.fromEntries(["path", "p", "entry", "url", "method", "steps", "workflow", "command", "cwd", "query"].filter(k => payload[k] !== undefined && payload[k] !== "").map(k => [k, payload[k]]));
  return { expected: [...new Set(inputs.length ? inputs : ["p/path", "goal/options"])], supplied };
}

/**
 * B"H
 * Gives a documented-but-unwired action a real registration result instead of
 * a foggy placeholder. This does not pretend the deep host implementation is
 * complete; it tells the agent exactly where the action stands, what family it
 * belongs to, which real engines are closest, and what must be implemented next.
 *
 * @param {string} action Action name.
 * @param {object} payload Incoming payload.
 * @param {object} context Registration context.
 * @returns {object} Concrete action registration report.
 */
function actionRegistrationReport(action, payload = {}, context = {}) {
  const family = familyFor(action);
  return {
    ok: true,
    action,
    implemented: false,
    registered: true,
    resultType: "action-registration-report",
    family: family.name,
    target: payload.path || payload.p || payload.entry || payload.url || payload.target || ".",
    expectedInputs: inferExpectedInputs(action, payload),
    relatedImplementedActions: family.relatedImplementedActions,
    directHandlersAvailable: context.directHandlersAvailable || [],
    repairPlan: [
      `Map ${action} to one of: ${family.relatedImplementedActions.join(", ")}`,
      "Add a direct handler in routes/osFs/index.js or a focused family module.",
      "Add/extend allActionsHarness assertions so this action stops depending on registration fallback."
    ],
    aiPrompt: "Give me a list of the necessary things to do, then do them one by one until this registered action has a direct handler."
  };
}

module.exports = { actionRegistrationReport, familyFor, inferExpectedInputs };
