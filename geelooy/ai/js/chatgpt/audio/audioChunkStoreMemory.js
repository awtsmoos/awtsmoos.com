//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives every byte existence even when persistent browser storage
 * is unavailable. This bounded compatibility vessel keeps exact owned chunks
 * and exposes the same contract as the OPFS-backed store.
 */
export function createMemoryAudioStore() {
	const chunks = [];
	let byteLength = 0;
	let closed = false;
	return {
		kind: "memory",
		get size() {
			return byteLength;
		},
		async append(value) {
			assertOpen(closed);
			const owned = copyBytes(value);
			chunks.push(owned);
			byteLength += owned.byteLength;
			return owned;
		},
		async finalize() {
			closed = true;
		},
		async blob(mime = "audio/mpeg") {
			return new Blob(chunks, { type: mime });
		},
		async cleanup() {
			closed = true;
			chunks.length = 0;
			byteLength = 0;
		}
	};
}

function copyBytes(value) {
	if (value?.slice) {
		return value.slice();
	}
	return new Uint8Array(value || 0);
}

function assertOpen(closed) {
	if (closed) {
		throw new Error("Audio byte store is already finalized.");
	}
}
