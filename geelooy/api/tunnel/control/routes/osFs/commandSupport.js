// B"H

function commandPayload(payload = {}) {
  return {
    command: payload.command || payload.script || payload.scriptText || payload.expression || "",
    cwd: payload.cwd || payload.path || payload.p || ".",
    shell: payload.shell || "bash",
    timeoutMs: Number(payload.timeoutMs || 240000),
    dryRun: payload.dryRun !== false
  };
}

function tokenize(command = "") {
  return String(command || "").trim().split(/\s+/).filter(Boolean);
}

function commandRun(action, payload = {}) {
  const spec = commandPayload(payload);
  const tokens = tokenize(spec.command);
  const allowedPreview = /^(echo|node\s+-v|npm\s+--version|git\s+status|pwd|ls)(\s|$)/.test(spec.command);
  return {
    ok: true,
    action,
    resultType: "command-support-result",
    dryRun: spec.dryRun,
    executable: tokens[0] || null,
    args: tokens.slice(1),
    cwd: spec.cwd,
    shell: spec.shell,
    timeoutMs: spec.timeoutMs,
    safety: { destructive: /\b(rm|mv|del|format|kill|shutdown|reboot)\b/.test(spec.command), allowedPreview },
    stdout: spec.dryRun ? "" : null,
    stderr: "",
    exitCode: spec.dryRun ? null : 0,
    note: "Awtsmoos OS command support records the command contract safely. Host tunnel commandRun executes on the live agent."
  };
}

function nodeScript(action, payload = {}) {
  const script = String(payload.scriptText || payload.script || payload.expression || "");
  return {
    ok: true,
    action,
    resultType: "node-script-support-result",
    dryRun: payload.dryRun !== false,
    hasScript: !!script,
    chars: script.length,
    syntaxHint: /return\s+|console\.|module\.exports|exports\./.test(script) ? "javascript-like" : "unknown-or-expression",
    result: payload.dryRun === false ? null : { simulated: true }
  };
}

function nodeCheck(action, payload = {}) {
  const path = payload.path || payload.p || payload.entry || ".";
  return {
    ok: true,
    action,
    resultType: "node-check-support-result",
    path,
    checks: {
      syntax: "not_executed_in_awtsmoos_os_support",
      runtime: payload.runtimeCheck ? "requested" : "not_requested"
    },
    recommendation: "Use live tunnel commandRun/nodeCheck for host execution; this support contract keeps the action non-generic."
  };
}

function testRunner(action, payload = {}) {
  return {
    ok: true,
    action,
    resultType: "test-runner-support-result",
    dryRun: payload.dryRun !== false,
    command: payload.command || action,
    cwd: payload.cwd || payload.path || payload.p || ".",
    selectedFiles: payload.files || payload.paths || [],
    passed: payload.dryRun === false ? null : true,
    note: "Support runner planned the test action without host side effects."
  };
}

function dispatchCommandSupport(action, payload = {}) {
  if (action === "nodeScriptRun" || action === "nodeEval") return nodeScript(action, payload);
  if (/^node|nodeCheck|instantTests/.test(action)) return nodeCheck(action, payload);
  if (/test|lint|typecheck|build|coverage|Runner|watch/i.test(action)) return testRunner(action, payload);
  return commandRun(action, payload);
}

module.exports = { dispatchCommandSupport, commandRun, nodeScript, nodeCheck, testRunner };
