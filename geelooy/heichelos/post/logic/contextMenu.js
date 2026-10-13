//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file contextMenu.js
 * @description
 * The Awtsmoos gives the reader's hand its own sacred instruments: a custom
 * context menu that appears on right-click (desktop) or long-press (mobile),
 * offering Copy as Markdown (selection or whole post) and Download as PDF.
 * The native selection handles are never touched — the menu floats above the
 * selection like a serving vessel, and if the browser refuses custom menus,
 * it degrades gracefully back to the native one.
 */

const MENU_ID = 'awtsmoos-context-menu';
const PRINT_CSS_ID = 'awtsmoos-print-css';

let menuEl = null;
let hideTimer = null;

/* ------------------------------------------------------------------ */
/* Menu construction                                                   */
/* ------------------------------------------------------------------ */

function buildMenu() {
	if (menuEl) return menuEl;
	menuEl = document.createElement('div');
	menuEl.id = MENU_ID;
	menuEl.className = 'awtsmoos-context-menu';
	menuEl.setAttribute('role', 'menu');
	menuEl.setAttribute('aria-label', 'Awtsmoos reader actions');
	menuEl.hidden = true;
	document.body.appendChild(menuEl);
	return menuEl;
}

function menuItem(label, labelHe, action, opts = {}) {
	const btn = document.createElement('button');
	btn.className = 'awtsmoos-context-menu-item';
	btn.setAttribute('role', 'menuitem');
	btn.type = 'button';
	const icon = document.createElement('span');
	icon.className = 'awtsmoos-context-menu-icon';
	icon.textContent = opts.icon || '';
	icon.setAttribute('aria-hidden', 'true');
	const textWrap = document.createElement('span');
	textWrap.className = 'awtsmoos-context-menu-text';
	const en = document.createElement('span');
	en.className = 'awtsmoos-context-menu-en';
	en.textContent = label;
	textWrap.appendChild(en);
	if (labelHe) {
		const he = document.createElement('span');
		he.className = 'awtsmoos-context-menu-he';
		he.textContent = labelHe;
		he.setAttribute('dir', 'rtl');
		he.setAttribute('lang', 'he');
		textWrap.appendChild(he);
	}
	btn.append(icon, textWrap);
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		hideMenu();
		action();
	});
	return btn;
}

function menuSeparator() {
	const sep = document.createElement('div');
	sep.className = 'awtsmoos-context-menu-separator';
	sep.setAttribute('role', 'separator');
	return sep;
}

/* ------------------------------------------------------------------ */
/* Show / hide / positioning                                           */
/* ------------------------------------------------------------------ */

export function hideMenu() {
	if (menuEl) menuEl.hidden = true;
	if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function clampToViewport(x, y, el) {
	const pad = 8;
	const rect = el.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	// Measure while visible but off-screen to get true size.
	const prevVisibility = el.style.visibility;
	el.style.visibility = 'hidden';
	el.hidden = false;
	const w = el.offsetWidth || 240;
	const h = el.offsetHeight || 160;
	el.style.visibility = prevVisibility;
	return {
		x: Math.min(Math.max(pad, x), Math.max(pad, vw - w - pad)),
		y: Math.min(Math.max(pad, y), Math.max(pad, vh - h - pad))
	};
}

function showMenu(x, y, hasSelection) {
	const menu = buildMenu();
	menu.innerHTML = '';

	// Stamp the reader's theme so the menu matches (it lives on body,
	// outside the themed root).
	try {
		const themed = document.querySelector('[data-theme]');
		const theme = themed?.dataset?.theme
			|| document.documentElement?.dataset?.theme
			|| 'light';
		menu.dataset.theme = theme;
	} catch { /* keep default light tokens */ }

	if (hasSelection) {
		menu.appendChild(menuItem('Copy selection as Markdown', 'העתק בחירה כמרקדאון', copySelectionAsMarkdown, { icon: '❝' }));
		menu.appendChild(menuItem('Copy plain text', null, copySelectionPlain, { icon: '⧉' }));
		menu.appendChild(menuSeparator());
	}
	menu.appendChild(menuItem('Copy all as Markdown', 'העתק הכל כמרקדאון', copyAllAsMarkdown, { icon: '🗎' }));
	menu.appendChild(menuItem('Download all as PDF', 'הורד הכל כ־PDF', downloadAllAsPdf, { icon: '⤓' }));

	const pos = clampToViewport(x, y, menu);
	menu.style.left = `${pos.x + window.scrollX}px`;
	menu.style.top = `${pos.y + window.scrollY}px`;
	menu.hidden = false;

	// Auto-hide on scroll / resize / outside tap, but never fight the OS
	// selection handles — the menu is purely additive.
	hideTimer = setTimeout(hideMenu, 8000);
}

/* ------------------------------------------------------------------ */
/* Clipboard helpers                                                   */
/* ------------------------------------------------------------------ */

async function writeClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		flashToast('Copied to clipboard');
		return true;
	} catch {
		// Fallback for older browsers / non-secure contexts.
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		let ok = false;
		try { ok = document.execCommand('copy'); } catch { ok = false; }
		ta.remove();
		flashToast(ok ? 'Copied to clipboard' : 'Copy failed — select and copy manually');
		return ok;
	}
}

function flashToast(message) {
	let toast = document.getElementById('awtsmoos-toast');
	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'awtsmoos-toast';
		toast.className = 'awtsmoos-toast';
		toast.setAttribute('role', 'status');
		document.body.appendChild(toast);
	}
	toast.textContent = message;
	toast.classList.add('visible');
	setTimeout(() => toast.classList.remove('visible'), 2200);
}

/* ------------------------------------------------------------------ */
/* Markdown conversion                                                 */
/*                                                                   */
/* Understands the sefer's phrase-pair structure: each                 */
/* .meluket-phrase-pair holds Hebrew (.meluket-phrase--he) directly    */
/* above its English (.meluket-phrase--en). Sections become headings.  */
/* ------------------------------------------------------------------ */

function cleanText(el) {
	if (!el) return '';
	// Clone so footnote <sup> markers become readable [n] references.
	const clone = el.cloneNode(true);
	clone.querySelectorAll('sup').forEach(sup => {
		sup.replaceWith(`[${sup.textContent.trim()}]`);
	});
	// Strip UI-only chrome.
	clone.querySelectorAll('.meluket-section-marker, .marginal-sigil, button, .highlight-palette').forEach(n => n.remove());
	return (clone.textContent || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function pairToMarkdown(pairEl) {
	const he = pairEl.querySelector('.meluket-phrase--he');
	const en = pairEl.querySelector('.meluket-phrase--en');
	const heText = cleanText(he);
	const enText = cleanText(en);
	if (!heText && !enText) return '';
	// Hebrew first (it leads in the reader), English beneath — mirrors the page.
	const parts = [];
	if (heText) parts.push(heText);
	if (enText) parts.push(`_${enText}_`);
	return parts.join('\n\n');
}

function sectionToMarkdown(sectionEl) {
	const lines = [];
	const idx = sectionEl.dataset.sectionIndex;
	if (idx !== undefined && idx !== '') {
		lines.push(`## Section ${Number(idx) + 1}`);
		lines.push('');
	}
	// Direct phrase pairs in document order.
	const pairs = sectionEl.querySelectorAll(':scope > .meluket-phrase-pair, :scope .meluket-phrase-pair');
	const seen = new Set();
	for (const pair of pairs) {
		if (seen.has(pair)) continue;
		seen.add(pair);
		const md = pairToMarkdown(pair);
		if (md) { lines.push(md); lines.push(''); }
	}
	// Any remaining prose blocks not inside pairs (summaries, overviews).
	sectionEl.querySelectorAll(':scope > p, :scope > .meluket-summary, :scope > .meluket-overview').forEach(block => {
		const t = cleanText(block);
		if (t && !lines.includes(t)) { lines.push(t); lines.push(''); }
	});
	return lines.join('\n').trim();
}

function nodeToMarkdown(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent;
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return '';
	const el = node;
	if (el.classList?.contains('meluket-phrase-pair')) return '\n\n' + pairToMarkdown(el) + '\n';
	if (el.classList?.contains('meluket-sefer-section')) return '\n\n' + sectionToMarkdown(el) + '\n';
	const tag = el.tagName?.toLowerCase();
	if (tag === 'h1') return `\n\n# ${cleanText(el)}\n`;
	if (tag === 'h2') return `\n\n## ${cleanText(el)}\n`;
	if (tag === 'h3') return `\n\n### ${cleanText(el)}\n`;
	if (tag === 'br') return '\n';
	if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'blockquote') {
		return '\n\n' + Array.from(el.childNodes).map(nodeToMarkdown).join('') + '\n';
	}
	return Array.from(el.childNodes).map(nodeToMarkdown).join('');
}

function tidyMarkdown(md) {
	return md
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function postTitle() {
	const he = document.querySelector('.meluket-sefer-title-he, .post-title-he, h1 [lang="he"]');
	const en = document.querySelector('.meluket-sefer-title, .post-title, h1');
	const heText = cleanText(he);
	let enText = cleanText(en);
	// Avoid duplicating when the h1 contains the Hebrew.
	if (heText && enText.includes(heText)) enText = enText.replace(heText, '').trim();
	return { he: heText, en: enText };
}

export function postToMarkdown() {
	const { he, en } = postTitle();
	const lines = [];
	if (en) lines.push(`# ${en}`);
	if (he && he !== en) lines.push(`# ${he}`);
	if (lines.length) lines.push('');
	const root = document.querySelector('.meluket-sefer') || document.querySelector('.post-reader-localized-context') || document.body;
	const sections = root.querySelectorAll('.meluket-sefer-section');
	if (sections.length) {
		sections.forEach(sec => {
			const md = sectionToMarkdown(sec);
			if (md) { lines.push(md); lines.push(''); }
		});
	} else {
		lines.push(tidyMarkdown(nodeToMarkdown(root)));
	}
	lines.push('');
	lines.push(`— ${window.location.href}`);
	return tidyMarkdown(lines.join('\n'));
}

export function selectionToMarkdown() {
	const sel = window.getSelection();
	if (!sel || sel.isCollapsed || sel.rangeCount === 0) return '';
	const frag = sel.getRangeAt(0).cloneContents();
	const md = tidyMarkdown(nodeToMarkdown(frag));
	if (!md) return sel.toString().trim();
	return md;
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

function copySelectionAsMarkdown() {
	const md = selectionToMarkdown();
	if (md) writeClipboard(md);
	else flashToast('Select some text first');
}

function copySelectionPlain() {
	const sel = window.getSelection();
	if (sel && !sel.isCollapsed) writeClipboard(sel.toString());
}

function copyAllAsMarkdown() {
	writeClipboard(postToMarkdown());
}

/* ------------------------------------------------------------------ */
/* PDF — print-optimized bilingual document via the browser's own      */
/* print-to-PDF. No libraries; the print stylesheet carries the beauty.*/
/* ------------------------------------------------------------------ */

function ensurePrintCss() {
	if (document.getElementById(PRINT_CSS_ID)) return;
	const style = document.createElement('style');
	style.id = PRINT_CSS_ID;
	style.textContent = `
@media print {
  body.awtsmoos-printing > *:not(.awtsmoos-print-sheet) { display: none !important; }
  .awtsmoos-print-sheet { display: block !important; }
}
.awtsmoos-print-sheet { display: none; }
.awtsmoos-print-sheet {
  font-family: Georgia, 'Times New Roman', serif;
  color: #1a1a1a;
  max-width: 100%;
  padding: 0;
}
.awtsmoos-print-sheet .print-title-en {
  font-size: 26pt; font-weight: 700; margin: 0 0 4pt; color: #111;
}
.awtsmoos-print-sheet .print-title-he {
  font-size: 24pt; font-weight: 700; margin: 0 0 18pt; color: #5a3c00;
  direction: rtl; text-align: right;
}
.awtsmoos-print-sheet .print-section-head {
  font-size: 14pt; font-weight: 700; color: #7a5a00;
  border-bottom: 1pt solid #d4a94e; margin: 22pt 0 10pt;
  padding-bottom: 4pt; page-break-after: avoid;
}
.awtsmoos-print-sheet .print-pair { margin: 0 0 12pt; page-break-inside: avoid; }
.awtsmoos-print-sheet .print-he {
  direction: rtl; text-align: right; font-size: 13.5pt; line-height: 1.9;
  font-family: 'Frank Ruhl Libre', 'Taamey Frank CLM', 'David Libre', serif;
  color: #111; margin: 0 0 3pt;
}
.awtsmoos-print-sheet .print-en {
  direction: ltr; text-align: left; font-size: 11pt; line-height: 1.65;
  color: #333; font-style: italic; margin: 0;
}
.awtsmoos-print-sheet .print-footer {
  margin-top: 30pt; padding-top: 8pt; border-top: 1pt solid #ccc;
  font-size: 8pt; color: #888;
}
`;
	document.head.appendChild(style);
}

function escapeHtml(s) {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function buildPrintSheet() {
	let old = document.querySelector('.awtsmoos-print-sheet');
	if (old) old.remove();
	const sheet = document.createElement('div');
	sheet.className = 'awtsmoos-print-sheet';
	sheet.setAttribute('aria-hidden', 'true');

	const { he, en } = postTitle();
	let html = '';
	if (en) html += `<div class="print-title-en">${escapeHtml(en)}</div>`;
	if (he && he !== en) html += `<div class="print-title-he" lang="he">${escapeHtml(he)}</div>`;

	const root = document.querySelector('.meluket-sefer') || document.querySelector('.post-reader-localized-context');
	const sections = root ? root.querySelectorAll('.meluket-sefer-section') : [];
	if (sections.length) {
		sections.forEach((sec, i) => {
			html += `<div class="print-section-head">Section ${i + 1}</div>`;
			sec.querySelectorAll('.meluket-phrase-pair').forEach(pair => {
				const heT = cleanText(pair.querySelector('.meluket-phrase--he'));
				const enT = cleanText(pair.querySelector('.meluket-phrase--en'));
				if (!heT && !enT) return;
				html += '<div class="print-pair">';
				if (heT) html += `<div class="print-he" lang="he">${escapeHtml(heT)}</div>`;
				if (enT) html += `<div class="print-en">${escapeHtml(enT)}</div>`;
				html += '</div>';
			});
		});
	} else if (root) {
		html += `<div class="print-pair"><div class="print-en">${escapeHtml(cleanText(root)).replace(/\n/g, '<br>')}</div></div>`;
	}
	html += `<div class="print-footer">Awtsmoos.com — ${escapeHtml(window.location.href)} — ${new Date().toLocaleDateString()}</div>`;
	sheet.innerHTML = html;
	document.body.appendChild(sheet);
	return sheet;
}

function downloadAllAsPdf() {
	try {
		ensurePrintCss();
		buildPrintSheet();
		document.body.classList.add('awtsmoos-printing');
		flashToast('Choose "Save as PDF" in the print dialog');
		// Let the toast paint before the print dialog takes over.
		setTimeout(() => {
			window.print();
			setTimeout(() => {
				document.body.classList.remove('awtsmoos-printing');
				document.querySelector('.awtsmoos-print-sheet')?.remove();
			}, 500);
		}, 350);
	} catch (err) {
		console.warn('B"H — PDF print sheet failed:', err);
		flashToast('Could not open print view');
	}
}

/* ------------------------------------------------------------------ */
/* Mount — one contextmenu listener on the reader root.                */
/* preventDefault() suppresses the native menu on desktop Chrome AND   */
/* Android long-press; if anything throws, we let the native menu     */
/* through (graceful degradation).                                     */
/* ------------------------------------------------------------------ */

function readerRoot() {
	return document.querySelector('.meluket-sefer-active')
		|| document.querySelector('.post-reader-localized-context')
		|| document.querySelector('.meluket-sefer')
		|| document.body;
}

export function initAwtsmoosContextMenu() {
	if (window.__awtsmoosContextMenuMounted) return;
	window.__awtsmoosContextMenuMounted = true;
	buildMenu();

	const root = readerRoot();

	root.addEventListener('contextmenu', (e) => {
		// Never hijack form fields or the command palette.
		if (e.target.closest('input, textarea, [contenteditable="true"], .awtsmoos-context-menu')) return;
		let hasSelection = false;
		let x = e.clientX;
		let y = e.clientY;
		try {
			const sel = window.getSelection();
			hasSelection = !!(sel && !sel.isCollapsed && sel.rangeCount > 0);
			if (hasSelection) {
				const rect = sel.getRangeAt(0).getBoundingClientRect();
				// Anchor above the selection; fall back to the press point.
				if (rect && rect.top >= 0) {
					x = rect.left + rect.width / 2;
					y = rect.top - 12;
				}
			}
			e.preventDefault();
			showMenu(x, y, hasSelection);
		} catch (err) {
			// Graceful: leave the native menu alone.
			console.warn('B"H — custom context menu deferred to native:', err);
		}
	});

	// Dismiss on outside interaction; never on selection change (the OS
	// owns the handles and we must not fight them).
	document.addEventListener('pointerdown', (e) => {
		if (menuEl && !menuEl.hidden && !e.target.closest('.awtsmoos-context-menu')) hideMenu();
	}, { passive: true });
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') hideMenu();
	});
	window.addEventListener('scroll', hideMenu, { passive: true });
	window.addEventListener('resize', hideMenu, { passive: true });
}
