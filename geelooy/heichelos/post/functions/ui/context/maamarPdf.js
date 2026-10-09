// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MaamarPdf
 * @description
 * The Awtsmoos lets a learner carry the whole maamar as a beautiful PDF:
 * big Hebrew phrases each followed by its English translation, the overview,
 * section summaries, Q&A, and footnotes. Awtsmoos.com builds a print-perfect
 * document from the live reader DOM and opens the browser print flow so the
 * learner chooses "Save as PDF". No libraries, no server round-trip, full RTL.
 */

const HEBREW_RE = /[\u0590-\u05FF]/u;

/** Escapes raw text for safe HTML embedding. */
function escapeHtml(text) {
	return String(text ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Converts one reader inline node into safe print HTML.
 * Keeps: text, footnote markers as superscript refs, bold/italic, line breaks.
 * Drops: scripts, styles, buttons, popups, and every other element shell.
 */
function inlineToHtml(node) {
	if (!node) return '';
	if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent);
	if (node.nodeType !== Node.ELEMENT_NODE) return '';
	const tag = node.tagName;
	if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'BUTTON' || tag === 'IFRAME') return '';
	if (tag === 'SUP' || node.classList?.contains('meluket-fn-marker')) {
		const num = (node.textContent || '').trim();
		if (/^\d+$/.test(num)) return `<sup class="pdf-fnref">${escapeHtml(num)}</sup>`;
		return '';
	}
	if (tag === 'BR') return '<br>';
	const children = Array.from(node.childNodes).map(inlineToHtml).join('');
	if (tag === 'B' || tag === 'STRONG') return `<strong>${children}</strong>`;
	if (tag === 'I' || tag === 'EM') return `<em>${children}</em>`;
	return children;
}

/** Plain visible text of an element, footnote markers rendered as [n]. */
function blockText(element) {
	if (!element) return '';
	const clone = element.cloneNode(true);
	clone.querySelectorAll('sup').forEach(sup => {
		const num = (sup.textContent || '').trim();
		sup.replaceWith(document.createTextNode(/^\d+$/.test(num) ? ` [${num}]` : ''));
	});
	return (clone.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

/** Reads the sefer title and series name from the live page. */
function readHeading() {
	const sefer = document.querySelector('.meluket-sefer');
	const titleHe = sefer?.querySelector('.meluket-sefer-title-he')?.textContent?.trim()
		|| document.querySelector('.meluket-sefer-title-he')?.textContent?.trim()
		|| '';
	const title = titleHe || (window.post?.title || window.post?.name || '').trim();
	const series = (window.series?.prateem?.name || window.series?.name || '').trim();
	return { title, series };
}

/** Reads the post overview (the klal before the pratim). */
function readOverview() {
	const wrap = document.querySelector('.meluket-post-summary, .meluket-summary-label')?.closest('.meluket-post-summary, .meluket-summary')
		|| document.querySelector('.meluket-post-summary');
	if (wrap) {
		const label = wrap.querySelector('.meluket-summary-label')?.textContent?.trim() || 'Overview';
		const body = Array.from(wrap.querySelectorAll('p')).map(p => blockText(p)).filter(Boolean).join('\n\n')
			|| blockText(wrap);
		if (body) return { label, body };
	}
	const fallback = (window.post?.enrichment?.summaries_en?.post || '').trim?.() || '';
	if (typeof fallback === 'string' && fallback) return { label: 'Overview', body: fallback };
	return null;
}

/** Reads Meluket sefer sections: phrase pairs, English fallback, section summary. */
function readMeluketSections() {
	const sections = [];
	document.querySelectorAll('.meluket-sefer-section').forEach((sectionEl, index) => {
		const pairs = [];
		sectionEl.querySelectorAll('.meluket-phrase-pair').forEach(pair => {
			const he = pair.querySelector('.meluket-phrase--he');
			const en = pair.querySelector('.meluket-phrase--en');
			const heHtml = he ? inlineToHtml(he).trim() : '';
			const enHtml = en ? inlineToHtml(en).trim() : '';
			const heText = he ? blockText(he) : '';
			const enText = en ? blockText(en) : '';
			if (heText || enText) pairs.push({ heHtml, enHtml, heText, enText });
		});
		const englishFallback = sectionEl.querySelector('.meluket-english')
			? Array.from(sectionEl.querySelector('.meluket-english').querySelectorAll('p')).map(p => inlineToHtml(p)).filter(s => s.trim())
			: [];
		const summaryEl = sectionEl.querySelector('.meluket-summary');
		const summary = summaryEl ? blockText(summaryEl.querySelector('p') || summaryEl) : '';
		if (pairs.length || englishFallback.length || summary) {
			sections.push({ number: index + 1, pairs, englishFallback, summary });
		}
	});
	return sections;
}

/** Reads generic reader sections for non-Meluket posts. */
function readGenericSections() {
	const sections = [];
	document.querySelectorAll('#realPost .section').forEach((sectionEl, index) => {
		const body = sectionEl.querySelector('.toichen') || sectionEl;
		const paragraphs = [];
		const subs = body.querySelectorAll(':scope > .sub-awtsmoos, :scope .sub-awtsmoos');
		if (subs.length) {
			subs.forEach(sub => {
				const html = inlineToHtml(sub).trim();
				if (html) paragraphs.push({ html, rtl: HEBREW_RE.test(sub.textContent || '') });
			});
		} else {
			const html = inlineToHtml(body).trim();
			if (html) paragraphs.push({ html, rtl: HEBREW_RE.test(body.textContent || '') });
		}
		if (paragraphs.length) sections.push({ number: index + 1, paragraphs });
	});
	return sections;
}

/** Reads Q&A pairs. */
function readQa() {
	const items = [];
	document.querySelectorAll('.meluket-qa-item').forEach(item => {
		const q = item.querySelector('.meluket-qa-q')?.textContent?.trim() || '';
		const a = item.querySelector('.meluket-qa-a')?.textContent?.trim() || '';
		if (q || a) items.push({ q, a });
	});
	return items;
}

/** Reads the footnote shelf: number, Hebrew body, English body. */
function readFootnotes() {
	const notes = [];
	document.querySelectorAll('.meluket-footnote[data-fn]').forEach(li => {
		const num = li.getAttribute('data-fn') || '';
		const he = li.querySelector('.meluket-footnote-he');
		const en = li.querySelector('.meluket-footnote-en');
		const heHtml = he ? inlineToHtml(he).trim() : '';
		const enText = en ? blockText(en) : '';
		const heText = he ? blockText(he) : '';
		if (heText || enText) notes.push({ num, heHtml, heText, enText });
	});
	notes.sort((a, b) => {
		const an = parseInt(a.num, 10), bn = parseInt(b.num, 10);
		if (!isNaN(an) && !isNaN(bn)) return an - bn;
		return String(a.num).localeCompare(String(b.num));
	});
	return notes;
}

function printCss() {
	return `
		@page { size: A4; margin: 18mm 15mm 20mm 15mm; }
		* { box-sizing: border-box; }
		html, body { margin: 0; padding: 0; }
		body {
			background: #fffdf8;
			color: #1c1710;
			font-family: Georgia, "Source Serif 4", "Times New Roman", serif;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.pdf-toolbar {
			position: sticky; top: 0; z-index: 10;
			display: flex; align-items: center; justify-content: center; gap: 12px;
			padding: 14px 16px;
			background: #14100b; color: #f5ead0;
			font-family: system-ui, sans-serif;
		}
		.pdf-toolbar p { margin: 0; font-size: 14px; color: #f5ead0; }
		.pdf-print-btn {
			appearance: none; border: 1px solid #c9a227; border-radius: 999px;
			background: #c9a227; color: #14100b;
			font-size: 15px; font-weight: 700; padding: 10px 26px; cursor: pointer;
			transition: background 150ms ease, transform 120ms ease;
		}
		.pdf-print-btn:hover { background: #dbb63a; }
		.pdf-print-btn:focus-visible { outline: 3px solid #7ddcff; outline-offset: 2px; }
		.pdf-print-btn:active { transform: scale(.97); }
		.maamar-pdf { max-width: 720px; margin: 0 auto; padding: 32px 8px 80px; }
		.pdf-series {
			text-align: center; font-size: 13px; letter-spacing: .22em;
			text-transform: uppercase; color: #8a6d1c; margin-bottom: 12px;
		}
		.pdf-title {
			font-family: "Frank Ruhl Libre", "David Libre", "Times New Roman", serif;
			font-size: 34px; font-weight: 700; line-height: 1.35;
			text-align: center; color: #1c1710; margin: 0 0 8px;
		}
		.pdf-meta {
			text-align: center; font-size: 12px; color: #8a8272;
			margin-bottom: 30px; padding-bottom: 24px;
			border-bottom: 2px solid #c9a227;
		}
		.pdf-overview { margin-bottom: 34px; }
		.pdf-overview h2, .pdf-footnotes h2, .pdf-qa h2 {
			font-family: "Frank Ruhl Libre", Georgia, serif;
			font-size: 22px; color: #8a6d1c; margin: 0 0 12px;
			padding-bottom: 8px; border-bottom: 1px solid #e5d9b8;
		}
		.pdf-overview p { font-size: 17px; line-height: 1.8; color: #2e2820; margin: 0 0 12px; }
		.pdf-section { margin-bottom: 30px; break-inside: auto; }
		.pdf-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
		.pdf-section-num {
			flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%;
			background: #1c1710; color: #f5d76e;
			display: flex; align-items: center; justify-content: center;
			font-size: 18px; font-weight: 700;
		}
		.pdf-section-rule { flex: 1 1 auto; height: 1px; background: #e5d9b8; }
		.pdf-pair {
			break-inside: avoid; padding: 14px 0;
			border-bottom: 1px solid #f0e8d2;
		}
		.pdf-pair:last-child { border-bottom: 0; }
		.pdf-he {
			font-family: "Frank Ruhl Libre", "David Libre", "Times New Roman", serif;
			font-size: 23px; line-height: 1.9; color: #1c1710;
			text-align: right; margin: 0 0 10px;
		}
		.pdf-en { font-size: 17px; line-height: 1.75; color: #3a332a; margin: 0; }
		.pdf-en + .pdf-en { margin-top: 8px; }
		.pdf-generic-p { font-size: 18px; line-height: 1.85; color: #2e2820; margin: 0 0 14px; }
		.pdf-section-summary {
			margin-top: 16px; padding: 14px 18px;
			background: #faf5e6; border-inline-start: 3px solid #c9a227;
			border-radius: 0 10px 10px 0;
		}
		.pdf-section-summary h3 {
			font-size: 14px; letter-spacing: .14em; text-transform: uppercase;
			color: #8a6d1c; margin: 0 0 8px;
		}
		.pdf-section-summary p { font-size: 16px; line-height: 1.7; color: #3a332a; margin: 0; }
		.pdf-qa { margin-bottom: 34px; }
		.pdf-qa-item { break-inside: avoid; margin-bottom: 16px; }
		.pdf-qa-q { font-size: 17px; font-weight: 700; color: #1c1710; margin: 0 0 6px; }
		.pdf-qa-a { font-size: 16px; line-height: 1.7; color: #3a332a; margin: 0; }
		.pdf-footnotes { margin-bottom: 40px; }
		.pdf-footnotes ol { margin: 0; padding: 0; list-style: none; }
		.pdf-footnotes li {
			break-inside: avoid; display: flex; gap: 12px;
			padding: 10px 0; border-bottom: 1px solid #f0e8d2;
			font-size: 15px; line-height: 1.7;
		}
		.pdf-fn-num {
			flex: 0 0 auto; min-width: 28px; height: 28px; border-radius: 50%;
			background: #f5ead0; color: #8a6d1c; border: 1px solid #c9a227;
			display: flex; align-items: center; justify-content: center;
			font-size: 13px; font-weight: 700;
		}
		.pdf-fn-he {
			font-family: "Frank Ruhl Libre", "David Libre", serif;
			font-size: 17px; color: #1c1710; text-align: right;
		}
		.pdf-fn-en { color: #3a332a; }
		.pdf-fn-body { display: flex; flex-direction: column; gap: 6px; }
		sup.pdf-fnref { color: #8a6d1c; font-size: .68em; font-weight: 700; }
		.pdf-colophon {
			margin-top: 40px; padding-top: 18px;
			border-top: 2px solid #c9a227;
			text-align: center; font-size: 13px; color: #8a8272;
		}
		@media print {
			.pdf-toolbar { display: none; }
			body { background: #ffffff; }
			.maamar-pdf { max-width: none; padding: 0; }
		}
	`;
}

function buildDocument() {
	const { title, series } = readHeading();
	const overview = readOverview();
	const meluketSections = readMeluketSections();
	const genericSections = meluketSections.length ? [] : readGenericSections();
	const qa = readQa();
	const footnotes = readFootnotes();
	const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

	let html = '';
	html += `<header>`;
	if (series) html += `<div class="pdf-series">${escapeHtml(series)}</div>`;
	html += `<h1 class="pdf-title" dir="rtl" lang="he">${escapeHtml(title) || 'Maamar'}</h1>`;
	html += `<div class="pdf-meta">awtsmoos.com · ${escapeHtml(today)}</div>`;
	html += `</header>`;

	if (overview) {
		html += `<section class="pdf-overview"><h2 dir="ltr">${escapeHtml(overview.label)}</h2>`;
		overview.body.split(/\n\n+/).forEach(para => {
			html += `<p dir="ltr">${escapeHtml(para)}</p>`;
		});
		html += `</section>`;
	}

	meluketSections.forEach(section => {
		html += `<section class="pdf-section">`;
		html += `<div class="pdf-section-head"><span class="pdf-section-num">${section.number}</span><span class="pdf-section-rule"></span></div>`;
		section.pairs.forEach(pair => {
			html += `<div class="pdf-pair">`;
			if (pair.heHtml) html += `<p class="pdf-he" dir="rtl" lang="he">${pair.heHtml}</p>`;
			if (pair.enHtml) html += `<p class="pdf-en" dir="ltr" lang="en">${pair.enHtml}</p>`;
			html += `</div>`;
		});
		section.englishFallback.forEach(paraHtml => {
			html += `<p class="pdf-en" dir="ltr" lang="en">${paraHtml}</p>`;
		});
		if (section.summary) {
			html += `<div class="pdf-section-summary"><h3 dir="ltr">Summary</h3><p dir="ltr">${escapeHtml(section.summary)}</p></div>`;
		}
		html += `</section>`;
	});

	genericSections.forEach(section => {
		html += `<section class="pdf-section">`;
		html += `<div class="pdf-section-head"><span class="pdf-section-num">${section.number}</span><span class="pdf-section-rule"></span></div>`;
		section.paragraphs.forEach(p => {
			html += `<p class="pdf-generic-p" dir="${p.rtl ? 'rtl' : 'ltr'}">${p.html}</p>`;
		});
		html += `</section>`;
	});

	if (qa.length) {
		html += `<section class="pdf-qa"><h2>שאלות ותשובות · Q&amp;A</h2>`;
		qa.forEach(item => {
			html += `<div class="pdf-qa-item">`;
			if (item.q) html += `<p class="pdf-qa-q" dir="auto">${escapeHtml(item.q)}</p>`;
			if (item.a) html += `<p class="pdf-qa-a" dir="auto">${escapeHtml(item.a)}</p>`;
			html += `</div>`;
		});
		html += `</section>`;
	}

	if (footnotes.length) {
		html += `<section class="pdf-footnotes"><h2>הערות · Footnotes</h2><ol>`;
		footnotes.forEach(fn => {
			html += `<li><span class="pdf-fn-num">${escapeHtml(fn.num)}</span><span class="pdf-fn-body">`;
			if (fn.heHtml) html += `<span class="pdf-fn-he" dir="rtl" lang="he">${fn.heHtml}</span>`;
			if (fn.enText) html += `<span class="pdf-fn-en" dir="ltr" lang="en">${escapeHtml(fn.enText)}</span>`;
			html += `</span></li>`;
		});
		html += `</ol></section>`;
	}

	html += `<div class="pdf-colophon" dir="ltr">B"H · Learned with love from awtsmoos.com</div>`;
	return { title, html };
}

/**
 * Opens the maamar as a beautiful print document and raises the print dialog
 * so the learner saves it as PDF. Synchronous window.open keeps popup
 * blockers quiet because this runs inside the menu click gesture.
 */
export function downloadMaamarPdf() {
	const { title, html } = buildDocument();
	const printWindow = window.open('', '_blank', 'noopener');
	if (!printWindow) {
		throw new Error('Popup blocked — allow popups for awtsmoos.com to download the PDF.');
	}
	const docTitle = `${title || 'Maamar'} — awtsmoos.com`;
	printWindow.document.write(
		`<!DOCTYPE html><html lang="he" dir="ltr"><head><meta charset="utf-8">` +
		`<meta name="viewport" content="width=device-width, initial-scale=1">` +
		`<title>${escapeHtml(docTitle)}</title><style>${printCss()}</style></head><body>` +
		`<div class="pdf-toolbar"><p dir="ltr">Choose <strong>“Save as PDF”</strong> as the destination, then print.</p>` +
		`<button type="button" class="pdf-print-btn">Save as PDF</button></div>` +
		`<article class="maamar-pdf">${html}</article>` +
		`<script>document.querySelector('.pdf-print-btn').addEventListener('click', function(){ window.print(); });` +
		`window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 450); });<\/script>` +
		`</body></html>`
	);
	printWindow.document.close();
	printWindow.focus();
}
