//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Lazy bilingual Torah navigation built one chamber at a time.
 * The Awtsmoos renews Hebrew and English as one beam of light;
 * Awtsmoos.com builds only what the learner chooses to see tonight.
 */

/** A short preview of plain text, never a re-render of the source Torah. */
function excerptText(text, limit = 64) {
	return String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

/** A short preview, never a re-render of the source Torah. */
function excerpt(node, limit = 64) {
	return excerptText(node?.textContent || '', limit);
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

/**
 * B"H batch 47 — gather every footnote on the page, in number order, with
 * the section that holds its marker. The marker is the authority for what
 * is actually readable; the note text comes from the post's footnotes[]
 * array first (the same source the footnote popup reads), then the shelf
 * DOM, then the bare number — a row never blocks on a missing body.
 */
export function collectReaderFootnotes(root) {
	if (!root?.querySelectorAll) return [];
	const markers = [...root.querySelectorAll('sup.meluket-fn-marker[data-fn], sup[data-fn]')];
	const api = (typeof window !== 'undefined' && window.post && Array.isArray(window.post.footnotes))
		? window.post.footnotes : [];
	const sections = readerSections(root);
	const seen = new Set();
	const notes = [];
	for (const marker of markers) {
		const n = String(marker.getAttribute('data-fn') || '').trim();
		if (!/^\d+$/.test(n) || seen.has(n)) continue;
		seen.add(n);
		const apiFn = api.find(fn => fn && String(fn.n ?? fn.num ?? fn.number ?? '') === n) || null;
		let hebrew = '';
		let english = '';
		if (apiFn) {
			hebrew = excerptText(apiFn.hebrew || apiFn.body || '', 46);
			english = excerptText(apiFn.english || apiFn.body_en || '', 52);
		}
		if (!hebrew && !english) {
			const shelf = root.querySelector(`.meluket-footnote[data-fn="${n}"], #meluket-fn-${n}`);
			english = excerpt(shelf, 52);
		}
		const sectionEl = marker.closest ? marker.closest('.meluket-sefer-section') : null;
		const sectionIndex = sectionEl ? sections.indexOf(sectionEl) : -1;
		notes.push({
			kind: 'footnote',
			index: notes.length,
			n,
			title: `Footnote ${n}`,
			hebrew,
			english,
			sectionIndex: sectionIndex < 0 ? null : sectionIndex
		});
	}
	notes.sort((a, b) => Number(a.n) - Number(b.n));
	return notes;
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

/**
 * B"H batch 47 — render one footnote jump row: the number, its section,
 * and the note's first lines. One tap jumps to the marker and opens it.
 */
export function readerFootnoteButton(doc, footnote) {
	const button = doc.createElement('button');
	button.type = 'button';
	button.dataset.readerFootnote = String(footnote.n);
	button.className = 'reader-index-choice';
	const title = doc.createElement('span');
	title.className = 'reader-index-choice-title';
	title.textContent = footnote.title || `Footnote ${footnote.n}`;
	button.append(title);
	const detail = doc.createElement('span');
	detail.className = 'reader-index-choice-detail';
	const text = footnote.hebrew || footnote.english || '';
	const where = footnote.sectionIndex != null ? `Section ${footnote.sectionIndex + 1} · ` : '';
	detail.textContent = where + (text || 'Open this footnote');
	button.append(detail);
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
