// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMaterialReadability.js
 * @description Converts live material tint and light into named family readability evidence.
 * The Awtsmoos reveals stone, timber, roof, road, water, and meadow through distinct darkness;
 * Awtsmoos.com preserves rich shadow while naming the exact vessels that fall below legibility.
 */

const LOWEST_RECORD_LIMIT = 6;
const TEXTURE_SHADOW_FACTOR = 0.62;

export function createReadabilityLedger() {
	return { families: new Map(), records: [] };
}

export function recordMaterialReadability(ledger, identity, material, lighting, mapReady) {
	if (!lighting) return;
	const family = readabilityFamily(identity);
	const tintLuminance = colorLuminance(material.color);
	const effectiveFloor = tintLuminance
		* Number(lighting.diffuseFloor || 0)
		* (mapReady ? TEXTURE_SHADOW_FACTOR : 1);
	const record = Object.freeze({
		color: Object.freeze([...(material.color || [1, 1, 1, 1])]),
		effectiveFloor,
		family,
		identity: String(identity || 'unnamed-physical-material'),
		mapReady,
		minimum: minimumFor(family),
		tintLuminance
	});
	ledger.records.push(record);
	const records = ledger.families.get(family) || [];
	records.push(record);
	ledger.families.set(family, records);
}

export function summarizeMaterialReadability(ledger) {
	const families = {};
	const warnings = [];
	for (const [name, records] of ledger.families.entries()) {
		const ordered = [...records].sort(compareEffectiveFloor);
		const values = ordered.map(record => record.effectiveFloor);
		const minimum = minimumFor(name);
		const p10 = percentile(values, 0.1);
		families[name] = Object.freeze({
			count: ordered.length,
			lowest: Object.freeze(ordered.slice(0, LOWEST_RECORD_LIMIT)),
			maximum: values.at(-1) || 0,
			median: percentile(values, 0.5),
			minimum,
			p10,
			readable: p10 >= minimum
		});
		if (p10 < minimum) warnings.push(`${name}-below-readable-material-floor`);
	}
	return Object.freeze({
		families: Object.freeze(families),
		readable: warnings.length === 0,
		recordCount: ledger.records.length,
		warnings: Object.freeze(warnings)
	});
}

export function readabilityFamily(identity = '') {
	if (/terrain|meadow|soil|ground|grass/i.test(identity)) return 'terrain';
	if (/roof|slate|shingle|tile/i.test(identity)) return 'roof';
	if (/timber|wood|beam|door|shutter|balcony/i.test(identity)) return 'timber';
	if (/wall|stone|foundation|cottage|house|shul/i.test(identity)) return 'masonry';
	if (/road|path|bridge|cobble|stair/i.test(identity)) return 'infrastructure';
	if (/water|river|lake|stream|waterfall/i.test(identity)) return 'water';
	if (/tree|leaf|forest|flower|bush|reed|moss/i.test(identity)) return 'vegetation';
	return 'other-physical';
}

function minimumFor(family) {
	return {
		infrastructure: 0.1, masonry: 0.1, 'other-physical': 0.08,
		roof: 0.075, terrain: 0.095, timber: 0.065, vegetation: 0.06, water: 0.055
	}[family] || 0.08;
}

function colorLuminance(color = []) {
	return (color[0] ?? 1) * 0.2126
		+ (color[1] ?? 1) * 0.7152
		+ (color[2] ?? 1) * 0.0722;
}

function percentile(values, fraction) {
	if (!values.length) return 0;
	return values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))];
}

function compareEffectiveFloor(left, right) {
	return left.effectiveFloor - right.effectiveFloor;
}
