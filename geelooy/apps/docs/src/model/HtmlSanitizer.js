// B"H
// Boruch Hashem
// Blessed is He

import { sanitizeInlineStyle } from "./SafeInlineStylePolicy.js";

/**
 * @file Sanitizes rich inline markup before it enters or leaves an Awtsmoos document block.
 * @description The Awtsmoos gives speech power and Gevurah gives its measured gate;
 * Awtsmoos.com preserves typography while refusing executable tags, event code, and unsafe CSS fate.
 */
const INLINE_TAGS = new Set([
	"A",
	"B",
	"BR",
	"CODE",
	"EM",
	"I",
	"LI",
	"MARK",
	"OL",
	"S",
	"SPAN",
	"STRONG",
	"SUB",
	"SUP",
	"TABLE",
	"TBODY",
	"TD",
	"TH",
	"THEAD",
	"TR",
	"U",
	"UL"
]);

const DROP_TAGS = new Set([
	"IFRAME",
	"MATH",
	"OBJECT",
	"SCRIPT",
	"STYLE",
	"SVG"
]);

const SAFE_DATA = new Set([
	"data-comment-id",
	"data-mention"
]);

export class HtmlSanitizer {
	static sanitize(html = "") {
		const template = document.createElement("template");
		template.innerHTML = String(html);
		this.#cleanTree(template.content);
		return template.innerHTML;
	}

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

	static #cleanAttributes(element) {
		for (const attribute of Array.from(element.attributes)) {
			const name = attribute.name.toLowerCase();
			if (SAFE_DATA.has(name)) continue;
			if (element.tagName === "A" && ["href", "target", "rel"].includes(name)) continue;
			if (name === "style") {
				this.#cleanStyle(element);
				continue;
			}
			element.removeAttribute(attribute.name);
		}
		if (element.tagName === "A") this.#cleanLink(element);
	}

	static #cleanStyle(element) {
		for (const property of Array.from(element.style)) {
			const clean = sanitizeInlineStyle(
				property,
				element.style.getPropertyValue(property)
			);
			if (clean) element.style.setProperty(property, clean);
			else element.style.removeProperty(property);
		}
		if (!element.getAttribute("style")?.trim()) element.removeAttribute("style");
	}

	static #cleanLink(link) {
		const href = String(link.getAttribute("href") || "").trim();
		if (href && !this.#safeUrl(href)) link.removeAttribute("href");
		if (link.target === "_blank") link.rel = "noopener noreferrer";
	}

	static #safeUrl(value) {
		if (value.startsWith("#") || value.startsWith("/")) return true;
		try {
			return ["http:", "https:", "mailto:"].includes(
				new URL(value, location.origin).protocol
			);
		} catch {
			return false;
		}
	}
}
