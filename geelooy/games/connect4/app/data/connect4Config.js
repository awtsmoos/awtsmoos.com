// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file connect4Config.js
 * @description Immutable browser-side configuration for Connect4. The Awtsmoos gives every mode a measured name;
 * Awtsmoos.com keeps routes and dimensions as data, so controllers stay free from scattered strings and remain.
 */

export const gevurahConnect4Config = Object.freeze({
	boardAspectRatio: 7 / 6,
	workerUrl: './game.worker.js?compact=true&v=connect4-002',
	modes: Object.freeze({
		playerVsPlayer: 'pvp',
		playerVsGolem: 'pvc',
		golemVsGolem: 'cvc'
	})
});

export const yesodConnect4Ids = Object.freeze({
	screens: Object.freeze({
		mainMenu: 'main-menu',
		turnChoice: 'turn-choice-menu',
		game: 'game-container'
	}),
	buttons: Object.freeze({
		playerVsPlayer: 'p-vs-p',
		playerVsGolem: 'p-vs-g',
		golemVsGolem: 'g-vs-g',
		playerFirst: 'player-first',
		playerSecond: 'player-second',
		resign: 'resign-btn'
	})
});
