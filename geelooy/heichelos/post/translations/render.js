// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostTranslationRenderer
 * @description
 * The Awtsmoos places English beneath the exact original phrase without mutation.
 * Awtsmoos.com keeps every translation read-only, visible, and phone-friendly.
 *
 * B"H — Yaakov (2026-10-11): the per-block "English" kicker repeated before
 * every English paragraph. The language indicator now appears exactly ONCE —
 * on the first mounted block — and the toolbar status line already names the
 * language for the whole report. Typography (lang="en", dir="ltr", the Latin
 * serif vessel) distinguishes every other block. Never repeated per phrase.
 */
import { groupTranslationRows, translationText } from "./alignment.js";

const STORAGE_KEY = "awtsmoos.post.translation.visible";

/**
 * B"H — Footnote markers in translation text (2026-11-09).
 * The translation API carries footnote numbers as plain digits glued to the
 * English text ("Yitzchak10", "discourses33", "etc.\"2", year+footnote
 * "56543") — no <sup> in the data. Set as textContent they render as plain
 * inline numbers, the same colour and size as the body text, sitting on the
 * baseline — never as the small gold superscripts the Hebrew body gets.
 * This renderer wraps them in real <sup> markers (same 0.62em / super /
 * gold treatment as .awtsmoos-plain-post-content sup) so the reader CSS
 * can style them. Only the numbers change — the words and the digits
 * themselves are never altered, and standalone numbers ("in 1967",
 * "chapter 3") are never touched: a footnote digit is always glued to a
 * letter, a closing quote, or a 4-digit Hebrew year.
 *
 * Placeholder flow (same as the sefer's renderEnglishWithFootnotes):
 * matches are stashed as \u0000FN{index}\u0000 before escaping, so the
 * escaper never meets a real tag and later passes never re-match a
 * placeholder (a NUL blocks every tail the patterns accept).
 */
const TRANSLATION_FN_PLACEHOLDER_RE = /\u0000FN(\d+)\u0000/g;

function translationFnMarkerHtml(fnNum) {
	const n = String(fnNum);
	return `<sup class="awtsmoos-translation-fn" data-fn="${n}">${n}</sup>`;
}

/**
 * Renders one English translation string as HTML with footnote markers.
 * - A literal `<sup data-fn="N">N</sup>` carried as TEXT becomes a real marker.
 * - Year+footnote ("56543" = year 5654 + footnote 3): the year stays as
 *   text, only the trailing 1-2 digits become a marker. Only Hebrew years
 *   55xx-58xx qualify, so a genuine 5-digit number is never split.
 * - Footnote after an abbreviation period ("etc.1", "etc.2"): a letter, a
 *   period, then 1-3 digits and a boundary. A digit before the period
 *   ("3.14") is a decimal, never a footnote.
 * - Digits glued to a word ("Yitzchak10", "discourses33", "etc.\"2"):
 *   a letter (or closing quote/paren/bracket) immediately followed by 1-3
 *   digits, then a boundary. Mid-phrase markers included — the old
 *   trailing-only pass never saw them.
 * - Bare trailing digits ("…Israel 5."): 1-3 digits at phrase end.
 * Everything else is HTML-escaped, so innerHTML is safe here.
 * @param {unknown} value Translation text.
 * @returns {string} HTML with footnote digits as <sup> markers.
 */
export function renderTranslationTextWithFootnotes(value) {
	const placeholders = [];
	const stash = (fnNum) => {
		placeholders.push(String(fnNum));
		return `\u0000FN${placeholders.length - 1}\u0000`;
	};
	// (0) Literal <sup data-fn="N">N</sup> carried as text.
	let text = String(value || '').replace(
		/<sup\b[^>]*\bdata-fn="(\d+)"[^>]*>\s*(\d+)\s*<\/sup\s*>/gi,
		(m, fnNum) => stash(fnNum)
	);
	// (1) Year+footnote: 4-digit Hebrew year + 1-2 footnote digits.
	text = text.replace(
		/(^|[^\dA-Za-z])(5[5-8]\d{2})([1-9]\d?)(?!\d)/g,
		(m, prefix, year, fnNum) => `${prefix}${year}${stash(fnNum)}`
	);
	// (1.5) Footnote after an abbreviation period ("etc.1", "etc.2"): a
	// letter, a period, then 1-3 digits and a boundary. A digit before the
	// period ("3.14") is a decimal, never a footnote, so it never matches.
	text = text.replace(
		/([A-Za-z])\.(\d{1,3})([\s.,;:!?…‥"”"'')\]\):—–-]|$)/g,
		(m, letter, digits, tail) => `${letter}.${stash(digits)}${tail}`
	);
	// (2) Digits glued to a word: letter/closing-punct + 1-3 digits + boundary.
	// Tail-capture (never a lookahead): a NUL after a placeholder digit can
	// never satisfy the tail, so stashed markers are never re-matched.
	text = text.replace(
		/([A-Za-z"”'’\)\]\}])(\d{1,3})([\s.,;:!?…‥"”"'')\]\):—–-]|$)/g,
		(m, letter, digits, tail) => `${letter}${stash(digits)}${tail}`
	);
	// (3) Bare trailing digits at phrase end.
	text = text.replace(
		/(^|\D)(\d{1,3})([.!?…‥"”"'')\];:—–-]*\s*)$/,
		(m, prefix, digits, tail) => `${prefix}${stash(digits)}${tail}`
	);
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	return escaped.replace(TRANSLATION_FN_PLACEHOLDER_RE, (m, idx) => translationFnMarkerHtml(placeholders[Number(idx)]));
}

/**
 * B"H — every vessel that can carry visible English on a post page.
 * The toolbar banner must never contradict what the reader can already see:
 * API-mounted blocks, the Meluket sefer reader's phrase/section English
 * (which mounts AFTER the toolbar), and the server-rendered translation
 * previews inside the annotations aside (only <p lang="en"> there belongs
 * to translations — commentHtml never emits lang attributes).
 */
const VISIBLE_ENGLISH_SELECTORS = [
	".awtsmoos-translation-block",
	".meluket-sefer .meluket-phrase--en",
	".meluket-phrase--en",
	".meluket-sefer .meluket-english p",
	".meluket-sefer .meluket-english .meluket-phrase",
	".meluket-english p",
	"[data-awtsmoos-indexed-annotations] p[lang=\"en\"]"
];

/** Minimum visible English characters before the banner may claim it exists. */
const VISIBLE_ENGLISH_THRESHOLD = 120;

function nodeIsVisible(node) {
	if (!(node instanceof Element)) return true;
	if (!node.getClientRects().length) return false;
	const view = node.ownerDocument && node.ownerDocument.defaultView;
	const style = view ? view.getComputedStyle(node) : null;
	if (style && (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0)) return false;
	return true;
}

function visibleEnglishChars() {
	if (typeof document === "undefined") return 0;
	let chars = 0;
	const seen = new Set();
	for (const selector of VISIBLE_ENGLISH_SELECTORS) {
		let nodes = [];
		try { nodes = document.querySelectorAll(selector); } catch (_) { continue; }
		for (const node of nodes) {
			if (seen.has(node) || !nodeIsVisible(node)) continue;
			seen.add(node);
			chars += (node.textContent || "").trim().length;
			if (chars >= VISIBLE_ENGLISH_THRESHOLD) return chars;
		}
	}
	// B"H — generic fallback: English comment/annotation sections (e.g.
	// "Meluket English Translation Comments") may not use the known classes.
	// Scan post body text for substantial Latin-script content.
	if (chars < VISIBLE_ENGLISH_THRESHOLD) {
		const body = document.querySelector("#realPost, .meluket-sefer, [data-post-body], main");
		if (body && nodeIsVisible(body)) {
			const text = (body.innerText || body.textContent || "");
			const latin = text.match(/[A-Za-z][A-Za-z'’\-.,;:!?() ]{2,}/g);
			if (latin) {
				const latinChars = latin.join(" ").length;
				if (latinChars >= VISIBLE_ENGLISH_THRESHOLD) return latinChars;
			}
		}
	}
	return chars;
}

function hasVisibleEnglish() {
	return visibleEnglishChars() >= VISIBLE_ENGLISH_THRESHOLD;
}

function statusText(report) {
	const rows = report?.rows || [];
	const status = report?.meta?.source?.status || "unknown";
	if (status === "loading") return "Loading English translation…";
	if (rows.length) return `English translation · ${rows.length} aligned phrase${rows.length === 1 ? "" : "s"}`;
	// B"H: English can arrive from vessels the translation API never sees —
	// the Meluket sefer reader mounts its own English beneath the Hebrew from
	// enrichment (not from the translation API), and the server renders
	// translation previews into the annotations aside. Never claim English is
	// missing when it is visibly on the page.
	if (hasVisibleEnglish()) {
		return "English translation · shown below the Hebrew";
	}
	if (status === "migration_required") return "English translation is being moved into the safe reader API.";
	if (status === "source_missing") return "An English translation source is not yet materialized for this corpus.";
	if (status === "unsupported") return "English translation is not available for this teaching yet.";
	if (status === "ready") return "English translation is not available for this teaching yet.";
	return "English translation is unavailable for this teaching.";
}

function updateToggle(button, visible) {
	button.textContent = visible ? "Hide English" : "Show English";
	button.setAttribute("aria-pressed", visible ? "true" : "false");
}

function makeToggle(viewport) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "awtsmoos-translation-toggle";
	let visible = localStorage.getItem(STORAGE_KEY) !== "0";
	viewport.classList.toggle("awtsmoos-translations-hidden", !visible);
	updateToggle(button, visible);
	button.addEventListener("click", () => {
		visible = !visible;
		viewport.classList.toggle("awtsmoos-translations-hidden", !visible);
		localStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
		updateToggle(button, visible);
	});
	return button;
}

function mountToolbar(viewport, report) {
	viewport.querySelector(".awtsmoos-translation-toolbar")?.remove();
	const toolbar = document.createElement("section");
	toolbar.className = "awtsmoos-translation-toolbar";
	toolbar.setAttribute("aria-live", "polite");
	// B"H — remember the mounted report on the toolbar so refreshTranslationStatus
	// can recompute the label later without losing the row count (a refresh must
	// never downgrade a genuine "N aligned phrases" label to "not available").
	toolbar.dataset.translationRowCount = String(report?.rows?.length || 0);
	toolbar.dataset.translationStatus = String(report?.meta?.source?.status || "unknown");
	const label = document.createElement("span");
	label.className = "awtsmoos-translation-status";
	label.textContent = statusText(report);
	toolbar.appendChild(label);
	if (report?.rows?.length) toolbar.appendChild(makeToggle(viewport));
	const crown = viewport.querySelector(".awtsmoos-post-title-crown");
	if (crown) crown.insertAdjacentElement("afterend", toolbar);
	else viewport.prepend(toolbar);
}

function targetFor(viewport, verse, domSub) {
	return viewport.querySelector(`.sub-awtsmoos[data-awtsmoos-idx="${verse}"][data-awtsmoos-sub="${domSub}"]`)
		|| viewport.querySelector(`.section[data-awtsmoos-idx="${verse}"] > .toichen`);
}

/**
 * B"H — builds one English block. The "English" language indicator is added
 * only when `showKicker` is true; the caller passes true exactly once (the
 * first mounted block), so the label never repeats per phrase.
 * @param {object} group Grouped translation rows.
 * @param {boolean} showKicker Whether this block carries the one language label.
 * @returns {HTMLElement} The translation block.
 */
function makeBlock(group, showKicker) {
	const block = document.createElement("aside");
	block.className = "awtsmoos-translation-block";
	block.dataset.translationVerse = String(group.verse);
	block.dataset.translationSub = String(group.domSub);
	block.lang = "en";
	block.dir = "ltr";
	if (showKicker) {
		const kicker = document.createElement("span");
		kicker.className = "awtsmoos-translation-kicker";
		kicker.textContent = "English";
		block.appendChild(kicker);
	}
	for (const row of group.rows) {
		const paragraph = document.createElement("p");
		// B"H — innerHTML, never textContent, so footnote numbers become
		// real <sup> markers (renderTranslationTextWithFootnotes escapes the
		// rest); textContent left them as plain inline numbers.
		paragraph.innerHTML = renderTranslationTextWithFootnotes(translationText(row));
		block.appendChild(paragraph);
	}
	return block;
}

export function renderTranslationReport(viewport, report) {
	if (!viewport) return { mounted: 0, missingTargets: 0 };
	viewport.querySelectorAll(".awtsmoos-translation-block").forEach(node => node.remove());
	mountToolbar(viewport, report);
	let mounted = 0;
	let missingTargets = 0;
	let kickerShown = false;
	for (const group of groupTranslationRows(report?.rows || [])) {
		const target = targetFor(viewport, group.verse, group.domSub);
		if (!target) {
			missingTargets++;
			continue;
		}
		// B"H — Yaakov: the language indicator appears once, on the first
		// mounted block only. Never repeated per phrase.
		const showKicker = !kickerShown;
		target.insertAdjacentElement("afterend", makeBlock(group, showKicker));
		if (showKicker) kickerShown = true;
		mounted++;
	}
	return { mounted, missingTargets };
}

/**
 * B"H: re-evaluates the toolbar status label against the live DOM.
 * The Meluket sefer reader mounts its English after the translation toolbar;
 * calling this refreshes the label so it never contradicts the English
 * visibly on the page. The row count stored on the toolbar is preserved, so
 * a refresh can only correct a false "not available" — never downgrade a
 * genuine "N aligned phrases" label.
 * @returns {boolean} True when a toolbar label was refreshed.
 */
export function refreshTranslationStatus() {
	if (typeof document === "undefined") return false;
	const label = document.querySelector(".awtsmoos-translation-status");
	if (!label) return false;
	const toolbar = label.closest(".awtsmoos-translation-toolbar");
	const rowCount = Number.parseInt(toolbar?.dataset?.translationRowCount || "0", 10) || 0;
	const status = toolbar?.dataset?.translationStatus || "ready";
	const report = {
		rows: rowCount ? Array.from({ length: rowCount }, () => ({})) : [],
		meta: { source: { status } }
	};
	label.textContent = statusText(report);
	return true;
}

export { hasVisibleEnglish };
