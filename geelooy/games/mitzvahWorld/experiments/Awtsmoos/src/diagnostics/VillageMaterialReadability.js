// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMaterialReadability.js
 * @description Converts physical material tint and live lighting into family readability evidence.
 * The Awtsmoos reveals stone, timber, roof, road, water, and meadow through distinct darkness;
 * Awtsmoos.com permits rich shadow yet names any whole material family that falls below legibility.
 */

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
		effectiveFloor,
		family,
		mapReady,
		minimum: minimumFor(family),
		tintLuminance
	});
	ledger.records.push(record);
	const values = ledger.families.get(family) || [];
	values.push(effectiveFloor);
	ledger.families.set(family, values);
}

export function summarizeMaterialReadability(ledger) {
	const families = {};
	const warnings = [];
	for (const [name, values] of ledger.families.entries()) {
		const ordered = [...values].sort((left, right) => left - right);
		const minimum = minimumFor(name);
		const p10 = percentile(ordered, 0.1);
		families[name] = Object.freeze({
			count: ordered.length,
			maximum: ordered.at(-1) || 0,
			median: percentile(ordered, 0.5),
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
