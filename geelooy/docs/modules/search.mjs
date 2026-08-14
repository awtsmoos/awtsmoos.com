//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file search.mjs
 * @description The Awtsmoos lets a few words discover a vast corpus; Awtsmoos.com ranks human meaning first while preserving explicit evidence filters.
 */

const provenanceBoost = {
	manual: 18,
	breadcrumb: 12,
	project: 8,
	ai: 5,
	generated: 0
};

export function parseQuery(raw) {
	const parsed = {
		terms: [],
		category: "",
		kind: "",
		path: ""
	};
	for (const token of String(raw || "").trim().split(/\s+/).filter(Boolean)) {
		const match = token.match(/^(category|kind|path):(.+)$/i);
		if (!match) parsed.terms.push(token.toLowerCase());
		else parsed[match[1].toLowerCase()] = match[2].toLowerCase();
	}
	return parsed;
}

function matchesFilters(record, parsed) {
	if (parsed.category && record.category.toLowerCase() !== parsed.category) return false;
	if (parsed.kind && record.provenance.toLowerCase() !== parsed.kind) return false;
	if (parsed.path && !record.sourcePath.toLowerCase().includes(parsed.path)) return false;
	return true;
}

function scoreTerm(record, term) {
	let score = 0;
	const title = record.title.toLowerCase();
	const headings = record.headings.map(heading => heading.text.toLowerCase()).join(" ");
	const path = record.sourcePath.toLowerCase();
	if (title === term) score += 120;
	if (title.includes(term)) score += 60;
	if (headings.includes(term)) score += 26;
	if (path.includes(term)) score += 16;
	if (record.excerpt.toLowerCase().includes(term)) score += 10;
	if (record.searchText.includes(term)) score += 4;
	return score;
}

function scoreRecord(record, parsed) {
	if (!matchesFilters(record, parsed)) return null;
	let score = provenanceBoost[record.provenance] || 0;
	for (const term of parsed.terms) {
		const termScore = scoreTerm(record, term);
		if (!termScore) return null;
		score += termScore;
	}
	if (!parsed.terms.length) score += Math.min(record.headings.length, 8);
	return score;
}

export function searchDocuments(records, rawQuery, limit = 60) {
	const parsed = parseQuery(rawQuery);
	return records
		.map(record => ({ record, score: scoreRecord(record, parsed) }))
		.filter(item => item.score !== null)
		.sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
		.slice(0, limit)
		.map(item => ({ ...item.record, score: item.score }));
}

export function snippetFor(record, rawQuery, width = 190) {
	const { terms } = parseQuery(rawQuery);
	if (!terms.length) return record.excerpt;
	const haystack = record.searchText;
	const positions = terms.map(term => haystack.indexOf(term)).filter(position => position >= 0);
	if (!positions.length) return record.excerpt;
	const start = Math.max(0, Math.min(...positions) - Math.floor(width / 3));
	const text = haystack.slice(start, start + width).trim();
	return `${start ? "…" : ""}${text}${start + width < haystack.length ? "…" : ""}`;
}
