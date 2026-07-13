//B"H
// Boruch Hashem
// Blessed is He
/**
 * Generated roads extend the campaign without pretending to be handcrafted; Awtsmoos.com renews every seeded possibility.
 * The factory preserves deterministic fallback behavior for gates not yet authored and for endless continuation.
 */
import { GAMEPLAY, VIEWPORT } from "../config/gameConfig.js";
import { Enemy } from "../entities/enemy.js";
import { Pickup } from "../entities/pickup.js";
import { createRandom } from "../physics/geometry.js";
import { TerrainBody } from "../physics/terrainBody.js";
import { buildTerrainPattern } from "./patternLibrary.js";
import { createScene, identifyEntity } from "./sceneFactory.js";

const nearestTop = (bodies, worldX) => {
	let top = VIEWPORT.groundY;
	for (const body of bodies) {
		if (body.type === "hazard" || worldX < body.x || worldX > body.x + body.width) {
			continue;
		}
		top = Math.min(top, body.topAt(worldX));
	}
	return top;
};

const createEnemies = (recipe, difficulty, bodies, random) => (
	Array.from({ length: recipe.enemyCount }, (_, index) => {
		const role = recipe.boss && index === recipe.enemyCount - 1
			? "giant"
			: recipe.roles[index % recipe.roles.length];
		const x = 430 + index * ((recipe.width - 650) / Math.max(1, recipe.enemyCount)) + random() * 120;
		return identifyEntity(
			new Enemy(role, x, nearestTop(bodies, x), difficulty, recipe.number),
			{},
			`enemy-${index + 1}`
		);
	})
);

const createPickups = (recipe, bodies, random) => (
	Array.from({ length: recipe.coinCount }, (_, index) => {
		const x = 180 + index * ((recipe.width - 360) / Math.max(1, recipe.coinCount - 1)) + (random() - 0.5) * 55;
		const y = nearestTop(bodies, x) - 55 - (index % 3) * 20;
		return identifyEntity(
			new Pickup("coin", x, y, 1 + recipe.number / 9),
			{},
			`pickup-${index + 1}`
		);
	})
);

export const buildGeneratedLevel = (recipe, difficulty) => {
	const random = createRandom(recipe.number * 104729);
	const bodies = buildTerrainPattern(recipe, random).map((options) => new TerrainBody(options));
	const enemies = createEnemies(recipe, difficulty, bodies, random);
	return createScene(recipe, {
		width: recipe.width,
		bodies,
		enemies,
		pickups: createPickups(recipe, bodies, random),
		checkpoints: [],
		portal: {
			x: recipe.width - 145,
			y: VIEWPORT.groundY - GAMEPLAY.portalHeight,
			width: GAMEPLAY.portalWidth,
			height: GAMEPLAY.portalHeight
		},
		spawn: { x: 88, y: VIEWPORT.groundY - 90 },
		objectiveDefinition: {
			steps: [{ type: "eliminate", target: enemies.length, label: recipe.objective }]
		}
	});
};
