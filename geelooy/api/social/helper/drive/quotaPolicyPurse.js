//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module quotaPolicyPurse
 * @description
 * Peruta purse ledger, monthly grant, tier subscription and credits.
 */

const { MONTHLY_GRANT_PERUTAS, quotaError } = require('./quotaPolicyCore.js');
const { tierDefinition } = require('./quotaPolicyAccess.js');

/**
 * Drive-local peruta purse. Kept in the drive state so storage coin
 * never tangles with the compute-tier balance system.
 * state.perutaPurse = { balance, tier, tierSince, lastGrantMonth, ledger: [] }
 */
function purseFor(state) {
	state.perutaPurse = state.perutaPurse || {
		balance: 0,
		tier: 'chinam',
		tierSince: null,
		lastGrantMonth: '',
		ledger: []
	};
	return state.perutaPurse;
}

function currentMonthKey(at = Date.now()) {
	return new Date(at).toISOString().slice(0, 7);
}

function purseLedger(purse, entry) {
	purse.ledger = purse.ledger || [];
	purse.ledger.push({ at: Date.now(), ...entry });
	while (purse.ledger.length > 500) purse.ledger.shift();
}

/** Grant the free monthly pundyon. Idempotent within a calendar month. */
function grantMonthly(state, at = Date.now()) {
	const purse = purseFor(state);
	const month = currentMonthKey(at);
	if (purse.lastGrantMonth === month) {
		return { granted: 0, balance: purse.balance, month };
	}
	purse.balance += MONTHLY_GRANT_PERUTAS;
	purse.lastGrantMonth = month;
	purseLedger(purse, {
		kind: 'monthly_grant',
		deltaPerutas: MONTHLY_GRANT_PERUTAS,
		balance: purse.balance,
		note: '1 pundyon — the free monthly measure'
	});
	return { granted: MONTHLY_GRANT_PERUTAS, balance: purse.balance, month };
}

/** Subscribe (or renew) a tier, debiting the purse. */
function subscribeTier(state, tierCode) {
	const tier = tierDefinition(tierCode);
	const purse = purseFor(state);
	grantMonthly(state);
	if (purse.balance < tier.monthlyPricePerutas) {
		const error = quotaError('INSUFFICIENT_PERUTAS_FOR_TIER');
		error.needed = tier.monthlyPricePerutas;
		error.balance = purse.balance;
		error.tier = tier.code;
		throw error;
	}
	purse.balance -= tier.monthlyPricePerutas;
	purse.tier = tier.code;
	purse.tierSince = Date.now();
	purseLedger(purse, {
		kind: 'tier_subscription',
		tier: tier.code,
		deltaPerutas: -tier.monthlyPricePerutas,
		balance: purse.balance,
		note: `${tier.priceLabel} — ${tier.name} (${tier.english})`
	});
	state.quota = { ...tier.quota };
	return { tier: tier.code, balance: purse.balance, quota: state.quota };
}

/** Credit perutas to the purse (admin grant, purchase, earnings). */
function creditPurse(state, perutas, meta = {}) {
	const purse = purseFor(state);
	const n = Math.floor(Number(perutas) || 0);
	if (n <= 0) throw quotaError(`INVALID_PERUTA_CREDIT:${perutas}`);
	purse.balance += n;
	purseLedger(purse, {
		kind: meta.kind || 'credit',
		deltaPerutas: n,
		balance: purse.balance,
		note: meta.note || ''
	});
	return { balance: purse.balance };
}

module.exports = {
	purseFor,
	currentMonthKey,
	purseLedger,
	grantMonthly,
	subscribeTier,
	creditPurse
};
