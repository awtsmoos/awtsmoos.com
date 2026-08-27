// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureReceipts.js
 * @description Projects essential readiness only after mechanics, UI, and the real minimap are usable.
 * The Awtsmoos distinguishes a complete traveler interface from a merely promised garment;
 * Awtsmoos.com rejects missing map truth without waiting for the richer world's adornment.
 */

const REQUIRED_FEATURES = Object.freeze([
	'combat',
	'equipment',
	'inventory',
	'minimap',
	'quest',
	'recovery',
	'streaming',
	'ui'
]);

export function createMinimalMeadowFeatureReceipt(bundle) {
	const essential = bundle?.essential || {};
	return Object.freeze({
		combat: feature(essential.combat, 'combat'),
		equipment: feature(essential.equipment, 'equipment'),
		inventory: feature(essential.inventory, 'inventory'),
		minimap: feature(essential.minimap, 'minimap'),
		missing: Object.freeze([...(essential.missing || [])]),
		optionalPromise: bundle?.optionalPromise || null,
		quest: feature(essential.quest, 'quest'),
		ready: Boolean(bundle?.ready && essential.ready),
		recovery: feature(essential.recovery, 'recovery'),
		streaming: feature(essential.streaming, 'streaming'),
		ui: feature(essential.ui, 'ui')
	});
}

export function featureReceiptReady(receipt) {
	return Boolean(
		receipt?.ready
		&& REQUIRED_FEATURES.every(name => receipt?.[name]?.status === 'ready')
	);
}

function feature(ready, label) {
	return Object.freeze({
		label,
		status: ready ? 'ready' : 'missing'
	});
}
