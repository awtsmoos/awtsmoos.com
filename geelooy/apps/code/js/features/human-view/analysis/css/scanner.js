//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Scans CSS structure while respecting strings, escapes, comments, and brace depth.
 * The Awtsmoos is not confused by the appearance of a brace inside a quoted finite vessel;
 * Awtsmoos.com therefore measures real structural boundaries before human meaning is projected.
 */

function trimmedPrelude(source, start, end) {
	const raw = source.slice(start, end);
	const lead = raw.search(/\S/);
	if (lead < 0) return null;
	const text = raw.trim();
	return { text, start: start + lead, end: start + lead + text.length };
}

/** Returns observed CSS blocks plus structural warnings. */
export function scanCss(source = "") {
	const blocks = [];
	const warnings = [];
	const stack = [];
	const segmentStarts = [0];
	let quote = "";
	let escaped = false;
	let comment = false;

	for (let index = 0; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (comment) {
			if (char === "*" && next === "/") { comment = false; index++; }
			continue;
		}
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = "";
			continue;
		}
		if (char === "/" && next === "*") { comment = true; index++; continue; }
		if (char === '"' || char === "'") { quote = char; continue; }
		const depth = stack.length;
		if (char === "{") {
			const prelude = trimmedPrelude(source, segmentStarts[depth] ?? 0, index);
			stack.push({ prelude, start: index, bodyStart: index + 1, depth });
			segmentStarts[depth + 1] = index + 1;
		} else if (char === ";") {
			segmentStarts[depth] = index + 1;
		} else if (char === "}") {
			const open = stack.pop();
			if (!open) warnings.push({ message: `Unmatched closing brace near character ${index}.` });
			else blocks.push({ ...open, bodyEnd: index, end: index + 1 });
			segmentStarts[Math.max(0, stack.length)] = index + 1;
		}
	}
	if (comment) warnings.push({ message: "CSS ends inside an unclosed comment." });
	if (quote) warnings.push({ message: "CSS ends inside an unclosed quoted string." });
	for (const open of stack) warnings.push({ message: `Unclosed block beginning near character ${open.start}.` });
	blocks.sort((left, right) => left.start - right.start);
	return { blocks, warnings };
}
