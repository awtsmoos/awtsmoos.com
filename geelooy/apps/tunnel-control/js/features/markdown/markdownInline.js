// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe inline Markdown tokenization for Tunnel Control.
 * @description
 * The Awtsmoos gives emphasis, code, and links their visible garments while
 * Awtsmoos.com refuses to turn arbitrary checkpoint text into executable HTML.
 * Every token remains data until a trusted renderer creates DOM nodes explicitly.
 */

export function safeHref(value = "") {
	const href = String(value || "").trim();
	if (!href) {
		return "";
	}
	if (/^(\/|\.\/|\.\.\/|#)/.test(href)) {
		return href;
	}
	try {
		const url = new URL(href, "https://awtsmoos.com");
		return ["http:", "https:"].includes(url.protocol) ? href : "";
	} catch (_error) {
		return "";
	}
}

export function inlineTokens(source = "") {
	const text = String(source || "");
	const tokens = [];
	let remaining = text;
	while (remaining) {
		const match = nextInlineMatch(remaining);
		if (!match) {
			tokens.push({ type: "text", text: remaining });
			break;
		}
		if (match.index > 0) {
			tokens.push({ type: "text", text: remaining.slice(0, match.index) });
		}
		tokens.push(match.token);
		remaining = remaining.slice(match.index + match.length);
	}
	return tokens;
}

function nextInlineMatch(text) {
	const candidates = [
		matchPattern(text, /`([^`]+)`/, value => ({ type: "code", text: value[1] })),
		matchPattern(text, /\*\*([^*]+)\*\*/, value => ({ type: "strong", children: inlineTokens(value[1]) })),
		matchPattern(text, /\*([^*]+)\*/, value => ({ type: "em", children: inlineTokens(value[1]) })),
		matchPattern(text, /\[([^\]]+)\]\(([^)]+)\)/, value => linkToken(value))
	].filter(Boolean);
	candidates.sort((left, right) => left.index - right.index);
	return candidates[0] || null;
}

function matchPattern(text, pattern, makeToken) {
	const match = pattern.exec(text);
	if (!match) {
		return null;
	}
	return {
		index: match.index,
		length: match[0].length,
		token: makeToken(match)
	};
}

function linkToken(match) {
	const href = safeHref(match[2]);
	if (!href) {
		return { type: "text", text: match[0] };
	}
	return {
		type: "link",
		href,
		children: inlineTokens(match[1])
	};
}
