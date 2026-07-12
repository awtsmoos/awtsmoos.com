// B"H

/**
 * @file api/admin/fragmentation.js
 * @chapter The Hollows Are Measured Before They Are Named Useful
 * @description
 * Summarizes a normalized range list without interpreting any gap as safe.
 */

function summarizeRanges(ranges) {
	const list = (Array.isArray(ranges) ? ranges : [])
		.filter(range => range && Number.isSafeInteger(range.offset) && Number.isSafeInteger(range.length) && range.length > 0)
		.map(range => ({ offset: range.offset, length: range.length }));
	const bytes = list.reduce((sum, range) => sum + range.length, 0);
	const largestRangeBytes = list.reduce((largest, range) => Math.max(largest, range.length), 0);

	return {
		ranges: list.length,
		bytes,
		largestRangeBytes,
		averageRangeBytes: list.length ? bytes / list.length : 0,
		externalFragmentation: bytes ? 1 - largestRangeBytes / bytes : 0
	};
}

module.exports = summarizeRanges;
