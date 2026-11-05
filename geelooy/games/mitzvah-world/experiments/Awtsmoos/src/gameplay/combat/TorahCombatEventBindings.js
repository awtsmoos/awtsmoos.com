// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahCombatEventBindings.js
 * @description Binds canonical target and legacy impact events without enlarging the combat owner.
 * The Awtsmoos gathers old and new event rivers into one impact sea;
 * Awtsmoos.com preserves every contract while the controller remains focused, bounded, and free.
 */

export function bindTorahCombatEvents(controller, bus) {
	return [
		bus.on('npc:target', payload => controller.receiveTarget(payload)),
		bus.on('npc:clear', payload => controller.clearTarget(payload)),
		bus.on('enemy:defeated', payload => controller.clearTarget(payload)),
		bus.on('torah:impact', payload => controller.receiveImpact(payload)),
		bus.on('combat:ability', payload => receiveLegacyAbility(controller, payload)),
		bus.on('combat:ward', payload => receiveLegacyWard(controller, payload))
	];
}

function receiveLegacyAbility(controller, payload) {
	if (!controller.pendingUse) return;
	const accepted = payload?.results?.some(result => result.accepted) || false;
	controller.receiveImpact({
		...payload,
		accepted,
		reason: accepted ? null : payload?.results?.[0]?.reason || 'ABILITY_REJECTED'
	});
}

function receiveLegacyWard(controller, payload) {
	if (controller.pendingUse) controller.receiveImpact({ accepted: true, ...payload, results: [] });
}
