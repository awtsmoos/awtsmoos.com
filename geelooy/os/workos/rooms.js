// --- VENDORED - DO NOT EDIT BY HAND ---
// Source: branch workos-v0.1 @ bbc331f78, path geelooy/apps/workos/core/rooms.js
// Extracted read-only via git (git show / git cat-file); re-vendor to update, never hand-edit.
// Shared WorkOS event-fabric core used by the OS shell. See geelooy/os/workos/README.md.
//B"H
// WorkOS core — rooms.js. Mission rooms: messages, presence.
(function () {
  var W = globalThis.WorkOSCore;
  var MSGKINDS = ["message", "announcement", "request", "response", "obligation",
    "delegation", "discovery", "blocker", "review_request", "handoff"];
  var PRESENCE = ["online", "away", "offline"];

  function roomMission(roomId) {
    var r = W.entities._live(roomId);
    return r && r.attrs ? r.attrs.missionId || null : null;
  }

  // create({missionId, name}) -> room entity + room.created
  function create(o) {
    o = o || {};
    if (!o.name) throw new Error("rooms.create: name is required");
    var r = W.entities.register("room", {
      name: o.name,
      attrs: { missionId: o.missionId || null }
    });
    W.events.append({
      type: "room.created",
      actor: o.actor || { kind: "system", id: "system" },
      room: r.id,
      mission: r.attrs.missionId,
      data: { name: o.name }
    });
    return r;
  }

  function normalizeAuthor(author) {
    if (typeof author === "string") {
      var ent = W.entities.get(author);
      return ent
        ? { kind: ent.kind, id: ent.id, name: ent.name }
        : { kind: "agent", id: author };
    }
    author = author || {};
    return { kind: author.kind || "agent", id: author.id || "unknown", name: author.name };
  }

  // post(roomId, {author, msgKind, body, to?}) -> room.message event
  function post(roomId, o) {
    o = o || {};
    if (!W.entities._live(roomId)) throw new Error("rooms.post: unknown room " + roomId);
    if (MSGKINDS.indexOf(o.msgKind) < 0) {
      throw new Error("rooms.post: invalid msgKind '" + o.msgKind + "' (want " + MSGKINDS.join("|") + ")");
    }
    return W.events.append({
      type: "room.message",
      actor: normalizeAuthor(o.author),
      room: roomId,
      mission: roomMission(roomId),
      data: { msgKind: o.msgKind, body: o.body || "", to: o.to != null ? o.to : null }
    });
  }

  // history(roomId, {limit=100}) -> oldest-first
  function history(roomId, o) {
    o = o || {};
    var limit = o.limit == null ? 100 : o.limit;
    var evs = W.events.list({ room: roomId, type: "room.message" }); // newest-first
    evs.reverse(); // oldest-first
    return evs.slice(-limit);
  }

  // setPresence(roomId, agentId, status) — status in online|away|offline
  function setPresence(roomId, agentId, status) {
    if (PRESENCE.indexOf(status) < 0) {
      throw new Error("rooms.setPresence: invalid status '" + status + "' (want " + PRESENCE.join("|") + ")");
    }
    if (!W.entities._live(roomId)) throw new Error("rooms.setPresence: unknown room " + roomId);
    var ent = W.entities.get(agentId);
    return W.events.append({
      type: "room.presence",
      actor: ent ? { kind: ent.kind, id: ent.id, name: ent.name } : { kind: "agent", id: agentId },
      room: roomId,
      mission: roomMission(roomId),
      data: { agentId: agentId, name: ent ? ent.name : null, status: status }
    });
  }

  // presence(roomId) -> latest status per agent [{agentId, name?, status, ts}]
  function presence(roomId) {
    var evs = W.events.list({ room: roomId, type: "room.presence" }); // newest-first
    var latest = {}, order = [];
    for (var i = 0; i < evs.length; i++) {
      var d = evs[i].data || {};
      var aid = d.agentId;
      if (!aid || latest[aid]) continue; // newest-first: first hit wins
      latest[aid] = { agentId: aid, name: d.name || null, status: d.status, ts: evs[i].ts };
      order.push(aid);
    }
    return order.map(function (aid) { return latest[aid]; });
  }

  W.rooms = {
    create: create, post: post, history: history,
    setPresence: setPresence, presence: presence,
    MSGKINDS: MSGKINDS.slice()
  };
})();
