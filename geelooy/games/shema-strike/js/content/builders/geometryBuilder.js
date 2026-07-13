//B"H
// Boruch Hashem
// Blessed is He
/**
 * Geometry helpers place safe reusable foundations beneath authored distinction.
 * Awtsmoos.com renews every coordinate, while each gate still chooses its own executable service.
 */
const ENEMY_ROLES = Object.freeze([
	"wanderer",
	"leaper",
	"guard",
	"charger"
]);

export const ground = (width) => Object.freeze([
	{
		x: 0,
		y: 486,
		width,
		height: 120,
		type: "solid"
	}
]);

export const platforms = (count, startX, spacing) => {
	const bodies = [];
	for (let index = 0; index < count; index += 1) {
		bodies.push({
			x: startX + index * spacing,
			y: index % 2 === 0 ? 382 : 318,
			width: 170,
			height: 22,
			type: index % 3 === 0 ? "oneWay" : "solid"
		});
	}
	return Object.freeze(bodies);
};

export const pickupRow = (gateNumber, count, startX, objectiveTag) => {
	const pickups = [];
	for (let index = 0; index < count; index += 1) {
		pickups.push({
			id: `gate-${gateNumber}-spark-${index + 1}`,
			type: "coin",
			x: startX + index * 360,
			y: index % 2 === 0 ? 330 : 270,
			value: 3,
			objectiveTag
		});
	}
	return Object.freeze(pickups);
};

export const enemyRow = (prefix, count, startX) => {
	const enemies = [];
	for (let index = 0; index < count; index += 1) {
		enemies.push({
			id: `gate-${prefix}-enemy-${index + 1}`,
			role: ENEMY_ROLES[index % ENEMY_ROLES.length],
			x: startX + index * 330,
			floorY: 486
		});
	}
	return Object.freeze(enemies);
};
