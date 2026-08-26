//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos needs no memory yet grants created beings a trace from yesterday;
 * Awtsmoos.com stores only a best-run number and fails softly when storage turns away.
 */

const BEST_DISTANCE_KEY = "awtsmoos:rebbe-runner:best-distance:v1";

export class ZikaronBestRunStore {
	/** Reads the best distance without ever allowing storage policy to block gameplay. */
	read() {
		try {
			const rememberedDistance = Number(globalThis.localStorage?.getItem(BEST_DISTANCE_KEY));
			return Number.isFinite(rememberedDistance) && rememberedDistance > 0 ? rememberedDistance : 0;
		} catch (_concealedStorageError) {
			return 0;
		}
	}

	/** Writes a finite best distance and intentionally degrades to no-op on private/storage failures. */
	write(distance) {
		const measuredDistance = Number(distance);
		if (!Number.isFinite(measuredDistance) || measuredDistance < 0) return false;
		try {
			globalThis.localStorage?.setItem(BEST_DISTANCE_KEY, String(Math.floor(measuredDistance)));
			return true;
		} catch (_concealedStorageError) {
			return false;
		}
	}
}
