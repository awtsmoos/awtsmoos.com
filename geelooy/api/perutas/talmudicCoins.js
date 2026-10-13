//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TalmudicCoins
 * @description
 * The full Talmudic coin hierarchy, smallest to largest, in perutas.
 * Every amount on Awtsmoos is reckoned in perutas but spoken in proper coins.
 *
 *   Peruta  = 1        (base unit)
 *   Issar   = 8        perutas
 *   Pundyon = 2        issarim  = 16 perutas
 *   Me'ah   = 2        pundyonim = 32 perutas
 *   Dinar   = 6        me'ah    = 192 perutas  (also called Zuz)
 *   Shekel  = 4        dinarim  = 768 perutas
 *   Maneh   = 25       shekalim = 19,200 perutas
 *   Kikar   = 60       maneh    = 1,152,000 perutas
 */

const DENOMINATIONS = Object.freeze([
	{ code: 'kikar',   name: 'Kikar',   plural: 'Kikarim',   perutas: 1152000 },
	{ code: 'maneh',   name: 'Maneh',   plural: 'Maneh',     perutas: 19200 },
	{ code: 'shekel',  name: 'Shekel',  plural: 'Shekalim',  perutas: 768 },
	{ code: 'dinar',   name: 'Dinar',   plural: 'Dinarim',   perutas: 192, aliases: ['zuz'] },
	{ code: 'meah',    name: "Me'ah",   plural: "Me'ahs",    perutas: 32 },
	{ code: 'pundyon', name: 'Pundyon', plural: 'Pundyonim', perutas: 16 },
	{ code: 'issar',   name: 'Issar',   plural: 'Issarim',   perutas: 8 },
	{ code: 'peruta',  name: 'Peruta',  plural: 'Perutas',   perutas: 1 }
]);

const BY_CODE = Object.freeze(
	Object.fromEntries(DENOMINATIONS.flatMap(d => [
		[d.code, d],
		...(d.aliases || []).map(a => [a, d])
	]))
);

function denomination(code) {
	const d = BY_CODE[String(code || '').toLowerCase()];
	if (!d) throw new Error(`UNKNOWN_COIN:${code}`);
	return d;
}

/** Convert a coin amount to perutas: toPerutas(2, 'shekel') === 1536 */
function toPerutas(amount, code) {
	const d = denomination(code);
	const n = Number(amount);
	if (!Number.isSafeInteger(n) || n < 0) throw new Error(`INVALID_COIN_AMOUNT:${amount}`);
	return n * d.perutas;
}

/** Break perutas into proper coins, largest first. */
function breakdown(perutas) {
	let rest = Math.floor(Number(perutas) || 0);
	if (rest < 0) throw new Error(`INVALID_PERUTAS:${perutas}`);
	const parts = [];
	for (const d of DENOMINATIONS) {
		const count = Math.floor(rest / d.perutas);
		if (count > 0) {
			parts.push({ code: d.code, name: d.name, plural: d.plural, count, perutas: count * d.perutas });
			rest -= count * d.perutas;
		}
	}
	return parts;
}

/** Human speech: formatPerutas(200) === "1 dinar and 8 perutas" */
function formatPerutas(perutas) {
	const parts = breakdown(perutas);
	if (parts.length === 0) return '0 perutas';
	const words = parts.map(p => `${p.count} ${p.count === 1 ? p.name.toLowerCase() : p.plural.toLowerCase()}`);
	if (words.length === 1) return words[0];
	if (words.length === 2) return `${words[0]} and ${words[1]}`;
	return words.slice(0, -1).join(', ') + ', and ' + words[words.length - 1];
}

/** Largest whole coin contained in the amount, e.g. largestCoin(500) => dinar. */
function largestCoin(perutas) {
	const n = Math.floor(Number(perutas) || 0);
	for (const d of DENOMINATIONS) {
		if (n >= d.perutas) return d;
	}
	return DENOMINATIONS[DENOMINATIONS.length - 1];
}

module.exports = {
	DENOMINATIONS,
	BY_CODE,
	breakdown,
	denomination,
	formatPerutas,
	largestCoin,
	toPerutas
};
