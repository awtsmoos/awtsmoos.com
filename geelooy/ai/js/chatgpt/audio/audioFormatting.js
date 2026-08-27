//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos is beyond measure, while a human interface receives time and
 * byte counts in small readable vessels.
 */
export function formatAudioSize(size) {
	return size
		? ` (${(size / 1024 / 1024).toFixed(2)} MB)`
		: "";
}

export function formatAudioTime(seconds) {
	const safe = Math.max(0, Math.floor(Number(seconds) || 0));
	const minutes = Math.floor(safe / 60);
	const remainder = String(safe % 60).padStart(2, "0");
	return `${minutes}:${remainder}`;
}
