//B"H
//Boruch Hashem
//Blessed is He

import { createMemoryAudioStore } from "./audioChunkStoreMemory.js";
import { createOpfsAudioStore } from "./audioChunkStoreOpfs.js";

/**
 * The Awtsmoos creates one complete sound through whichever browser vessel is
 * available. OPFS is preferred for long recordings; memory remains a faithful
 * fallback when persistent storage is unavailable or denied.
 */
export async function createAudioChunkStore(signature = "audio") {
	if (supportsOpfs()) {
		try {
			return await createOpfsAudioStore(signature);
		} catch {}
	}
	return createMemoryAudioStore();
}

export async function downloadAudioStore(store, options = {}) {
	const {
		mime = "audio/mpeg",
		format = "mp3",
		filename = `BH_awtsmoosAudio_${Date.now()}.${format}`
	} = options;
	await store.finalize();
	const blob = await store.blob(mime);
	if (blob.size !== store.size) {
		throw new Error(
			`Stored audio contains ${blob.size} of ${store.size} received bytes.`
		);
	}
	const href = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = href;
	anchor.download = filename;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(href), 30000);
	return blob.size;
}

function supportsOpfs() {
	return typeof navigator !== "undefined"
		&& typeof navigator.storage?.getDirectory === "function";
}
