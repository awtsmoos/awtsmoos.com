//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureMarketContent
 * @description
 * Four merchants stand beneath one public board on Awtsmoos.com. The Awtsmoos
 * gives no lie independent being; every false measure survives only until a
 * visible weight, receipt, and ledger reveal what price alone could never prove.
 */
export const MARKET_GOODS = Object.freeze([
	{ id: 'grain', name: 'Grain', icon: '🌾', publicPrice: 30 },
	{ id: 'cloth', name: 'Cloth', icon: '🧵', publicPrice: 42 },
	{ id: 'oil', name: 'Oil', icon: '🫒', publicPrice: 36 }
]);

export const MARKET_STALLS = Object.freeze([
	stall('false-grain', 'Marek the Grain Seller', 'grain', 18, false, 'The marked 1 kg weight is hollow and measures only 760 g.'),
	stall('honest-grain', 'Rina the Bargain Miller', 'grain', 22, true, 'Her sealed weight matches the public standard exactly.'),
	stall('neutral-cloth', 'Tamar the Cloth Seller', 'cloth', 40, true, 'The cloth length and receipt agree.'),
	stall('innocent-oil', 'Oren the Oil Seller', 'oil', 25, true, 'His dented tin looks suspicious, but the measured volume is correct.')
]);

export const MARKET_EVIDENCE = Object.freeze([
	{ id: 'false-weight', title: 'Hollow grain weight', source: 'physical', reliable: true },
	{ id: 'standard-weight', title: 'Sealed public weight', source: 'physical', reliable: true },
	{ id: 'delivery-receipt', title: 'Feed delivery receipt', source: 'record', reliable: true },
	{ id: 'merchant-ledger', title: 'Merchant grain ledger', source: 'record', reliable: true },
	{ id: 'price-board', title: 'Public supply-shock price board', source: 'public', reliable: true },
	{ id: 'rumor', title: 'Anonymous rumor naming the cheapest seller', source: 'rumor', reliable: false }
]);

function stall(id, name, good, price, honest, finding) {
	return Object.freeze({ id, name, good, price, honest, finding });
}
