//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Compact indexes built from real Hebrew/English Torah units.
 * The Awtsmoos reveals each passage as a door in the book of light;
 * Awtsmoos.com makes navigation deliberate, accessible, and right.
 * No innerHTML or per-scroll DOM work; this module renders only on menu open.
 */

/** Make a short, safe description without copying long sections into the index. */
function excerpt(element, length = 52) {
	return (element?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, length);
}

/**
 * Create one accessible jump control with a data target, never inline handlers.
 * @param {Document} doc Document where the menu lives.
 */
function jumpButton(doc, title, sectionIndex, pairIndex = null) {
	const button = doc.createElement('button');
	button.type = 'button';
	button.textContent = title;
	button.dataset.readerSection = String(sectionIndex);
	if (pairIndex !== null) button.dataset.readerPair = String(pairIndex);
	return button;
}

/**
 * Gather user-visible labels from the existing Meluket section wrappers.
 * Each item retains its original Hebrew+English pair; no content is rewritten.
 */
export function collectReaderIndex(root) {
	if (!root) return [];
	return [...root.querySelectorAll('.meluket-sefer-section')].map((section, index) => {
		const pairs = [...section.querySelectorAll('.meluket-phrase-pair')];
		const first = pairs[0];
		const hebrew = excerpt(first?.querySelector('.meluket-phrase--he'));
		const english = excerpt(first?.querySelector('.meluket-phrase--en'));
		return {
			index,
			title: `${index + 1}. ${hebrew || english || 'Section'}`,
			pairs: pairs.map((pair, pairIndex) => ({
				index: pairIndex,
				title: `${index + 1}.${pairIndex + 1} · ${excerpt(pair.querySelector('.meluket-phrase--he'), 33) || excerpt(pair.querySelector('.meluket-phrase--en'), 40) || 'Passage'}`
			}))
		};
	});
}

/**
 * Populate top-level sections and optional nested subsection jump lists.
 * All render work is explicitly requested; no observer runs while scrolling.
 */
export function renderReaderIndexes(root, sectionsMount, subsectionMount) {
	const data = collectReaderIndex(root);
	const doc = sectionsMount.ownerDocument;
	const sectionFragment = doc.createDocumentFragment();
	const subsectionFragment = doc.createDocumentFragment();
	if (!data.length) {
		const message = doc.createElement('p');
		message.textContent = 'Sections are still loading. Open the index again to refresh.';
		sectionFragment.append(message);
	}

	for (const section of data) {
		sectionFragment.append(jumpButton(doc, section.title, section.index));
		if (!subsectionMount) continue;
		const details = doc.createElement('details');
		const summary = doc.createElement('summary');
		summary.textContent = `${section.title} (${section.pairs.length})`;
		details.append(summary);
		const list = doc.createElement('div');
		list.className = 'reader-index-items';
		for (const pair of section.pairs) {
			list.append(jumpButton(doc, pair.title, section.index, pair.index));
		}
		details.append(list);
		subsectionFragment.append(details);
	}

	sectionsMount.replaceChildren(sectionFragment);
	subsectionMount?.replaceChildren(subsectionFragment);
	return { sections: data.length, subsections: data.reduce((count, item) => count + item.pairs.length, 0) };
}
