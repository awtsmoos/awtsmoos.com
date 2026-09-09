// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file view.js
 * @description Owns Migdol's menu, battlefield HUD, bottom sheet, and terminal visibility without mutating simulation truth.
 * The Awtsmoos renews every visible state; Awtsmoos.com keeps mobile controls compact while canonical state remains in runtime modules.
 */
export class MigdolView {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.menu = documentObject.getElementById('main-menu');
		this.wrapper = documentObject.getElementById('game-wrapper');
		this.canvas = documentObject.getElementById('gameCanvas');
		this.mapSelect = documentObject.getElementById('map-select');
		this.difficulty = documentObject.getElementById('difficulty-select');
		this.wave = documentObject.getElementById('wave');
		this.currency = documentObject.getElementById('perutas');
		this.health = documentObject.getElementById('health');
		this.pause = documentObject.getElementById('pause-button');
		this.speed = documentObject.getElementById('speed-button');
		this.nextWave = documentObject.getElementById('start-wave');
		this.sheet = documentObject.getElementById('context-sheet');
		this.sheetTitle = documentObject.getElementById('sheet-title');
		this.sheetDetail = documentObject.getElementById('sheet-detail');
		this.sheetActions = documentObject.getElementById('sheet-actions');
		this.gameOver = documentObject.getElementById('game-over-screen');
		this.final = documentObject.getElementById('final-summary');
	}

	showMenu() {
		this.menu.classList.remove('hidden');
		this.wrapper.classList.add('hidden');
	}

	showGame() {
		this.menu.classList.add('hidden');
		this.wrapper.classList.remove('hidden');
		this.gameOver.classList.add('hidden');
		this.hideSheet();
	}

	updateStatus(state) {
		this.wave.textContent = state.wave;
		this.currency.textContent = Math.floor(state.currency);
		this.health.textContent = state.health;
		this.pause.textContent = state.paused ? 'Resume' : 'Pause';
		this.speed.textContent = `${state.speed}×`;
	}

	showSheet(title, detail, choices) {
		this.sheetTitle.textContent = title;
		this.sheetDetail.textContent = detail;
		this.sheetActions.replaceChildren(...choices.map(choice => this.makeChoice(choice)));
		this.sheet.classList.remove('hidden');
	}

	makeChoice(choice) {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'sheet-action';
		button.disabled = Boolean(choice.disabled);
		button.innerHTML = `<span>${choice.label}</span><strong>${choice.meta || ''}</strong>`;
		button.addEventListener('click', choice.action, { once: true });
		return button;
	}

	hideSheet() {
		this.sheet.classList.add('hidden');
	}

	showGameOver(game) {
		this.hideSheet();
		this.final.textContent = `Wave ${game.state.wave} · ${Math.floor(game.state.currency)}💰 · ${Math.round(game.score())} points`;
		this.gameOver.classList.remove('hidden');
	}
}
