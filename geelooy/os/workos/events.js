// --- VENDORED - DO NOT EDIT BY HAND ---
// Source: branch workos-v0.1 @ bbc331f78, path geelooy/apps/workos/core/events.js
// Extracted read-only via git (git show / git cat-file); re-vendor to update, never hand-edit.
// Shared WorkOS event-fabric core used by the OS shell. See geelooy/os/workos/README.md.
//B"H
// WorkOS core — events.js. Append-only causal event fabric + facts/claims/decisions views.
(function () {
  var W = globalThis.WorkOSCore;

  function persist() { if (W.persist) W.persist(); }

  function nextSeq() {
    var evs = W.state.events, m = 0;
    for (var i = 0; i < evs.length; i++) if (evs[i].seq > m) m = evs[i].seq;
    return m + 1;
  }

  // append({type,actor,entity?,mission?,work?,room?,causes?,data?}) -> event
  // actor may be {kind,id,name?} or a bare entity-id string (resolved when possible).
  function append(o) {
    o = o || {};
    if (!o.type) throw new Error("events.append: type is required");
    var actor = o.actor;
    if (typeof actor === "string") {
      var ent = W.entities && W.entities._live ? W.entities._live(actor) : null;
      actor = ent
        ? { kind: ent.kind, id: ent.id, name: ent.name }
        : { kind: "agent", id: actor };
    }
    actor = actor || { kind: "system", id: "system" };
    var ev = {
      id: "evt_" + W.util.uid(),
      seq: nextSeq(),
      ts: W.util.now(),
      type: o.type,
      actor: { kind: actor.kind || "system", id: actor.id || "system" },
      entity: o.entity || null,
      mission: o.mission || null,
      work: o.work || null,
      room: o.room || null,
      causes: o.causes ? o.causes.slice() : [],
      data: o.data ? W.util.clone(o.data) : {}
    };
    if (actor.name) ev.actor.name = actor.name;
    W.state.events.push(ev);
    persist(); // persist after every append
    return W.util.clone(ev);
  }

  // list({type?,typePrefix?,mission?,work?,room?,entity?,actorId?,since?,limit?}) -> newest-first
  function list(f) {
    f = f || {};
    var out = [];
    var evs = W.state.events;
    for (var i = evs.length - 1; i >= 0; i--) {
      var e = evs[i];
      if (f.type && e.type !== f.type) continue;
      if (f.typePrefix && e.type.indexOf(f.typePrefix) !== 0) continue;
      if (f.mission && e.mission !== f.mission) continue;
      if (f.work && e.work !== f.work) continue;
      if (f.room && e.room !== f.room) continue;
      if (f.entity && e.entity !== f.entity) continue;
      if (f.actorId && e.actor.id !== f.actorId) continue;
      if (f.since && e.ts < f.since) continue;
      out.push(W.util.clone(e));
      if (f.limit && out.length >= f.limit) break;
    }
    return out;
  }

  function factsList(f) {
    f = f || {};
    return list({ typePrefix: "fact.", mission: f.mission, entity: f.entity, limit: f.limit });
  }

  function claimsList(f) {
    f = f || {};
    return list({ typePrefix: "claim.", mission: f.mission, entity: f.entity, limit: f.limit });
  }

  // decisions.list({mission?,status?}) — status = latest decision.* event per data.title
  function decisionsList(f) {
    f = f || {};
    var evs = list({ typePrefix: "decision.", mission: f.mission });
    var byTitle = {};
    for (var i = 0; i < evs.length; i++) {
      var e = evs[i];
      var t = e.data && e.data.title;
      if (!t) continue;
      if (!byTitle[t] || e.seq > byTitle[t].event.seq) byTitle[t] = { event: e };
    }
    var out = [];
    for (var title in byTitle) {
      var le = byTitle[title].event;
      var status = le.type.split(".")[1]; // proposed|accepted|implemented|superseded|reversed|deprecated
      if (f.status && status !== f.status) continue;
      out.push({
        title: title,
        status: status,
        mission: le.mission,
        ts: le.ts,
        seq: le.seq,
        rationale: (le.data && le.data.rationale) || "",
        supersedes: (le.data && le.data.supersedes) || null,
        eventId: le.id
      });
    }
    out.sort(function (a, b) { return b.seq - a.seq; });
    return out;
  }

  W.events = { append: append, list: list };
  W.facts = { list: factsList };
  W.claims = { list: claimsList };
  W.decisions = { list: decisionsList };
})();
