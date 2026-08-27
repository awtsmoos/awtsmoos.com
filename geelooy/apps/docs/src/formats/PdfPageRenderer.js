// B"H
// Boruch Hashem
// Blessed is He

import { semanticTextLines } from "./PdfBlockText.js";

/**
 * @file Renders document semantics onto browser canvases before custom PDF packaging.
 * @description The Awtsmoos gives every alphabet its form beyond PDF font tables;
 * Awtsmoos.com lets the browser shape Unicode, including Hebrew, into faithful page pixels.
 */
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN_X = 118;
const MARGIN_TOP = 120;
const MARGIN_BOTTOM = 130;

export class PdfPageRenderer {
	render(blocks = []) {
		const pages = [];
		let page = createPage();
		let y = MARGIN_TOP;
		for (const block of blocks) {
			const style = blockStyle(block?.tag);
			const lines = blockLines(block, page.context, style);
			const needed = lines.length * style.lineHeight + style.after;
			if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM && y > MARGIN_TOP) {
				pages.push(page.canvas);
				page = createPage();
				y = MARGIN_TOP;
			}
			y = drawLines(page.context, lines, y, style);
		}
		pages.push(page.canvas);
		return pages;
	}
}

function createPage() {
	const canvas = document.createElement("canvas");
	canvas.width = PAGE_WIDTH;
	canvas.height = PAGE_HEIGHT;
	const context = canvas.getContext("2d", { alpha: false });
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
	context.fillStyle = "#172033";
	context.textBaseline = "alphabetic";
	return { canvas, context };
}

function blockStyle(tag = "p") {
	const styles = {
		h1: { size: 44, weight: 700, lineHeight: 58, before: 14, after: 24 },
		h2: { size: 34, weight: 700, lineHeight: 46, before: 22, after: 18 },
		h3: { size: 28, weight: 700, lineHeight: 40, before: 18, after: 14 },
		pre: { size: 21, weight: 400, lineHeight: 31, before: 12, after: 18, mono: true },
		blockquote: { size: 25, weight: 400, lineHeight: 39, before: 10, after: 16, indent: 32 },
		table: { size: 20, weight: 400, lineHeight: 31, before: 10, after: 18 },
		ul: { size: 25, weight: 400, lineHeight: 39, before: 6, after: 12, indent: 30 },
		ol: { size: 25, weight: 400, lineHeight: 39, before: 6, after: 12, indent: 30 }
	};
	return styles[tag] || {
		size: 25,
		weight: 400,
		lineHeight: 41,
		before: 4,
		after: 14
	};
}

function blockLines(block, context, style) {
	context.font = fontFor(style);
	const rawLines = semanticTextLines(block);
	const width = PAGE_WIDTH - (2 * MARGIN_X) - (style.indent || 0);
	return rawLines.flatMap(line => wrapLine(context, line, width));
}

function wrapLine(context, value, width) {
	const words = String(value).split(/\s+/);
	const lines = [];
	let line = "";
	for (const word of words) {
		const candidate = line ? `${line} ${word}` : word;
		if (!line || context.measureText(candidate).width <= width) {
			line = candidate;
			continue;
		}
		lines.push(line);
		line = word;
	}
	lines.push(line);
	return lines;
}

function drawLines(context, lines, y, style) {
	context.font = fontFor(style);
	const x = MARGIN_X + (style.indent || 0);
	let cursor = y + style.before + style.lineHeight;
	for (const line of lines) {
		const rtl = /[\u0590-\u08ff]/.test(line);
		context.direction = rtl ? "rtl" : "ltr";
		context.textAlign = rtl ? "right" : "left";
		context.fillText(line, rtl ? PAGE_WIDTH - x : x, cursor);
		cursor += style.lineHeight;
	}
	return cursor + style.after;
}

function fontFor(style) {
	const family = style.mono
		? "ui-monospace, SFMono-Regular, Menlo, monospace"
		: "Arial, 'Noto Sans Hebrew', sans-serif";
	return `${style.weight} ${style.size}px ${family}`;
}
