// B"H
const FOUR_MINUTES_MS = 240000;
const ONE_DAY_MS = 86400000;

function bool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

/**
 * B"H
 * Bounds tunnel waits so long commands can breathe, but dead requests still return.
 *
 * @param {*} value Requested timeout.
 * @returns {number} Bounded timeout.
 */
function boundedTimeout(value) {
  const n = Number(value || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  return Math.max(1000, Math.min(Math.floor(n), ONE_DAY_MS));
}

function closeOldTunnel(ctx, client, name) {
  const old = ctx.tunnels.get(name);
  if (!old || old === client) return;
  try {
    old.send({ type: "TUNNEL_REPLACED", name, message: "A newer tunnel agent registered with the same tunnel name." });
  } catch (e) {}
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

function requestExpectation(id, name, payload, timeoutMs) {
  return {
    id,
    tunnelName: name,
    requestedTunnelName: payload?.requestedTunnelName || payload?.tunnelName || name,
    requestedAction: String(payload?.action || ""),
    controlRequestId: payload?.controlRequestId || "",
    clientRequestId: payload?.clientRequestId || "",
    agentSessionId: payload?.agentSessionId || "",
    logicalAgentId: payload?.logicalAgentId || "",
    projectRoot: payload?.projectRoot || payload?.root || "",
    nonce: payload?.nonce || "",
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

function mismatchResponse(expected, data, flags) {
  return {
    BH: "B\"H",
    ok: false,
    status: 409,
    error: "tunnel_response_correlation_mismatch",
    correlationMismatch: true,
    actionMismatch: !!flags.actionMismatch,
    wrongTunnel: !!flags.wrongTunnel,
    controlRequestMismatch: !!flags.controlRequestMismatch,
    clientRequestMismatch: !!flags.clientRequestMismatch,
    agentSessionMismatch: !!flags.agentSessionMismatch,
    logicalAgentMismatch: !!flags.logicalAgentMismatch,
    projectRootMismatch: !!flags.projectRootMismatch,
    nonceMismatch: !!flags.nonceMismatch,
    expected,
    actual: {
      id: data?.id || "",
      tunnelName: data?.tunnelName || data?.actualTunnelName || "",
      requestedTunnelName: data?.requestedTunnelName || "",
      controlRequestId: data?.controlRequestId || "",
      clientRequestId: data?.clientRequestId || "",
      agentSessionId: data?.agentSessionId || "",
      logicalAgentId: data?.logicalAgentId || "",
      projectRoot: data?.projectRoot || data?.root || "",
      nonce: data?.nonce || "",
      action: data?.action || "",
      actualAction: data?.actualAction || "",
      requestAction: data?.requestAction || ""
    }
  };
}

function validateTunnelResponse(expected, data) {
  if (!expected) return { ok: true };
  const actualAction = actualActionOf(data);
  const actualTunnel = data?.tunnelName || data?.actualTunnelName || expected.tunnelName;
  const flags = {
    wrongTunnel: !!actualTunnel && actualTunnel !== expected.tunnelName,
    actionMismatch: !!expected.requestedAction && !!actualAction && !allowedActionAlias(expected.requestedAction, actualAction),
    controlRequestMismatch: !!expected.controlRequestId && data?.controlRequestId !== expected.controlRequestId,
    clientRequestMismatch: !!expected.clientRequestId && data?.clientRequestId !== expected.clientRequestId,
    agentSessionMismatch: !!expected.agentSessionId && data?.agentSessionId !== expected.agentSessionId,
    logicalAgentMismatch: !!expected.logicalAgentId && data?.logicalAgentId !== expected.logicalAgentId,
    projectRootMismatch: !!expected.projectRoot && (data?.projectRoot || data?.root) !== expected.projectRoot,
    nonceMismatch: !!expected.nonce && data?.nonce !== expected.nonce
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

/**
 * B"H
 * Sends one request to the connected agent and waits up to the bounded API
 * ceiling. Long-running work should still prefer async job actions, but the
 * relay no longer turns valid large timeoutMs values into premature 504s.
 * The pending entry remembers the requested action, tunnel, and correlation
 * fields so crossed results fail closed instead of becoming false success.
 *
 * @param {object} ctx Relay context.
 * @param {string} name Tunnel name.
 * @param {object} payload Agent payload.
 * @param {number} [timeout=240000] Timeout in ms.
 * @returns {Promise<object>} Agent response.
 */
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

module.exports = { FOUR_MINUTES_MS, ONE_DAY_MS, boundedTimeout, handleTunnelRegister, handleTunnelResponse, sendTunnelRequest, validateTunnelResponse };
