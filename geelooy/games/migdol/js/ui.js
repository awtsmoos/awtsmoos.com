//B"H

import { TILE_SIZE, TOWER_TYPES } from './config.js';
import { isLocationValid } from './utils.js';

function getCanvasCoordinates(event, game) {
    const rect = game.canvas.getBoundingClientRect();
    const scaleX = game.canvas.width / rect.width;
    const scaleY = game.canvas.height / rect.height;

    let clientX, clientY;

    // Use touches for active touch events (like touchmove)
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    // Use changedTouches for ended touch events (like touchend)
    } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        // Fallback for mouse events
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
}

export function setupUI(game) {
	document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });

	const towerOptionsContentDiv = document.getElementById('tower-options-content');
	towerOptionsContentDiv.innerHTML = ''; 
	for (const type in TOWER_TYPES) {
		const config = TOWER_TYPES[type];
		const option = document.createElement('div');
		option.classList.add('tower-option');
		option.dataset.type = type;
		option.innerHTML = `
            <span class="emoji">${config.emoji}</span>
            <span class="name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="cost">${config.cost} 💰</span>
        `;
		option.addEventListener('click', () => selectTowerType(game, type, option));
		towerOptionsContentDiv.appendChild(option);
	}

	game.canvas.addEventListener('mousemove', (e) => handleMouseMove(e, game));
	game.canvas.addEventListener('click', (e) => handleCanvasClick(e, game));
	game.canvas.addEventListener('mouseleave', () => { game.ghostTower = null; });
    
    game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleMouseMove(e, game);
    }, { passive: false });

    game.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleCanvasClick(e, game);
    });

	document.getElementById('start-wave').onclick = () => game.startNextWave();
}

function selectTowerType(game, type, element) {
	if (game.selectedTowerType === type) {
		game.selectedTowerType = null;
		game.ghostTower = null;
		element.classList.remove('selected');
	} else {
		game.selectedTowerType = type;
		game.selectedTower = null;
        game.hideModal();
		document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
		element.classList.add('selected');
	}
}

function handleMouseMove(event, game) {
	if (!game.selectedTowerType) return;
	
    const { x, y } = getCanvasCoordinates(event, game);
	const gridX = Math.floor(x / TILE_SIZE);
	const gridY = Math.floor(y / TILE_SIZE);

	const towerConfig = TOWER_TYPES[game.selectedTowerType];
	game.ghostTower = {
		x: gridX * TILE_SIZE + TILE_SIZE / 2,
		y: gridY * TILE_SIZE + TILE_SIZE / 2,
		emoji: towerConfig.emoji,
		range: towerConfig.baseRange,
		isValid: isLocationValid(gridX, gridY, game)
	};
}

function handleCanvasClick(event, game) {
    const { x, y } = getCanvasCoordinates(event, game);
	const gridX = Math.floor(x / TILE_SIZE);
	const gridY = Math.floor(y / TILE_SIZE);

	if (game.selectedTowerType) {
		if (isLocationValid(gridX, gridY, game)) {
			const cost = TOWER_TYPES[game.selectedTowerType].cost;
			if (game.perutas >= cost) {
				game.showConfirmationModal(gridX, gridY, game.selectedTowerType);
			} else {
                game.showEventMessage('Not enough 💰!', { x, y });
            }
		}
	} else {
		const clickedTower = game.getTowerAt(x, y);
		if (clickedTower) {
			game.showUpgradeModal(clickedTower);
		} else {
			game.selectedTower = null;
			game.hideModal();
		}
	}
}