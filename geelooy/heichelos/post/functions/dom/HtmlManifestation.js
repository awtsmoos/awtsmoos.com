//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file HtmlManifestation.js
 * @description
 * The Awtsmoos gives parsed markup a measured vessel instead of a tangled flood,
 * while Awtsmoos.com manifests each child in order and preserves the reader's living hooks.
 */
import { renderTranslationTextWithFootnotes } from '../../translations/render.js';

/**
 * @class BeriahHtmlManifestation
 * @description Parses trusted reader HTML and recursively manifests its nodes into a destination.
 */
export class BeriahHtmlManifestation {
	/**
	 * Parses an HTML string and manifests each top-level child.
	 * @param {string} htmlMarkup HTML supplied by the reader's existing content pipeline.
	 * @param {Node|null} parentKli Destination vessel.
	 * @returns {void}
	 */
	append(htmlMarkup, parentKli) {
		if (!parentKli) {
			return;
		}
		const parserDaas = new DOMParser();
		const parsedWorld = parserDaas.parseFromString(htmlMarkup, "text/html");
		const childOros = Array.from(parsedWorld.body.childNodes);
		for (const childOhr of childOros) {
			this.appendNode(childOhr, parentKli, childOros);
		}
	}

	/**
	 * Recursively manifests one parsed node while preserving historical toldafy and script behavior.
	 * @param {Node} sourceOhr Parsed source node.
	 * @param {Node|null} parentKli Destination node.
	 * @param {Node[]} siblingOros Original sibling collection used by toldafy.
	 * @returns {void}
	 */
	appendNode(sourceOhr, parentKli, siblingOros) {
		if (!parentKli) {
			return;
		}
		// B"H — English footnote digits baked into the stored content HTML.
		// A post's content carries Hebrew footnotes as real <sup> elements
		// but English footnotes as plain digits glued to words ("Yitzchak10",
		// "etc.1", "Torah Or27"). The Meluket reader and the translation API
		// blocks convert those at render time, but a post with no enrichment
		// renders its English straight from the canonical content HTML, which
		// neither of them touches — so the digits stayed plain. Convert them
		// here, in the text nodes, with the same rules as
		// renderTranslationTextWithFootnotes (same patterns, same safety:
		// only digits glued to a Latin letter/quote/paren, after an
		// abbreviation period, trailing a Hebrew year, or bare at the end;
		// standalone numbers are never touched). Only Latin/English text is
		// converted — Hebrew text nodes are left alone, and the Hebrew <sup>
		// already in the content is an element node, never a text node, so
		// it is untouched. A converted <sup> is plain (no class) and takes
		// the .awtsmoos-plain-post-content sup styling (0.62em, super, gold,
		// 700), exactly like the Hebrew <sup> beside it.
		if (sourceOhr.nodeType === 3 && this.appendEnglishFootnoteText(sourceOhr, parentKli)) {
			return;
		}
		if (this.shouldLiftSuperscript(sourceOhr)) {
			this.appendNode(sourceOhr.firstChild, parentKli, siblingOros);
			return;
		}
		if (this.runInlineScript(sourceOhr)) {
			return;
		}
		const toldafyResult = typeof window.toldafy === "function"
			? window.toldafy(sourceOhr, parentKli, siblingOros)
			: null;
		if (toldafyResult === "delete") {
			return;
		}
		const manifestedNodes = toldafyResult?.node
			? [toldafyResult.node]
			: toldafyResult?.nodes
				? Array.from(toldafyResult.nodes)
				: [sourceOhr.cloneNode(false)];
		for (const manifestedKli of manifestedNodes) {
			if (toldafyResult?.action?.appendFirst) {
				manifestedKli.appendChild(toldafyResult.action.appendFirst);
			}
			parentKli.appendChild(manifestedKli);
			for (const childOhr of Array.from(sourceOhr.childNodes || [])) {
				this.appendNode(childOhr, manifestedKli, siblingOros);
			}
		}
	}

	/**
	 * Converts one text node's English footnote digits to real <sup> elements.
	 * @param {Node} textOhr Source text node.
	 * @param {Node} parentKli Destination node.
	 * @returns {boolean} True when the node was converted and appended (the
	 * caller must not manifest it again); false when there was nothing to
	 * convert and the caller should fall through to the normal path.
	 */
	appendEnglishFootnoteText(textOhr, parentKli) {
		const text = textOhr.textContent || '';
		// No Latin letters — Hebrew-only text (or a number alone) can never
		// carry these English footnote digits. Leave it exactly as it is.
		if (!/[A-Za-z]/.test(text)) return false;
		const html = renderTranslationTextWithFootnotes(text);
		if (!html.includes('<sup')) return false;
		// Parse the converted HTML into real nodes (text + <sup>) and append
		// them. The converter escapes the rest, so no markup can leak in.
		const template = document.createElement('template');
		template.innerHTML = html;
		parentKli.append(...template.content.childNodes);
		return true;
	}

	/** @param {Node} sourceOhr Candidate node. @returns {boolean} Whether a paragraph only wraps a SUP node. */
	shouldLiftSuperscript(sourceOhr) {
		return sourceOhr.nodeType === 1
			&& sourceOhr.tagName === "P"
			&& sourceOhr.childNodes.length === 1
			&& sourceOhr.firstChild?.tagName === "SUP";
	}

	/** @param {Node} sourceOhr Candidate script node. @returns {boolean} Whether script handling consumed the node. */
	runInlineScript(sourceOhr) {
		if (sourceOhr.tagName !== "SCRIPT" || sourceOhr.src) {
			return false;
		}
		try {
			if (!sourceOhr.innerHTML.includes("var x = /")) {
				globalThis.eval(sourceOhr.innerHTML);
			}
		} catch (error) {
			console.warn('B"H - Script ignition failed in manifestation.', error);
		}
		return true;
	}
}

const malchusHtmlManifestation = new BeriahHtmlManifestation();

/** @param {string} html HTML content. @param {Node|null} parent Destination. @returns {void} */
export function appendHTML(html, parent) {
	malchusHtmlManifestation.append(html, parent);
}

/**
 * B"H — Authored-HTML detection.
 * Stored post text that carries real markup (a Meluket maamar's <sup>
 * footnote markers, <h3> heading, <i> words, <br/> breaks) must be parsed
 * as HTML. Plain/Markdown prose carries no such tags and keeps the safe
 * plain path. A stray "<" in prose never matches: a tag name is required.
 */
const HTML_CONTENT_TAG_RE = /<\/?(?:h[1-6]|p|div|span|sup|sub|br|hr|i|em|b|strong|u|ul|ol|li|a|blockquote|table|thead|tbody|tr|td|th|section|article|header|footer|img|figure|figcaption)\b[^>]*>/i;

/** @param {unknown} value Stored post text. @returns {boolean} True when it carries authored HTML markup. */
export function isHtmlPostContent(value) {
	return HTML_CONTENT_TAG_RE.test(String(value || ''));
}

const INLINE_MARKDOWN_RE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/gu;

/** Converts one text line's small Markdown subset to HTML (same markers as the plain renderer). */
function convertInlineMarkers(text) {
	return String(text || '').replace(INLINE_MARKDOWN_RE, (token) => {
		if (token.startsWith('**')) return `<strong>${token.slice(2, -2)}</strong>`;
		if (token.startsWith('`')) return `<code>${token.slice(1, -1)}</code>`;
		return `<em>${token.slice(1, -1)}</em>`;
	});
}

/**
 * B"H — Hybrid authored content (Meluket): mostly HTML, with a few Markdown
 * markers left in it (**section headings**, *se'if* lines, standalone ---
 * rules). Converts those markers to HTML so nothing renders as literal
 * markup. Tag-aware: segments inside <...> are never touched, so footnote
 * asterisks and <sup> contents are never mangled.
 * @param {unknown} value Stored post text.
 * @returns {string} HTML with the Markdown markers converted.
 */
export function markdownMarkersToHtml(value) {
	const parts = String(value || '').split(/(<[^>]*>)/g);
	return parts.map((part) => {
		if (part.startsWith('<')) return part;
		return part.split('\n').map((line) => {
			if (line.trim() === '---') return '<hr>';
			return convertInlineMarkers(line);
		}).join('\n');
	}).join('');
}

/**
 * B"H — Sanitizes authored post HTML before it is manifested.
 * Decodes nothing here (the string is already HTML); strips executable and
 * dangerous elements plus event-handler attributes and javascript: links.
 * Safe inline markup (b, i, em, strong, sup, sub, br, h1-h6, p, ul, ol, li,
 * a, hr) survives. Same pattern as the footnote sanitizer: without this,
 * the manifestation path would eval an inline <script> in stored text.
 * @param {unknown} raw Authored post HTML.
 * @returns {string} Sanitized HTML safe to manifest.
 */
export function sanitizePostHtml(raw) {
	if (typeof document === 'undefined') return String(raw || '');
	const div = document.createElement('div');
	div.innerHTML = String(raw || '');
	div.querySelectorAll('script, style, iframe, object, embed, link, meta, form, input, button').forEach(n => n.remove());
	div.querySelectorAll('*').forEach(n => {
		for (const attr of Array.from(n.attributes)) {
			if (/^on/i.test(attr.name) || attr.name === 'srcdoc') n.removeAttribute(attr.name);
		}
		const href = n.getAttribute('href');
		if (href && /^\s*javascript:/i.test(href)) n.removeAttribute('href');
	});
	return div.innerHTML;
}

/**
 * B"H — Renders authored post HTML safely: Markdown markers converted,
 * dangerous markup stripped, then manifested through the existing HTML
 * path, so <sup> footnote markers render as real superscripts (never as
 * literal "<sup>" text) and headings render as headings.
 * B"H 2026-11-09 (re-fix): the parsed HTML is wrapped in the post body
 * card (.awtsmoos-plain-post-content) before it reaches the viewport.
 * The reader CSS scopes every body rule (sup gold superscripts, h3
 * headings, body size/color) under that card; without the wrapper the
 * HTML path's direct children never matched those rules, so even a
 * correctly parsed post rendered small, dark and unstyled.
 * @param {unknown} html Authored post HTML.
 * @param {Node|null} parent Destination.
 * @returns {void}
 */
export function appendSafePostHtml(html, parent) {
	if (!parent) return;
	const vessel = document.createElement('div');
	vessel.className = 'awtsmoos-plain-post-content';
	appendHTML(sanitizePostHtml(markdownMarkersToHtml(html)), vessel);
	parent.append(vessel);
	wirePostContentInteractions(vessel);
}

/**
 * B"H 2026-11-09 (Coby phone screenshots): two reader interactions were
 * missing on authored-HTML posts (Meluket), because the Meluket reader
 * (which owns the footnote popup and the עברית/English/Both toggle) only
 * mounts when the post carries enrichment — and this post has none.
 * 1. Footnote tap: tapping a <sup> number in the body now scrolls to the
 *    matching footnote in the הערות section at the end, and highlights it.
 *    The notes section is the part after the "הערות" marker; a body marker
 *    is a <sup> before it, a footnote body is a <sup> after it.
 * 2. English jump: the English translation starts ~27% down the page with
 *    no anchor, so the owner could not find it. The "English translation:"
 *    marker is tagged with an id and a small jump button is added at the
 *    top of the post body that scrolls to it.
 * @param {Element} vessel The rendered .awtsmoos-plain-post-content card.
 * @returns {void}
 */
function wirePostContentInteractions(vessel) {
	if (!vessel || typeof document === 'undefined') return;
	// --- English jump: tag the "English translation:" marker and add a button.
	const walker = document.createTreeWalker(vessel, NodeFilter.SHOW_TEXT);
	let englishAnchor = null;
	let notesBoundary = null;
	let textNode;
	while ((textNode = walker.nextNode())) {
		const text = textNode.textContent || '';
		if (!englishAnchor && /English translation/i.test(text)) {
			const parentEl = textNode.parentElement;
			if (parentEl && !parentEl.closest('#awtsmoos-english-translation')) {
				parentEl.id = 'awtsmoos-english-translation';
				englishAnchor = parentEl;
			}
		}
		if (!notesBoundary && /הערות/.test(text)) {
			notesBoundary = textNode;
		}
		if (englishAnchor && notesBoundary) break;
	}
	if (englishAnchor) {
		const jump = document.createElement('button');
		jump.type = 'button';
		jump.className = 'awtsmoos-english-jump';
		jump.textContent = 'English ↓';
		jump.addEventListener('click', () => {
			englishAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
		vessel.prepend(jump);
	}
	// --- Footnote tap: delegated click on <sup> markers scrolls to the
	// matching footnote body in the הערות section.
	vessel.addEventListener('click', (event) => {
		const sup = event.target && event.target.closest ? event.target.closest('sup') : null;
		if (!sup || !vessel.contains(sup)) return;
		const num = (sup.textContent || '').trim();
		if (!/^\d+$/.test(num)) return;
		// The notes section is at the end of the post (after "הערות"), so
		// the footnote body is the LAST <sup> carrying this number; every
		// earlier one is a body marker pointing at it.
		const vesselText = vessel.textContent || '';
		if (vesselText.indexOf('הערות') < 0) return;
		const matches = Array.from(vessel.querySelectorAll('sup'))
			.filter(s => (s.textContent || '').trim() === num);
		if (!matches.length) return;
		const target = matches[matches.length - 1];
		if (target === sup && matches.length === 1) return;
		target.scrollIntoView({ behavior: 'smooth', block: 'center' });
		target.classList.add('awtsmoos-footnote-target');
		window.setTimeout(() => target.classList.remove('awtsmoos-footnote-target'), 2000);
	});
}

/** @param {Node} node Source node. @param {Node|null} parent Destination. @param {Node[]} siblings Sibling context. @returns {void} */
export function appendWithSubChildren(node, parent, siblings) {
	malchusHtmlManifestation.appendNode(node, parent, siblings);
}
