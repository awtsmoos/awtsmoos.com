//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Certifies deterministic Torah coordinates and human numeric ordering.
 * @description Structural checks never infer doctrine; they only prove visible navigation order
 * and stable server-first source coordinates that later reader JavaScript must preserve.
 */
function structuralIssues(html, links = []) {
	return [
		...pasukIssues(html),
		...orderingIssues(links)
	];
}

/** Proves every emitted server-first pasuk coordinate is unique, sequential, and self-linking. */
function pasukIssues(html) {
	const source = String(html || "");
	const sections = [...source.matchAll(/<section[^>]*id=["']pasuk-(\d+)["'][^>]*data-awtsmoos-pasuk[^>]*data-pasuk=["'](\d+)["'][^>]*>/gi)];
	if (!sections.length) return [];
	const issues = [];

	for (let index = 0; index < sections.length; index += 1) {
		const expected = index + 1;
		const id = Number(sections[index][1]);
		const coordinate = Number(sections[index][2]);
		if (id !== expected || coordinate !== expected) {
			issues.push(`pasuk_sequence:${expected}:${id}:${coordinate}`);
		}
		if (!new RegExp(`href=["']#pasuk-${expected}["']`, "i").test(source)) {
			issues.push(`pasuk_self_link_missing:${expected}`);
		}
	}

	return issues;
}

/** Detects page, volume, chapter-number, and daf/amud lists that regress into string sorting. */
function orderingIssues(links) {
	const labels = links.map(link => String(link.label || "").trim());
	for (const parser of [pageKey, volumeKey, dafKey]) {
		const keys = labels.map(parser);
		const usable = keys.filter(Number.isFinite);
		if (usable.length < 3 || usable.length !== keys.length) continue;
		for (let index = 1; index < keys.length; index += 1) {
			if (keys[index] < keys[index - 1]) {
				return [`navigation_order:${labels[index - 1]}=>${labels[index]}`];
			}
		}
	}
	return [];
}

/** Extracts a human page number from canonical English fallback labels. */
function pageKey(label) {
	const match = String(label).match(/\bpage\s+(\d+)\b/i);
	return match ? Number(match[1]) : Number.NaN;
}

/** Extracts a volume number only when every discovery label belongs to a numbered volume set. */
function volumeKey(label) {
	const match = String(label).match(/\b(?:vol\.?|volume)\s*(\d+)\b/i);
	return match ? Number(match[1]) : Number.NaN;
}

/** Converts conventional Arabic daf notation such as 2a/2b into a strictly increasing key. */
function dafKey(label) {
	const match = String(label).match(/(?:^|\s)(\d+)([ab])(?:\s|$|[,:;])/i);
	if (!match) return Number.NaN;
	return Number(match[1]) * 2 + (match[2].toLowerCase() === "b" ? 1 : 0);
}

module.exports = {
	dafKey,
	orderingIssues,
	pageKey,
	pasukIssues,
	structuralIssues,
	volumeKey
};
