// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureReceipts.js
 * @description Projects essential readiness without waiting for optional visual hydration.
 * The Awtsmoos distinguishes usable form from later enrichment; Awtsmoos.com reports every
 * store and gameplay vessel while remote models, vegetation, NPCs, and polish remain optional.
 */

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
		&& receipt.combat.status === 'ready'
		&& receipt.equipment.status === 'ready'
		&& receipt.inventory.status === 'ready'
		&& receipt.quest.status === 'ready'
		&& receipt.recovery.status === 'ready'
		&& receipt.streaming.status === 'ready'
		&& receipt.ui.status === 'ready'
	);
}

function feature(ready, label) {
	return Object.freeze({
		label,
		status: ready ? 'ready' : 'missing'
	});
}
