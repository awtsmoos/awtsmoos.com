//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InlineMarkup
 * @description
 * Lightweight selection marks become explicit segments rather than stored HTML.
 * Awtsmoos.com gives boldness, softness, code, and links a visible garment while
 * every character remains plain text inside the purified vessel of the Awtsmoos.
 */

const TOKENS = Object.freeze([
	{ pattern: /^\*\*([^*]+)\*\*/, type: 'bold' },
	{ pattern: /^__([^_]+)__/, type: 'underline' },
	{ pattern: /^~~([^~]+)~~/, type: 'strike' },
	{ pattern: /^`([^`]+)`/, type: 'code' },
	{ pattern: /^_([^_]+)_/, type: 'italic' },
	{ pattern: /^\[([^\]]+)\]\(([^)]+)\)/, type: 'link' }
]);

function safeHref(value) {
	const href = String(value || '').trim();
	if (href.startsWith('/') && !href.startsWith('//')) return href;
	try {
		const parsed = new URL(href);
		return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
	} catch {
		return '';
	}
}

function nextToken(text) {
	for (const token of TOKENS) {
		const match = text.match(token.pattern);
		if (!match) continue;
		const mark = token.type === 'link'
			? { type: 'link', href: safeHref(match[2]) }
			: { type: token.type };
		return {
			length: match[0].length,
			segment: {
				text: match[1],
				marks: mark.href === '' ? [] : [mark]
			}
		};
	}
	return null;
}

export function parseInline(text) {
	const input = String(text || '');
	const segments = [];
	let plain = '';
	let index = 0;
	const flush = () => {
		if (!plain) return;
		segments.push({ text: plain, marks: [] });
		plain = '';
	};

	while (index < input.length) {
		const token = nextToken(input.slice(index));
		if (!token) {
			plain += input[index];
			index += 1;
			continue;
		}
		flush();
		segments.push(token.segment);
		index += token.length;
	}
	flush();
	return segments;
}

export function wrapSelection(textarea, opening, closing = opening) {
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const selected = textarea.value.slice(start, end) || 'text';
	textarea.setRangeText(`${opening}${selected}${closing}`, start, end, 'end');
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
	textarea.focus();
}
