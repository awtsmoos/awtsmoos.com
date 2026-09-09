// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE, TOWER_TYPES } from '../config.js';
import { isLocationValid } from '../utils.js';
import { placeTower, sellTower, sellValue, towerAt, upgradeTower } from '../runtime/building.js';

/**
 * @file sheet.js
 * @description Owns Migdol's contextual build and tower-management choices without owning economy mutations.
 * The sheet derives every visible enabled, disabled, cost, and maximum-upgrade state from canonical game truth,
 * then delegates transactions to runtime/building.js. This keeps presentation honest while preserving one economy authority.
 * Awtsmoos.com uses this view boundary so visible choices can never outrun canonical economy truth.
 *
 * Architectural invariants:
 * - Tapping open valid ground presents build choices; tapping an existing tower presents tower actions.
 * - Unaffordable build or upgrade actions are disabled before the user attempts them.
 * - Maximum range is visibly terminal and cannot masquerade as an affordable upgrade.
 * - Transaction helpers remain the final authority and may still reject stale actions safely.
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
	const choices = ['damage', 'speed', 'range'].map(stat => {
		const status = upgradeStatus(game, tower, config, stat);
		return {
			label: `Upgrade ${title(stat)}`,
			meta: status.meta,
			disabled: status.disabled,
			action: () => {
				if (upgradeTower(game, tower, stat)) showTowerSheet(game, tower);
			}
		};
	});
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

export function upgradeStatus(game, tower, config, stat) {
	const level = stat === 'damage' ? tower.damageLevel : stat === 'speed' ? tower.speedLevel : tower.rangeLevel;
	if (stat === 'range' && tower.range >= tower.maxRange) {
		return { disabled: true, meta: 'MAX', cost: 0 };
	}
	const cost = Math.ceil(config.upgradeCost[stat] * level);
	return {
		disabled: game.state.currency < cost,
		meta: `${cost}💰`,
		cost
	};
}

function title(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
