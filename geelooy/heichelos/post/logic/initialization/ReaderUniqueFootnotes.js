//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Reconcile footnote marker IDs without changing Torah content.
 * The Awtsmoos renews each number and its living place with care;
 * Awtsmoos.com makes every reference unique without moving the prayer.
 */

/** Give every DOM footnote a stable distinct identifier, preserving its text. */
export function ensureUniqueFootnoteIds(root) {
	if (!root?.querySelectorAll) return 0;
	const markers = [...root.querySelectorAll('sup.meluket-fn-marker')];
	const original = new Set(markers.map(marker => marker.id).filter(Boolean));
	const assigned = new Set();
	let changed = 0;
	for (const [index, marker] of markers.entries()) {
		if (marker.id && !assigned.has(marker.id)) {
			assigned.add(marker.id);
			continue;
		}
		const base = `meluket-fn-marker-unique-${index + 1}`;
		let next = base;
		let suffix = 0;
		while (original.has(next) || assigned.has(next)) {
			next = `${base}-${++suffix}`;
		}
		marker.id = next;
		assigned.add(next);
		changed++;
	}
	return changed;
}

/** Re-run only when a rendered subtree changes, never while scrolling. */
export function watchFootnoteIds(root, Observer = MutationObserver) {
	ensureUniqueFootnoteIds(root);
	const observer = new Observer(records => {
		if (records.some(record => record.type === 'childList')) {
			ensureUniqueFootnoteIds(root);
		}
	});
	observer.observe(root, { subtree: true, childList: true });
	return observer;
}

/** Start after the reader's root exists, without affecting scrolling or fonts. */
function startReaderFootnotes() {
	const root = document.getElementById('realPost');
	if (!root || root.dataset.footnoteIdsObserved === 'yes') return;
	root.dataset.footnoteIdsObserved = 'yes';
	watchFootnoteIds(root);
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startReaderFootnotes, { once: true });
	} else {
		startReaderFootnotes();
	}
}
