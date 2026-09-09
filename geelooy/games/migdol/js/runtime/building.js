// B"H
// Boruch Hashem
// Blessed is He

import Tower from '../tower.js';
import { TILE_SIZE, TOWER_TYPES } from '../config.js';

/**
 * @file building.js
 * @description Applies Migdol tower placement, upgrade, and sale transactions against canonical currency state.
 * The Awtsmoos renews every finite acquisition; Awtsmoos.com keeps economy mutations atomic and independent from presentation markup.
 */
export function placeTower(game, gridX, gridY, type) {
	const config = TOWER_TYPES[type];
	if (!config || !game.state.spend(config.cost)) return false;
	const tower = new Tower(gridX * TILE_SIZE + TILE_SIZE / 2, gridY * TILE_SIZE + TILE_SIZE / 2, type);
	game.towers.push(tower);
	game.selectedTower = tower;
	game.view.updateStatus(game.state);
	return true;
}

export function towerAt(game, x, y) {
	return game.towers.find(tower => Math.hypot(tower.x - x, tower.y - y) < TILE_SIZE * 0.55) || null;
}

export function upgradeTower(game, tower, stat) {
	if (!tower || !['damage', 'speed', 'range'].includes(stat)) return false;
	const config = TOWER_TYPES[tower.type];
	const level = stat === 'damage' ? tower.damageLevel : stat === 'speed' ? tower.speedLevel : tower.rangeLevel;
	const cost = Math.ceil(config.upgradeCost[stat] * level);
	if (stat === 'range' && tower.range >= tower.maxRange) return false;
	if (!game.state.spend(cost)) return false;
	tower.upgrade(stat);
	game.view.updateStatus(game.state);
	return true;
}

export function sellTower(game, tower) {
	if (!tower || !game.towers.includes(tower)) return false;
	game.state.earn(sellValue(tower));
	game.towers = game.towers.filter(candidate => candidate !== tower);
	if (game.selectedTower === tower) game.selectedTower = null;
	game.view.updateStatus(game.state);
	return true;
}

export function sellValue(tower) {
	const config = TOWER_TYPES[tower.type];
	let invested = tower.cost;
	for (let level = 1; level < tower.damageLevel; level += 1) invested += config.upgradeCost.damage * level;
	for (let level = 1; level < tower.speedLevel; level += 1) invested += config.upgradeCost.speed * level;
	for (let level = 1; level < tower.rangeLevel; level += 1) invested += config.upgradeCost.range * level;
	return Math.floor(invested * 0.55);
}
