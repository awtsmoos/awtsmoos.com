// B"H
// Boruch Hashem
// Blessed is He
//
// Lets a visitor find the extension version that matches what they are
// comfortable granting: free-text search over permission names and plain
// words, plus "without" toggles for the most sensitive permissions.
// Cards that match stay visible; the rest hide; a count and an empty
// state say what happened. No network, no storage — pure DOM filtering.

(function () {
	"use strict";

	function normalize(value) {
		return String(value || "").toLowerCase().trim();
	}

	function cardHaystack(card) {
		const parts = [card.dataset.version || "", card.dataset.name || ""];
		card.querySelectorAll("[data-permission]").forEach(function (chip) {
			parts.push(chip.dataset.permission);
			parts.push(chip.textContent);
		});
		card.querySelectorAll("[data-capability]").forEach(function (item) {
			parts.push(item.dataset.capability);
			parts.push(item.textContent);
		});
		return normalize(parts.join(" "));
	}

	function cardHasPermission(card, permission) {
		const found = card.querySelector('[data-permission="' + permission + '"]');
		return !!found;
	}

	function applyFilter(root) {
		const input = root.querySelector('[data-extension-search]');
		const toggles = Array.prototype.slice.call(root.querySelectorAll('[data-without]'));
		const cards = Array.prototype.slice.call(root.querySelectorAll('[data-extension-card]'));
		const count = root.querySelector('[data-extension-count]');
		const empty = root.querySelector('[data-extension-empty]');
		if (!input || !cards.length) return;

		const query = normalize(input.value);
		const excluded = toggles
			.filter(function (toggle) { return toggle.getAttribute("aria-pressed") === "true"; })
			.map(function (toggle) { return toggle.dataset.without; });

		let visible = 0;
		cards.forEach(function (card) {
			let show = true;
			if (query) {
				const haystack = cardHaystack(card);
				const words = query.split(/\s+/).filter(Boolean);
				show = words.every(function (word) { return haystack.indexOf(word) !== -1; });
			}
			if (show) {
				show = excluded.every(function (permission) {
					return !cardHasPermission(card, permission);
				});
			}
			card.setAttribute("data-hidden", show ? "false" : "true");
			if (show) visible += 1;
		});

		if (count) {
			const total = cards.length;
			const noun = visible === 1 ? "version" : "versions";
			count.textContent = visible === total
				? "Showing all " + total + " versions."
				: "Showing " + visible + " of " + total + " " + noun + ".";
		}
		if (empty) {
			empty.setAttribute("data-visible", visible === 0 ? "true" : "false");
		}
	}

	function wire(root) {
		const input = root.querySelector('[data-extension-search]');
		const toggles = Array.prototype.slice.call(root.querySelectorAll('[data-without]'));
		if (!input) return;
		input.addEventListener("input", function () { applyFilter(root); });
		toggles.forEach(function (toggle) {
			toggle.addEventListener("click", function () {
				const pressed = toggle.getAttribute("aria-pressed") === "true";
				toggle.setAttribute("aria-pressed", pressed ? "false" : "true");
				applyFilter(root);
			});
		});
		applyFilter(root);
	}

	document.addEventListener("DOMContentLoaded", function () {
		const roots = document.querySelectorAll('[data-extension-filter]');
		roots.forEach(wire);
	});
})();
