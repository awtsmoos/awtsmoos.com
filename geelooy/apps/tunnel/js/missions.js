// B"H

/**
 * B"H — Tunnel missions registry page.
 * Loads missions registered on a tunnel through the tunnel control relay.
 * The relay answers slow deeds with a control-request receipt; the page
 * observes it (retryAction) until the terminal response lands, instead of mistaking the receipt for an empty registry.
 */
const params = new URL(location.href).searchParams;
const input = document.getElementById("tunnelInput");
const label = document.getElementById("tunnelLabel");
const box = document.getElementById("missions");
const countTitle = document.getElementById("countTitle");
input.value = params.get("tunnelName") || localStorage.getItem("awtsmoos.tunnelName") || "";

function tunnelName() { return (input.value || "").trim(); }

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function listHtml(items, title) {
  if (!items || !items.length) return "";
  return '<div><h4>' + esc(title) + "</h4><ul>" +
    items.map((i) => "<li>" + esc(typeof i === "string" ? i : JSON.stringify(i)) + "</li>").join("") +
    "</ul></div>";
}

function card(m) {
  const agents = (m.agents || []).map((a) => (typeof a === "string" ? a : (a.id || a.name || JSON.stringify(a))));
  return '<article class="panel mission-card"><span class="status-pill">' + esc(m.status || "active") + "</span> " +
    "<h3>" + esc(m.title || m.id) + "</h3>" +
    '<div class="mission-meta">' + esc(m.id || "") +
    (m.updatedAt ? " • updated " + esc(m.updatedAt) : "") +
    (agents.length ? " • agents: " + esc(agents.join(", ")) : "") + "</div>" +
    '<div class="mission-desc">' + esc(m.description || "") + "</div>" +
    (m.progress ? '<div class="mission-meta progress-note">Progress: ' + esc(m.progress) + "</div>" : "") +
    '<div class="mission-lists">' + listHtml(m.goals, "Goals") + listHtml(m.tasks, "Tasks") +
    listHtml(m.decisions, "Key decisions") + listHtml(m.openQuestions, "Open questions") +
    listHtml(m.relatedPaths, "Related paths") + "</div></article>";
}

async function relay(name, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch("/api/tunnel/control/fs/" + encodeURIComponent(name), {
      method: "POST", credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body), signal: controller.signal
    });
    return await res.json();
  } finally { clearTimeout(timer); }
}

function isReceipt(d) {
  return Boolean(d && d.controlRequestId && d.type !== "TUNNEL_RESPONSE" &&
    (d.action === "tunnelRequestPending" || d.pending === true || d.receiptType === "control_request"));
}

async function observe(name, receipt) {
  const body = Object.assign({}, receipt.observeWith || receipt.retryPayload || {}, {
    action: "retryAction", tunnelName: name, controlRequestId: receipt.controlRequestId
  });
  const deadline = Date.now() + 90000;
  let last = receipt;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    const data = await relay(name, body);
    if (data && data.error === "tunnel_response_correlation_mismatch") continue;
    last = data;
    if (!data || data.type === "TUNNEL_RESPONSE" || data.terminal === true || !isReceipt(data)) return data;
  }
  return last;
}

function missionRows(d) {
  for (const v of [d && d.missions, d && d.items, d && d.records, d && d.data && d.data.missions]) {
    if (Array.isArray(v)) return v;
  }
  return null;
}

async function load() {
  const name = tunnelName();
  label.textContent = "tunnel: " + (name || "?");
  if (name) localStorage.setItem("awtsmoos.tunnelName", name);
  if (!name) {
    box.innerHTML = '<p class="empty-note">Enter a tunnel name above, then Load.</p>';
    return;
  }
  countTitle.textContent = "Loading…";
  try {
    let data = await relay(name, { action: "missionVisibilityList", targetVessel: "native-tunnel" });
    if (isReceipt(data)) {
      countTitle.textContent = "Tunnel accepted — waiting for its answer…";
      data = await observe(name, data);
    }
    if (!data || data.ok === false) throw new Error((data && (data.error || data.message)) || "request_failed");
    const missions = missionRows(data);
    if (missions === null) {
      countTitle.textContent = "No mission list returned";
      box.innerHTML = '<p class="empty-note">The tunnel answered, but its response carried no mission list. ' +
        esc(data.summary || data.message || "") + "</p>";
      return;
    }
    countTitle.textContent = missions.length + (missions.length === 1 ? " active mission" : " active missions");
    box.innerHTML = missions.length ? missions.map(card).join("") :
      '<p class="empty-note">No active missions registered yet. Agents: call <code>missionVisibilityRegister</code> to add one.</p>';
  } catch (err) {
    countTitle.textContent = "Could not load";
    const why = err && err.name === "AbortError" ? "the request timed out" : esc(err.message);
    box.innerHTML = '<p class="empty-note">Failed to load missions: ' + why + ". Check the tunnel name and that you are signed in.</p>";
  }
}

document.getElementById("loadBtn").addEventListener("click", load);
document.getElementById("refreshBtn").addEventListener("click", load);
load();
