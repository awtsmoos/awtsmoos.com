//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives an hours-long voice a durable browser vessel. OPFS receives
 * each chunk at its exact byte position, allowing playback to proceed without
 * retaining the completed recording in JavaScript memory.
 */
export async function createOpfsAudioStore(name) {
	const root = await navigator.storage.getDirectory();
	const fileName = safeFileName(name);
	const handle = await root.getFileHandle(fileName, { create: true });
	const writable = await handle.createWritable();
	let byteLength = 0;
	let closed = false;
	return {
		kind: "opfs",
		get size() {
			return byteLength;
		},
		async append(value) {
			assertOpen(closed);
			const owned = copyBytes(value);
			await writable.write({
				type: "write",
				position: byteLength,
				data: owned
			});
			byteLength += owned.byteLength;
			return owned;
		},
		async finalize() {
			if (!closed) {
				await writable.close();
				closed = true;
			}
		},
		async blob(mime = "audio/mpeg") {
			if (!closed) {
				await writable.flush?.();
			}
			const file = await handle.getFile();
			return file.type === mime
				? file
				: new Blob([file], { type: mime });
		},
		async cleanup() {
			if (!closed) {
				await writable.close().catch(() => undefined);
				closed = true;
			}
			await root.removeEntry(fileName).catch(() => undefined);
			byteLength = 0;
		}
	};
}

function safeFileName(value) {
	const clean = String(value || "audio")
		.replace(/[^a-z0-9_-]/gi, "_")
		.slice(0, 140);
	return `BH_${clean}_${Date.now()}.audio`;
}

function copyBytes(value) {
	return value?.slice
		? value.slice()
		: new Uint8Array(value || 0);
}

function assertOpen(closed) {
	if (closed) {
		throw new Error("Persistent audio store is already finalized.");
	}
}
