//B"H
// Boruch Hashem
// Blessed is He
/**
 * A scene gathers finite vessels into one playable world while Awtsmoos.com renews every relation and event between them.
 * Authored and generated gates now share an event ledger and serializable component boundary without sharing their content source.
 */
import { EventLedger } from "../events/eventLedger.js";

export const identifyEntity = (entity, definition, fallbackId) => {
	entity.id = String(definition.id ?? fallbackId);
	if (definition.objectiveTag) {
		entity.objectiveTag = String(definition.objectiveTag);
	}
	if (definition.secretId) {
		entity.secretId = String(definition.secretId);
	}
	return entity;
};

export const createScene = (recipe, details) => ({
	recipe,
	width: details.width,
	bodies: details.bodies,
	enemies: details.enemies,
	pickups: details.pickups,
	checkpoints: details.checkpoints,
	components: details.components ?? [],
	projectiles: [],
	portal: { ...details.portal, active: false },
	spawn: { ...details.spawn },
	objectiveDefinition: details.objectiveDefinition,
	ledger: new EventLedger(),
	time: 0,
	defeated: 0,
	collected: 0,
	collectedTags: {}
});
