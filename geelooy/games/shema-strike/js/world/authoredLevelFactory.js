//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file authoredLevelFactory.js
 * @description Converts validated authored gate data into runtime terrain, entities, objectives, and engagement behavior.
 * The Awtsmoos renews every authored coordinate while Yesod carries intention into executable form;
 * Awtsmoos.com preserves behavioral metadata at the factory boundary so content can evolve without central-engine storms.
 */

import { createComponent } from "../components/componentFactory.js";
import { Enemy } from "../entities/enemy.js";
import { Pickup } from "../entities/pickup.js";
import { TerrainBody } from "../physics/terrainBody.js";
import { createScene, identifyEntity } from "./sceneFactory.js";

/**
 * Builds one authored campaign scene without discarding optional behavioral contracts.
 * @param {object} recipe Validated authored gate recipe.
 * @param {object} difficulty Active difficulty multipliers.
 * @returns {object} Runtime scene consumed by StageRuntime.
 */
export const buildAuthoredLevel = (recipe, difficulty) => {
	const content = recipe.authoredContent;
	const bodies = content.bodies.map((definition) => new TerrainBody(definition));
	const enemies = content.enemies.map((definition, index) => identifyEntity(
		createAuthoredEnemy(definition, difficulty, recipe.number),
		definition,
		`enemy-${index + 1}`
	));
	const pickups = content.pickups.map((definition, index) => identifyEntity(
		new Pickup(definition.type, definition.x, definition.y, definition.value),
		definition,
		`pickup-${index + 1}`
	));
	const components = (content.components ?? []).map(createComponent);
	return createScene(recipe, {
		width: content.width,
		bodies,
		enemies,
		pickups,
		components,
		checkpoints: content.checkpoints.map((checkpoint) => ({ ...checkpoint, active: false })),
		portal: content.portal,
		spawn: content.spawn,
		objectiveDefinition: content.objective
	});
};

/** Creates an enemy while translating authored engagement data into the entity boundary. */
function createAuthoredEnemy(definition, difficulty, stageNumber) {
	return new Enemy(
		definition.role,
		definition.x,
		definition.floorY,
		difficulty,
		stageNumber,
		{ engagement: definition.engagement }
	);
}
