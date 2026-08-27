// B"H
// Boruch Hashem
// Blessed is He

import { MarkdownInline } from "./MarkdownInline.js";
import {
	createBlock,
	readFence,
	readList,
	readParagraph,
	readTable
} from "./MarkdownBlockReaders.js";

/**
 * @file Directs supported Markdown syntax into semantic Awtsmoos Docs blocks.
 * @description The Awtsmoos precedes source and page; Awtsmoos.com reads H1-H6,
 * lists, tables, code, fragments, and safe navigation markers into named vessels
 * while keeping the Markdown subset bounded enough to remain predictable and testable.
 */
export class MarkdownImporter {
	static parse(markdown = "") {
		const lines = String(markdown)
			.replace(/\r\n?/g, "\n")
			.split("\n");
		const blocks = [];
		for (let index = 0; index < lines.length;) {
			const result = readBlock(lines, index);
			if (result.block) blocks.push(result.block);
			index = result.nextIndex;
		}
		return blocks;
	}
}

function readBlock(lines, index) {
	const line = lines[index];
	if (!line.trim()) return { nextIndex: index + 1 };
	if (/^```/.test(line)) return readFence(lines, index);
	const heading = /^(#{1,6})\s+(.+)$/.exec(line);
	if (heading) {
		return singleBlock(
			`h${heading[1].length}`,
			MarkdownInline.toHtml(heading[2]),
			index
		);
	}
	if (/^\s*>\s?/.test(line)) {
		return singleBlock(
			"blockquote",
			MarkdownInline.toHtml(line.replace(/^\s*>\s?/, "")),
			index
		);
	}
	if (isDivider(line)) return singleBlock("hr", "", index);
	if (isTableStart(lines, index)) return readTable(lines, index);
	if (/^\s*[-+*]\s+/.test(line)) return readList(lines, index, false);
	if (/^\s*\d+[.)]\s+/.test(line)) return readList(lines, index, true);
	return readParagraph(lines, index, startsBlock);
}

function startsBlock(lines, index) {
	if (index === 0) return false;
	const line = lines[index];
	return /^```|^#{1,6}\s|^\s*>|^\s*[-+*]\s+|^\s*\d+[.)]\s+/.test(line)
		|| isDivider(line)
		|| isTableStart(lines, index);
}

function isDivider(line) {
	return /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line);
}

function isTableStart(lines, index) {
	return /\|/.test(lines[index] || "")
		&& /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || "");
}

function singleBlock(tag, html, index) {
	return {
		block: createBlock(tag, html),
		nextIndex: index + 1
	};
}
