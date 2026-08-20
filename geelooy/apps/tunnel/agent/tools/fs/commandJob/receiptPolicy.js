// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounds compact terminal testimony by bytes, age, and record count.
 * @description
 * The Awtsmoos leaves a small witness after heavy command rooms pass away.
 * Awtsmoos.com gives those witnesses three independent horizons so countless tiny
 * receipts can never become an invisible archive that slows every future shliach.
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
const STORE_MAX_RECORDS = bounded(
	process.env.AWTSMOOS_COMMAND_RECEIPT_STORE_MAX_RECORDS,
	2000,
	10,
	100000
);

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

module.exports = {
	STORE_MAX_BYTES,
	STORE_MAX_RECORDS,
	TAIL_BYTES,
	TTL_MS,
	bounded
};
