//B"H

import { TILE_SIZE, TOWER_TYPES } from './config.js';

export function setupUI(game) {
    const towerSelectionDiv = document.getElementById('tower-selection');
    
    // Create tower selection buttons
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
        towerSelectionDiv.appendChild(option);
    }
    
    // --- Event Listeners ---
    game.canvas.addEventListener('mousemove', (e) => handleMouseMove(e, game));
    game.canvas.addEventListener('click', (e) => handleCanvasClick(e, game));
    game.canvas.addEventListener('mouseleave', () => { game.ghostTower = null; });
    document.getElementById('start-wave').addEventListener('click', () => game.startNextWave());
}

function selectTowerType(game, type, element) {
    // Deselect if clicking the same tower
    if (game.selectedTowerType === type) {
        game.selectedTowerType = null;
        game.ghostTower = null; // Hide ghost tower
        element.classList.remove('selected');
    } else {
        game.selectedTowerType = type;
        game.selectedTower = null; // Deselect any placed tower
        document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }
}

function handleMouseMove(event, game) {
    if (!game.selectedTowerType) return;

    const rect = game.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
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
    const rect = game.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const gridX = Math.floor(mouseX / TILE_SIZE);
    const gridY = Math.floor(mouseY / TILE_SIZE);

    if (game.selectedTowerType) {
        if (isLocationValid(gridX, gridY, game)) {
            const cost = TOWER_TYPES[game.selectedTowerType].cost;
            if (game.perutas >= cost) {
                game.showConfirmationModal(gridX, gridY, game.selectedTowerType);
            }
        }
    } else {
        // Attempt to select an existing tower
        const clickedTower = game.getTowerAt(mouseX, mouseY);
        if (clickedTower) {
            game.selectedTower = clickedTower;
            game.showUpgradeModal(clickedTower);
        } else {
            // Clicked on empty space, deselect everything
            game.selectedTower = null;
            game.hideModal();
        }
    }
}

export function isLocationValid(gridX, gridY, game) {
    // Check bounds
    if (gridX < 0 || gridX >= (game.canvas.width / TILE_SIZE) || gridY < 0 || gridY >= (game.canvas.height / TILE_SIZE)) {
        return false;
    }
    // Check if tile is on the path
    for (let i = 0; i < game.path.length - 1; i++) {
        const start = game.path[i];
        const end = game.path[i+1];
        if (start.x === end.x && gridX === start.x && gridY >= Math.min(start.y, end.y) && gridY <= Math.max(start.y, end.y)) return false;
        if (start.y === end.y && gridY === start.y && gridX >= Math.min(start.x, end.x) && gridX <= Math.max(start.x, end.x)) return false;
    }
    // Check if another tower is there
    return !game.towers.some(t => Math.floor(t.x / TILE_SIZE) === gridX && Math.floor(t.y / TILE_SIZE) === gridY);
}