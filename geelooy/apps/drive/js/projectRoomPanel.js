//B"H
// geelooy/apps/drive/js/projectRoomPanel.js — mountable multi-agent project room panel.
//
// mountProjectRoom(container, {projectId, roomId, agentId}) renders, inside any
// Drive view, the shared project room for a mission:
//   - presence roster (who is online in the room)
//   - shared activity feed (room messages + mission-scoped work/provenance/decision events)
//   - work-division controls: claim a work item, delegate it to another agent,
//     advance its status, and post semantic messages (discovery / blocker / handoff / …)
//
// Pure-ish over the WorkOS fabric (globalThis.WorkOS, vendored at geelooy/os/workos/).
// If the fabric is not loaded, renders a graceful "not loaded" card instead of
// throwing. All rendered values are HTML-escaped. Realtime sync across peers is
// out of scope (see README) — the panel re-renders after every local action.
(function () {
  "use strict";

  function fabric() {
    return (typeof globalThis !== "undefined" && globalThis.WorkOS) || null;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmtTime(ts) {
    try { return new Date(ts).toLocaleString(); } catch (e) { return ""; }
  }
  function actorName(a) {
    if (!a) return "system";
    return a.name || a.id || "system";
  }

  // ---- resolution helpers (pure over the fabric) ----
  function getMission(W, projectId) {
    if (!projectId) return null;
    try { return W.missions.get(projectId); } catch (e) { return null; }
  }
  function findRoomForMission(W, missionId) {
    if (!missionId) return null;
    var rooms = W.entities.find("room");
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i].attrs && rooms[i].attrs.missionId === missionId) return rooms[i];
    }
    return null;
  }
  function resolveRoom(W, opts) {
    if (opts.roomId) {
      try {
        var r = W.entities.get(opts.roomId);
        if (r && r.kind === "room") return r;
      } catch (e) {}
    }
    if (opts.projectId) return findRoomForMission(W, opts.projectId);
    return null;
  }

  // ---- work-division actions ----
  function claimWork(workId, agentId) {
    var W = fabric();
    if (!W) throw new Error("ProjectRoomPanel.claimWork: WorkOS fabric not loaded");
    var live = W.entities._live(workId);
    if (!live || live.kind !== "work") throw new Error("ProjectRoomPanel.claimWork: unknown work " + workId);
    live.attrs.owner = agentId;
    var actor = { kind: "agent", id: agentId };
    if (live.attrs.status === "todo") {
      W.work.setStatus(workId, "doing", { actor: actor, note: "Claimed by " + actorName(actor) });
    } else if (W.persist) { W.persist(); }
    W.events.append({ type: "work.claimed", actor: actor, work: workId,
      mission: live.attrs.missionId, data: { agentId: agentId } });
    return W.work.get(workId);
  }

  function delegateWork(workId, fromAgentId, toAgentId, note) {
    var W = fabric();
    if (!W) throw new Error("ProjectRoomPanel.delegateWork: WorkOS fabric not loaded");
    if (!toAgentId) throw new Error("ProjectRoomPanel.delegateWork: toAgentId is required");
    var live = W.entities._live(workId);
    if (!live || live.kind !== "work") throw new Error("ProjectRoomPanel.delegateWork: unknown work " + workId);
    var prevOwner = live.attrs.owner || null;
    live.attrs.owner = toAgentId;
    if (W.persist) W.persist();
    var body = (note || "Delegated") + " → " + toAgentId +
      (prevOwner ? " (was " + prevOwner + ")" : "");
    var room = findRoomForMission(W, live.attrs.missionId);
    if (room) {
      W.rooms.post(room.id, { author: fromAgentId || "system", msgKind: "delegation",
        body: "Work '" + live.name + "': " + body, to: toAgentId });
    }
    W.events.append({ type: "work.delegated",
      actor: { kind: "agent", id: fromAgentId || "system" },
      work: workId, mission: live.attrs.missionId,
      data: { from: prevOwner, to: toAgentId, note: note || "" } });
    return W.work.get(workId);
  }

  function postMessage(roomId, authorId, msgKind, body, to) {
    var W = fabric();
    if (!W) throw new Error("ProjectRoomPanel.postMessage: WorkOS fabric not loaded");
    if (!roomId) throw new Error("ProjectRoomPanel.postMessage: roomId is required");
    if (!body) throw new Error("ProjectRoomPanel.postMessage: body is required");
    return W.rooms.post(roomId, { author: authorId || "system", msgKind: msgKind || "message",
      body: body, to: to || null });
  }

  // ---- feed ----
  // collectFeed(W, {room, missionId, limit}) -> [{ts, kind, title, body, actor, raw}] oldest-first
  function collectFeed(W, opts) {
    opts = opts || {};
    var items = [];
    var room = opts.room || null;
    var missionId = opts.missionId || (room && room.attrs ? room.attrs.missionId : null);
    var seen = {};
    function push(ts, kind, title, body, actor, raw) {
      var key = (raw && raw.id) || (kind + "|" + ts + "|" + title);
      if (seen[key]) return;
      seen[key] = true;
      items.push({ ts: ts, kind: kind, title: title, body: body, actor: actor, raw: raw });
    }
    if (room) {
      var hist = W.rooms.history(room.id, { limit: 200 });
      hist.forEach(function (e) {
        var d = e.data || {};
        push(e.ts, "room." + (d.msgKind || "message"),
          (d.msgKind || "message") + " — " + actorName(e.actor),
          d.body || "", e.actor, e);
      });
    }
    if (missionId) {
      var evs = W.events.list({ mission: missionId, limit: 200 });
      evs.forEach(function (e) {
        if (e.type === "room.message") return; // already included via history
        var d = e.data || {};
        var title = e.type, body = "";
        if (e.type === "work.created") { title = "work created"; body = d.title || ""; }
        else if (e.type === "work.status_changed") { title = "status: " + d.from + " → " + d.to; body = d.note || ""; }
        else if (e.type === "work.claimed") { title = "claimed by " + (d.agentId || "?"); }
        else if (e.type === "work.delegated") { title = "delegated → " + (d.to || "?"); body = d.note || ""; }
        else if (e.type === "work.blocked") { title = "blocked"; body = d.note || ""; }
        else if (e.type === "work.completed") { title = "completed ✓"; body = d.note || ""; }
        else if (e.type === "provenance.recorded") { title = "provenance: " + (d.tool || ""); body = d.summary || ""; }
        else if (e.type.indexOf("decision.") === 0) { title = e.type; body = d.title || d.rationale || ""; }
        else if (e.type === "room.created") { title = "room created"; body = (d.name || ""); }
        else { body = d.summary || d.note || ""; }
        push(e.ts, e.type, title, body, e.actor, e);
      });
    }
    items.sort(function (a, b) { return a.ts - b.ts; });
    var limit = opts.limit || 80;
    return items.slice(-limit);
  }

  var KIND_ICON = {
    "room.message": "💬", "room.discovery": "💡", "room.blocker": "🚧", "room.handoff": "🔄",
    "room.delegation": "➡️", "room.request": "🙋", "room.response": "↩️",
    "room.announcement": "📢", "room.obligation": "📌", "room.review_request": "🔍",
    "work.created": "📝", "work.status_changed": "🔀", "work.claimed": "✋",
    "work.delegated": "➡️", "work.blocked": "🚧", "work.completed": "✅",
    "provenance.recorded": "🕘"
  };
  function iconFor(kind) { return KIND_ICON[kind] || "•"; }

  function renderFeed(items) {
    if (!items.length) return '<p class="prp-empty">No activity yet. Post the first message below.</p>';
    return '<ol class="prp-feed">' + items.map(function (it) {
      return '<li class="prp-feed-item">' +
        '<span class="prp-icon">' + esc(iconFor(it.kind)) + "</span>" +
        '<div class="prp-feed-body"><div class="prp-feed-title">' + esc(it.title) +
        ' <span class="prp-feed-actor">' + esc(actorName(it.actor)) + "</span></div>" +
        (it.body ? '<div class="prp-feed-text">' + esc(it.body) + "</div>" : "") +
        '<div class="prp-feed-ts">' + esc(fmtTime(it.ts)) + "</div></div></li>";
    }).join("") + "</ol>";
  }

  function renderRoster(presenceList) {
    if (!presenceList || !presenceList.length) {
      return '<p class="prp-empty">No agents currently present in this room.</p>';
    }
    return '<ul class="prp-roster">' + presenceList.map(function (p) {
      var dot = p.status === "online" ? "🟢" : (p.status === "away" ? "🟡" : "⚪");
      return '<li class="prp-roster-item"><span>' + esc(dot) + "</span> " +
        "<span>" + esc(p.name || p.agentId) + "</span></li>";
    }).join("") + "</ul>";
  }

  function renderWorkList(W, works, selfId) {
    if (!works.length) return '<p class="prp-empty">No work items yet for this mission.</p>';
    return '<ul class="prp-work">' + works.map(function (w) {
      var mine = selfId && w.attrs.owner === selfId;
      var claimBtn = (!w.attrs.owner && w.attrs.status === "todo")
        ? ' <button class="prp-btn" data-act="claim" data-id="' + esc(w.id) + '">Claim</button>' : "";
      var advBtn = (w.attrs.status !== "done" && w.attrs.status !== "blocked")
        ? ' <button class="prp-btn" data-act="advance" data-id="' + esc(w.id) + '">Advance ▸</button>' : "";
      return '<li class="prp-work-item" data-id="' + esc(w.id) + '">' +
        '<span class="prp-work-status">[' + esc(w.attrs.status) + "]</span> " +
        "<strong>" + esc(w.name) + "</strong>" +
        ' <span class="prp-work-owner">' + esc(w.attrs.owner ? (mine ? "you" : w.attrs.owner) : "unassigned") + "</span>" +
        claimBtn + advBtn +
        ' <button class="prp-btn prp-btn-quiet" data-act="delegate" data-id="' + esc(w.id) + '">Delegate…</button>' +
        "</li>";
    }).join("") + "</ul>";
  }

  var MSGKINDS = ["message", "announcement", "request", "response", "obligation",
    "delegation", "discovery", "blocker", "review_request", "handoff"];
  var NEXT_STATUS = { todo: "doing", doing: "review", review: "done", blocked: "doing" };

  function renderPanel(W, opts, room, mission) {
    var missionId = (mission && mission.id) || opts.projectId || null;
    var feed = collectFeed(W, { room: room, missionId: missionId });
    var roster = room ? W.rooms.presence(room.id) : [];
    var works = missionId ? W.work.list({ missionId: missionId }) : [];
    var title = mission ? mission.name : (room ? room.name : "Project room");
    var kindOpts = MSGKINDS.map(function (k) {
      return '<option value="' + k + '"' + (k === "message" ? " selected" : "") + ">" + k + "</option>";
    }).join("");
    return '<div class="prp" data-mission="' + esc(missionId) + '" data-room="' + esc(room ? room.id : "") + '">' +
      '<div class="prp-head"><h3>🏠 ' + esc(title) + "</h3>" +
      (mission && mission.attrs && mission.attrs.status ? '<span class="prp-mstatus">' + esc(mission.attrs.status) + "</span>" : "") +
      "</div>" +
      '<div class="prp-cols">' +
      '<div class="prp-col"><h4>Presence</h4><div class="prp-roster-wrap">' + renderRoster(roster) + "</div>" +
      '<h4>Work division</h4><div class="prp-work-wrap">' + renderWorkList(W, works, opts.agentId) + "</div></div>" +
      '<div class="prp-col prp-col-wide"><h4>Activity</h4><div class="prp-feed-wrap">' + renderFeed(feed) + "</div>" +
      (room ? '<div class="prp-composer"><select class="prp-kind">' + kindOpts + "</select> " +
        '<input class="prp-input" type="text" placeholder="Post to the room… (discovery / blocker / handoff…)"> ' +
        '<button class="prp-btn prp-send">Post</button></div>'
        : '<p class="prp-empty">No room yet for this mission.</p>') +
      "</div></div></div>";
  }

  function renderNotLoaded() {
    return '<div class="prp prp-unavailable">' +
      "<h3>🏠 Project room</h3>" +
      "<p>The WorkOS event fabric is not loaded in this page, so the shared " +
      "room cannot be shown. Load <code>geelooy/os/workos/*.js</code> (see " +
      "<code>geelooy/os/workos/README.md</code>) and remount.</p></div>";
  }

  // mountProjectRoom(container, {projectId?, roomId?, agentId?}) -> {refresh, unmount}
  function mountProjectRoom(container, opts) {
    opts = opts || {};
    if (typeof container === "string") {
      if (typeof document === "undefined") throw new Error("ProjectRoomPanel.mountProjectRoom: no document");
      container = document.querySelector(container);
    }
    if (!container) throw new Error("ProjectRoomPanel.mountProjectRoom: container not found");
    var W = fabric();

    function refresh() {
      var w2 = fabric();
      if (!w2) { container.innerHTML = renderNotLoaded(); return; }
      var room = resolveRoom(w2, opts);
      var mission = getMission(w2, opts.projectId) ||
        (room && room.attrs && room.attrs.missionId ? w2.missions.get(room.attrs.missionId) : null);
      container.innerHTML = renderPanel(w2, opts, room, mission);
    }

    function onClick(ev) {
      var W2 = fabric();
      if (!W2) return;
      var t = ev.target;
      if (t.classList && t.classList.contains("prp-send")) {
        var root = t.closest(".prp");
        var kind = root.querySelector(".prp-kind").value;
        var input = root.querySelector(".prp-input");
        var body = input.value.trim();
        if (!body) return;
        try {
          postMessage(root.getAttribute("data-room"), opts.agentId, kind, body);
          input.value = "";
          refresh();
        } catch (e) { /* surface nothing; keep the draft */ }
        return;
      }
      var btn = t.closest ? t.closest("[data-act]") : null;
      if (!btn) return;
      var id = btn.getAttribute("data-id"), act = btn.getAttribute("data-act");
      try {
        if (act === "claim") claimWork(id, opts.agentId || "local-agent");
        else if (act === "advance") {
          var w = W2.work.get(id);
          var next = w && NEXT_STATUS[w.attrs.status];
          if (next) W2.work.setStatus(id, next, { actor: { kind: "agent", id: opts.agentId || "local-agent" } });
        } else if (act === "delegate") {
          var to = (typeof prompt === "function")
            ? prompt("Delegate to agent id:")
            : null;
          if (to) delegateWork(id, opts.agentId, to, "");
        }
        refresh();
      } catch (e) { /* keep panel alive on action errors */ }
    }

    if (typeof container.addEventListener === "function") {
      container.addEventListener("click", onClick);
    }
    api._detach = function () {
      if (typeof container.removeEventListener === "function") container.removeEventListener("click", onClick);
    };
    refresh();
    return { refresh: refresh, unmount: function () { api._detach(); container.innerHTML = ""; } };
  }

  var api = {
    mountProjectRoom: mountProjectRoom,
    claimWork: claimWork,
    delegateWork: delegateWork,
    postMessage: postMessage,
    collectFeed: collectFeed,
    renderFeed: renderFeed,
    renderRoster: renderRoster,
    renderWorkList: renderWorkList,
    renderNotLoaded: renderNotLoaded,
    MSGKINDS: MSGKINDS.slice()
  };
  if (typeof globalThis !== "undefined") globalThis.ProjectRoomPanel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
