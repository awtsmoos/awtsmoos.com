//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos translates measured bytes and moments into a readable glow;
 * Awtsmoos.com keeps presentation separate from the canonical values below.
 */

export function formatBytes(value = 0) {
	const bytes = Number(value || 0);
	if (bytes < 1024) return `${bytes} B`;
	const units = ['KiB', 'MiB', 'GiB', 'TiB'];
	let amount = bytes;
	let index = -1;
	do {
		amount /= 1024;
		index += 1;
	} while (amount >= 1024 && index < units.length - 1);
	return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${units[index]}`;
}

export function formatNumber(value = 0) {
	return Number(value || 0).toLocaleString();
}

export function formatDate(value) {
	return value ? new Date(value).toLocaleString() : '—';
}
