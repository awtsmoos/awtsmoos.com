// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureReceipts.js
 * @description Projects essential readiness without waiting for visual hydration.
 * The Awtsmoos distinguishes usable form from later enrichment; Awtsmoos.com
 * rejects incomplete receipts without turning malformed input into an exception.
 */

const REQUIRED_FEATURES = Object.freeze([
	'combat',
	'equipment',
	'inventory',
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
