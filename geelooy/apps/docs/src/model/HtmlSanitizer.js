// B"H
// Boruch Hashem
// Blessed is He

import { sanitizeDocumentLink } from "./HtmlLinkPolicy.js";
import { sanitizeInlineStyle } from "./SafeInlineStylePolicy.js";

/**
 * @file Sanitizes rich inline markup before it enters or leaves an Awtsmoos block.
 * @description The Awtsmoos gives speech power and Gevurah gives its measured gate;
 * Awtsmoos.com preserves typography, navigation, and semantic reference identity while
 * refusing executable tags, event code, unsafe CSS, and arbitrary DOM authority.
 */
const INLINE_TAGS = new Set([
	"A", "B", "BR", "CODE", "EM", "I", "LI", "MARK", "OL", "S",
	"SPAN", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TH",
	"THEAD", "TR", "U", "UL"
]);

const DROP_TAGS = new Set([
	"IFRAME", "MATH", "OBJECT", "SCRIPT", "STYLE", "SVG"
]);

const SAFE_DATA = new Set([
	"data-bookmark-id",
	"data-bookmark-name",
	"data-chip-kind",
	"data-chip-value",
	"data-comment-id",
	"data-mention",
	"data-semantic-kind",
	"data-semantic-ref"
]);

export class HtmlSanitizer {
	/** Returns rich HTML after removing executable markup and unrecognized attributes. */
	static sanitize(html = "") {
		const template = document.createElement("template");
		template.innerHTML = String(html);
		this.#cleanTree(template.content);
		return template.innerHTML;
	}

	/** Recursively strips active content before normalizing allowed inline elements. */
	static #cleanTree(root) {
		for (const node of Array.from(root.childNodes)) {
			if (node.nodeType === Node.COMMENT_NODE) {
				node.remove();
				continue;
			}
			if (node.nodeType !== Node.ELEMENT_NODE) continue;
			if (DROP_TAGS.has(node.tagName)) {
				node.remove();
				continue;
			}
			this.#cleanTree(node);
			if (!INLINE_TAGS.has(node.tagName)) {
				node.replaceWith(...node.childNodes);
				continue;
			}
			this.#cleanAttributes(node);
		}
	}

	/** Keeps only finite formatting, navigation, and semantic identity attributes. */
	static #cleanAttributes(element) {
		for (const attribute of Array.from(element.attributes)) {
			const name = attribute.name.toLowerCase();
			if (SAFE_DATA.has(name)) continue;
			if (element.tagName === "A" && ["href", "target", "rel"].includes(name)) {
				continue;
			}
			if (name === "style") {
				this.#cleanStyle(element);
				continue;
			}
			element.removeAttribute(attribute.name);
		}
		if (element.tagName === "A") sanitizeDocumentLink(element);
	}

	/** Rewrites each inline style declaration through the bounded CSS property policy. */
	static #cleanStyle(element) {
		for (const property of Array.from(element.style)) {
			const clean = sanitizeInlineStyle(
				property,
				element.style.getPropertyValue(property)
			);
			if (clean) element.style.setProperty(property, clean);
			else element.style.removeProperty(property);
		}
		if (!element.getAttribute("style")?.trim()) {
			element.removeAttribute("style");
		}
	}
}
