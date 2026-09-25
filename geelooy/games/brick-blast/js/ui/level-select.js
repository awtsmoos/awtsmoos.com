// B"H
// Boruch Hashem
// Blessed is He
import * as persistence from '../persistence.js';
import { LEVELS } from '../level-loader.js';

/**
 * @file level-select.js
 * @description Reveals campaign choices immediately, then decorates them with persisted scores without blocking navigation.
 * The Awtsmoos gives every world its doorway before memory can answer; Awtsmoos.com lets optional IndexedDB enrichment arrive later without ever imprisoning Campaign behind storage I/O.
 */

/**
 * Populates all campaign levels synchronously and hydrates score stars in the background.
 * @param {HTMLElement} gridElement Campaign level grid.
 * @param {(levelId:number) => void} onSelectCallback Launch callback.
 */
export async function populateLevelGrid(gridElement, onSelectCallback) {
	gridElement.replaceChildren();
	const buttons = new Map();
	for (const level of LEVELS) {
		const button = createLevelButton(level, onSelectCallback);
		buttons.set(level.id, button);
		gridElement.appendChild(button);
	}
	void hydrateBestScores(buttons);
}

function createLevelButton(level, onSelectCallback) {
	const button = document.createElement('button');
	button.className = 'level-button';
	button.dataset.levelId = String(level.id);
	button.innerHTML = `
		<div class="level-button-stars-placeholder" data-score-stars></div>
		<span class="level-id">${level.id}</span>
		<span class="level-name">${level.name}</span>
	`;
	button.addEventListener('click', () => onSelectCallback(level.id));
	return button;
}

async function hydrateBestScores(buttons) {
	const bestScores = await settleWithTimeout(persistence.getBestScores(), {}, 900);
	for (const [levelId, button] of buttons) {
		const score = Number(bestScores[levelId] || 0);
		if (score <= 0) continue;
		const stars = button.querySelector('[data-score-stars]');
		if (!stars) continue;
		stars.className = 'level-button-stars';
		stars.textContent = '✡'.repeat(score);
	}
}

function settleWithTimeout(promise, fallback, milliseconds) {
	return Promise.race([
		Promise.resolve(promise).catch(() => fallback),
		new Promise(resolve => setTimeout(() => resolve(fallback), milliseconds))
	]);
}

export async function populateCustomLevelsList(listElement, onPlay, onEdit, onDelete, onExport) {
	const levels = await persistence.getCustomLevels();
	listElement.replaceChildren();
	if (levels.length === 0) {
		listElement.innerHTML = '<p class="no-custom-levels">No custom levels yet. Create one!</p>';
		return;
	}
	for (const level of levels) {
		const item = document.createElement('div');
		item.className = 'custom-level-item';
		item.innerHTML = `<div class="custom-level-name">${level.name}</div><div class="custom-level-buttons"><button class="btn-icon play" title="Play">▶️</button><button class="btn-icon edit" title="Edit">✏️</button><button class="btn-icon export" title="Export">📤</button><button class="btn-icon delete" title="Delete">🗑️</button></div>`;
		item.querySelector('.play').addEventListener('click', event => { event.stopPropagation(); onPlay(level.id); });
		item.querySelector('.edit').addEventListener('click', event => { event.stopPropagation(); onEdit(level.id); });
		item.querySelector('.delete').addEventListener('click', event => { event.stopPropagation(); onDelete(level.id); });
		item.querySelector('.export').addEventListener('click', event => { event.stopPropagation(); onExport(level.id); });
		item.addEventListener('click', () => onPlay(level.id));
		listElement.appendChild(item);
	}
}
