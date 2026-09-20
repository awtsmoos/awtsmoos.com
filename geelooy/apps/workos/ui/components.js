//B"H
// WorkOS UI — shared components. Pure functions returning HTML strings.
// No DOM access here; everything is escaped via esc().

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Tiny HTML builder: el("div", {class:"x", "data-a":"b"}, "<p>hi</p>")
function el(tag, attrs, inner) {
  var s = "<" + tag;
  if (attrs) {
    for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      s += " " + k + '="' + esc(attrs[k]) + '"';
    }
  }
  s += ">" + (inner === null || inner === undefined ? "" : inner) + "</" + tag + ">";
  return s;
}

// Generic badge: badge("hello", "info") -> <span class="badge info">hello</span>
function badge(text, kind) {
  return el("span", { "class": "badge " + (kind || "neutral") }, esc(text));
}

// Progress bar: progressBar(40) -> track + fill + pct label
function progressBar(pct) {
  var p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  return '<span class="progress">' +
    '<span class="track"><span class="fill" style="width:' + p + '%"></span></span>' +
    '<span class="pct">' + p + '%</span></span>';
}

// Relative time: timeAgo(ts) -> "just now" | "5m ago" | "3h ago" | "2d ago" | "Mar 4"
function timeAgo(ts) {
  var t = Number(ts);
  if (!t) return "—";
  var diff = Date.now() - t;
  if (diff < 0) diff = 0;
  var m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  var h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  var d = Math.floor(h / 24);
  if (d < 30) return d + "d ago";
  var dt = new Date(t);
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[dt.getMonth()] + " " + dt.getDate();
}

// Display name for an actor: {kind,id,name?} object or plain string.
function actorName(a) {
  if (a == null) return "—";
  if (typeof a === "string") return a || "—";
  return a.name || a.id || "—";
}

// Avatar with initials and a deterministic hue from the name.
function avatar(name, size) {
  var n = String(name == null ? "?" : name).trim() || "?";
  var parts = n.split(/\s+/);
  var initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  var h = 0;
  for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360;
  var cls = "avatar" + (size === "sm" ? " sm" : "");
  return el("span", {
    "class": cls,
    title: n,
    style: "background:linear-gradient(135deg,hsl(" + h + ",45%,42%),hsl(" + ((h + 40) % 360) + ",50%,30%))"
  }, esc(initials));
}

var STATUS_LABELS = { todo: "To do", doing: "Doing", blocked: "Blocked", review: "Review", done: "Done" };

// statusPill("doing") -> <span class="pill st-doing"><span class="dot"></span>Doing</span>
function statusPill(status) {
  var s = (status || "todo").toLowerCase();
  var label = STATUS_LABELS[s] || s;
  return '<span class="pill st-' + esc(s) + '"><span class="dot"></span>' + esc(label) + "</span>";
}

var MSG_KIND_LABELS = {
  message: "message",
  announcement: "announcement",
  request: "request",
  response: "response",
  obligation: "obligation",
  delegation: "delegation",
  discovery: "discovery",
  blocker: "blocker",
  review_request: "review request",
  handoff: "handoff"
};

// msgKindBadge("blocker") -> distinct color per semantic kind
function msgKindBadge(msgKind) {
  var k = (msgKind || "message").toLowerCase();
  var label = MSG_KIND_LABELS[k] || k.replace(/_/g, " ");
  var safe = k.replace(/[^a-z0-9_]/g, "");
  return el("span", { "class": "badge mk-" + safe }, esc(label));
}

// Full timestamp for title attributes.
function fullTime(ts) {
  var t = Number(ts);
  if (!t) return "";
  try { return new Date(t).toLocaleString(); } catch (e) { return ""; }
}

// Truncate text with ellipsis.
function trunc(s, n) {
  s = s === null || s === undefined ? "" : String(s);
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
