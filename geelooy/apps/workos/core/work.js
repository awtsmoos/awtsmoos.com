//B"H
// WorkOS core — work.js. Missions + work items (the durable work graph).
(function () {
  var W = globalThis.WorkOSCore;
  var STATUSES = ["todo", "doing", "blocked", "review", "done"];
  var LINK_RELS = ["blocks", "depends_on", "supersedes", "part_of"];

  // ---------------- missions ----------------
  function missionCreate(o) {
    o = o || {};
    if (!o.title) throw new Error("missions.create: title is required");
    var m = W.entities.register("mission", {
      name: o.title,
      attrs: {
        objective: o.objective || "",
        acceptance: o.acceptance || "",
        status: "active"
      }
    });
    W.events.append({
      type: "mission.created",
      actor: o.actor || { kind: "system", id: "system" },
      mission: m.id,
      data: { title: o.title, objective: o.objective || "", acceptance: o.acceptance || "" }
    });
    return m;
  }

  function missionGet(id) {
    var m = W.entities.get(id);
    return m && m.kind === "mission" ? m : null;
  }

  function missionList() { return W.entities.find("mission"); }

  function missionRoomId(missionId) {
    var rooms = W.entities.find("room");
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i].attrs.missionId === missionId) return rooms[i].id;
    }
    return null;
  }

  // overview(id) -> {mission, progress, blockers, agents, recentActivity, decisions, openRequests}
  function overview(id) {
    var m = W.entities._live(id);
    if (!m || m.kind !== "mission") throw new Error("missions.overview: unknown mission " + id);
    var works = workList({ missionId: id });
    var done = 0, i;
    for (i = 0; i < works.length; i++) if (works[i].attrs.status === "done") done++;
    var blockers = [];
    for (i = 0; i < works.length; i++) if (works[i].attrs.status === "blocked") blockers.push(works[i]);

    var roomId = missionRoomId(id);
    var agents = W.entities.find("agent").map(function (a) {
      var status = "offline", currentWork = null;
      if (roomId) {
        var pres = W.rooms.presence(roomId);
        for (var p = 0; p < pres.length; p++) {
          if (pres[p].agentId === a.id) { status = pres[p].status; break; }
        }
      }
      var owned = workList({ owner: a.id });
      var prio = ["doing", "review", "blocked"];
      for (var s = 0; s < prio.length && !currentWork; s++) {
        for (var k = 0; k < owned.length; k++) {
          if (owned[k].attrs.status === prio[s]) { currentWork = owned[k]; break; }
        }
      }
      return { agent: a, status: status, currentWork: currentWork };
    });

    // recentActivity: 8 newest events on the mission or its room
    var merged = {}, recent = [];
    W.events.list({ mission: id, limit: 8 }).forEach(pushUnique);
    if (roomId) W.events.list({ room: roomId, limit: 8 }).forEach(pushUnique);
    function pushUnique(e) { if (!merged[e.id]) { merged[e.id] = 1; recent.push(e); } }
    recent.sort(function (a, b) { return b.seq - a.seq; });
    recent = recent.slice(0, 8);

    var openRequests = roomId
      ? W.events.list({ room: roomId, type: "room.message" }).filter(function (e) {
          return e.data && e.data.msgKind === "request";
        })
      : [];

    return {
      mission: W.util.clone(m),
      progress: {
        total: works.length,
        done: done,
        pct: works.length ? Math.round((done / works.length) * 100) : 0
      },
      blockers: blockers,
      agents: agents,
      recentActivity: recent,
      decisions: W.decisions.list({ mission: id }),
      openRequests: openRequests
    };
  }

  // ---------------- work items ----------------
  function workCreate(o) {
    o = o || {};
    if (!o.title) throw new Error("work.create: title is required");
    var w = W.entities.register("work", {
      name: o.title,
      attrs: {
        missionId: o.missionId || null,
        status: "todo",
        owner: o.owner || null,
        acceptance: o.acceptance || "",
        parentId: o.parentId || null,
        links: []
      }
    });
    W.events.append({
      type: "work.created",
      actor: o.actor || { kind: "system", id: "system" },
      work: w.id,
      mission: w.attrs.missionId,
      data: { title: o.title, owner: w.attrs.owner, parentId: w.attrs.parentId }
    });
    return w;
  }

  function workGet(id) {
    var w = W.entities.get(id);
    return w && w.kind === "work" ? w : null;
  }

  function workList(f) {
    f = f || {};
    var out = [];
    var all = W.entities.find("work");
    for (var i = 0; i < all.length; i++) {
      var w = all[i];
      if (f.missionId && w.attrs.missionId !== f.missionId) continue;
      if (f.status && w.attrs.status !== f.status) continue;
      if (f.owner && w.attrs.owner !== f.owner) continue;
      out.push(w);
    }
    return out;
  }

  // setStatus(id, status, {note?, evidence?}) — emits status_changed plus
  // work.blocked / work.unblocked / work.completed on entering those states.
  function setStatus(id, status, o) {
    o = o || {};
    if (STATUSES.indexOf(status) < 0) {
      throw new Error("work.setStatus: invalid status '" + status + "' (want " + STATUSES.join("|") + ")");
    }
    var w = W.entities._live(id);
    if (!w || w.kind !== "work") throw new Error("work.setStatus: unknown work " + id);
    var from = w.attrs.status;
    if (from === status) return W.util.clone(w);
    w.attrs.status = status;
    var actor = o.actor || { kind: "system", id: "system" };
    var base = { work: id, mission: w.attrs.missionId };
    W.events.append({
      type: "work.status_changed", actor: actor,
      work: base.work, mission: base.mission,
      data: { from: from, to: status, note: o.note || "", evidence: o.evidence != null ? o.evidence : null }
    });
    if (status === "blocked") {
      W.events.append({ type: "work.blocked", actor: actor, work: id, mission: w.attrs.missionId,
        data: { from: from, note: o.note || "" } });
    }
    if (from === "blocked" && status !== "blocked") {
      W.events.append({ type: "work.unblocked", actor: actor, work: id, mission: w.attrs.missionId,
        data: { to: status, note: o.note || "" } });
    }
    if (status === "done") {
      W.events.append({ type: "work.completed", actor: actor, work: id, mission: w.attrs.missionId,
        data: { from: from, note: o.note || "", evidence: o.evidence != null ? o.evidence : null } });
    }
    if (W.persist) W.persist();
    return W.util.clone(w);
  }

  // link(aId, bId, rel) — rel in blocks|depends_on|supersedes|part_of
  function link(aId, bId, rel) {
    if (LINK_RELS.indexOf(rel) < 0) {
      throw new Error("work.link: invalid rel '" + rel + "' (want " + LINK_RELS.join("|") + ")");
    }
    var a = W.entities._live(aId);
    var b = W.entities._live(bId);
    if (!a) throw new Error("work.link: unknown entity " + aId);
    if (!b) throw new Error("work.link: unknown entity " + bId);
    a.attrs.links = a.attrs.links || [];
    a.attrs.links.push({ rel: rel, other: bId, ts: W.util.now() });
    W.events.append({
      type: "work.linked",
      actor: { kind: "system", id: "system" },
      work: a.kind === "work" ? aId : null,
      entity: a.kind === "work" ? null : aId,
      data: { from: aId, to: bId, rel: rel }
    });
    if (W.persist) W.persist();
    return W.util.clone(a);
  }

  W.missions = {
    create: missionCreate, get: missionGet, list: missionList, overview: overview
  };
  W.work = {
    create: workCreate, get: workGet, list: workList, setStatus: setStatus, link: link,
    STATUSES: STATUSES.slice(), LINK_RELS: LINK_RELS.slice()
  };
})();
