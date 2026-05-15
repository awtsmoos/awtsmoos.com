// B"H
const FOUR_MINUTES_MS = 240000;

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
  return Math.max(1000, Math.min(Math.floor(n), FOUR_MINUTES_MS));
}

function closeOldTunnel(ctx, client, name) {
  const old = ctx.tunnels.get(name);

  if (!old || old === client) return;

  try {
    old.send({
      type: "TUNNEL_REPLACED",
      name,
      message: "A newer tunnel agent registered with the same tunnel name."
    });
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
  client.registeredAt = Date.now();

  ctx.tunnels.set(name, client);

  client.send({
    type: "TUNNEL_ACK",
    ok: true,
    name,
    replacedOlderConnection: true
  });
}

function handleTunnelResponse(ctx, data) {
  const pending = ctx.pendingTunnelRequests.get(data.id);
  if (!pending) return;

  ctx.pendingTunnelRequests.delete(data.id);
  pending.resolve(data);
}

/**
 * B"H
 * Sends one request to the connected agent and waits up to four minutes.
 *
 * @param {object} ctx Relay context.
 * @param {string} name Tunnel name.
 * @param {object} payload Agent payload.
 * @param {number} [timeout=240000] Timeout in ms.
 * @returns {Promise<object>} Agent response.
 */
function sendTunnelRequest(ctx, name, payload, timeout = FOUR_MINUTES_MS) {
  const tunnel = ctx.tunnels.get(name);

  if (!tunnel) {
    return Promise.reject(new Error("No tunnel connected: " + name));
  }

  const id = Date.now() + "_" + Math.random().toString(36).slice(2);
  const timeoutMs = boundedTimeout(timeout);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ctx.pendingTunnelRequests.delete(id);
      reject(new Error("Tunnel timeout after " + timeoutMs + "ms"));
    }, timeoutMs);

    timer.unref?.();

    ctx.pendingTunnelRequests.set(id, {
      resolve: data => {
        clearTimeout(timer);
        resolve(data);
      },
      reject: error => {
        clearTimeout(timer);
        reject(error);
      }
    });

    tunnel.send({
      type: "TUNNEL_REQUEST",
      id,
      payload
    });
  });
}

module.exports = {
  FOUR_MINUTES_MS,
  handleTunnelRegister,
  handleTunnelResponse,
  sendTunnelRequest
};
