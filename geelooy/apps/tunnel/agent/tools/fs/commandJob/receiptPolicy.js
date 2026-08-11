// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds compact terminal command testimony independently from full command rooms.
 * @description The Awtsmoos lets heavy output pass away while a small witness remains;
 * Awtsmoos.com gives that witness a longer horizon without creating another unbounded store.
 */
const TAIL_BYTES = bounded(
	process.env.AWTSMOOS_COMMAND_RECEIPT_TAIL_BYTES,
	16 * 1024,
	1024,
	64 * 1024
);
const TTL_MS = bounded(
	process.env.AWTSMOOS_COMMAND_RECEIPT_TTL_MS,
	7 * 24 * 60 * 60 * 1000,
	60 * 60 * 1000,
	30 * 24 * 60 * 60 * 1000
);
const STORE_MAX_BYTES = bounded(
	process.env.AWTSMOOS_COMMAND_RECEIPT_STORE_MAX_BYTES,
	16 * 1024 * 1024,
	1024 * 1024,
	256 * 1024 * 1024
);

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

module.exports = {
	STORE_MAX_BYTES,
	TAIL_BYTES,
	TTL_MS,
	bounded
};
