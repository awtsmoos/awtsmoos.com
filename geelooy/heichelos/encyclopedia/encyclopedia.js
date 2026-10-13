/* B"H — Admur Encyclopedia landing interactions: live search + category filter. */
(function () {
	"use strict";

	var INDEX = Array.isArray(window.__ENC_INDEX__) ? window.__ENC_INDEX__ : [];
	var CATS = Array.isArray(window.__ENC_CATS__) ? window.__ENC_CATS__ : [];
	var ACTIVE_CAT = typeof window.__ENC_ACTIVE_CAT__ === "string" ? window.__ENC_ACTIVE_CAT__ : "";

	var CAT_BY_KEY = {};
	CATS.forEach(function (c) { CAT_BY_KEY[c.key] = c; });

	var grid = document.getElementById("encArticleGrid");
	var input = document.getElementById("encSearchInput");
	var form = document.getElementById("encSearchForm");
	var titleEl = document.getElementById("encBrowserTitle");
	var countEl = document.getElementById("encResultCount");
	var clearBtn = document.getElementById("encClearFilter");
	var catGrid = document.getElementById("encCatGrid");
	var browser = document.getElementById("encBrowser");

	if (!grid || !input) return;

	function latinOf(full) {
		var m = String(full).match(/^([^(—–-]+?)\s*\(/);
		return (m ? m[1] : full).trim();
	}

	function glossOf(full) {
		var m = String(full).match(/[—–-]\s*(.+)$/);
		return m ? m[1].trim() : "";
	}

	function hebrewOf(full) {
		var m = String(full).match(/\(([^)]+)\)/);
		return m ? m[1].trim() : "";
	}

	function badge(catKey) {
		var c = CAT_BY_KEY[catKey];
		return c ? c.en : catKey;
	}

	function esc(s) {
		return String(s == null ? "" : s)
			.replace(/&/g, "&amp;").replace(/</g, "&lt;")
			.replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}

	function matches(item, needle) {
		var hay = (item.t + " " + badge(item.c) + " " + (CAT_BY_KEY[item.c] ? CAT_BY_KEY[item.c].he : "")).toLowerCase();
		return hay.indexOf(needle) >= 0;
	}

	var currentCat = ACTIVE_CAT;
	var currentQ = "";

	function setUrl() {
		var params = new URLSearchParams();
		if (currentCat) params.set("category", currentCat);
		if (currentQ) params.set("q", currentQ);
		var qs = params.toString();
		var base = window.location.pathname;
		history.replaceState(null, "", qs ? base + "?" + qs : base);
	}

	function render() {
		var needle = currentQ.trim().toLowerCase();
		var items = INDEX.filter(function (item) {
			if (currentCat && item.c !== currentCat) return false;
			if (needle && !matches(item, needle)) return false;
			return true;
		});
		items.sort(function (a, b) { return latinOf(a.t).localeCompare(latinOf(b.t)); });

		if (!items.length) {
			grid.innerHTML = '<div class="enc-empty"><p>No articles found. Try another search or category.</p></div>';
		} else {
			grid.innerHTML = items.map(function (item) {
				var latin = latinOf(item.t);
				var gloss = glossOf(item.t);
				var heb = hebrewOf(item.t);
				var linkText = gloss ? latin + " — " + gloss : latin;
				return '<div class="enc-article-row">' +
					'<div class="enc-row-main">' +
					'<a class="enc-row-link" href="' + esc(rowHref(item.i)) + '">' + esc(linkText) + "</a>" +
					(heb ? '<div class="enc-row-he" lang="he" dir="rtl">' + esc(heb) + "</div>" : "") +
					"</div>" +
					'<span class="enc-badge">' + esc(badge(item.c)) + "</span>" +
					"</div>";
			}).join("");
		}

		var parts = [];
		if (currentCat && CAT_BY_KEY[currentCat]) parts.push(CAT_BY_KEY[currentCat].en);
		if (needle) parts.push('“' + currentQ.trim() + "”");
		titleEl.textContent = parts.length ? parts.join(" · ") : "All Articles";
		countEl.textContent = items.length + (items.length === 1 ? " article" : " articles");
		clearBtn.hidden = !(currentCat || needle);

		var cards = catGrid ? catGrid.querySelectorAll("[data-enc-cat]") : [];
		cards.forEach(function (card) {
			if (card.getAttribute("data-enc-cat") === currentCat) card.classList.add("is-active");
			else card.classList.remove("is-active");
		});
	}

	function rowHref(id) {
		var base = window.location.pathname.replace(/\/?$/, "");
		return base + "/post/" + encodeURIComponent(id);
	}

	var debounce = null;
	input.addEventListener("input", function () {
		clearTimeout(debounce);
		debounce = setTimeout(function () {
			currentQ = input.value;
			setUrl();
			render();
		}, 120);
	});

	form.addEventListener("submit", function (ev) {
		ev.preventDefault();
		currentQ = input.value;
		setUrl();
		render();
		if (browser) browser.scrollIntoView({ behavior: "smooth", block: "start" });
	});

	if (catGrid) {
		catGrid.addEventListener("click", function (ev) {
			var card = ev.target.closest("[data-enc-cat]");
			if (!card) return;
			ev.preventDefault();
			var key = card.getAttribute("data-enc-cat");
			currentCat = currentCat === key ? "" : key;
			setUrl();
			render();
			if (browser) browser.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	}

	clearBtn.addEventListener("click", function () {
		currentCat = "";
		currentQ = "";
		input.value = "";
		setUrl();
		render();
	});

	// Initial state from server (?category= / ?q=) or the prefilled input.
	if (input.value && !currentQ) currentQ = input.value;
	render();
})();
