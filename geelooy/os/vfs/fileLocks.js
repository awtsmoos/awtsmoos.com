//B"H
// geelooy/os/vfs/fileLocks.js — advisory file locking for the OS VFS.
//
// Locks are ADVISORY and TTL-based:
//  - They coordinate cooperative agents (two agents won't clobber the same
//    file when both check first), but nothing enforces them. A rogue writer
//    can still write. Enforcement is cooperative by design.
//  - A lock can never deadlock the system: every lock carries a TTL and
//    expires automatically; breakStale() sweeps expired locks.
// Lock lifecycle events (file.lock_acquired / file.lock_released /
// file.lock_expired) are appended to the WorkOS event fabric when it is
// loaded (globalThis.WorkOSCore), otherwise to an optional callback set via
// setEventCallback(fn). The module works fine with neither present.
(function () {
  "use strict";
  var DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
  var locks = {}; // normPath -> {agentId, ts, ttlMs, note}
  var onEvent = null;

  function fabric() {
    return (typeof globalThis !== "undefined" && globalThis.WorkOSCore) || null;
  }
  function now() { return Date.now(); }
  function normPath(p) { return String(p == null ? "" : p); }

  function emit(type, path, lock) {
    var data = {
      path: path,
      agentId: lock ? lock.agentId : null,
      ttlMs: lock ? lock.ttlMs : null,
      note: (lock && lock.note) || ""
    };
    var W = fabric();
    if (W && W.events && typeof W.events.append === "function") {
      try {
        W.events.append({
          type: type,
          actor: { kind: "agent", id: data.agentId || "system" },
          data: data
        });
      } catch (e) { /* fabric failure must not break locking */ }
    }
    if (onEvent) { try { onEvent(type, data); } catch (e) {} }
  }

  // get live lock or null (expired locks are swept on read)
  function live(path) {
    path = normPath(path);
    var l = locks[path];
    if (!l) return null;
    if (l.ts + l.ttlMs <= now()) {
      delete locks[path];
      emit("file.lock_expired", path, l);
      return null;
    }
    return l;
  }

  // acquire(path, {agentId, ttlMs?, note?})
  // -> {ok:true, lock} | {ok:true, refreshed:true, lock} | {ok:false, reason, holder?, expiresInMs?}
  function acquire(path, o) {
    o = o || {};
    path = normPath(path);
    if (!path) return { ok: false, reason: "path required" };
    if (!o.agentId) return { ok: false, reason: "agentId required" };
    var existing = live(path);
    if (existing) {
      if (existing.agentId === o.agentId) {
        existing.ts = now(); // re-entrant refresh by the holder
        if (o.ttlMs && o.ttlMs > 0) existing.ttlMs = o.ttlMs;
        if (o.note != null) existing.note = String(o.note);
        return { ok: true, refreshed: true, lock: snapshot(path, existing) };
      }
      return {
        ok: false, reason: "locked", holder: existing.agentId,
        expiresInMs: Math.max(0, (existing.ts + existing.ttlMs) - now())
      };
    }
    var lock = {
      agentId: String(o.agentId),
      ts: now(),
      ttlMs: (o.ttlMs && o.ttlMs > 0) ? o.ttlMs : DEFAULT_TTL_MS,
      note: o.note != null ? String(o.note) : ""
    };
    locks[path] = lock;
    emit("file.lock_acquired", path, lock);
    return { ok: true, lock: snapshot(path, lock) };
  }

  // release(path, agentId) -> {ok:true} | {ok:false, reason, holder?}
  // Only the holder may release (prevents accidental unlocks by others).
  function release(path, agentId) {
    path = normPath(path);
    var l = live(path); // sweeps expired locks as a side effect
    if (!l) return { ok: false, reason: "not locked" };
    if (l.agentId !== agentId) return { ok: false, reason: "not holder", holder: l.agentId };
    delete locks[path];
    emit("file.lock_released", path, l);
    return { ok: true };
  }

  function snapshot(path, l) {
    return { path: path, agentId: l.agentId, ttlMs: l.ttlMs, note: l.note,
      expiresAt: l.ts + l.ttlMs };
  }

  // isLocked(path) -> boolean
  function isLocked(path) { return !!live(path); }

  // holder(path) -> agentId | null
  function holder(path) { var l = live(path); return l ? l.agentId : null; }

  // describe(path) -> lock snapshot | null (for UI)
  function describe(path) { var l = live(path); return l ? snapshot(normPath(path), l) : null; }

  // breakStale() -> number of expired locks swept
  function breakStale() {
    var n = 0, t = now();
    for (var p in locks) {
      if (locks[p].ts + locks[p].ttlMs <= t) {
        var l = locks[p];
        delete locks[p];
        emit("file.lock_expired", p, l);
        n++;
      }
    }
    return n;
  }

  function setEventCallback(fn) { onEvent = (typeof fn === "function") ? fn : null; }

  var api = {
    acquire: acquire,
    release: release,
    isLocked: isLocked,
    holder: holder,
    describe: describe,
    breakStale: breakStale,
    setEventCallback: setEventCallback,
    DEFAULT_TTL_MS: DEFAULT_TTL_MS
  };
  if (typeof globalThis !== "undefined") globalThis.VfsLocks = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
