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

/**
 * B"H batch 48 — the lettered sections (א, ב, ג …) inside a post.
 * The code's "sections" are the numbered passages (1–79); the lettered
 * sections are NOT DOM structure — they live only in the pair text
 * ("א. דובר…" at the passage that opens each one). Scan the passages in
 * order; a passage whose first pair's Hebrew opens with the next
 * expected Hebrew letter + "." starts a new lettered section. Returns
 * one entry per passage: { lettered, letter, isStart } — lettered is
 * the 1-based lettered-section number the passage belongs to (null
 * before the first lettered section opens, e.g. the header passage),
 * letter is that section's Hebrew letter, isStart marks its opening
 * passage.
 */
const HEBREW_LETTER_VALUES = {
	'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
	'י': 10, 'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16,
	'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23,
	'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30
};

function stripPageMarkers(text) {
	return String(text || '')
		.replace(/\[עמוד\s*\d+\]/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function letteredSectionsFor(root) {
	const sections = readerSections(root);
	const out = [];
	let current = null;
	for (let i = 0; i < sections.length; i++) {
		const first = sections[i].querySelector?.('.meluket-phrase-pair');
		const hebrewEl = first?.querySelector?.('.meluket-phrase--he');
		const text = stripPageMarkers(hebrewEl?.textContent || '');
		const m = /^([א-ת]{1,2})\.\s/.exec(text);
		let isStart = false;
		if (m && HEBREW_LETTER_VALUES[m[1]]) {
			const n = HEBREW_LETTER_VALUES[m[1]];
			if (!current || n !== current.lettered) {
				current = { lettered: n, letter: m[1] };
				isStart = true;
			}
		}
		out.push({
			lettered: current ? current.lettered : null,
			letter: current ? current.letter : null,
			isStart
		});
	}
	return out;
}

/**
 * B"H batch 48 — stamp each lettered section's opening passage with a
 * "Section N" label the post itself shows. The label is painted by CSS
 * (::before reads the data attribute), so this only sets attributes —
 * no nodes are inserted and the reading text never moves. Idempotent:
 * re-running it re-stamps the same values.
 */
export function stampLetteredSectionLabels(root) {
	if (!root?.querySelectorAll) return 0;
	const sections = readerSections(root);
	const lettered = letteredSectionsFor(root);
	let stamped = 0;
	for (let i = 0; i < sections.length; i++) {
		const info = lettered[i];
		if (!info || !info.isStart || !info.lettered) continue;
		sections[i].setAttribute('data-lettered-section', String(info.lettered));
		if (info.letter) sections[i].setAttribute('data-lettered-letter', info.letter);
		stamped += 1;
	}
	return stamped;
}

/**
 * Gather summaries without building all nested subsection controls.
 * B"H batch 48: each row also carries its lettered section (א–ח) — the
 * passage number alone (1–79) never said which lettered section a
 * passage belongs to, so the jump list shows "Section N · letter" too.
 */
export function collectReaderSections(root) {
	const lettered = letteredSectionsFor(root);
	return readerSections(root).map((section, index) => {
		const pairs = section.querySelectorAll('.meluket-phrase-pair');
		const first = section.querySelector?.('.meluket-phrase-pair') || pairs[0];
		const hebrew = excerpt(first?.querySelector('.meluket-phrase--he'), 46);
		const english = excerpt(first?.querySelector('.meluket-phrase--en'), 52);
		const info = lettered[index] || { lettered: null, letter: null, isStart: false };
		return {
			index, hebrew, english,
			title: `${index + 1}. ${hebrew || english || 'Section'}`,
			count: pairs.length,
			lettered: info.lettered,
			letter: info.letter,
			isLetteredStart: info.isStart
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
		/* B"H batch 49 — the footnote row names its LETTERED section
		   (1–8), not its passage index (1–79), so the row reads
		   "Section 2" for a note in section 2 (ב.), matching the
		   section numbers everywhere else. */
		const lettered = letteredSectionsFor(root);
		const letteredNumber = sectionIndex >= 0 && lettered[sectionIndex]
			? lettered[sectionIndex].lettered : null;
		notes.push({
			kind: 'footnote',
			index: notes.length,
			n,
			title: `Footnote ${n}`,
			hebrew,
			english,
			sectionIndex: sectionIndex < 0 ? null : sectionIndex,
			lettered: letteredNumber
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

/**
 * Render one accessible menu choice without injecting untrusted markup.
 * B"H batch 48: a section row names its lettered section too — the
 * opening passage of lettered section N reads "Section N · א — …" and
 * every passage in it carries "Section N" in its detail line, so the
 * jump list shows section numbers as well as passage numbers (1–79).
 */
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
		: (section.isLetteredStart && section.lettered
			? `Section ${section.lettered} · ${section.letter || ''} — ${section.title}`
			: section.title);
	button.append(title);
	if (pair?.english || (!pair && section.count)) {
		const detail = doc.createElement('span');
		detail.className = 'reader-index-choice-detail';
		/* B"H batch 49 — the old detail repeated "Section N" on EVERY
		   row in the lettered section (every passage in section 1 said
		   "Section 1 · 1 passages · Explore ›"), which the user called
		   messy. Name the lettered section only on its OPENING row
		   (isLetteredStart, where the title already says "Section N");
		   other rows say only their passage count. Also "1 passage",
		   not "1 passages". */
		const where = (!pair && section.isLetteredStart && section.lettered)
			? `Section ${section.lettered} · ` : '';
		const countText = pair ? pair.english
			: `${where}${section.count} ${section.count === 1 ? 'passage' : 'passages'} · Explore ›`;
		detail.textContent = countText;
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
	const where = footnote.lettered ? `Section ${footnote.lettered} · ` : '';
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
