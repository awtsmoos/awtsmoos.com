//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module JastrowTraversal
 * @description
 * Sefaria may return a bucket containing several linked Jastrow homographs while
 * omitting an intermediate display form. Traversal follows only contiguous links
 * present in that bucket, then returns the first missing headword for the next request.
 */

/** Selects only Jastrow records from a mixed Lexicon API response. */
export function jastrowRows(entries) {
	return Array.isArray(entries)
		? entries.filter(entry => entry?.parent_lexicon === 'Jastrow Dictionary')
		: [];
}

/** Returns the first linked headword not already represented in this response bucket. */
export function nextJastrowHeadword(entries, requestedHeadword) {
	const rows = jastrowRows(entries);
	if (!rows.length) return '';
	const byHeadword = new Map(rows.map(entry => [String(entry.headword || ''), entry]));
	let current = byHeadword.get(String(requestedHeadword || '')) || rows[0];
	const visited = new Set();
	while (current) {
		const headword = String(current.headword || '');
		if (visited.has(headword)) throw new Error(`jastrow_bucket_cycle:${headword}`);
		visited.add(headword);
		const next = String(current.next_hw || '').trim();
		if (!next) return '';
		const local = byHeadword.get(next);
		if (!local) return next;
		current = local;
	}
	return '';
}
