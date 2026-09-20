//B"H
// WorkOS core — store.js (loads last). Persistence + the public WorkOS facade.
(function () {
  var W = globalThis.WorkOSCore;
  var KEY = "awtsmoos.workos.v1";

  // Node (no localStorage): in-memory backing. Browser: localStorage.
  var memStore = { events: [], entities: {} };
  function hasLS() { return typeof localStorage !== "undefined"; }

  function save() {
    var snap = JSON.stringify({ events: W.state.events, entities: W.state.entities });
    if (hasLS()) {
      try { localStorage.setItem(KEY, snap); } catch (e) { /* storage full/blocked: keep going */ }
    } else {
      var parsed = JSON.parse(snap);
      memStore.events = parsed.events;
      memStore.entities = parsed.entities;
    }
  }

  function load() {
    var raw = null;
    if (hasLS()) { try { raw = localStorage.getItem(KEY); } catch (e) {} }
    var snap = null;
    if (raw) { try { snap = JSON.parse(raw); } catch (e) {} }
    else { snap = memStore; }
    if (snap) {
      W.state.events = snap.events || [];
      W.state.entities = snap.entities || {};
    }
  }

  // Late-bound by every mutating API (events.append, entities.register/rename, ...).
  W.persist = save;

  function reset() {
    W.state.events = [];
    W.state.entities = {};
    save(); // persist the empty state
  }

  load(); // restore persisted state on boot

  globalThis.WorkOS = {
    version: "0.1.0",
    reset: reset,
    seed: function () { return W.seed(); },
    events: W.events,
    entities: W.entities,
    missions: W.missions,
    work: W.work,
    rooms: W.rooms,
    provenance: W.provenance,
    capsule: W.capsule,
    graph: W.graph,
    facts: W.facts,
    claims: W.claims,
    decisions: W.decisions,
    _save: save,
    _load: load
  };
})();
