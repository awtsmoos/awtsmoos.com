//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module XmlEntryStream
 * @description
 * Large upstream XML is consumed as transient network evidence and never becomes
 * a local corpus file. Complete <entry> fragments are yielded one at a time with
 * a hard fragment-size ceiling so malformed input cannot create unbounded memory.
 */

const MAX_FRAGMENT_BYTES = 1024 * 1024;
const ENTRY_END = '</entry>';

/** Finds and removes one complete lexical entry from the rolling transport buffer. */
function takeEntry(state) {
	const start = state.buffer.indexOf('<entry');
	if (start < 0) {
		state.buffer = state.buffer.slice(-32);
		return '';
	}
	const end = state.buffer.indexOf(ENTRY_END, start);
	if (end < 0) {
		if (state.buffer.length - start > MAX_FRAGMENT_BYTES) {
			throw new Error('lexicon_xml_entry_too_large');
		}
		if (start > 0) state.buffer = state.buffer.slice(start);
		return '';
	}
	const after = end + ENTRY_END.length;
	const fragment = state.buffer.slice(start, after);
	state.buffer = state.buffer.slice(after);
	return fragment;
}

/** Streams complete XML lexical entries from one bounded HTTP response body. */
export async function* xmlEntries(url, fetchImpl = fetch) {
	const response = await fetchImpl(url, {
		headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' }
	});
	if (!response.ok || !response.body) {
		throw new Error(`lexicon_xml_http_${response.status || 0}`);
	}
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	const state = { buffer: '' };
	try {
		while (true) {
			const { value, done } = await reader.read();
			state.buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
			while (true) {
				const fragment = takeEntry(state);
				if (!fragment) break;
				yield fragment;
			}
			if (done) break;
		}
	} finally {
		reader.releaseLock();
	}
	if (state.buffer.includes('<entry')) {
		throw new Error('lexicon_xml_truncated_entry');
	}
}
