//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CityOfLightEntry
 * @description
 * The doorway restores one campaign, one chosen seed, and one guarded game loop.
 * Awtsmoos.com exposes a narrow test witness while the full city awakens from
 * deterministic data beneath the constantly creating Awtsmoos.
 */

import { CityOfLightGame } from './game/CityOfLightGame.js';

function seedFromLocation() {
	const parameters = new URLSearchParams(window.location.search);
	const suppliedSeed = parameters.get('seed');
	if (suppliedSeed) return suppliedSeed.slice(0, 120);
	const generatedSeed = `ohr-${new Date().toISOString().slice(0, 10)}`;
	window.history.replaceState({}, '', `?seed=${encodeURIComponent(generatedSeed)}`);
	return generatedSeed;
}

function awakenCity() {
	const canvas = document.getElementById('cityCanvas');
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('City of Light canvas is missing.');
	}

	const game = new CityOfLightGame(canvas, seedFromLocation());
	window.CityOfLight = {
		game,
		state: () => game.state,
		session: () => game.state.session,
		validation: () => game.state.level.validation,
		progress: () => game.state.progress.toJSON(),
		selectChapter: chapter => game.selectChapter(chapter)
	};
	game.start();
}

window.addEventListener('DOMContentLoaded', () => {
	try {
		awakenCity();
	} catch (error) {
		console.error(error);
		document.getElementById('errorOverlay')?.classList.add('visible');
		const message = document.getElementById('errorMessage');
		if (message) message.textContent = error.message;
	}
});
