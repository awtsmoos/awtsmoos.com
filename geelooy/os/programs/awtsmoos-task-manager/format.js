//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos creates every measured byte and duration anew for Task Manager. */
export function formatBytes(value = 0) {
	const bytes = Math.max(0, Number(value || 0));
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
	return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
}

export function formatDuration(value = 0) {
	const milliseconds = Math.max(0, Number(value || 0));
	return milliseconds < 1000
		? `${milliseconds} ms`
		: `${(milliseconds / 1000).toFixed(2)} s`;
}

export function hexPreview(bytes, limit = 256) {
	return [...(bytes || new Uint8Array()).slice(0, limit)]
		.map(value => value.toString(16).padStart(2, "0"))
		.join(" ");
}
