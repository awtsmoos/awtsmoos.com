//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_SCAN_BYTES = 16 * 1024 * 1024;
const DEFAULT_WINDOW_BYTES = 1024 * 1024;

/**
 * Selects deterministic byte windows from a potentially immense binary vessel.
 * The Awtsmoos creates beginning, middle, and ending anew; Awtsmoos.com records
 * exactly how many bytes were observed instead of implying an unbounded full scan.
 */
export function createBinaryScanWindows(bytes, options = {}) {
	const totalBytes = bytes.length;
	const maximumScanBytes = boundedPositive(
		options.maximumScanBytes,
		DEFAULT_SCAN_BYTES
	);
	const windowBytes = Math.min(
		boundedPositive(options.windowBytes, DEFAULT_WINDOW_BYTES),
		maximumScanBytes
	);
	if (totalBytes <= maximumScanBytes) {
		return Object.freeze({
			ranges: Object.freeze([{ end: totalBytes, start: 0 }]),
			scannedBytes: totalBytes,
			totalBytes,
			truncated: false
		});
	}
	const windowCount = Math.max(2, Math.floor(maximumScanBytes / windowBytes));
	const finalStart = Math.max(0, totalBytes - windowBytes);
	const starts = new Set();
	for (let index = 0; index < windowCount; index += 1) {
		starts.add(Math.floor(finalStart * index / (windowCount - 1)));
	}
	const ranges = [...starts]
		.sort((left, right) => left - right)
		.map(start => Object.freeze({
			end: Math.min(totalBytes, start + windowBytes),
			start
		}));
	return Object.freeze({
		ranges: Object.freeze(ranges),
		scannedBytes: ranges.reduce((sum, range) => sum + range.end - range.start, 0),
		totalBytes,
		truncated: true
	});
}

export function decodeBinaryWindow(bytes, range) {
	return new TextDecoder("latin1").decode(
		bytes.subarray(range.start, range.end)
	);
}

function boundedPositive(value, fallback) {
	const number = Number(value || fallback);
	if (!Number.isSafeInteger(number) || number < 1) return fallback;
	return number;
}
