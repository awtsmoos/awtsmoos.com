//B"H
/**
 * @file transportStatus.js
 * Chapter 416: The bridge stopped lying about a road Chrome had sealed.
 * A local relay is only called alive after a real permitted breath returns.
 */
const HELP = Object.freeze({
  extensionUrl: "https://awtsmoos.com/apps/tunnel-control/",
  macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
  windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
  relayUrl: "http://127.0.0.1:3977"
});

export function wireTransportStatus(dom = {}) {
  const el = dom.transportStatus;
  if (!el) return;
  let ready = false;
  const canProbe = canProbeLoopback();
  renderChecking(el, canProbe ? "Checking local relay…" : "Public page cannot probe local relay directly.");
  const missingTimer = setTimeout(() => {
    if (!ready) renderUnavailable(el, canProbe ? "is-relay-unreachable" : "is-private-network-blocked");
  }, 1500);
  const markReady = detail => {
    ready = true;
    clearTimeout(missingTimer);
    renderReady(el, detail);
  };
  if (canProbe) probeRelay(el, markReady);
  else renderUnavailable(el, "is-private-network-blocked");
  window.addEventListener("awtsmoos-ai-transport", event => markReady(event.detail || {}));
  window.addEventListener("awtsmoos-server-ready", event => markReady(event.detail || { kind: "extension" }));
  window.addEventListener("awtsmoos-server-feedback", event => renderFeedback(el, event.detail));
  window.addEventListener("awtsmoos-ai-transport-error", event => {
    if (!ready) renderError(el, event.detail?.message || "Transport error.");
  });
}

function canProbeLoopback() {
  const host = location.hostname;
  return location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "::1";
}

async function probeRelay(el, onReady) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 900);
  try {
    const response = await fetch(`${HELP.relayUrl}/manifest`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Relay returned ${response.status}`);
    onReady({ kind: "relay", label: "Local relay active", detail: `Verified ${HELP.relayUrl}/manifest.` });
  } catch (_error) {
    renderUnavailable(el, "is-relay-unreachable");
  } finally {
    clearTimeout(timeout);
  }
}

function renderReady(el, detail = {}) {
  el.className = "transport-status ready";
  el.innerHTML = `<b>Transport:</b> ${escapeHtml(detail.label || detail.kind || "ready")}<br><span>${escapeHtml(detail.detail || "Bridge is available.")}</span>`;
}

function renderFeedback(el, detail = {}) {
  el.className = "transport-status feedback";
  el.innerHTML = `<b>Transport:</b> ${escapeHtml(detail.message || "Working…")}`;
}

function renderChecking(el, message) {
  el.className = "transport-status checking";
  el.innerHTML = `<b>Transport:</b> ${escapeHtml(message)}`;
}

function renderError(el, message) {
  el.className = "transport-status error";
  el.innerHTML = `<b>Transport blocked:</b> ${escapeHtml(message)}${helpMarkup()}`;
  bindCopy(el);
}

function renderUnavailable(el, className) {
  const publicBlocked = className === "is-private-network-blocked";
  el.className = `transport-status ${className}`;
  el.innerHTML = `<b>${publicBlocked ? "Extension bridge needed" : "Local relay not reachable"}</b><br><span>${publicBlocked ? "Chrome blocks public HTTPS pages from directly reading 127.0.0.1. Use the Awtsmoos extension/tunnel bridge, or open a local AI page." : "Start or restart the Awtsmoos tunnel relay, then refresh this page."}</span>${helpMarkup()}`;
  bindCopy(el);
}

function helpMarkup() {
  return `<div class="transport-commands"><button type="button" data-copy="windows">Copy Windows</button><button type="button" data-copy="unix">Copy macOS/Linux</button><a href="${HELP.extensionUrl}" target="_blank" rel="noreferrer">Open setup</a><code>${HELP.relayUrl}</code></div>`;
}

function bindCopy(el) {
  el.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy === "windows" ? HELP.windows : HELP.macLinux;
      try { await navigator.clipboard?.writeText(text); button.textContent = "Copied"; }
      catch (_error) { button.textContent = "Select command manually"; }
    });
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}
