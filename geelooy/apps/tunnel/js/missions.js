// B"H

/**
 * B"H — Tunnel missions registry page.
 * Loads missions registered on a tunnel through the tunnel control relay.
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
    '<div class="mission-lists">' +
    listHtml(m.goals, "Goals") + listHtml(m.tasks, "Tasks") +
    listHtml(m.decisions, "Key decisions") + listHtml(m.openQuestions, "Open questions") +
    listHtml(m.relatedPaths, "Related paths") +
    "</div></article>";
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
    const res = await fetch("/api/tunnel/control/fs/" + encodeURIComponent(name), {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "missionVisibilityList" })
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) throw new Error(data.error || ("http_" + res.status));
    const missions = data.missions || [];
    countTitle.textContent = missions.length + (missions.length === 1 ? " active mission" : " active missions");
    box.innerHTML = missions.length ? missions.map(card).join("") :
      '<p class="empty-note">No active missions registered yet. Agents: call <code>missionVisibilityRegister</code> to add one.</p>';
  } catch (err) {
    countTitle.textContent = "Could not load";
    box.innerHTML = '<p class="empty-note">Failed to load missions: ' + esc(err.message) + ". Check the tunnel name and that you are signed in.</p>";
  }
}

document.getElementById("loadBtn").addEventListener("click", load);
document.getElementById("refreshBtn").addEventListener("click", load);
load();
