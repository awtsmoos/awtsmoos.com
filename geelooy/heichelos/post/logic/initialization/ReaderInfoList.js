//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Lazy bilingual Torah navigation built one chamber at a time.
 * The Awtsmoos renews Hebrew and English as one beam of light;
 * Awtsmoos.com builds only what the learner chooses to see tonight.
 */

/** A short preview, never a re-render of the source Torah. */
function excerpt(node, limit = 64) {
	return (node?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

/** Locate the live section nodes; no cached array across post updates. */
export function readerSections(root) {
	return root ? [...root.querySelectorAll('.meluket-sefer-section')] : [];
}

/** Gather summaries without building all nested subsection controls. */
export function collectReaderSections(root) {
	return readerSections(root).map((section, index) => {
		const pairs = section.querySelectorAll('.meluket-phrase-pair');
		const first = section.querySelector?.('.meluket-phrase-pair') || pairs[0];
		const hebrew = excerpt(first?.querySelector('.meluket-phrase--he'), 46);
		const english = excerpt(first?.querySelector('.meluket-phrase--en'), 52);
		return {
			index, hebrew, english,
			title: `${index + 1}. ${hebrew || english || 'Section'}`,
			count: pairs.length
		};
	});
}

/** Read only the Hebrew/English rows within the selected section. */
export function collectReaderPairs(root, sectionIndex) {
	const section = readerSections(root)[sectionIndex];
	if (!section) return [];
	return [...section.querySelectorAll('.meluket-phrase-pair')].map((pair, index) => ({
		index, sectionIndex,
		hebrew: excerpt(pair.querySelector('.meluket-phrase--he'), 60),
		english: excerpt(pair.querySelector('.meluket-phrase--en'), 76)
	}));
}

/** Maintain the earlier public data contract for existing tests. */
export function collectReaderIndex(root) {
	return collectReaderSections(root).map(section => ({
		index: section.index,
		title: section.title,
		pairs: collectReaderPairs(root, section.index).map(pair => ({
			index: pair.index,
			title: `${section.index + 1}.${pair.index + 1} · ${pair.hebrew || pair.english || 'Passage'}`
		}))
	}));
}

/** Render one accessible menu choice without injecting untrusted markup. */
export function readerIndexButton(doc, section, pair = null) {
	const button = doc.createElement('button');
	button.type = 'button';
	button.dataset.readerSection = String(section.index);
	if (pair) button.dataset.readerPair = String(pair.index);
	button.className = 'reader-index-choice';
	const title = doc.createElement('span');
	title.className = 'reader-index-choice-title';
	title.textContent = pair
		? `${section.index + 1}.${pair.index + 1}  ${pair.hebrew || pair.english || 'Passage'}`
		: section.title;
	button.append(title);
	if (pair?.english || (!pair && section.count)) {
		const detail = doc.createElement('span');
		detail.className = 'reader-index-choice-detail';
		detail.textContent = pair ? pair.english : `${section.count} passages · Explore ›`;
		button.append(detail);
	}
	return button;
}

/** Populate the optional upper index on explicit expansion only. */
export function renderReaderIndexes(root, sectionMount, subsectionMount = null) {
	const sections = collectReaderSections(root);
	const doc = sectionMount.ownerDocument;
	const fragment = doc.createDocumentFragment();
	for (const section of sections) fragment.append(readerIndexButton(doc, section));
	if (!sections.length) {
		const message = doc.createElement('p');
		message.textContent = 'Torah sections are loading. Open the index again shortly.';
		fragment.append(message);
	}
	sectionMount.replaceChildren(fragment);
	if (subsectionMount) subsectionMount.replaceChildren();
	return { sections: sections.length,
		subsections: sections.reduce((total, section) => total + section.count, 0) };
}
