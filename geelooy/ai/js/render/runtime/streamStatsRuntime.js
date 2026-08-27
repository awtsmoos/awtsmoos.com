//B"H

/**
 * Chapter 198: The Stream Clock Became A Small Eternal Flame.
 *
 * Streaming status is not part of the markdown bubble and not part of the event
 * rail. It is its own stable div, so text refreshes, thought refreshes, and tool
 * refreshes cannot delete the elapsed seconds or token progress vessel.
 */
export function ensureStreamStatus(shell, record = {}) {
  let node = shell.querySelector(":scope > .stream-status-rail");
  if (!node) {
    node = document.createElement("div");
    node.className = "stream-status-rail";
    node.innerHTML = statusHtml();
    shell.insertBefore(node, firstContentNode(shell));
  }
  updateStreamStatus(node, record);
  return node;
}

export function updateStreamStatus(node, record = {}) {
  const metrics = record.metrics || {};
  const elapsed = elapsedSeconds(record);
  const tokens = tokenCount(record, metrics);
  const percent = progressPercent(record, metrics, tokens);
  node.dataset.live = record.streaming || record.loading ? "true" : "false";
  node.querySelector(".stream-status-time").textContent = `${elapsed}s`;
  node.querySelector(".stream-status-tokens").textContent = `${tokens.toLocaleString()} tok`;
  node.querySelector(".stream-status-label").textContent = labelFor(record);
  node.querySelector(".stream-status-fill").style.width = `${percent}%`;
}

export function removeStreamStatus(shell) {
  shell?.querySelector?.(":scope > .stream-status-rail")?.remove();
}

function statusHtml() {
  return `<div class="stream-status-line"><span class="stream-status-dot"></span><b class="stream-status-label">Streaming</b><span class="stream-status-time">0s</span><span class="stream-status-tokens">0 tok</span></div><div class="stream-status-bar"><i class="stream-status-fill"></i></div>`;
}

function firstContentNode(shell) {
  return shell.querySelector(":scope > .event-record-badge, :scope > .event-region, :scope > .message") || null;
}

function elapsedSeconds(record = {}) {
  record.streamStartedAt ||= Date.now();
  const end = record.streaming || record.loading ? Date.now() : (record.streamEndedAt ||= Date.now());
  return Math.max(0, Math.floor((end - record.streamStartedAt) / 1000));
}

function tokenCount(record = {}, metrics = {}) {
  return Number(metrics.outputTokens || metrics.completion_tokens || Math.ceil(String(record.text || "").length / 4) || 0);
}

function progressPercent(record = {}, metrics = {}, tokens = 0) {
  if (Number(metrics.percent)) return Math.max(2, Math.min(100, Number(metrics.percent)));
  if (!(record.streaming || record.loading)) return 100;
  return Math.max(7, Math.min(94, 8 + (tokens % 87)));
}

function labelFor(record = {}) {
  const kinds = new Set((record.events || []).map(event => event.kind));
  if (kinds.has("tool_call") || kinds.has("tool_result")) return "Tools streaming";
  if (kinds.has("thinking")) return "Thinking live";
  return record.streaming || record.loading ? "Streaming" : "Complete";
}
