// B"H
import * as persistence from '../persistence.js';
import { LEVELS } from '../level-loader.js';

/**
 * The Creator laid out the stars in the heavens, each with its place and purpose.
 * This function populates the level selection grid, creating a constellation of choices
 * for the player to navigate.
 * @param {HTMLElement} gridElement The celestial plane (HTML element) upon which to place the levels.
 * @param {(levelId: number) => void} onSelectCallback The divine command to execute when a level is chosen.
 */
export async function populateLevelGrid(gridElement, onSelectCallback) {
    gridElement.innerHTML = '';
    const bestScores = await persistence.getBestScores();
    LEVELS.forEach(level => {
        const button = document.createElement('button');
        button.className = 'level-button';
        
        const bestScore = bestScores[level.id] || 0;
        let starsHTML = '';
        if (bestScore > 0) {
            starsHTML = `<div class="level-button-stars">${'✡'.repeat(bestScore)}</div>`;
        } else {
            starsHTML = `<div class="level-button-stars-placeholder"></div>`;
        }

        button.innerHTML = `
            ${starsHTML}
            <span class="level-id">${level.id}</span>
            <span class="level-name">${level.name}</span>
        `;
        button.addEventListener('click', () => onSelectCallback(level.id));
        gridElement.appendChild(button);
    });
}

export async function populateCustomLevelsList(listElement, onPlay, onEdit, onDelete, onExport) {
    const levels = await persistence.getCustomLevels();
    listElement.innerHTML = '';
    if (levels.length === 0) {
        listElement.innerHTML = `<p class="no-custom-levels">No custom levels yet. Create one!</p>`;
        return;
    }
    levels.forEach(level => {
        const item = document.createElement('div');
        item.className = 'custom-level-item';
        item.innerHTML = `
            <div class="custom-level-name">${level.name}</div>
            <div class="custom-level-buttons">
                <button class="btn-icon play" title="Play">▶️</button>
                <button class="btn-icon edit" title="Edit">✏️</button>
                <button class="btn-icon export" title="Export">📤</button>
                <button class="btn-icon delete" title="Delete">🗑️</button>
            </div>
        `;
        item.querySelector('.play').addEventListener('click', (e) => { e.stopPropagation(); onPlay(level.id); });
        item.querySelector('.edit').addEventListener('click', (e) => { e.stopPropagation(); onEdit(level.id); });
        item.querySelector('.delete').addEventListener('click', (e) => { e.stopPropagation(); onDelete(level.id); });
        item.querySelector('.export').addEventListener('click', (e) => { e.stopPropagation(); onExport(level.id); });
        
        // The entire item is a play button as a default action
        item.addEventListener('click', () => onPlay(level.id));
        
        listElement.appendChild(item);
    });
}