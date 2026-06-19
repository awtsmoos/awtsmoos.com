// B"H
/**
 * DevTools bridge: a thin golden wire into Chrome where the Awtsmoos lets
 * runtime exceptions stop hiding behind the glass of a rendered page.
 */
export async function connectCdp(wsUrl, onEvent = () => {}) {
  if (typeof WebSocket === "undefined") throw new Error("Node global WebSocket is unavailable.");
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let sequence = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("CDP websocket failed to open.")), { once: true });
  });

  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result || {});
      return;
    }
    if (message.method) onEvent(message);
  });

  function send(method, params = {}, timeoutMs = 12000) {
    sequence += 1;
    const id = sequence;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
    });
  }

  return { send, close: () => socket.close() };
}
