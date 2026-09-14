//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TextLineStream
 * @description
 * External line-oriented evidence is consumed directly from an HTTP body and
 * never materialized as a local corpus. A hard line-size ceiling prevents one
 * malformed upstream record from becoming an unbounded memory allocation.
 */

const MAX_LINE_BYTES = 2 * 1024 * 1024;

/** Streams bounded nonempty text lines from one upstream HTTP response. */
export async function* textLines(url, fetchImpl = fetch) {
	const response = await fetchImpl(url);
	if (!response.ok || !response.body) {
		throw new Error(`lexicon_line_http_${response.status || 0}`);
	}
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	try {
		while (true) {
			const { value, done } = await reader.read();
			buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
			let newline = buffer.indexOf('\n');
			while (newline >= 0) {
				const line = buffer.slice(0, newline).trim();
				buffer = buffer.slice(newline + 1);
				if (line) yield line;
				newline = buffer.indexOf('\n');
			}
			if (buffer.length > MAX_LINE_BYTES) {
				throw new Error('lexicon_transport_line_too_large');
			}
			if (done) break;
		}
	} finally {
		reader.releaseLock();
	}
	const tail = buffer.trim();
	if (tail) {
		if (tail.length > MAX_LINE_BYTES) {
			throw new Error('lexicon_transport_line_too_large');
		}
		yield tail;
	}
}
