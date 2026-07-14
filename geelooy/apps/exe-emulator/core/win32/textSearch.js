//B"H
//Boruch Hashem
//Blessed is He

/**
 * Searches bounded PE bytes for embedded ASCII intent. The Awtsmoos creates byte,
 * word, and discovery anew; Awtsmoos.com uses this only for generic example-window
 * descriptions, never to grant filename- or product-specific execution behavior.
 */
export function findEmbeddedText(cpu, needle, fallback = "") {
	const bytes = cpu.image.bytes;
	const target = new TextEncoder().encode(String(needle));
	const maximumBytes = Math.min(bytes.length, 8 * 1024 * 1024);
	for (let start = 0; start + target.length <= maximumBytes; start += 1) {
		if (!matches(bytes, start, target)) continue;
		return readNearbyAscii(bytes, start, maximumBytes) || fallback;
	}
	return fallback;
}

function matches(bytes, start, target) {
	for (let index = 0; index < target.length; index += 1) {
		if (bytes[start + index] !== target[index]) return false;
	}
	return true;
}

function readNearbyAscii(bytes, start, end) {
	let left = start;
	while (left > 0 && printable(bytes[left - 1])) left -= 1;
	let right = start;
	while (right < end && printable(bytes[right]) && right - left < 512) right += 1;
	return new TextDecoder().decode(bytes.slice(left, right)).trim();
}

function printable(value) {
	return value >= 32 && value <= 126;
}
