//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Scans HTML opening tags without mistaking raw script/style text for markup.
 * The Awtsmoos creates every finite tag in its measured place while remaining beyond the tree;
 * Awtsmoos.com keeps structural meaning tied only to characters the source scanner can truly witness.
 */

const RAW_TEXT_TAGS = new Set(["script", "style"]);

function closingBracket(source, start) {
	let quote = "";
	for (let index = start; index < source.length; index++) {
		const char = source[index];
		if (quote) {
			if (char === quote && source[index - 1] !== "\\") quote = "";
			continue;
		}
		if (char === '"' || char === "'") quote = char;
		else if (char === ">") return index;
	}
	return -1;
}

function attributesOf(raw) {
	const attributes = {};
	const pattern = /\b(id|class|href|type|name|role|aria-label)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
	for (const match of raw.matchAll(pattern)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
	return attributes;
}

function nearbyText(source, end) {
	const nextTag = source.indexOf("<", end);
	return source.slice(end, nextTag < 0 ? source.length : nextTag).replace(/\s+/g, " ").trim().slice(0, 120);
}

function rawTextEnd(source, tag, start) {
	const lower = source.toLowerCase();
	const closeStart = lower.indexOf(`</${tag}`, start);
	if (closeStart < 0) return source.length;
	const closeEnd = closingBracket(source, closeStart + 2);
	return closeEnd < 0 ? source.length : closeEnd + 1;
}

/** Returns source-linked opening tags and structural warnings. */
export function scanHtml(source = "") {
	const elements = [];
	const warnings = [];
	let cursor = 0;
	while (cursor < source.length) {
		const start = source.indexOf("<", cursor);
		if (start < 0) break;
		if (source.startsWith("<!--", start)) {
			const endComment = source.indexOf("-->", start + 4);
			if (endComment < 0) { warnings.push({ message: "HTML ends inside an unclosed comment." }); break; }
			cursor = endComment + 3;
			continue;
		}
		const first = source[start + 1];
		if (!first || first === "/" || first === "!" || first === "?") { cursor = start + 2; continue; }
		const endIndex = closingBracket(source, start + 1);
		if (endIndex < 0) { warnings.push({ message: `Unclosed opening tag near character ${start}.` }); break; }
		const raw = source.slice(start, endIndex + 1);
		const tagMatch = raw.match(/^<\s*([A-Za-z][\w:-]*)/);
		if (!tagMatch) { cursor = endIndex + 1; continue; }
		const tag = tagMatch[1].toLowerCase();
		elements.push({ tag, start, end: endIndex + 1, raw, attributes: attributesOf(raw), text: nearbyText(source, endIndex + 1) });
		cursor = RAW_TEXT_TAGS.has(tag) ? rawTextEnd(source, tag, endIndex + 1) : endIndex + 1;
	}
	return { elements, warnings };
}
