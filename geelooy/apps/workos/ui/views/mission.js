//B"H
// WorkOS UI — mission view. Pure function returning an HTML string.
// renderMission(WorkOS, missionId, tab) — tab in overview|work|agents|room|files|decisions|activity

function wosSafe(fn, fallback) {
  try { var v = fn(); return (v === null || v === undefined) ? fallback : v; }
  catch (e) { return fallback; }
}

function missionOf(WorkOS, missionId) {
  var m = wosSafe(function () { return WorkOS.entities.get(missionId); }, null);
  if (m && (m.kind === "mission" || (m.attrs && m.attrs.objective !== undefined))) return m;
  var all = wosSafe(function () { return WorkOS.missions.list(); }, []);
  for (var i = 0; i < all.length; i++) if (String(all[i].id) === String(missionId)) return all[i];
  return null;
}

function missionRoomOf(WorkOS, missionId) {
  var rooms = wosSafe(function () { return WorkOS.entities.find("room"); }, []);
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].attrs && String(rooms[i].attrs.missionId) === String(missionId)) return rooms[i];
  }
  return rooms.length ? rooms[0] : null;
}

var MISSION_TABS = [
  ["overview", "Overview"],
  ["work", "Work"],
  ["agents", "Agents"],
  ["room", "Room"],
  ["files", "Files"],
  ["decisions", "Decisions"],
  ["activity", "Activity"]
];

function missionStatusOf(progress) {
  if (!progress || !progress.total) return "todo";
  return progress.pct >= 100 ? "done" : "doing";
}

/* ---------------- Overview ---------------- */
function tabOverview(WorkOS, mission, ov) {
  var attrs = mission.attrs || {};
  var objective = attrs.objective || "";
  var acceptance = attrs.acceptance || [];
  if (typeof acceptance === "string") acceptance = [acceptance];
  var progress = (ov && ov.progress) || { total: 0, done: 0, pct: 0 };
  var blockers = (ov && ov.blockers) || [];
  var agents = (ov && ov.agents) || [];
  var work = wosSafe(function () { return WorkOS.work.list({ missionId: mission.id }); }, []);
  var facts = wosSafe(function () { return WorkOS.facts.list({ mission: mission.id, limit: 5 }); }, []);

  var next = null;
  for (var i = 0; i < work.length; i++) if ((work[i].attrs || {}).status === "doing") { next = work[i]; break; }
  if (!next) for (var j = 0; j < work.length; j++) if ((work[j].attrs || {}).status === "todo") { next = work[j]; break; }

  var html = '<div class="two-col">';
  html += '<div class="panel"><h3>🎯 Objective</h3>' +
    (objective ? "<p>" + esc(objective) + "</p>" : '<p class="muted">No objective recorded.</p>') +
    (acceptance.length ? "<h3 style='margin-top:16px'>Acceptance criteria</h3><ul class='checklist'>" +
      acceptance.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "") +
    "</div>";

  html += '<div class="panel"><h3>📊 Progress</h3>' + progressBar(progress.pct) +
    '<p class="muted small" style="margin:8px 0 0">' + esc(progress.done) + " of " + esc(progress.total) + " work items complete</p>";
  if (next) {
    html += "<h3 style='margin-top:16px'>⏭ Next important action</h3>" +
      '<div class="agent-row"><div class="who"><b>' + esc(next.name || next.id) + "</b><span>" +
      esc(((next.attrs || {}).owner || "unassigned")) + "</span></div>" +
      '<span style="margin-left:auto">' + statusPill((next.attrs || {}).status) + "</span></div>";
  }
  html += "</div></div>";

  html += '<div class="two-col">';
  html += '<div class="panel"><h3>🚧 Blockers' + (blockers.length ? ' <span class="badge bad">' + blockers.length + "</span>" : "") + "</h3>";
  if (!blockers.length) html += '<p class="muted">No blockers. Clear road ahead.</p>';
  else html += blockers.map(function (b) {
    var name = b.name || b.title || b.id;
    var note = b.note || (b.attrs && b.attrs.note) || b.body || "";
    return '<div class="ev-row"><span class="ev-type" style="color:var(--red)">blocker</span>' +
      '<div class="ev-main"><b>' + esc(name) + "</b>" +
      (note ? ' <span class="muted">' + esc(note) + "</span>" : "") + "</div></div>";
  }).join("");
  html += "</div>";

  html += '<div class="panel"><h3>🧪 Recent evidence</h3>';
  if (!facts.length) html += '<p class="muted">No facts recorded yet.</p>';
  else html += facts.map(function (f) {
    var text = f.text || (f.data && f.data.text) || "";
    var src = f.source || (f.data && f.data.source) || "";
    return '<div class="ev-row"><span class="ev-type" style="color:var(--teal)">fact</span>' +
      '<div class="ev-main">' + esc(text) +
      (src ? ' <span class="faint small">— ' + esc(src) + "</span>" : "") + "</div>" +
      '<span class="ev-meta">' + esc(timeAgo(f.ts)) + "</span></div>";
  }).join("");
  html += "</div></div>";

  html += '<div class="panel"><h3>🤖 Active agents</h3>';
  if (!agents.length) html += '<p class="muted">No agents on this mission yet.</p>';
  else html += '<div class="grid tight">' + agents.map(function (a) {
    var ag = a.agent || {};
    var name = ag.name || a.agentId || "agent";
    var cw = a.currentWork || "";
    return '<div class="agent-row">' + avatar(name, "sm") +
      '<div class="who"><b>' + esc(name) + "</b>" +
      (cw ? "<span>" + esc(trunc(cw, 70)) + "</span>" : '<span class="faint">idle</span>') + "</div>" +
      '<span style="margin-left:auto">' + statusPill(a.status === "online" ? "doing" : "todo") + "</span></div>";
  }).join("") + "</div>";
  html += "</div>";

  return html;
}

/* ---------------- Work ---------------- */
var WORK_FILTERS = ["all", "todo", "doing", "blocked", "review", "done"];

function tabWork(WorkOS, mission) {
  var work = wosSafe(function () { return WorkOS.work.list({ missionId: mission.id }); }, []);
  var counts = { all: work.length };
  WORK_FILTERS.slice(1).forEach(function (s) { counts[s] = 0; });
  work.forEach(function (w) {
    var s = ((w.attrs || {}).status || "todo").toLowerCase();
    if (counts[s] === undefined) counts[s] = 0;
    counts[s]++;
  });

  var html = '<div class="chips" role="tablist" aria-label="Filter work by status">';
  WORK_FILTERS.forEach(function (f, i) {
    var label = f === "all" ? "All" : (STATUS_LABELS[f] || f);
    html += '<button class="chip' + (i === 0 ? " active" : "") + '" data-work-filter="' + esc(f) + '">' +
      esc(label) + ' <span class="n">' + (counts[f] || 0) + "</span></button>";
  });
  html += "</div>";

  if (!work.length) {
    html += '<div class="empty"><div class="big">📋</div>No work items yet.</div>';
    return html;
  }

  html += '<div class="grid" id="work-grid">';
  html += work.map(function (w) {
    var a = w.attrs || {};
    var st = (a.status || "todo").toLowerCase();
    var owner = a.owner || "unassigned";
    var acc = a.acceptance || "";
    var links = a.links || [];
    var note = a.note || "";
    var detail = "";
    if (acc) detail += "<p><b>Acceptance:</b> " + esc(acc) + "</p>";
    if (note) detail += '<p class="muted">' + esc(note) + "</p>";
    if (links.length) detail += '<ul class="link-list">' + links.map(function (l) {
      return "<li>" + (String(l).indexOf("http") === 0 ? '<a href="' + esc(l) + '">' + esc(l) + "</a>" : esc(l)) + "</li>";
    }).join("") + "</ul>";
    detail += '<div class="status-row"><span class="muted small">Set status:</span> ' +
      WORK_FILTERS.slice(1).map(function (s) {
        return '<button class="btn" data-action="work-status" data-id="' + esc(w.id) + '" data-status="' + esc(s) + '"' +
          (s === st ? " disabled" : "") + ">" + esc(STATUS_LABELS[s] || s) + "</button>";
      }).join("") + "</div>";
    return '<details class="card work-card" data-status="' + esc(st) + '" data-filterable>' +
      "<summary>" +
      '<div class="card-top">' + statusPill(st) + '<span class="muted small">' + esc(owner) + "</span></div>" +
      "<h3>" + esc(w.name || w.id) + "</h3>" +
      "</summary>" +
      '<div class="work-detail">' + detail + "</div>" +
      "</details>";
  }).join("");
  html += "</div>";
  return html;
}

/* ---------------- Agents ---------------- */
function tabAgents(WorkOS, mission) {
  var agents = wosSafe(function () { return WorkOS.entities.find("agent"); }, []);
  var room = missionRoomOf(WorkOS, mission.id);
  var presence = room ? wosSafe(function () { return WorkOS.rooms.presence(room.id); }, []) : [];
  var presMap = {};
  presence.forEach(function (p) { presMap[p.agentId] = p; });
  var work = wosSafe(function () { return WorkOS.work.list({ missionId: mission.id }); }, []);

  if (!agents.length) return '<div class="empty"><div class="big">🤖</div>No agents registered.</div>';

  var html = '<div class="grid">';
  html += agents.map(function (a) {
    var name = a.name || (a.attrs && a.attrs.name) || a.id;
    var specialty = (a.attrs && a.attrs.specialty) || "";
    var p = presMap[a.id] || presMap[name] || {};
    var pStatus = (p.status || "offline").toLowerCase();
    var dot = pStatus === "online" ? "online" : (pStatus === "idle" ? "idle" : "offline");
    var mine = work.filter(function (w) {
      return (w.attrs || {}).status === "doing" &&
        ((w.attrs || {}).owner === name || (w.attrs || {}).owner === a.id);
    });
    return '<div class="card" data-filterable>' +
      '<div class="agent-row">' + avatar(name) +
      '<div class="who"><b>' + esc(name) + "</b>" +
      (specialty ? "<span>" + esc(specialty) + "</span>" : "") + "</div>" +
      '<span class="presence-dot ' + dot + '" title="' + esc(pStatus) + '"></span></div>' +
      (mine.length
        ? '<div class="card-foot"><span class="muted small">Now:</span> ' +
          mine.map(function (w) { return badge(trunc(w.name || w.id, 48), "info"); }).join(" ") + "</div>"
        : '<p class="card-sub faint" style="margin-top:10px">No active work on this mission</p>') +
      "</div>";
  }).join("");
  html += "</div>";
  return html;
}

/* ---------------- Room ---------------- */
var ROOM_KINDS = ["message", "announcement", "request", "response", "obligation",
  "delegation", "discovery", "blocker", "review_request", "handoff"];

function tabRoom(WorkOS, mission) {
  var room = missionRoomOf(WorkOS, mission.id);
  if (!room) return '<div class="empty"><div class="big">💬</div>No room for this mission yet.</div>';
  var history = wosSafe(function () { return WorkOS.rooms.history(room.id, { limit: 100 }); }, []);
  var presence = wosSafe(function () { return WorkOS.rooms.presence(room.id); }, []);

  var html = '<div class="room-layout"><div>';
  html += '<div class="stream" id="msg-stream">';
  if (!history.length) html += '<div class="empty"><div class="big">💬</div>No messages yet. Start the conversation.</div>';
  html += history.map(function (ev) {
    var d = ev.data || {};
    var kind = d.msgKind || "message";
    var author = ev.actor || "—";
    var to = d.to ? '<div class="to">→ ' + esc(d.to) + "</div>" : "";
    return '<article class="msg mk-' + esc(kind) + '">' +
      '<div class="msg-head">' + avatar(author, "sm") +
      '<span class="author">' + esc(author) + "</span>" +
      msgKindBadge(kind) +
      '<span class="time" title="' + esc(fullTime(ev.ts)) + '">' + esc(timeAgo(ev.ts)) + "</span></div>" +
      to + '<div class="body">' + esc(d.body || "") + "</div>" +
      "</article>";
  }).join("");
  html += "</div>";

  html += '<div class="composer" data-room="' + esc(room.id) + '">' +
    '<div class="row">' +
    '<select id="composer-kind" aria-label="Message kind">' +
    ROOM_KINDS.map(function (k) { return '<option value="' + esc(k) + '">' + esc(k.replace(/_/g, " ")) + "</option>"; }).join("") +
    "</select>" +
    '<input type="text" id="composer-author" placeholder="Your name" value="you" aria-label="Author" style="flex:1;min-width:120px">' +
    "</div>" +
    '<textarea id="composer-body" placeholder="Write a message to the room…" aria-label="Message body"></textarea>' +
    '<div class="foot"><button class="btn primary" data-action="room-post" data-room="' + esc(room.id) + '">Post</button></div>' +
    "</div></div>";

  html += '<aside class="presence"><h3>👥 In this room</h3>';
  if (!presence.length) html += '<p class="muted small">No presence data.</p>';
  html += presence.map(function (p) {
    var name = p.name || p.agentId;
    var st = (p.status || "offline").toLowerCase();
    var dot = st === "online" ? "online" : (st === "idle" ? "idle" : "offline");
    return '<div class="agent-row">' + avatar(name, "sm") +
      '<div class="who"><b>' + esc(name) + "</b><span>" + esc(timeAgo(p.ts)) + "</span></div>" +
      '<span class="presence-dot ' + dot + '" title="' + esc(st) + '"></span></div>';
  }).join("");
  html += "</aside></div>";
  return html;
}

/* ---------------- Files ---------------- */
function tabFiles(WorkOS, mission) {
  var files = wosSafe(function () { return WorkOS.entities.find("file"); }, []);
  var mine = files.filter(function (f) { return f.attrs && String(f.attrs.missionId) === String(mission.id); });
  if (!mine.length) mine = files;
  var events = wosSafe(function () { return WorkOS.events.list({ mission: mission.id, limit: 500 }); }, []);

  if (!mine.length) return '<div class="empty"><div class="big">🗂️</div>No files linked to this mission yet.</div>';

  var html = '<div class="grid">';
  html += mine.map(function (f) {
    var name = f.name || f.id;
    var path = (f.attrs && (f.attrs.path || f.attrs.url)) || "";
    var hist = events.filter(function (e) {
      return String(e.entity) === String(f.id) &&
        (String(e.type || "").indexOf("file.") === 0 || e.type === "provenance.recorded");
    });
    var timeline = hist.length
      ? '<ul class="timeline" style="margin-top:12px">' + hist.map(function (e) {
          var dot = e.type === "file.modified" ? "yellow" : (e.type === "provenance.recorded" ? "purple" : "green");
          var body = (e.data && (e.data.note || e.data.summary || e.data.body)) || "";
          return '<li><span class="t-dot ' + dot + '"></span>' +
            '<div class="t-head"><b>' + esc(e.type) + "</b>" +
            '<span class="muted">by ' + esc(actorName(e.actor)) + "</span>" +
            '<span class="faint small">' + esc(timeAgo(e.ts)) + "</span></div>" +
            (body ? '<div class="t-body">' + esc(body) + "</div>" : "") + "</li>";
        }).join("") + "</ul>"
      : '<p class="muted small" style="margin-top:10px">No recorded history yet.</p>';
    return '<div class="card" data-filterable>' +
      '<div class="file-row"><span class="file-icon">📄</span>' +
      '<div class="file-meta"><b>' + esc(name) + "</b>" +
      (path ? "<span>" + esc(path) + "</span>" : "") + "</div></div>" +
      timeline + "</div>";
  }).join("");
  html += "</div>";
  return html;
}

/* ---------------- Decisions ---------------- */
function decisionStatus(type) {
  var t = String(type || "").toLowerCase();
  if (t.indexOf("superseded") >= 0) return "superseded";
  if (t.indexOf("accepted") >= 0) return "accepted";
  if (t.indexOf("rejected") >= 0) return "rejected";
  return "proposed";
}

var DECISION_PILL = {
  proposed: '<span class="pill st-review"><span class="dot"></span>Proposed</span>',
  accepted: '<span class="pill st-done"><span class="dot"></span>Accepted</span>',
  superseded: '<span class="pill st-todo"><span class="dot"></span>Superseded</span>',
  rejected: '<span class="pill st-blocked"><span class="dot"></span>Rejected</span>'
};

function tabDecisions(WorkOS, mission) {
  var decisions = wosSafe(function () { return WorkOS.decisions.list({ mission: mission.id }); }, []);
  if (!decisions.length) return '<div class="empty"><div class="big">⚖️</div>No decisions recorded yet.</div>';

  var html = '<div class="grid">';
  html += decisions.map(function (d) {
    // Core returns aggregated {title,status,rationale,supersedes}; accept raw events too.
    var data = d.data || {};
    var st = d.status || decisionStatus(d.type);
    var title = d.title || data.title || d.type || "Untitled decision";
    var rationale = d.rationale || data.rationale || "";
    var supT = d.supersedes || data.supersedes;
    var sup = supT ? '<div class="supersedes-note">⛓ Supersedes: ' + esc(supT) + "</div>" : "";
    return '<div class="card decision st-' + st + '" data-filterable>' +
      '<div class="card-top">' + (DECISION_PILL[st] || DECISION_PILL.proposed) +
      '<span class="muted small" title="' + esc(fullTime(d.ts)) + '">' + esc(timeAgo(d.ts)) + "</span></div>" +
      "<h3>" + esc(title) + "</h3>" +
      (rationale ? '<p class="rationale">' + esc(rationale) + "</p>" : "") +
      (d.actor ? '<p class="muted small">Decided by ' + esc(actorName(d.actor)) + "</p>" : "") +
      sup + "</div>";
  }).join("");
  html += "</div>";
  return html;
}

/* ---------------- Activity ---------------- */
function tabActivity(WorkOS, mission) {
  var events = wosSafe(function () { return WorkOS.events.list({ mission: mission.id, limit: 50 }); }, []);
  if (!events.length) return '<div class="empty"><div class="big">📜</div>No activity yet.</div>';

  var html = '<div class="panel" style="padding:8px 18px">';
  html += events.map(function (ev) {
    var summary = (ev.data && (ev.data.summary || ev.data.title || ev.data.body || ev.data.note)) || "";
    return '<div class="ev-row">' +
      '<span class="ev-type">' + esc(ev.type || "event") + "</span>" +
      '<div class="ev-main"><b>' + esc(actorName(ev.actor)) + "</b>" +
      (summary ? ' <span class="muted">' + esc(trunc(summary, 130)) + "</span>" : "") + "</div>" +
      '<span class="ev-meta" title="' + esc(fullTime(ev.ts)) + '">' + esc(timeAgo(ev.ts)) + "</span></div>";
  }).join("");
  html += "</div>";
  return html;
}

/* ---------------- Main renderer ---------------- */
var TAB_RENDERERS = {
  overview: tabOverview,
  work: tabWork,
  agents: tabAgents,
  room: tabRoom,
  files: tabFiles,
  decisions: tabDecisions,
  activity: tabActivity
};

function renderMission(WorkOS, missionId, tab) {
  tab = TAB_RENDERERS[tab] ? tab : "overview";
  var mission = missionOf(WorkOS, missionId);
  if (!mission) {
    return '<div class="page"><div class="empty"><div class="big">🔍</div>' +
      "<p>Mission <code>" + esc(missionId) + "</code> not found.</p>" +
      '<p><a href="#/">← Back to missions</a></p></div></div>';
  }
  var title = mission.title || mission.name || mission.id;
  var ov = wosSafe(function () { return WorkOS.missions.overview(mission.id); }, null);
  var progress = (ov && ov.progress) || { total: 0, done: 0, pct: 0 };
  var objective = (mission.attrs && mission.attrs.objective) || "";
  var mStatus = missionStatusOf(progress);

  var html = '<div class="page">';
  html += '<div class="mission-head">' +
    '<div class="crumb"><a href="#/">Missions</a> / ' + esc(title) + "</div>" +
    "<h1>" + esc(title) + "</h1>" +
    (objective ? '<p class="objective">' + esc(objective) + "</p>" : "") +
    '<div class="meta-row">' + progressBar(progress.pct) + statusPill(mStatus) +
    '<span class="muted small">Created ' + esc(timeAgo(mission.createdTs)) + "</span></div>" +
    '<nav class="tabs">' +
    MISSION_TABS.map(function (t) {
      return '<a href="#/mission/' + esc(encodeURIComponent(mission.id)) + "/" + t[0] + '"' +
        (t[0] === tab ? ' class="active"' : "") + ">" + esc(t[1]) + "</a>";
    }).join("") +
    "</nav></div>";

  html += '<div class="tab-pane">' + TAB_RENDERERS[tab](WorkOS, mission, ov) + "</div>";
  html += "</div>";
  return html;
}
