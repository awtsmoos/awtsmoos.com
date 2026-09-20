//B"H
// WorkOS UI — home view. Pure function returning an HTML string.

function safeGet(fn, fallback) {
  try { var v = fn(); return (v === null || v === undefined) ? fallback : v; }
  catch (e) { return fallback; }
}

function missionTitle(m) {
  return m.title || m.name || m.id;
}

function renderMissionCard(WorkOS, m) {
  var ov = safeGet(function () { return WorkOS.missions.overview(m.id); }, null);
  var progress = ov && ov.progress ? ov.progress : { total: 0, done: 0, pct: 0 };
  var work = safeGet(function () { return WorkOS.work.list({ missionId: m.id }); }, []);
  var byStatus = {};
  work.forEach(function (w) {
    var s = (w.attrs && w.attrs.status) || "todo";
    byStatus[s] = (byStatus[s] || 0) + 1;
  });
  var chips = Object.keys(byStatus).map(function (s) {
    return statusPill(s) + ' <span class="muted small">' + byStatus[s] + "</span>";
  }).join(" ");
  var objective = m.attrs && m.attrs.objective ? trunc(m.attrs.objective, 140) : "";
  return '<a class="card" data-filterable href="#/mission/' + esc(encodeURIComponent(m.id)) + '">' +
    '<div class="card-top">' + badge("mission", "info") +
    '<span class="muted small">' + esc(timeAgo(m.createdTs)) + "</span></div>" +
    "<h3>" + esc(missionTitle(m)) + "</h3>" +
    (objective ? '<p class="card-sub">' + esc(objective) + "</p>" : "") +
    '<div class="card-foot">' + progressBar(progress.pct) + "</div>" +
    (chips ? '<div class="tag-row">' + chips + "</div>" : "") +
    "</a>";
}

function renderAgentCard(WorkOS, a) {
  var name = a.name || (a.attrs && a.attrs.name) || a.id;
  var specialty = (a.attrs && a.attrs.specialty) || "";
  var work = safeGet(function () { return WorkOS.work.list({ status: "doing" }); }, []);
  var mine = work.filter(function (w) {
    return w.attrs && (w.attrs.owner === name || w.attrs.owner === a.id);
  });
  var status = mine.length ? "doing" : "idle";
  return '<div class="card" data-filterable>' +
    '<div class="agent-row">' + avatar(name) +
    '<div class="who"><b>' + esc(name) + "</b>" +
    (specialty ? '<span>' + esc(specialty) + "</span>" : "") + "</div>" +
    '<span class="presence-dot ' + (status === "doing" ? "online" : "idle") + '" title="' + esc(status) + '"></span>' +
    "</div>" +
    (mine.length
      ? '<p class="card-sub">Working on: ' + esc(trunc(mine[0].name || mine[0].id, 60)) + "</p>"
      : '<p class="card-sub faint">Available</p>') +
    "</div>";
}

function renderActivityRow(ev) {
  var actor = actorName(ev.actor);
  var summary = (ev.data && (ev.data.summary || ev.data.title || ev.data.body || ev.data.note)) || "";
  return '<div class="ev-row" data-filterable>' +
    '<span class="ev-type">' + esc(ev.type || "event") + "</span>" +
    '<div class="ev-main"><b>' + esc(actor) + "</b>" +
    (summary ? ' <span class="muted">' + esc(trunc(summary, 110)) + "</span>" : "") + "</div>" +
    '<span class="ev-meta" title="' + esc(fullTime(ev.ts)) + '">' + esc(timeAgo(ev.ts)) + "</span>" +
    "</div>";
}

function renderSoonCard(icon, title, blurb) {
  return '<div class="card soon" data-filterable>' +
    '<div class="card-top"><span style="font-size:22px">' + icon + '</span><span class="soon-tag">soon</span></div>' +
    "<h3>" + esc(title) + "</h3>" +
    '<p class="card-sub">' + esc(blurb) + "</p></div>";
}

function renderHome(WorkOS) {
  var missions = safeGet(function () { return WorkOS.missions.list(); }, []);
  var agents = safeGet(function () { return WorkOS.entities.find("agent"); }, []);
  var events = safeGet(function () { return WorkOS.events.list({ limit: 8 }); }, []);
  var version = safeGet(function () { return WorkOS.version; }, "");

  var html = "";
  html += '<div class="hero">' +
    "<h1>Mission control for <span class='grad'>humans &amp; AI agents</span></h1>" +
    "<p>WorkOS is the persistent work graph: missions, work items, rooms, decisions and files — every fact with provenance, every agent accountable.</p>" +
    '<div class="hero-stats">' +
    '<div class="hero-stat"><b>' + missions.length + "</b><span>missions</span></div>" +
    '<div class="hero-stat"><b>' + agents.length + "</b><span>agents</span></div>" +
    '<div class="hero-stat"><b>' + events.length + "</b><span>recent events</span></div>" +
    "</div></div>";

  html += '<div class="search-wrap" style="margin-bottom:6px;max-width:520px">' +
    '<span class="search-icon">⌕</span>' +
    '<input type="search" id="home-search" placeholder="Filter missions, agents, activity…" autocomplete="off" aria-label="Filter home">' +
    "</div>";

  // Missions
  html += '<section class="section" id="section-missions"><div class="section-head"><h2>Missions <span class="count">' +
    missions.length + "</span></h2></div>";
  if (!missions.length) {
    html += '<div class="empty"><div class="big">🧭</div>No missions yet. Seed the graph to begin.</div>';
  } else {
    html += '<div class="grid">' + missions.map(function (m) { return renderMissionCard(WorkOS, m); }).join("") + "</div>";
  }
  html += "</section>";

  // Agents
  html += '<section class="section" id="section-agents"><div class="section-head"><h2>Agents <span class="count">' +
    agents.length + "</span></h2></div>";
  if (!agents.length) {
    html += '<div class="empty"><div class="big">🤖</div>No agents registered yet.</div>';
  } else {
    html += '<div class="grid tight">' + agents.map(function (a) { return renderAgentCard(WorkOS, a); }).join("") + "</div>";
  }
  html += "</section>";

  // Recent activity
  html += '<section class="section"><div class="section-head"><h2>Recent activity</h2></div>';
  html += '<div class="panel" style="padding:8px 18px">';
  if (!events.length) {
    html += '<div class="empty"><div class="big">📜</div>Nothing has happened yet.</div>';
  } else {
    html += events.map(renderActivityRow).join("");
  }
  html += "</div></section>";

  // Near-term areas
  html += '<section class="section"><div class="section-head"><h2>Explore</h2></div><div class="grid tight">' +
    renderSoonCard("📁", "Projects", "Project workspaces with linked files, briefs and artifacts.") +
    renderSoonCard("🗂️", "Files", "Every file with full who/why history from the event graph.") +
    renderSoonCard("🔗", "Shared", "Shared capsules: portable context bundles for handoffs.") +
    "</div></section>";

  html += '<div class="footer-note">WorkOS' + (version ? " · v" + esc(version) : "") + " · built on the Awtsmoos work graph</div>";
  return html;
}
