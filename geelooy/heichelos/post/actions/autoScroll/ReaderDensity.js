// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderDensity
 * @description The Awtsmoos measures the rendered reader itself: real font,
 * line height, width, height, and Hebrew-word density rather than guessed pace.
 */
const HEBREW_WORD = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"־-]*/gu;
const GENERAL_WORD = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
const BLOCK_SELECTOR = '.sub-awtsmoos, [data-awtsmoos-sub], p, li, blockquote, h1, h2, h3, h4, h5, h6';

function positiveNumber(value, fallback) {
	const number = Number.parseFloat(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function textOf(root) {
	// B"H 2026-11-10 round 12 — innerText EXCLUDES text inside
	// content-visibility: auto subtrees that have not rendered yet, so at
	// calibrate time most of the sefer's words are invisible to it: the
	// word count collapses while scrollHeight stays full, pixels-per-word
	// explodes, and the pace clamps at exactly 640 px/s (the "45 WPM"
	// label that could not be right). textContent counts every word in
	// the subtree, rendered or not, so label and motion share one sane
	// density.
	return String(root?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function measuredHeight(root, rectangle, lineHeight) {
	return Math.max(
		positiveNumber(root?.scrollHeight, 0),
		positiveNumber(rectangle?.height, 0),
		lineHeight
	);
}

function sampleNode(root) {
	const candidates = [...(root?.querySelectorAll?.(BLOCK_SELECTOR) ?? [])];
	return candidates.find(node => String(node.textContent ?? '').trim()) ?? root;
}

export function countHebrewWords(value) {
	return String(value ?? '').match(HEBREW_WORD)?.length ?? 0;
}

export function countGeneralWords(value) {
	return String(value ?? '').match(GENERAL_WORD)?.length ?? 0;
}

export function measureReaderDensity(root, options = {}) {
	const getStyle = options.getStyle ?? globalThis.getComputedStyle;
	const rectangle = root?.getBoundingClientRect?.() ?? { width: 0, height: 0 };
	const sample = sampleNode(root);
	const style = getStyle?.(sample) ?? {};
	const fontSize = positiveNumber(style.fontSize, 16);
	const lineHeight = positiveNumber(style.lineHeight, fontSize * 1.5);
	const width = Math.max(
		positiveNumber(root?.clientWidth, 0),
		positiveNumber(rectangle.width, 0),
		positiveNumber(options.viewportWidth, globalThis.innerWidth || 320)
	);
	const height = measuredHeight(root, rectangle, lineHeight);
	const text = textOf(root);
	const hebrewWordCount = countHebrewWords(text);
	const totalWordCount = countGeneralWords(text);
	const readingWordCount = Math.max(1, hebrewWordCount || totalWordCount);
	const lineCount = Math.max(1, height / lineHeight);
	return {
		fontSize,
		lineHeight,
		width,
		height,
		hebrewWordCount,
		totalWordCount,
		readingWordCount,
		hebrewRatio: totalWordCount ? hebrewWordCount / totalWordCount : 0,
		lineCount,
		wordsPerLine: readingWordCount / lineCount,
		pixelsPerWord: height / readingWordCount,
		signature: [height, width, fontSize, lineHeight, hebrewWordCount, totalWordCount].join(':')
	};
}
