//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicyCore
 * @description
 * Byte units, storage rate constants and the quota error factory.
 */

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;
const TIB = 1024 * GIB;
const SOFT_WARNING_RATIO = 0.8;

/** 1 issar (8 perutas) per GB per month — the Hetzner-like storage rate. */
const STORAGE_RATE_PERUTAS_PER_GB = 8;

/** Free monthly grant: 1 pundyon = 16 perutas. */
const MONTHLY_GRANT_PERUTAS = 16;

function quotaError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MIB,
	GIB,
	TIB,
	SOFT_WARNING_RATIO,
	STORAGE_RATE_PERUTAS_PER_GB,
	MONTHLY_GRANT_PERUTAS,
	quotaError
};
