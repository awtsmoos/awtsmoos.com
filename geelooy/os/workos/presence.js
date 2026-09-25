//B"H
// geelooy/os/workos/presence.js — presence-at-file: which agents are currently
// focused on which VFS path (e.g. co-editing awareness in the Drive UI).
//
// API:
//   setFocus(agentId, path)   — mark an agent as focused on a path (heartbeat: call
//                               repeatedly while the agent is active there)
//   clearFocus(agentId)       — remove an agent's focus entry
//   whoIsHere(path)           — [{agentId, path, ts}] for one path, oldest-first
//
// Heartbeat-pruned: entries expire FOCUS_TTL_MS after the last setFocus and are
// swept lazily on read (whoIsHere / count). No presence server needed.
// Emits file.focus / file.unfocus events into the WorkOS event fabric when it is
// loaded (globalThis.WorkOSCore), otherwise to an optional callback.
// Attaches to WorkOSCore.filePresence when the core is present, otherwise to
// globalThis.FilePresence (standalone use).
(function () {
  "use strict";
  var FOCUS_TTL_MS = 90 * 1000; // heartbeat window
  var focus = {}; // agentId -> {path, ts}
  var onEvent = null;
  var nowFn = function () { return Date.now(); };

  function fabric() {
    return (typeof globalThis !== "undefined" && globalThis.WorkOSCore) || null;
  }
  function emit(type, agentId, path) {
    var data = { agentId: agentId, path: path || null };
    var W = fabric();
    if (W && W.events && typeof W.events.append === "function") {
      try {
        W.events.append({ type: type, actor: { kind: "agent", id: agentId }, data: data });
      } catch (e) { /* must not break presence */ }
    }
    if (onEvent) { try { onEvent(type, data); } catch (e) {} }
  }
  function prune() {
    var t = nowFn(), n = 0;
    for (var a in focus) {
      if (focus[a].ts + FOCUS_TTL_MS <= t) { delete focus[a]; n++; }
    }
    return n;
  }

  function setFocus(agentId, path) {
    if (!agentId) throw new Error("filePresence.setFocus: agentId is required");
    if (!path) throw new Error("filePresence.setFocus: path is required");
    agentId = String(agentId);
    path = String(path);
    var prev = focus[agentId];
    focus[agentId] = { path: path, ts: nowFn() };
    if (!prev || prev.path !== path) emit("file.focus", agentId, path);
    return { agentId: agentId, path: path, ts: focus[agentId].ts };
  }

  function clearFocus(agentId) {
    if (!agentId) return false;
    agentId = String(agentId);
    var had = !!focus[agentId];
    var path = had ? focus[agentId].path : null;
    delete focus[agentId];
    if (had) emit("file.unfocus", agentId, path);
    return had;
  }

  function whoIsHere(path) {
    prune();
    path = String(path);
    var out = [];
    for (var a in focus) {
      if (focus[a].path === path) out.push({ agentId: a, path: path, ts: focus[a].ts });
    }
    out.sort(function (x, y) { return x.ts - y.ts; });
    return out;
  }

  function count() { prune(); return Object.keys(focus).length; }
  function setEventCallback(fn) { onEvent = (typeof fn === "function") ? fn : null; }

  var api = {
    setFocus: setFocus,
    clearFocus: clearFocus,
    whoIsHere: whoIsHere,
    count: count,
    setEventCallback: setEventCallback,
    FOCUS_TTL_MS: FOCUS_TTL_MS,
    // test seam: override the clock to simulate heartbeat expiry
    _setNowFn: function (fn) { nowFn = (typeof fn === "function") ? fn : function () { return Date.now(); }; }
  };
  var W = fabric();
  if (W) W.filePresence = api;
  if (typeof globalThis !== "undefined") globalThis.FilePresence = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
