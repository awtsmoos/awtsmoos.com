//B"H
const HELP = Object.freeze({
  extensionUrl: "https://awtsmoos.com/apps/tunnel-control/",
  macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
  windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
  relayUrl: "http://127.0.0.1:3977"
});

/**
 * Chapter 2: The transport sentinel tests extension and relay.
 *
 * The Awtsmoos gives two roads: Chrome extension bridge and local relay. The
 * page now checks the relay by default, explains exactly how to install/restart,
 * and only shows fear after both roads fail to answer.
 */
export function wireTransportStatus(dom = {}) {
  const el = dom.transportStatus;
  if (!el) return;
  let ready = false;
  renderChecking(el);
  probeRelay(el, flagReady);
  const missingTimer = setTimeout(() => { if (!ready) renderMissing(el, HELP); }, 1800);

  function flagReady(detail) {
    ready = true;
    clearTimeout(missingTimer);
    renderReady(el, detail);
  }

  window.addEventListener("awtsmoos-ai-transport", event => flagReady(event.detail || {}));
  window.addEventListener("awtsmoos-server-ready", () => flagReady({ kind: "extension", label: "Awtsmoos Chrome Server Extension" }));
  window.addEventListener("awtsmoos-server-feedback", event => renderFeedback(el, event.detail || {}));
  window.addEventListener("awtsmoos-ai-transport-error", event => renderMissing(el, { ...HELP, ...(event.detail || {}) }));
}

async function probeRelay(el, onReady) {
  try {
    const { getBrowserLocalTunnelBridge } = await import("../../central/browserLocalTunnelBridge.js");
    const bridge = await getBrowserLocalTunnelBridge();
    if (!bridge) return;
    onReady({ kind: "relay", label: "Local relay active", detail: `Using ${bridge.baseUrl} by default for tools.` });
  } catch (_error) {
    renderChecking(el, "Extension not seen yet; checking local relay…");
  }
}

function renderReady(el, detail) {
  el.hidden = false;
  el.className = `transport-status is-${safe(detail.kind || detail.transport || "ready")}`;
  el.innerHTML = `<strong>Transport:</strong> ${escapeInline(detail.label || detail.transport || "ready")}${detail.detail ? `<span class="transport-detail">${escapeInline(detail.detail)}</span>` : ""}`;
}

function renderChecking(el, text = "Waiting for extension or local relay…") {
  el.hidden = false;
  el.className = "transport-status is-checking";
  el.innerHTML = `<strong>Checking transport…</strong><span>${escapeInline(text)}</span>`;
}

function renderFeedback(el, detail) {
  const error = String(detail.error || "");
  if (/Response not found|already consumed/i.test(error)) return;
  el.hidden = false;
  el.className = `transport-status is-${safe(detail.type || "extension-issue")}`;
  el.innerHTML = `<strong>Transport feedback:</strong> ${escapeInline(detail.type || "extension issue")} ${error ? `<span class="transport-error-text">${escapeInline(error)}</span>` : ""}`;
}

function renderMissing(el, help) {
  el.hidden = false;
  el.className = "transport-status is-missing";
  el.innerHTML = `<strong>Transport not detected.</strong><span class="transport-detail">Install/restart Awtsmoos Tunnel. Then refresh this AI tab. The same command updates the agent, starts the relay, and reuses the saved tunnel name.</span><span class="transport-commands"><a href="${escapeInline(help.extensionUrl)}" target="_blank" rel="noreferrer">Open setup</a><button type="button" data-copy="win">Copy Windows install/restart</button><button type="button" data-copy="mac">Copy macOS/Linux install/restart</button><code>${escapeInline(help.relayUrl)}</code></span>`;
  el.querySelector('[data-copy="mac"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.macLinux));
  el.querySelector('[data-copy="win"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.windows));
}

function safe(text) { return String(text || "ready").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase(); }
function escapeInline(text) { return String(text || "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c])); }
