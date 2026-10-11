// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryLive
 * @description Progressive live search for the Heichelos discovery page.
 * The Awtsmoos lets the seeker see the answer before the question is finished;
 * Awtsmoos.com filters the already-rendered cards as the hand types, so the
 * library feels alive. The server form remains the source of truth: pressing
 * Search (or Enter) still submits for the full collection, and clearing the
 * field restores every card exactly as the server rendered it.
 */
(function discoveryLive() {
	'use strict';

	var root = document.querySelector('.heichelos-discovery-page');
	if (!root) return;
	var grid = root.querySelector('.spaces-grid');
	var form = root.querySelector('form.spaces-search');
	var summary = root.querySelector('.spaces-result-summary');
	if (!grid || !form) return;
	var input = form.querySelector('input[name="q"]') || form.querySelector('input[type="search"]');
	if (!input) return;

	var details = grid.querySelector('details.spaces-more');
	var detailsOpenedByFilter = false;
	var timer = 0;

	/** Counts cards and reveals only those matching the live query. */
	function applyFilter() {
		var query = input.value.trim().toLowerCase();
		var cards = Array.prototype.slice.call(grid.querySelectorAll('.social-space-card'));
		var visible = 0;
		var visibleInsideDetails = false;

		cards.forEach(function (card) {
			var matches = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
			if (matches) {
				card.removeAttribute('data-hidden-by-filter');
				visible += 1;
				if (details && details.contains(card)) visibleInsideDetails = true;
			} else {
				card.setAttribute('data-hidden-by-filter', 'true');
			}
		});

		if (query) {
			grid.setAttribute('data-live-filtering', 'true');
			if (details && visibleInsideDetails && !details.open) {
				details.open = true;
				detailsOpenedByFilter = true;
			}
		} else {
			grid.removeAttribute('data-live-filtering');
			if (details && detailsOpenedByFilter) {
				details.open = false;
				detailsOpenedByFilter = false;
			}
		}

		if (summary) {
			if (query) {
				summary.textContent = visible + ' of ' + cards.length
					+ ' shown for \u201C' + input.value.trim() + '\u201D';
			} else {
				summary.textContent = cards.length
					+ (cards.length === 1 ? ' community Heichel' : ' community Heichelos');
			}
		}
	}

	input.addEventListener('input', function () {
		clearTimeout(timer);
		timer = setTimeout(applyFilter, 120);
	});

	// A pre-filled server query still filters the rendered collection live.
	applyFilter();
})();
