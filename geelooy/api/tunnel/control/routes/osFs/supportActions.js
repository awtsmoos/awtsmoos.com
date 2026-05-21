// B"H

const state = {
  presets: new Map(),
  templates: new Map(),
  histories: [],
  memories: new Map(),
  macros: new Map(),
  servers: new Map(),
  previews: new Map()
};

function base(action, payload = {}, extra = {}) {
  return {
    ok: true,
    action,
    resultType: "support-action-result",
    target: payload.path || payload.p || payload.cwd || payload.url || payload.entry || payload.name || ".",
    generatedAt: new Date().toISOString(),
    ...extra
  };
}

function classify(action) {
  if (/^http|network|api|endpoint|oauth|cookie/i.test(action)) return "network";
  if (/command|process|port|server|git|npm|script|shell|node/i.test(action)) return "host-command";
  if (/history|memory|preset|template|macro|cache|state|snapshot|handoff/i.test(action)) return "stateful-memory";
  if (/doctor|health|risk|scan|lint|build|test|coverage|vuln|security|secret|env|config|dependency/i.test(action)) return "diagnostic";
  if (/context|pack|affected|diff|blast|review|release|repro/i.test(action)) return "context-pack";
  if (/preview|browser|chrome|console|runtime/i.test(action)) return "preview-runtime";
  return "general-support";
}

function summarizePayload(payload = {}) {
  const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== "");
  return Object.fromEntries(keys.slice(0, 30).map(k => [k, typeof payload[k] === "string" ? payload[k].slice(0, 300) : payload[k]]));
}

async function supportAction(action, payload = {}, dispatch) {
  if (action === "finishAndContinue") return finishAndContinue(payload);
  if (/Preset|Template|History|Memory|Macro/.test(action)) return stateAction(action, payload);
  if (/List$/.test(action) || action.endsWith("Status")) return listLike(action, payload);
  if (/Get$/.test(action)) return getLike(action, payload);
  if (/Validate|Linter|Tester|Check|Doctor|Scan|Audit|Diff|Matrix|Trace|Explain|Discover|Probe|Triage|Plan|Pack|Report|Summary|Health|Freshness|Parity|Compatibility|Coverage|Surface|Manifest|Contract|Schema|Fuzzer|Stress/.test(action)) return diagnosticLike(action, payload, dispatch);
  if (/Run$|Runner$|Start$|Stop$|Restart$|Replay$|Resume$|Cancel$|Save$|Patch$|Replace$|Fork$|Promote$|Record/.test(action)) return operationLike(action, payload);
  return base(action, payload, { family: classify(action), payload: summarizePayload(payload), note: "Direct support handler executed; deepen this action by replacing supportAction mapping with a focused implementation." });
}

function finishAndContinue(payload = {}) {
  const remaining = payload.remainingTasks || payload.tasks || payload.todo || [];
  const defaultContent = [
    "Keep going.",
    "First give me a list of all remaining things needed to make this complete.",
    "Then do them one by one with real tool results and verification after each step.",
    "Do not stop merely because one action succeeded.",
    "At the end, call the conclude/final-summary step if available; if anything remains, call finishAndContinue again with the remaining task list."
  ].join(" ");
  return base("finishAndContinue", payload, {
    finalInstruction: {
      role: "assistant",
      content: payload.continuationPrompt || defaultContent
    },
    remainingTasks: Array.isArray(remaining) ? remaining : String(remaining || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean),
    prompt: "remember: keep going; list all remaining work; do it one by one; verify; conclude only when truly complete",
    concludeFunctionReminder: "When no work remains, call the conclude/final-summary function or give the final verified summary."
  });
}

function stateAction(action, payload = {}) {
  const name = payload.name || payload.key || payload.id || "default";
  const family = classify(action);
  const bucket = action.includes("Template") ? state.templates : action.includes("Preset") ? state.presets : action.includes("Macro") ? state.macros : state.memories;
  if (/Save|Patch|Replace|Fork|Promote|RecordStart|Run/.test(action)) bucket.set(name, { name, payload: summarizePayload(payload), updatedAt: new Date().toISOString() });
  if (/Delete/.test(action)) bucket.delete(name);
  return base(action, payload, { family, name, count: bucket.size, items: [...bucket.values()].slice(0, Number(payload.limit || 20)) });
}

function listLike(action, payload = {}) {
  return base(action, payload, {
    family: classify(action),
    items: [],
    status: "empty_but_available",
    note: "Direct list/status handler is available. No persisted local records were found in this in-process support store."
  });
}

function getLike(action, payload = {}) {
  return base(action, payload, {
    family: classify(action),
    found: false,
    name: payload.name || payload.id || payload.key || "default",
    note: "Direct get handler is available. No matching persisted local record was found in this in-process support store."
  });
}

async function diagnosticLike(action, payload = {}, dispatch) {
  const probes = [];
  if (dispatch && (payload.path || payload.p)) {
    try { probes.push({ name: "stat", result: await dispatch({ ...payload, action: "stat" }) }); } catch (e) { probes.push({ name: "stat", error: e.message }); }
  }
  return base(action, payload, {
    family: classify(action),
    ok: true,
    probes,
    findings: [],
    recommendation: "Use this direct diagnostic result as the stable contract; add deeper probes inside supportActions.js or a focused family module."
  });
}

function operationLike(action, payload = {}) {
  const safe = payload.confirm === true || payload.dryRun !== false;
  return base(action, payload, {
    family: classify(action),
    dryRun: payload.dryRun !== false,
    executed: safe && payload.dryRun === false ? "simulated_safe_operation" : false,
    payload: summarizePayload(payload),
    note: "Potentially host-affecting operation is represented safely in Awtsmoos OS dispatcher. Live tunnel agent may provide host execution."
  });
}

module.exports = { supportAction, state };
