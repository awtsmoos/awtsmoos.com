//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SearchExecutionLabel
 * @description The Awtsmoos lets Awtsmoos.com name the search that actually answered:
 * Hebrew-script questions stay lexical, while English may reveal literal text or semantic meaning.
 */
const HEBREW_SCRIPT = /[\u0590-\u05ff]/u;

/** Returns true when Hebrew, Aramaic, or Yiddish script participates in the query. */
export function hasHebrewScript(value) {
	return HEBREW_SCRIPT.test(String(value || ''));
}

/** Names the executed Library-search lane without promising stricter exactness than the backend provides. */
export function executedSearchLabel(search = {}, query = '') {
	if (hasHebrewScript(query)) return 'Hebrew-script lexical';
	if (search.mode === 'vector') return 'English semantic';
	if (search.mode === 'text') return 'English text';
	return 'Library search';
}

/** Describes result count, executed search lane, and linked-comment availability. */
export function searchStatusMessage(search = {}, hits = [], query = '') {
	const count = hits.length;
	const commentCount = hits.reduce((total, hit) => {
		return total + (Array.isArray(hit?.comments) ? hit.comments.length : 0);
	}, 0);
	const sources = `${count} source${count === 1 ? '' : 's'} found`;
	const comments = `${commentCount} linked comment${commentCount === 1 ? '' : 's'} available`;
	const openState = commentCount > 0 ? ' · The first source window is open.' : '';
	return `${sources} · ${executedSearchLabel(search, query)} · ${comments}${openState}`;
}
