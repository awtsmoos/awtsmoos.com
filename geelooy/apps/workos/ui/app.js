//B"H
// WorkOS UI — app shell. The ONLY UI file that touches document/window.
// Mounts views, runs the hash router, wires the composer and filters.

(function () {
  "use strict";

  var bootError = document.getElementById("boot-error");
  var app = document.getElementById("app");

  if (typeof WorkOS === "undefined") {
    if (bootError) bootError.hidden = false;
    return;
  }

  // Seed a fresh graph on first run.
  try {
    if (WorkOS.missions.list().length === 0 && typeof WorkOS.seed === "function") WorkOS.seed();
  } catch (e) { /* core will surface errors at render time */ }

  var current = { view: "home" };

  function shell(inner) {
    return '<header class="topbar"><div class="topbar-inner">' +
      '<a class="wordmark" href="#/"><span class="wordmark-mark">W</span><span>Work<em>OS</em></span></a>' +
      '<nav>' +
      '<a href="#/" data-nav="home">Missions</a>' +
      '<a href="#/agents" data-nav="agents">Agents</a>' +
      "</nav>" +
      '<span class="spacer"></span>' +
      '<div class="search-wrap"><span class="search-icon">⌕</span>' +
      '<input type="search" class="wos-search" placeholder="Search…" autocomplete="off" aria-label="Search"></div>' +
      '<span class="bh">B"H</span>' +
      "</div></header>" +
      '<main id="view">' + inner + "</main>";
  }

  function parseHash() {
    var h = (location.hash || "#/").replace(/^#\/?/, "");
    var parts = h.split("/");
    if (parts[0] === "mission" && parts[1]) {
      return { view: "mission", id: decodeURIComponent(parts[1]), tab: parts[2] || "overview" };
    }
    if (parts[0] === "agents") return { view: "agents" };
    return { view: "home" };
  }

  function errorHtml(e) {
    return '<div class="page"><div class="empty"><div class="big">⚠️</div>' +
      "<p>Something went wrong rendering this view.</p>" +
      '<p class="muted small">' + String(e && e.message || e).replace(/[<>&]/g, "") + "</p></div></div>";
  }

  function render() {
    var r = parseHash();
    current = r;
    var body;
    try {
      body = (r.view === "mission") ? renderMission(WorkOS, r.id, r.tab) : renderHome(WorkOS);
    } catch (e) { body = errorHtml(e); }
    app.innerHTML = shell(body);
    var nav = app.querySelector('[data-nav="' + (r.view === "mission" ? "home" : r.view) + '"]');
    var navs = app.querySelectorAll("[data-nav]");
    for (var i = 0; i < navs.length; i++) navs[i].classList.remove("active");
    if (nav) nav.classList.add("active");
    if (r.view === "agents") {
      var s = document.getElementById("section-agents");
      if (s) s.scrollIntoView();
    }
  }

  // ---- client-side filtering (home search) ----
  function applyFilter(q) {
    q = (q || "").trim().toLowerCase();
    var items = document.querySelectorAll("#view [data-filterable]");
    for (var i = 0; i < items.length; i++) {
      var t = (items[i].textContent || "").toLowerCase();
      items[i].style.display = (!q || t.indexOf(q) >= 0) ? "" : "none";
    }
  }

  // ---- work status filter chips ----
  function applyWorkFilter(f) {
    var cards = document.querySelectorAll('#work-grid [data-status]');
    for (var i = 0; i < cards.length; i++) {
      var st = cards[i].getAttribute("data-status");
      cards[i].style.display = (f === "all" || st === f) ? "" : "none";
    }
    var chips = document.querySelectorAll("[data-work-filter]");
    for (var j = 0; j < chips.length; j++) {
      chips[j].classList.toggle("active", chips[j].getAttribute("data-work-filter") === f);
    }
  }

  function postMessage(btn) {
    var box = btn.closest(".composer");
    if (!box) return;
    var roomId = btn.getAttribute("data-room");
    var kind = box.querySelector("#composer-kind");
    var author = box.querySelector("#composer-author");
    var ta = box.querySelector("#composer-body");
    var body = ta ? ta.value.trim() : "";
    if (!body) { if (ta) ta.focus(); return; }
    try {
      WorkOS.rooms.post(roomId, {
        author: (author && author.value.trim()) || "you",
        msgKind: kind ? kind.value : "message",
        body: body
      });
    } catch (e) { return; }
    render();
    var stream = document.getElementById("msg-stream");
    if (stream && stream.lastElementChild) stream.lastElementChild.scrollIntoView({ block: "nearest" });
  }

  // ---- global event delegation ----
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-action],[data-work-filter]");
    if (!t) return;
    if (t.hasAttribute("data-work-filter")) {
      applyWorkFilter(t.getAttribute("data-work-filter"));
      return;
    }
    var action = t.getAttribute("data-action");
    if (action === "room-post") {
      ev.preventDefault();
      postMessage(t);
    } else if (action === "work-status") {
      ev.preventDefault();
      try { WorkOS.work.setStatus(t.getAttribute("data-id"), t.getAttribute("data-status")); } catch (e) { return; }
      render();
    }
  });

  document.addEventListener("input", function (ev) {
    if (ev.target && ev.target.classList && ev.target.classList.contains("wos-search")) {
      applyFilter(ev.target.value);
    }
  });

  document.addEventListener("keydown", function (ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter" &&
        ev.target && ev.target.id === "composer-body") {
      var btn = ev.target.closest(".composer").querySelector('[data-action="room-post"]');
      if (btn) postMessage(btn);
    }
  });

  window.addEventListener("hashchange", render);

  render();
})();
