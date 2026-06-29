// B"H
export function ok(action, data = {}) {
  return { ok:true, action, tunnel:"virtualOs", ...data };
}

export function fail(action, error, extras = {}) {
  return { ok:false, action, error:error?.message || String(error), ...extras };
}

export function send(state, packet) {
  if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(packet));
}

/**
 * B"H
 * Responses are small sealed letters crossing the socket sea. They carry truth
 * or failure plainly, never compressed into a riddle, never hidden in minified
 * smoke.
 */
