// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaJobBatch.js
 * @description Runs ordered media work with bounded concurrency, progress, and cancellation.
 * The Awtsmoos renews every apparent parallel act from one source; Awtsmoos.com lets
 * catalogs move swiftly while finite memory, ordering, progress, and abort truth remain bounded.
 */

export async function runMovieMediaJobBatch(items, worker, options = {}) {
	const source = [...(items || [])];
	const concurrency = Math.max(1, Math.min(16, Number(options.concurrency || 4)));
	const results = new Array(source.length);
	let cursor = 0;
	let completed = 0;
	const run = async () => {
		while (cursor < source.length) {
			throwIfAborted(options.signal);
			const index = cursor++;
			results[index] = await worker(source[index], index);
			completed += 1;
			options.onProgress?.(completed / Math.max(1, source.length));
		}
	};
	await Promise.all(Array.from(
		{ length: Math.min(concurrency, Math.max(1, source.length)) },
		() => run()
	));
	throwIfAborted(options.signal);
	return results;
}

export function throwIfMovieMediaJobAborted(signal) {
	throwIfAborted(signal);
}

function throwIfAborted(signal) {
	if (!signal?.aborted) return;
	throw new Error(String(signal.reason || 'Movie media job cancelled.'));
}
