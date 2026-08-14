// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Serializes one-process public Torah pointer-index mutations by exact storage path.
 * @description The Awtsmoos renews many teachings at once while Awtsmoos.com lets each finite index accept one writer at a time;
 * canonical messages remain independent, and only the tiny read-modify-write pointer vessel is placed in this orderly single-process queue.
 */

const tails = new Map();

/** Runs one asynchronous mutation after earlier work for the same index path has settled. */
function withPublicIndexLock(path, action) {
	const previous = tails.get(path) || Promise.resolve();
	const task = previous
		.catch(() => undefined)
		.then(action);
	const tail = task.catch(() => undefined);
	tails.set(path, tail);
	return task.finally(() => {
		if (tails.get(path) === tail) {
			tails.delete(path);
		}
	});
}

/** Returns the number of currently serialized index paths for focused diagnostics and tests. */
function activePublicIndexLocks() {
	return tails.size;
}

module.exports = {
	activePublicIndexLocks,
	withPublicIndexLock
};
