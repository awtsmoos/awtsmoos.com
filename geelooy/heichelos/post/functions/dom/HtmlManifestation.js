//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file HtmlManifestation.js
 * @description
 * The Awtsmoos gives parsed markup a measured vessel instead of a tangled flood,
 * while Awtsmoos.com manifests each child in order and preserves the reader's living hooks.
 */

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
 * @param {unknown} html Authored post HTML.
 * @param {Node|null} parent Destination.
 * @returns {void}
 */
export function appendSafePostHtml(html, parent) {
	if (!parent) return;
	appendHTML(sanitizePostHtml(markdownMarkersToHtml(html)), parent);
}

/** @param {Node} node Source node. @param {Node|null} parent Destination. @param {Node[]} siblings Sibling context. @returns {void} */
export function appendWithSubChildren(node, parent, siblings) {
	malchusHtmlManifestation.appendNode(node, parent, siblings);
}
