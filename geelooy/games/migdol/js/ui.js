//B"H

import { TILE_SIZE, TOWER_TYPES } from './config.js';
import Tower from './tower.js';

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
        option.addEventListener('click', () => {
            selectTowerType(game, type, option);
        });
        towerSelectionDiv.appendChild(option);
    }
    
    // Handle clicks on the canvas
    game.canvas.addEventListener('click', (e) => handleCanvasClick(e, game));
    
    // Start wave button
    document.getElementById('start-wave').addEventListener('click', () => {
        game.startNextWave();
    });
    
    // Upgrade buttons
    document.getElementById('upgrade-damage').addEventListener('click', () => game.upgradeSelectedTower('damage'));
    document.getElementById('upgrade-speed').addEventListener('click', () => game.upgradeSelectedTower('speed'));
    document.getElementById('upgrade-range').addEventListener('click', () => game.upgradeSelectedTower('range'));
    document.getElementById('sell-tower').addEventListener('click', () => game.sellSelectedTower());
}

function selectTowerType(game, type, element) {
    if (game.selectedTowerType === type) {
        game.selectedTowerType = null;
        document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
    } else {
        game.selectedTowerType = type;
        document.querySelectorAll('.tower-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }
}

function handleCanvasClick(event, game) {
    const rect = game.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    if (game.selectedTowerType) {
        // Attempt to place a tower
        const cost = TOWER_TYPES[game.selectedTowerType].cost;
        if (game.perutas >= cost && isLocationValid(gridX, gridY, game)) {
            game.addTower(gridX, gridY, game.selectedTowerType);
        }
    } else {
        // Attempt to select an existing tower
        game.selectTowerAt(x, y);
    }
}

function isLocationValid(gridX, gridY, game) {
    // Check if tile is on the path
    for (let i = 0; i < game.path.length - 1; i++) {
        const start = game.path[i];
        const end = game.path[i + 1];
        if (start.x === end.x && gridX === start.x && gridY >= Math.min(start.y, end.y) && gridY <= Math.max(start.y, end.y)) return false;
        if (start.y === end.y && gridY === start.y && gridX >= Math.min(start.x, end.x) && gridX <= Math.max(start.x, end.x)) return false;
    }
    // Check if another tower is there
    for (const tower of game.towers) {
        if (Math.floor(tower.x / TILE_SIZE) === gridX && Math.floor(tower.y / TILE_SIZE) === gridY) return false;
    }
    return true;
}