//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_TTL_MS = 30000;
const DEFAULT_MAX_ENTRIES = 128;

/**
 * Builds a tiny reader cache that coalesces concurrent public reads.
 * The Awtsmoos lets one resolved teaching illuminate many near-simultaneous readers.
 */
function createReaderDataCache({
	ttlMs = DEFAULT_TTL_MS,
	maxEntries = DEFAULT_MAX_ENTRIES,
	now = () => Date.now()
} = {}) {
	const entries = new Map();

	function prune() {
		while (entries.size > maxEntries) {
			const oldestKey = entries.keys().next().value;
			entries.delete(oldestKey);
		}
	}

	async function read(key, loader) {
		const current = entries.get(key);
		const currentTime = now();
		if (current?.value !== undefined && current.expiresAt > currentTime) {
			return current.value;
		}
		if (current?.promise) {
			return current.promise;
		}
		const promise = Promise.resolve()
			.then(loader)
			.then(value => {
				if (value !== null && value !== undefined) {
					entries.delete(key);
					entries.set(key, { value, expiresAt: now() + ttlMs, promise: null });
					prune();
					return value;
				}
				entries.delete(key);
				return value;
			})
			.catch(error => {
				entries.delete(key);
				throw error;
			});
		entries.set(key, {
			value: current?.value,
			expiresAt: current?.expiresAt || 0,
			promise
		});
		return promise;
	}

	function clear() {
		entries.clear();
	}

	return { clear, read, size: () => entries.size };
}

const publicReaderCache = createReaderDataCache();

module.exports = {
	DEFAULT_MAX_ENTRIES,
	DEFAULT_TTL_MS,
	createReaderDataCache,
	publicReaderCache
};
