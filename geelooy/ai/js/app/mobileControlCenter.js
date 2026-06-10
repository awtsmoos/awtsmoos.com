//B"H
/**
 * @file mobileControlCenter.js
 * @brief Compact command card for mobile and embedded AI vessels only.
 *
 * Chapter 12: The Awtsmoos stopped the jewel from invading the standalone
 * desktop throne room. The compact card belongs to phone and iframe chambers;
 * the full desktop /ai page keeps its own transport and provider panels.
 */

const MOBILE_QUERY = "(max-width: 900px)";

/** B"H. Mounts the compact control center only when its vessel needs it. */
export function mountMobileControlCenter() {
  syncControlCenter();
  window.addEventListener("awtsmoos-ai-vessel", syncControlCenter);
  matchMedia(MOBILE_QUERY)?.addEventListener?.("change", syncControlCenter);
}

function syncControlCenter() {
  if (shouldShowControl()) return ensureControlCenter();
  removeControlCenter();
}

function shouldShowControl() {
  return document.body.classList.contains("is-awtsmoos-embedded-ai") || matchMedia(MOBILE_QUERY)?.matches;
}

function ensureControlCenter() {
  const main = document.querySelector(".main");
  if (!main || document.querySelector(".mobile-control-center")) return;
  const node = document.createElement("details");
  node.className = "mobile-control-center";
  node.innerHTML = markup();
  const transport = document.getElementById("transport-status");
  main.insertBefore(node, transport || main.firstChild);
  bind(node);
  syncAll(node);
}

function removeControlCenter() {
  document.querySelector(".mobile-control-center")?.remove();
}

function bind(node) {
  const service = document.getElementById("ai-service-select");
  const mirror = node.querySelector(".mobile-control-provider");
  node.querySelector(".mobile-control-new")?.addEventListener("click", () => document.getElementById("new-chat")?.click());
  node.querySelector(".mobile-control-tools")?.addEventListener("click", () => document.querySelector(".mobile-nav-automation")?.click());
  mirror?.addEventListener("change", () => {
    if (!service) return;
    service.value = mirror.value;
    service.dispatchEvent(new Event("change", { bubbles: true }));
    syncProvider(node);
  });
  service?.addEventListener("change", () => syncProvider(node));
  observeTransport(node);
}

function observeTransport(node) {
  const transport = document.getElementById("transport-status");
  if (!transport) return;
  new MutationObserver(() => syncTransport(node)).observe(transport, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
}

function syncAll(node) {
  syncProvider(node);
  syncTransport(node);
}

function syncProvider(node) {
  const service = document.getElementById("ai-service-select");
  const mirror = node.querySelector(".mobile-control-provider");
  if (!service || !mirror) return;
  mirror.innerHTML = [...service.options].map(option => optionMarkup(option)).join("");
  mirror.value = service.value;
  node.querySelector(".mobile-control-provider-name").textContent = service.options[service.selectedIndex]?.text || "AI";
}

function syncTransport(node) {
  const source = document.getElementById("transport-status");
  const label = node.querySelector(".mobile-control-status-text");
  const dot = node.querySelector(".mobile-control-dot");
  const text = source?.innerText?.replace(/\s+/g, " ").trim() || "Checking transport";
  const ready = /connected|relay active|ready|transport:/i.test(text);
  const missing = /not detected|missing|install|restart/i.test(text);
  label.textContent = text.slice(0, 92);
  dot.dataset.state = ready ? "ready" : missing ? "missing" : "checking";
}

function markup() {
  return `<summary>
      <span class="mobile-control-dot" data-state="checking"></span>
      <span><strong>AI Chat</strong><em class="mobile-control-status-text">Checking transport</em></span>
      <span class="mobile-control-provider-name">AI</span>
    </summary>
    <div class="mobile-control-body">
      <label>Provider<select class="mobile-control-provider"></select></label>
      <button type="button" class="mobile-control-new">＋ New Chat</button>
      <button type="button" class="mobile-control-tools">Tools</button>
    </div>`;
}

function optionMarkup(option) {
  return `<option value="${escapeHtml(option.value)}">${escapeHtml(option.text)}</option>`;
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}
