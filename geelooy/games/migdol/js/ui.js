//B"H

//B"H

import {
	TILE_SIZE,
	TOWER_TYPES
} from './config.js';
import {
	isLocationValid
} from './utils.js'; // We'll move isLocationValid to its own file for cleanliness

export function setupUI(game) {
	const towerOptionsContentDiv =
		document.getElementById(
			'tower-options-content');

	// --- NEW: Add click listeners for collapsible headers ---
	document.querySelectorAll(
			'.collapsible-header')
		.forEach(header => {
			header.addEventListener(
				'click', () => {
					const
						collapsible =
						header
						.parentElement;
					collapsible
						.classList
						.toggle(
							'collapsed'
							);
				});
		});

	// Create tower selection buttons
	for (const type in TOWER_TYPES) {
		const config = TOWER_TYPES[
		type];
		const option = document
			.createElement('div');
		option.classList.add(
			'tower-option');
		option.dataset.type = type;
		option.innerHTML = `
            <span class="emoji">${config.emoji}</span>
            <span class="name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="cost">${config.cost} 💰</span>
        `;
		option.addEventListener('click',
			() => selectTowerType(
				game, type, option));
		// Append to the new content div
		towerOptionsContentDiv
			.appendChild(option);
	}

	// Event Listeners (remain the same)
	game.canvas.addEventListener(
		'mousemove', (e) =>
		handleMouseMove(e, game));
	game.canvas.addEventListener(
		'click', (e) =>
		handleCanvasClick(e, game));
	game.canvas.addEventListener(
		'mouseleave', () => {
			game.ghostTower = null;
		});
	document.getElementById(
			'start-wave')
		.addEventListener('click', () =>
			game.startNextWave());
}

// All other functions (selectTowerType, handleMouseMove, handleCanvasClick) remain the same as the previous version.

function selectTowerType(game, type,
	element) {
	if (game.selectedTowerType ===
		type) {
		game.selectedTowerType = null;
		game.ghostTower = null;
		element.classList.remove(
			'selected');
	} else {
		game.selectedTowerType = type;
		game.selectedTower = null;
		document.querySelectorAll(
				'.tower-option')
			.forEach(el => el.classList
				.remove('selected'));
		element.classList.add(
			'selected');
	}
}

function handleMouseMove(event, game) {
	if (!game.selectedTowerType) return;
	const rect = game.canvas
		.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	const gridX = Math.floor(x /
		TILE_SIZE);
	const gridY = Math.floor(y /
		TILE_SIZE);
	const towerConfig = TOWER_TYPES[game
		.selectedTowerType];
	game.ghostTower = {
		x: gridX * TILE_SIZE +
			TILE_SIZE / 2,
		y: gridY * TILE_SIZE +
			TILE_SIZE / 2,
		emoji: towerConfig.emoji,
		range: towerConfig
			.baseRange,
		isValid: isLocationValid(
			gridX, gridY, game)
	};
}

function handleCanvasClick(event,
game) {
	const rect = game.canvas
		.getBoundingClientRect();
	const mouseX = event.clientX - rect
		.left;
	const mouseY = event.clientY - rect
		.top;
	const gridX = Math.floor(mouseX /
		TILE_SIZE);
	const gridY = Math.floor(mouseY /
		TILE_SIZE);
	if (game.selectedTowerType) {
		if (isLocationValid(gridX,
				gridY, game)) {
			const cost = TOWER_TYPES[
					game
					.selectedTowerType]
				.cost;
			if (game.perutas >= cost) {
				game.showConfirmationModal(
					gridX, gridY,
					game
					.selectedTowerType
					);
			}
		}
	} else {
		const clickedTower = game
			.getTowerAt(mouseX, mouseY);
		if (clickedTower) {
			game.selectedTower =
				clickedTower;
			game.showUpgradeModal(
				clickedTower);
		} else {
			game.selectedTower = null;
			game.hideModal();
		}
	}
}





