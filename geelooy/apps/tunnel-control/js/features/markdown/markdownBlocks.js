// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe block Markdown parsing for Tunnel Control checkpoint text.
 * @description
 * The Awtsmoos lets headings, lists, quotes, paragraphs, and fenced code reveal
 * structure without granting checkpoint text the power of HTML. Awtsmoos.com
 * keeps every block as inert data until the viewer creates trusted DOM elements.
 */

import { inlineTokens } from "./markdownInline.js";

export function markdownBlocks(source = "") {
	const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
	const blocks = [];
	let index = 0;
	while (index < lines.length) {
		const line = lines[index];
		if (!line.trim()) {
			index += 1;
			continue;
		}
		const fenced = parseFence(lines, index);
		if (fenced) {
			blocks.push(fenced.block);
			index = fenced.nextIndex;
			continue;
		}
		const single = parseSingleLine(line);
		if (single) {
			blocks.push(single);
			index += 1;
			continue;
		}
		const paragraph = parseParagraph(lines, index);
		blocks.push(paragraph.block);
		index = paragraph.nextIndex;
	}
	return blocks;
}

function parseFence(lines, index) {
	const start = /^\s*```\s*([^`]*)$/.exec(lines[index]);
	if (!start) {
		return null;
	}
	const code = [];
	let cursor = index + 1;
	while (cursor < lines.length && !/^\s*```\s*$/.test(lines[cursor])) {
		code.push(lines[cursor]);
		cursor += 1;
	}
	return {
		block: {
			type: "codeBlock",
			language: start[1].trim(),
			text: code.join("\n")
		},
		nextIndex: cursor < lines.length ? cursor + 1 : cursor
	};
}

function parseSingleLine(line) {
	const heading = /^(#{1,6})\s+(.+)$/.exec(line);
	if (heading) {
		return {
			type: "heading",
			level: heading[1].length,
			children: inlineTokens(heading[2])
		};
	}
	const quote = /^>\s?(.*)$/.exec(line);
	if (quote) {
		return { type: "quote", children: inlineTokens(quote[1]) };
	}
	const unordered = /^\s*[-+*]\s+(.+)$/.exec(line);
	if (unordered) {
		return { type: "listItem", ordered: false, children: inlineTokens(unordered[1]) };
	}
	const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
	if (ordered) {
		return { type: "listItem", ordered: true, children: inlineTokens(ordered[1]) };
	}
	return null;
}

function parseParagraph(lines, index) {
	const parts = [];
	let cursor = index;
	while (cursor < lines.length && lines[cursor].trim()) {
		if (cursor > index && (parseSingleLine(lines[cursor]) || /^\s*```/.test(lines[cursor]))) {
			break;
		}
		parts.push(lines[cursor].trim());
		cursor += 1;
	}
	return {
		block: { type: "paragraph", children: inlineTokens(parts.join(" ")) },
		nextIndex: cursor
	};
}
