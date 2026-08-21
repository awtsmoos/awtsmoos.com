// B"H
// Boruch Hashem
// Blessed is He

import { isSafeDocumentUrl } from "../model/HtmlLinkPolicy.js";
import {
	protectMarkdownBookmarks,
	restoreMarkdownBookmarks,
	semanticMarkerMarkdown
} from "./MarkdownBookmarkSyntax.js";
import {
	decodeHtml,
	escapeAttribute,
	escapeHtml,
	escapeMarkdownText
} from "./FormatEscapes.js";

/**
 * @file Converts inline garments shared by Markdown and rich Awtsmoos document HTML.
 * @description The Awtsmoos renews meaning before syntax takes a shape; Awtsmoos.com
 * carries emphasis, fragment links, code, mentions, bookmarks, and stable heading
 * markers between source and rich view without granting arbitrary raw HTML passage.
 */
export class MarkdownInline {
	static toMarkdown(html = "") {
		const template = document.createElement("template");
		template.innerHTML = String(html);
		return Array.from(template.content.childNodes)
			.map(node => renderMarkdownNode(node))
			.join("");
	}

	static toHtml(markdown = "") {
		const semantic = protectMarkdownBookmarks(markdown);
		const codeTokens = [];
		let value = escapeHtml(semantic.value);
		value = protectCode(value, codeTokens);
		value = value.replace(
			/\[([^\]]+)\]\(([^)\s]+)\)/g,
			(match, label, href) => safeLink(label, href)
		);
		value = value
			.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
			.replace(/__([^_]+)__/g, "<strong>$1</strong>")
			.replace(/~~([^~]+)~~/g, "<s>$1</s>")
			.replace(/==([^=]+)==/g, "<mark>$1</mark>")
			.replace(/(^|[\s(])@([A-Za-z0-9._-]{2,64})\b/g, (
				match,
				prefix,
				alias
			) => `${prefix}<span data-mention="${alias}">@${alias}</span>`)
			.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
			.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
		value = restoreTokens(value, codeTokens);
		return restoreMarkdownBookmarks(value, semantic.tokens);
	}
}

function renderMarkdownNode(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		return escapeMarkdownText(node.textContent || "");
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return "";
	const semantic = semanticMarkerMarkdown(node);
	if (semantic) return semantic;
	const inner = Array.from(node.childNodes)
		.map(child => renderMarkdownNode(child))
		.join("");
	const tag = node.tagName;
	if (tag === "BR") return "  \n";
	if (tag === "STRONG" || tag === "B") return `**${inner}**`;
	if (tag === "EM" || tag === "I") return `*${inner}*`;
	if (tag === "S") return `~~${inner}~~`;
	if (tag === "MARK") return `==${inner}==`;
	if (tag === "U") return `<u>${inner}</u>`;
	if (tag === "CODE") return codeFence(inner);
	if (tag === "A") return linkMarkdown(node, inner);
	if (node.dataset?.mention) return `@${node.dataset.mention}`;
	return inner;
}

function linkMarkdown(node, inner) {
	const href = String(node.getAttribute("href") || "");
	return href ? `[${inner}](${href.replace(/\)/g, "%29")})` : inner;
}

function codeFence(value) {
	const fence = value.includes("`") ? "``" : "`";
	return `${fence}${value}${fence}`;
}

function protectCode(value, tokens) {
	return value.replace(/(``?)([\s\S]*?)\1/g, (match, fence, code) => {
		const token = `\u0000${tokens.length}\u0000`;
		tokens.push(`<code>${code}</code>`);
		return token;
	});
}

function restoreTokens(value, tokens) {
	return value.replace(/\u0000(\d+)\u0000/g, (match, index) => (
		tokens[Number(index)] || ""
	));
}

function safeLink(label, href) {
	const decoded = decodeHtml(href);
	if (!isSafeDocumentUrl(decoded)) return label;
	if (decoded.startsWith("#") || decoded.startsWith("/")) {
		return `<a href="${escapeAttribute(decoded)}">${label}</a>`;
	}
	return `<a href="${escapeAttribute(new URL(decoded, location.origin).href)}">${label}</a>`;
}
