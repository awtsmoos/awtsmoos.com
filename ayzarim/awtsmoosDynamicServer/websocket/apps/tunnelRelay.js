// B"H
const FOUR_MINUTES_MS = 240000;
const ONE_DAY_MS = 86400000;

function bool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function boundedTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  return Math.max(1000, Math.min(Math.floor(n), ONE_DAY_MS));
}

function closeOldTunnel(ctx, client, name) {
  const old = ctx.tunnels.get(name);
  if (!old || old === client) return;
  try { old.send({ type: "TUNNEL_REPLACED", name, message: "A newer tunnel agent registered with the same tunnel name." }); } catch (e) {}
  try { old.socket.end(); } catch (e) {}
  try { ctx.clients.delete(old); } catch (e) {}
}

function handleTunnelRegister(ctx, client, data) {
  const name = String(data.name || "").trim();
  if (!name) return;
  closeOldTunnel(ctx, client, name);
  client.isTunnel = true;
  client.tunnelName = name;
  client.deviceName = data.deviceName || null;
  client.root = data.root || null;
  client.allowWrite = bool(data.allowWrite);
  client.allowSecrets = bool(data.allowSecrets);
  client.allowCommands = bool(data.allowCommands);
  client.agentVersion = data.agentVersion || null;
  client.tools = data.tools || null;
  client.chrome = data.chrome || null;
  client.command = data.command || null;
  client.vesselType = data.vesselType || data.kind || null;
  client.kind = data.kind || data.vesselType || null;
  client.registeredAt = Date.now();
  ctx.tunnels.set(name, client);
  client.send({ type: "TUNNEL_ACK", ok: true, name, replacedOlderConnection: true });
}

function requestExpectation(id, name, payload = {}, timeoutMs) {
  return {
    id,
    tunnelName: name,
    requestedTunnelName: payload.requestedTunnelName || payload.tunnelName || name,
    requestedAction: String(payload.action || ""),
    expectedVessel: payload.targetVessel || payload.vessel || "",
    expectedRouteReason: payload.targetVessel === "native-tunnel" ? "native" : "",
    controlRequestId: payload.controlRequestId || "",
    clientRequestId: payload.clientRequestId || "",
    agentSessionId: payload.agentSessionId || "",
    logicalAgentId: payload.logicalAgentId || "",
    projectRoot: payload.projectRoot || payload.root || "",
    nonce: payload.nonce || "",
    jobId: payload.jobId || payload.id || "",
    stream: payload.stream || "",
    cwd: payload.cwd || "",
    command: payload.command || "",
    path: payload.path || payload.p || "",
    createdAt: Date.now(),
    timeoutMs
  };
}

function allowedActionAlias(requestAction, actualAction) {
  if (!requestAction || !actualAction || requestAction === actualAction) return true;
  const aliases = {
    command: ["commandRun", "commandStart"],
    commandRun: ["commandStart", "commandRun"],
    commandStart: ["commandStart", "commandRun"],
    commandStatus: ["commandStatus", "commandStart"],
    commandWait: ["commandWait"],
    commandJobOutputPage: ["commandJobOutputPage"],
    commandOutputPage: ["commandJobOutputPage"],
    commandCancel: ["commandCancel"],
    commandJobCancel: ["commandCancel"]
  };
  return (aliases[requestAction] || []).includes(actualAction);
}

function actualActionOf(data = {}) {
  return String(data.actualAction || data.action || "");
}

function actualJobId(data = {}) {
  return data.jobId || data.statusPayload?.jobId || data.waitPayload?.jobId || data.stdoutPagePayload?.jobId || data.stderrPagePayload?.jobId || data.stdout?.jobId || data.stderr?.jobId || "";
}

function actualStream(data = {}) {
  return data.stream || data.stdout?.stream || data.stderr?.stream || "";
}

function valueMismatch(expectedValue, actualValue) {
  return !!expectedValue && actualValue !== undefined && actualValue !== null && actualValue !== "" && actualValue !== expectedValue;
}

function missingOrMismatch(expectedValue, actualValue) {
  return !!expectedValue && actualValue !== expectedValue;
}

function mismatchResponse(expected, data, flags) {
  return {
    BH: "B\"H",
    ok: false,
    status: 409,
    error: "tunnel_response_correlation_mismatch",
    correlationMismatch: true,
    ...flags,
    expected,
    actual: {
      id: data?.id || "",
      tunnelName: data?.tunnelName || data?.actualTunnelName || "",
      requestedTunnelName: data?.requestedTunnelName || "",
      vessel: data?.vessel || data?.targetVessel || "",
      routeReason: data?.routeReason || "",
      controlRequestId: data?.controlRequestId || "",
      clientRequestId: data?.clientRequestId || "",
      agentSessionId: data?.agentSessionId || "",
      logicalAgentId: data?.logicalAgentId || "",
      projectRoot: data?.projectRoot || data?.root || "",
      nonce: data?.nonce || "",
      jobId: actualJobId(data),
      stream: actualStream(data),
      cwd: data?.cwd || "",
      command: data?.command || "",
      path: data?.path || data?.absolutePath || "",
      action: data?.action || "",
      actualAction: data?.actualAction || "",
      requestAction: data?.requestAction || ""
    }
  };
}

function validateTunnelResponse(expected, data = {}) {
  if (!expected) return { ok: true };
  const actualAction = actualActionOf(data);
  const actualTunnel = data.tunnelName || data.actualTunnelName || "";
  const actualVessel = data.vessel || data.targetVessel || "";
  const routeReason = String(data.routeReason || "");
  const flags = {
    wrongTunnel: missingOrMismatch(expected.tunnelName, actualTunnel),
    actionMismatch: !!expected.requestedAction && !!actualAction && !allowedActionAlias(expected.requestedAction, actualAction),
    controlRequestMismatch: missingOrMismatch(expected.controlRequestId, data.controlRequestId),
    clientRequestMismatch: missingOrMismatch(expected.clientRequestId, data.clientRequestId),
    agentSessionMismatch: missingOrMismatch(expected.agentSessionId, data.agentSessionId),
    logicalAgentMismatch: missingOrMismatch(expected.logicalAgentId, data.logicalAgentId),
    projectRootMismatch: missingOrMismatch(expected.projectRoot, data.projectRoot || data.root),
    nonceMismatch: missingOrMismatch(expected.nonce, data.nonce),
    vesselMismatch: valueMismatch(expected.expectedVessel, actualVessel),
    routeReasonMismatch: !!expected.expectedRouteReason && !!routeReason && !routeReason.includes(expected.expectedRouteReason),
    jobIdMismatch: valueMismatch(expected.jobId, actualJobId(data)),
    streamMismatch: /^command(Job)?OutputPage$/.test(expected.requestedAction) && valueMismatch(expected.stream, actualStream(data)),
    cwdMismatch: /^(command|commandRun|commandStart)$/.test(expected.requestedAction) && valueMismatch(expected.cwd, data.cwd),
    commandMismatch: /^(command|commandRun|commandStart)$/.test(expected.requestedAction) && valueMismatch(expected.command, data.command),
    pathMismatch: !/^command/.test(expected.requestedAction) && valueMismatch(expected.path, data.path || data.absolutePath)
  };
  return Object.values(flags).some(Boolean) ? { ok: false, response: mismatchResponse(expected, data, flags) } : { ok: true };
}

function handleTunnelResponse(ctx, data) {
  const pending = ctx.pendingTunnelRequests.get(data.id);
  if (!pending) return;
  const validation = validateTunnelResponse(pending.expected, data);
  ctx.pendingTunnelRequests.delete(data.id);
  pending.resolve(validation.ok ? data : validation.response);
}

function sendTunnelRequest(ctx, name, payload, timeout = FOUR_MINUTES_MS) {
  const tunnel = ctx.tunnels.get(name);
  if (!tunnel) return Promise.reject(new Error("No tunnel connected: " + name));
  const id = Date.now() + "_" + Math.random().toString(36).slice(2);
  const timeoutMs = boundedTimeout(timeout);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ctx.pendingTunnelRequests.delete(id);
      reject(new Error("Tunnel timeout after " + timeoutMs + "ms"));
    }, timeoutMs);
    timer.unref?.();
    ctx.pendingTunnelRequests.set(id, {
      expected: requestExpectation(id, name, payload, timeoutMs),
      resolve: data => { clearTimeout(timer); resolve(data); },
      reject: error => { clearTimeout(timer); reject(error); }
    });
    tunnel.send({ type: "TUNNEL_REQUEST", id, payload });
  });
}

module.exports = {
  FOUR_MINUTES_MS,
  ONE_DAY_MS,
  boundedTimeout,
  handleTunnelRegister,
  handleTunnelResponse,
  sendTunnelRequest,
  validateTunnelResponse,
  requestExpectation
};
