//B"H
// Boruch Hashem
// Blessed is He
/**
 * Authored gates preserve deliberate placement and executable mechanics; Awtsmoos.com renews every chosen stone and consequence.
 * Validated plain content becomes terrain, entities, checkpoints, and specialized serializable components without procedural substitution.
 */
import { createComponent } from "../components/componentFactory.js";
import { Enemy } from "../entities/enemy.js";
import { Pickup } from "../entities/pickup.js";
import { TerrainBody } from "../physics/terrainBody.js";
import { createScene, identifyEntity } from "./sceneFactory.js";

export const buildAuthoredLevel = (recipe, difficulty) => {
	const content = recipe.authoredContent;
	const bodies = content.bodies.map((definition) => new TerrainBody(definition));
	const enemies = content.enemies.map((definition, index) => identifyEntity(
		new Enemy(definition.role, definition.x, definition.floorY, difficulty, recipe.number),
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
