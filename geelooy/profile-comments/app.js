/* B"H — Alias comment browser: series → posts → comments + search, all paginated. No dependencies. */
(function () {
	"use strict";
	var API = "/api/social/profiles/";
	var PAGE = 50;

	var aliasInput = document.getElementById("aliasInput");
	var searchInput = document.getElementById("searchInput");
	var crumbs = document.getElementById("crumbs");
	var statusEl = document.getElementById("status");
	var results = document.getElementById("results");
	var pager = document.getElementById("pager");
	var prevPage = document.getElementById("prevPage");
	var nextPage = document.getElementById("nextPage");
	var pageInfo = document.getElementById("pageInfo");
	var clearSearch = document.getElementById("clearSearch");

	var state = { alias: "", view: "series", seriesId: "", seriesTitle: "", postId: "", postTitle: "", offset: 0, total: 0, q: "" };

	function esc(s) {
		return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}
	function alias() { return state.alias; }
	function url(path) { return API + encodeURIComponent(alias()) + path; }

	function setStatus(msg) { statusEl.textContent = msg || ""; }
	function showPager(show) { pager.hidden = !show; }

	function crumb(items) {
		crumbs.innerHTML = "";
		items.forEach(function (item, i) {
			if (i > 0) {
				var sep = document.createElement("span");
				sep.className = "sep";
				sep.textContent = "›";
				crumbs.appendChild(sep);
			}
			if (item.go) {
				var b = document.createElement("button");
				b.type = "button";
				b.textContent = item.label;
				b.onclick = item.go;
				crumbs.appendChild(b);
			} else {
				var s = document.createElement("span");
				s.textContent = item.label;
				crumbs.appendChild(s);
			}
		});
	}

	function getJSON(urlStr) {
		return fetch(urlStr, { headers: { "Accept": "application/json" } }).then(function (r) {
			if (!r.ok) throw new Error("HTTP " + r.status);
			return r.json();
		}).then(function (data) {
			// Canonical envelope: { data } or raw.
			if (data && typeof data === "object" && "data" in data && !Array.isArray(data.data)) {
				return data.data && data.data.items !== undefined ? data.data : data.data;
			}
			return data && data.data !== undefined ? data.data : data;
		});
	}

	function seriesLabel() { return "@" + alias(); }

	function renderSeries() {
		state.view = "series";
		crumb([{ label: seriesLabel() }]);
		showPager(false);
		setStatus("Loading series…");
		results.innerHTML = "";
		getJSON(url("/comment-series")).then(function (items) {
			items = Array.isArray(items) ? items : [];
			if (!items.length) {
				setStatus("");
				results.innerHTML = '<div class="ac-empty">No comments found under this alias yet.</div>';
				return;
			}
			var total = items.reduce(function (n, s) { return n + (s.commentCount || 0); }, 0);
			setStatus(items.length + " series · " + total.toLocaleString() + " comments");
			items.forEach(function (s) {
				var card = document.createElement("article");
				card.className = "ac-card";
				card.tabIndex = 0;
				card.innerHTML =
					"<h3>" + esc(s.title || s.seriesId) + "</h3>" +
					'<div class="meta">' + esc(s.heichelName || s.heichelId || "") + " · " + esc(s.seriesId) + "</div>" +
					'<div class="counts"><span><strong>' + Number(s.postCount || 0).toLocaleString() + "</strong> posts</span>" +
					"<span><strong>" + Number(s.commentCount || 0).toLocaleString() + "</strong> comments</span></div>";
				function go() { renderPosts(s.seriesId, s.title || s.seriesId); }
				card.onclick = go;
				card.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
				results.appendChild(card);
			});
		}).catch(function (err) {
			setStatus("Could not load series: " + err.message);
		});
	}

	function renderPosts(seriesId, seriesTitle) {
		state.view = "posts";
		state.seriesId = seriesId;
		state.seriesTitle = seriesTitle;
		crumb([
			{ label: seriesLabel(), go: renderSeries },
			{ label: seriesTitle }
		]);
		showPager(false);
		setStatus("Loading posts…");
		results.innerHTML = "";
		getJSON(url("/comment-series/" + encodeURIComponent(seriesId) + "/posts")).then(function (items) {
			items = Array.isArray(items) ? items : [];
			if (!items.length) {
				setStatus("");
				results.innerHTML = '<div class="ac-empty">No posts with comments in this series.</div>';
				return;
			}
			var total = items.reduce(function (n, p) { return n + (p.commentCount || 0); }, 0);
			setStatus(items.length + " posts · " + total.toLocaleString() + " comments");
			items.forEach(function (p) {
				var card = document.createElement("article");
				card.className = "ac-card";
				card.tabIndex = 0;
				card.innerHTML =
					"<h3>" + esc(p.postTitle || p.postId) + "</h3>" +
					'<div class="counts"><span><strong>' + Number(p.commentCount || 0).toLocaleString() + "</strong> comments</span></div>";
				function go() { renderComments(p.postId, p.postTitle || p.postId, 0); }
				card.onclick = go;
				card.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
				results.appendChild(card);
			});
		}).catch(function (err) {
			setStatus("Could not load posts: " + err.message);
		});
	}

	function commentCard(c) {
		var el = document.createElement("article");
		el.className = "ac-comment";
		var coords = "Section " + esc(c.verseSection) + (c.segmentId ? " · phrase " + esc(c.segmentId) : "");
		var isHebrew = /[\u0590-\u05FF]/.test(c.content || "");
		el.innerHTML =
			'<div class="coords">' + coords + "</div>" +
			'<div class="body clamped' + (isHebrew ? " hebrew" : "") + '">' + esc(c.content) + "</div>" +
			'<div class="foot">' +
			'<button type="button" class="expand">Read more</button>' +
			(c.postUrl ? '<a href="' + esc(c.postUrl) + '">View in context →</a>' : "") +
			"</div>";
		var body = el.querySelector(".body");
		var btn = el.querySelector(".expand");
		btn.onclick = function () {
			var clamped = body.classList.toggle("clamped");
			btn.textContent = clamped ? "Read more" : "Show less";
		};
		if ((c.content || "").length < 400) btn.style.display = "none";
		return el;
	}

	function renderComments(postId, postTitle, offset) {
		state.view = "comments";
		state.postId = postId;
		state.postTitle = postTitle;
		state.offset = offset;
		crumb([
			{ label: seriesLabel(), go: renderSeries },
			{ label: state.seriesTitle, go: function () { renderPosts(state.seriesId, state.seriesTitle); } },
			{ label: postTitle }
		]);
		setStatus("Loading comments…");
		results.innerHTML = "";
		showPager(false);
		getJSON(url("/comment-series/" + encodeURIComponent(state.seriesId) + "/posts/" + encodeURIComponent(postId) + "/comments?limit=" + PAGE + "&offset=" + offset)).then(function (page) {
			var items = (page && page.items) || [];
			var total = (page && page.total) || 0;
			state.total = total;
			if (!items.length) {
				setStatus("");
				results.innerHTML = '<div class="ac-empty">No comments on this post.</div>';
				return;
			}
			setStatus(total.toLocaleString() + " comments · showing " + (offset + 1) + "–" + Math.min(offset + PAGE, total));
			items.forEach(function (c) { results.appendChild(commentCard(c)); });
			pageInfo.textContent = "Page " + (Math.floor(offset / PAGE) + 1) + " of " + Math.max(1, Math.ceil(total / PAGE));
			prevPage.disabled = offset <= 0;
			nextPage.disabled = offset + PAGE >= total;
			showPager(true);
		}).catch(function (err) {
			setStatus("Could not load comments: " + err.message);
		});
	}

	function renderSearch(q) {
		state.view = "search";
		state.q = q;
		crumb([
			{ label: seriesLabel(), go: renderSeries },
			{ label: 'Search: "' + q + '"' }
		]);
		showPager(false);
		setStatus("Searching…");
		results.innerHTML = "";
		clearSearch.hidden = false;
		getJSON(url("/comments/search?q=" + encodeURIComponent(q) + "&limit=50")).then(function (res) {
			var items = (res && res.items) || [];
			if (!items.length) {
				setStatus("No matches for \"" + q + "\".");
				results.innerHTML = "";
				return;
			}
			setStatus(items.length + " match" + (items.length === 1 ? "" : "es") + ' for "' + q + '"' + (res && res.complete === false ? " (more available — refine your search)" : ""));
			items.forEach(function (c) { results.appendChild(commentCard(c)); });
		}).catch(function (err) {
			setStatus("Search failed: " + err.message);
		});
	}

	function loadAlias(next) {
		state.alias = next;
		state.q = "";
		searchInput.value = "";
		clearSearch.hidden = true;
		var params = new URLSearchParams(window.location.search);
		params.set("alias", next);
		window.history.replaceState(null, "", window.location.pathname + "?" + params.toString());
		renderSeries();
	}

	document.getElementById("aliasForm").addEventListener("submit", function (e) {
		e.preventDefault();
		var next = aliasInput.value.trim();
		if (next) loadAlias(next);
	});
	document.getElementById("searchForm").addEventListener("submit", function (e) {
		e.preventDefault();
		var q = searchInput.value.trim();
		if (q && state.alias) renderSearch(q);
	});
	clearSearch.addEventListener("click", function () {
		searchInput.value = "";
		clearSearch.hidden = true;
		renderSeries();
	});
	prevPage.addEventListener("click", function () {
		if (state.view === "comments" && state.offset > 0) renderComments(state.postId, state.postTitle, state.offset - PAGE);
	});
	nextPage.addEventListener("click", function () {
		if (state.view === "comments" && state.offset + PAGE < state.total) renderComments(state.postId, state.postTitle, state.offset + PAGE);
	});

	var initial = new URLSearchParams(window.location.search).get("alias") || "likkutei_translation_en";
	aliasInput.value = initial;
	loadAlias(initial);
})();
