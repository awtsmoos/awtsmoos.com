//B"H
// geelooy/apps/drive/js/provenance.js — client-side file provenance recorder.
//
// Who touched a file, from which chat, as which agent, what they did, and why.
// This module is intentionally standalone: bulkActions.js and the upload queue
// are sibling-owned, so instead of hooking into them directly this module
// exposes installProvenanceHooks({onTransfer, onUpload}) which returns
// {emitTransfer, emitUpload} callbacks those owners can call (or wrap with).
//
// Storage is pluggable:
//   HistoryBackend { append(entryId, rec), list(entryId) }
// Default: localStorage-backed (per-browser). Swap in the server binding
// (WS-7 drive backend API) via setBackend(). getFileHistory() merges the
// local records with the active backend's records (deduped by id), newest-first,
// so nothing recorded locally is ever lost when the backend changes.
// Every touch is also bridged into the WorkOS event fabric (provenance.recorded)
// when globalThis.WorkOSCore is loaded.
//
// Record shape: {id, ts, entryId, chatId, agentId, action, summary}
(function () {
  "use strict";
  var LS_KEY = "awtsmoos.drive.provenance.v1";

  function entryIdOf(entry) {
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    // Logical paths first: the WS-7 server history backend keys entries by
    // their logical drive path, so entry.path is the cross-backend identity.
    return entry.path || entry.id || entry.entryId || entry.name || null;
  }
  function entryLabel(entry) {
    if (!entry) return "(unknown file)";
    if (typeof entry === "string") return entry;
    return entry.name || entry.path || entry.id || "(unknown file)";
  }

  function readLS() {
    try {
      if (typeof localStorage === "undefined") return {};
      var raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeLS(all) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(LS_KEY, JSON.stringify(all));
    } catch (e) { /* storage full/blocked: keep going */ }
  }

  var localBackend = {
    name: "localStorage",
    append: function (entryId, rec) {
      var all = readLS();
      (all[entryId] = all[entryId] || []).push(rec);
      writeLS(all);
    },
    list: function (entryId) {
      var all = readLS();
      return (all[entryId] || []).slice();
    }
  };

  var customBackend = null;
  function activeBackend() { return customBackend || localBackend; }

  // setBackend({append(entryId, rec), list(entryId)}) — install the server binding.
  // Pass null/undefined to revert to the localStorage backend.
  function setBackend(be) {
    if (be == null) { customBackend = null; return; }
    if (typeof be.append !== "function" || typeof be.list !== "function") {
      throw new Error("DriveProvenance.setBackend: backend needs append(entryId, rec) and list(entryId)");
    }
    customBackend = be;
  }

  function bridgeToFabric(rec) {
    var W = (typeof globalThis !== "undefined" && globalThis.WorkOSCore) || null;
    if (!W || !W.provenance || typeof W.provenance.record !== "function") return;
    try {
      W.provenance.record({
        tool: "drive",
        agentId: rec.agentId,
        summary: rec.action + ": " + rec.summary,
        data: { entryId: rec.entryId, chatId: rec.chatId, action: rec.action, historyId: rec.id }
      });
    } catch (e) { /* fabric failure must not break the drive UI */ }
  }

  // recordTouch({entry|entryId, chatId?, agentId?, action?, summary?}) -> rec
  function recordTouch(o) {
    o = o || {};
    var entryId = o.entryId || entryIdOf(o.entry);
    if (!entryId) throw new Error("DriveProvenance.recordTouch: entry (or entryId) is required");
    var rec = {
      id: "ht_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      entryId: String(entryId),
      label: entryLabel(o.entry),
      chatId: o.chatId != null ? String(o.chatId) : null,
      agentId: o.agentId != null ? String(o.agentId) : null,
      action: o.action != null ? String(o.action) : "touch",
      summary: o.summary != null ? String(o.summary) : ""
    };
    activeBackend().append(rec.entryId, rec);
    bridgeToFabric(rec);
    return rec;
  }

  // getFileHistory(entryId|entry) -> merged records, newest-first
  function getFileHistory(entryId) {
    entryId = entryIdOf(entryId);
    if (!entryId) return [];
    var seen = {}, out = [];
    function take(list) {
      (list || []).forEach(function (r) {
        if (!r || !r.id || seen[r.id]) return;
        seen[r.id] = true;
        out.push(r);
      });
    }
    take(localBackend.list(entryId)); // local records always included (merge)
    if (customBackend) take(customBackend.list(entryId));
    out.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    return out;
  }

  // installProvenanceHooks({onTransfer?, onUpload?}) -> {emitTransfer, emitUpload}
  // Sibling-owned call sites (bulkActions transferEntries, upload queue) call the
  // emitters; the optional onTransfer/onUpload callbacks let them observe.
  function installProvenanceHooks(hooks) {
    hooks = hooks || {};
    function emitTransfer(info) {
      info = info || {};
      var entries = info.entries || [];
      entries.forEach(function (e) {
        recordTouch({
          entry: e,
          chatId: info.chatId,
          agentId: info.agentId,
          action: "transfer",
          summary: "Moved " + (info.fromPath || "?") + " → " + (info.toPath || "?")
        });
      });
      if (typeof hooks.onTransfer === "function") {
        try { hooks.onTransfer(info); } catch (e) {}
      }
    }
    function emitUpload(info) {
      info = info || {};
      recordTouch({
        entry: info.entry,
        entryId: info.entryId,
        chatId: info.chatId,
        agentId: info.agentId,
        action: "upload",
        summary: info.summary || ("Uploaded " + entryLabel(info.entry || info.entryId))
      });
      if (typeof hooks.onUpload === "function") {
        try { hooks.onUpload(info); } catch (e) {}
      }
    }
    return { emitTransfer: emitTransfer, emitUpload: emitUpload };
  }

  var api = {
    recordTouch: recordTouch,
    getFileHistory: getFileHistory,
    installProvenanceHooks: installProvenanceHooks,
    setBackend: setBackend,
    entryIdOf: entryIdOf,
    backendName: function () { return activeBackend().name || "custom"; }
  };
  if (typeof globalThis !== "undefined") globalThis.DriveProvenance = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
