//B"H
// geelooy/apps/drive/js/views/DriveHistoryPane.js — the file "History" tab.
//
// renderHistoryTab(entry) -> HTML string: the who/why timeline of a file —
// which chat/agent touched it, what they did, and when — from
// DriveProvenance.getFileHistory(). Used by WS-4's DriveDetailsPane; this
// component is defensive and standalone: it never assumes the details pane,
// the entry mapper, or any sibling module exists.
//
// Entry shape is defensive: entry.id / entry.entryId / entry.path / entry.name
// (or a bare id string). All rendered values are HTML-escaped (XSS-safe).
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function entryIdOf(entry) {
    var P = (typeof globalThis !== "undefined" && globalThis.DriveProvenance) || null;
    if (P && typeof P.entryIdOf === "function") {
      try { return P.entryIdOf(entry); } catch (e) {}
    }
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    return entry.id || entry.entryId || entry.path || entry.name || null;
  }

  function fmtTime(ts) {
    if (!ts) return "";
    try {
      var d = new Date(ts);
      var now = Date.now(), diff = now - ts;
      if (diff >= 0 && diff < 60 * 1000) return "just now";
      if (diff >= 0 && diff < 60 * 60 * 1000) {
        var m = Math.floor(diff / 60000);
        return m + (m === 1 ? " min ago" : " mins ago");
      }
      if (diff >= 0 && diff < 24 * 60 * 60 * 1000) {
        var h = Math.floor(diff / 3600000);
        return h + (h === 1 ? " hour ago" : " hours ago");
      }
      return d.toLocaleString();
    } catch (e) { return ""; }
  }

  var ACTION_LABELS = {
    upload: "Uploaded",
    transfer: "Moved",
    rename: "Renamed",
    edit: "Edited",
    share: "Shared",
    touch: "Touched"
  };
  function actionLabel(a) { return ACTION_LABELS[a] || (a ? a.charAt(0).toUpperCase() + a.slice(1) : "Touched"); }

  function whoLine(rec) {
    var bits = [];
    if (rec.agentId) bits.push("agent " + rec.agentId);
    if (rec.chatId) bits.push("chat " + rec.chatId);
    return bits.length ? bits.join(" · ") : "unknown actor";
  }

  function renderItem(rec) {
    return '<li class="dh-item">' +
      '<span class="dh-badge">' + esc(actionLabel(rec.action)) + "</span>" +
      '<div class="dh-body">' +
      '<div class="dh-summary">' + esc(rec.summary || actionLabel(rec.action)) + "</div>" +
      '<div class="dh-meta">' + esc(whoLine(rec)) + " · " + esc(fmtTime(rec.ts)) + "</div>" +
      "</div></li>";
  }

  // renderHistoryTab(entry) -> HTML string
  function renderHistoryTab(entry) {
    var P = (typeof globalThis !== "undefined" && globalThis.DriveProvenance) || null;
    var entryId = entryIdOf(entry);
    var title = entry && typeof entry === "object" && (entry.name || entry.path)
      ? (entry.name || entry.path) : (entryId || "file");
    var html = '<div class="drive-history-tab" data-entry-id="' + esc(entryId) + '">' +
      '<h3 class="dh-title">History — ' + esc(title) + "</h3>";
    if (!P || typeof P.getFileHistory !== "function") {
      return html + '<p class="dh-empty">Provenance recorder not loaded — no history available.</p></div>';
    }
    var recs;
    try { recs = P.getFileHistory(entryId); } catch (e) { recs = []; }
    if (!recs || !recs.length) {
      return html + '<p class="dh-empty">No recorded touches yet. ' +
        "Actions taken from a chat (uploads, moves) will appear here.</p></div>";
    }
    html += '<ol class="dh-timeline">' + recs.map(renderItem).join("") + "</ol></div>";
    return html;
  }

  var api = { renderHistoryTab: renderHistoryTab, _esc: esc, _fmtTime: fmtTime };
  if (typeof globalThis !== "undefined") globalThis.DriveHistoryPane = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
