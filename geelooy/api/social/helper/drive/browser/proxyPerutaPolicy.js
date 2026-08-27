//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyPerutaPolicy
 * @description
 * The Awtsmoos gives browser work a smallest visible cost unit. Awtsmoos.com
 * translates bounded request and response work into perutas so identity budgets
 * can measure resource weight instead of pretending every request costs the same.
 */

const DEFAULT_PERUTA_COST = Object.freeze({
	requestBase: 8,
	requestKiB: 1,
	responseKiB: 1
});

function requestPerutas(bytes, schedule = DEFAULT_PERUTA_COST) {
	return schedule.requestBase + kibCost(bytes, schedule.requestKiB);
}

function responsePerutas(bytes, schedule = DEFAULT_PERUTA_COST) {
	return kibCost(bytes, schedule.responseKiB);
}

function maxResponseBytesForPerutas(perutas, schedule = DEFAULT_PERUTA_COST) {
	const available = Math.max(Math.floor(Number(perutas) || 0), 0);
	if (!schedule.responseKiB) return Number.MAX_SAFE_INTEGER;
	return Math.floor(available / schedule.responseKiB) * 1024;
}

function requestedPerutaBudget(value, hardLimit) {
	const maximum = positiveInteger(hardLimit, 'PROXY_PERUTA_LIMIT_INVALID');
	if (value === undefined || value === null || value === '') return maximum;
	const requested = positiveInteger(value, 'PROXY_PERUTA_BUDGET_INVALID');
	return Math.min(requested, maximum);
}

function kibCost(bytes, rate) {
	const count = Math.max(Number(bytes) || 0, 0);
	const units = count ? Math.ceil(count / 1024) : 0;
	return units * Math.max(Number(rate) || 0, 0);
}

function positiveInteger(value, code) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		const error = new Error(code);
		error.code = code;
		error.status = 400;
		throw error;
	}
	return number;
}

module.exports = {
	DEFAULT_PERUTA_COST,
	requestPerutas,
	responsePerutas,
	maxResponseBytesForPerutas,
	requestedPerutaBudget
};
