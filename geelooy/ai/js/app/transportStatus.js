//B"H
const HELP = Object.freeze({
  extensionUrl: "https://awtsmoos.com/apps/tunnel-control/",
  macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
  windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex"
});

/**
 * Chapter 31: The transport sentinel lights a torch before the road disappears.
 *
 * If the Chrome bridge never answers, the user still sees install/restart
 * commands. If it does answer, the torch becomes a compact ready badge.
 */
export function wireTransportStatus(dom = {}) {
  const el = dom.transportStatus;
  if (!el) return;
  let ready = false;
  renderChecking(el);
  const missingTimer = setTimeout(() => { if (!ready) renderMissing(el, HELP); }, 1400);
  const renderReady = detail => {
    ready = true;
    clearTimeout(missingTimer);
    el.hidden = false;
    el.className = `transport-status is-${safe(detail.kind || detail.transport || "ready")}`;
    el.innerHTML = `<strong>Transport:</strong> ${escapeInline(detail.label || detail.transport || "ready")}`;
  };
  window.addEventListener("awtsmoos-ai-transport", event => renderReady(event.detail || {}));
  window.addEventListener("awtsmoos-server-ready", () => renderReady({ kind: "extension", label: "Awtsmoos Chrome Server Extension" }));
  window.addEventListener("awtsmoos-server-feedback", event => renderFeedback(el, event.detail || {}));
  window.addEventListener("awtsmoos-ai-transport-error", event => renderMissing(el, { ...HELP, ...(event.detail || {}) }));
}

function renderChecking(el) {
  el.hidden = false;
  el.className = "transport-status is-checking";
  el.innerHTML = `<strong>Checking transport…</strong><span>Waiting for the Awtsmoos Chrome bridge.</span>`;
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
  el.innerHTML = `<strong>Install / restart Awtsmoos transport.</strong><span>The extension bridge was not detected yet.</span><a href="${escapeInline(help.extensionUrl)}" target="_blank" rel="noreferrer">Open installer</a><button type="button" data-copy="mac">Copy macOS/Linux command</button><button type="button" data-copy="win">Copy Windows command</button>`;
  el.querySelector('[data-copy="mac"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.macLinux));
  el.querySelector('[data-copy="win"]')?.addEventListener("click", () => navigator.clipboard?.writeText(help.windows));
}
function safe(text) { return String(text || "ready").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase(); }
function escapeInline(text) { return String(text || "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c])); }
