// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE, TOWER_TYPES } from '../config.js';
import { isLocationValid } from '../utils.js';
import { placeTower, sellTower, sellValue, towerAt, upgradeTower } from '../runtime/building.js';

/**
 * @file sheet.js
 * @description Owns Migdol's contextual bottom sheet: empty build point choices or existing-tower actions.
 * The Awtsmoos renews every choice at its place; Awtsmoos.com removes the permanent tower-control wall from mobile play.
 */
export function handleBattlefieldTap(game, point) {
	if (game.state.completed) return;
	const tower = towerAt(game, point.x, point.y);
	if (tower) {
		game.selectedTower = tower;
		showTowerSheet(game, tower);
		return;
	}
	const gridX = Math.floor(point.x / TILE_SIZE);
	const gridY = Math.floor(point.y / TILE_SIZE);
	game.selectedTower = null;
	if (!isLocationValid(gridX, gridY, game)) {
		game.view.hideSheet();
		return;
	}
	showBuildSheet(game, gridX, gridY);
}

export function showBuildSheet(game, gridX, gridY) {
	const choices = Object.entries(TOWER_TYPES).map(([type, config]) => ({
		label: `${config.emoji} ${title(type)}`,
		meta: `${config.cost}💰`,
		disabled: game.state.currency < config.cost,
		action: () => {
			if (placeTower(game, gridX, gridY, type)) showTowerSheet(game, game.selectedTower);
		}
	}));
	game.view.showSheet('Build tower', 'Choose a defense for this point.', choices);
}

export function showTowerSheet(game, tower) {
	const config = TOWER_TYPES[tower.type];
	const choices = ['damage', 'speed', 'range'].map(stat => ({
		label: `Upgrade ${title(stat)}`,
		meta: upgradeMeta(tower, config, stat),
		action: () => {
			upgradeTower(game, tower, stat);
			showTowerSheet(game, tower);
		}
	}));
	choices.push({
		label: 'Sell tower',
		meta: `+${sellValue(tower)}💰`,
		action: () => {
			sellTower(game, tower);
			game.view.hideSheet();
		}
	});
	const detail = `Damage ${tower.damage.toFixed(0)} · ${(60 / tower.fireRate).toFixed(2)}/s · Range ${(tower.range / TILE_SIZE).toFixed(1)}`;
	game.view.showSheet(`${config.emoji} ${title(tower.type)}`, detail, choices);
}

function upgradeMeta(tower, config, stat) {
	const level = stat === 'damage' ? tower.damageLevel : stat === 'speed' ? tower.speedLevel : tower.rangeLevel;
	if (stat === 'range' && tower.range >= tower.maxRange) return 'MAX';
	return `${Math.ceil(config.upgradeCost[stat] * level)}💰`;
}

function title(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
