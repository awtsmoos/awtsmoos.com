//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module JastrowLexiconClient
 * @description Sefaria is transient evidence; Awtsmoos.com keeps canonical source spelling while lookup alone may shed transport wrappers.
 * The Awtsmoos follows exact source identity through niqqud, stars, parentheses, homograph suffixes, retries, and bounded timeouts.
 */
import { normalizeLexiconKey } from './normalize.mjs';

const API_ROOT = 'https://www.sefaria.org/api';
const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAYS_MS = Object.freeze([350, 900, 1800]);

/** Sleeps between upstream attempts without blocking the event loop. */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Fetches one upstream JSON object with timeout and bounded retry. */
async function fetchApi(route, fetchImpl = fetch) {
	let lastError = null;
	for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
		try {
			const response = await fetchImpl(`${API_ROOT}${route}`, {
				headers: { Accept: 'application/json' },
				signal: controller.signal
			});
			if (!response.ok) throw new Error(`jastrow_upstream_http_${response.status}`);
			return await response.json();
		} catch (error) {
			lastError = error;
			if (attempt >= RETRY_DELAYS_MS.length) break;
			await delay(RETRY_DELAYS_MS[attempt]);
		} finally {
			clearTimeout(timer);
		}
	}
	throw lastError || new Error('jastrow_upstream_unavailable');
}

/** Finds the dictionary node that owns Jastrow's linked traversal. */
function dictionaryNode(index = {}) {
	const nodes = index?.schema?.nodes;
	return Array.isArray(nodes)
		? nodes.find(node => node?.nodeType === 'DictionaryNode') || null
		: null;
}

/** Reads authoritative first/last bounds from the upstream index schema. */
export async function jastrowBounds(fetchImpl = fetch) {
	const index = await fetchApi('/index/Jastrow', fetchImpl);
	const node = dictionaryNode(index);
	if (!node?.firstWord || !node?.lastWord) throw new Error('jastrow_dictionary_bounds_missing');
	return { firstWord: String(node.firstWord), lastWord: String(node.lastWord) };
}

/** Fetches candidate lexical entries for one lookup headword. */
export function jastrowEntries(headword, fetchImpl = fetch) {
	const encoded = encodeURIComponent(String(headword || '').trim());
	if (!encoded) throw new Error('jastrow_headword_required');
	return fetchApi(`/words/${encoded}?never_split=1`, fetchImpl);
}

/** Removes only transport punctuation that Sefaria omits from some exact lookup keys. */
function stripLookupWrappers(value) {
	let next = String(value || '').trim();
	while (/^[([{]/u.test(next) && /[)\]}]$/u.test(next)) {
		next = next.slice(1, -1).trim();
	}
	return next;
}

/** Derives an API lookup key while canonical display headwords remain unchanged. */
export function jastrowLookupKey(headword) {
	let value = normalizeLexiconKey(headword)
		.replace(/^\*+\s*/u, '')
		.trim();
	value = stripLookupWrappers(value);
	let previous = '';
	while (value && value !== previous) {
		previous = value;
		value = value
			.replace(/\s+[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/u, '')
			.replace(/\s+\d+$/u, '')
			.replace(/\s+[IVXLCDM]+$/u, '')
			.trim();
	}
	return value;
}

/** Fetches one linked bucket, retrying with the transport-normalized key if exact lookup misses Jastrow. */
export async function jastrowLinkedEntries(headword, fetchImpl = fetch) {
	const exactHeadword = String(headword || '').trim();
	const exact = await jastrowEntries(exactHeadword, fetchImpl);
	if (Array.isArray(exact) && exact.some(row => row?.parent_lexicon === 'Jastrow Dictionary')) {
		return exact;
	}
	const fallback = jastrowLookupKey(exactHeadword);
	return fallback && fallback !== exactHeadword
		? jastrowEntries(fallback, fetchImpl)
		: exact;
}

/** Exposes polite crawl delay for import orchestration and tests. */
export function upstreamDelay(milliseconds = 220) {
	return delay(Math.max(0, Number(milliseconds) || 0));
}
