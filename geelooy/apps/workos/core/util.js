//B"H
// WorkOS core — util.js (loads first). Shared primitives.
(function () {
  var W = globalThis.WorkOSCore = globalThis.WorkOSCore || {};
  // Shared mutable state. store.js persists/restores it; every other
  // module reads/writes W.state so load order never matters at runtime.
  W.state = W.state || { events: [], entities: {} };

  function uid() {
    var r = Math.random().toString(36).slice(2, 8);
    while (r.length < 6) r += "0";
    return Date.now().toString(36) + r;
  }
  function now() { return Date.now(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function estTokens(s) { return Math.ceil(String(s == null ? "" : s).length / 4); }

  W.util = { uid: uid, now: now, clone: clone, estTokens: estTokens };
})();
