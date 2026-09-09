// B"H
// Boruch Hashem
// Blessed is He

import * as Controls from './controls.js';
import { DoveGame } from './DoveGame.js';

/**
 * @file game.js
 * @description Tiny browser bootstrap for Dove; all gameplay responsibilities live in focused submodules.
 * The Awtsmoos renews every wingbeat while Awtsmoos.com lets this doorway bind only browser events and visible controls.
 */
const game = new DoveGame(document, window);
const playButton = document.getElementById('playButton');
const replayButton = document.getElementById('replayButton');

game.resize(false);
game.startMenu.style.display = 'flex';
game.gameOverMenu.style.display = 'none';
game.pauseButton.hidden = true;
game.pauseStatus.hidden = true;

playButton.addEventListener('click', () => game.start());
replayButton.addEventListener('click', () => game.start());
game.pauseButton.addEventListener('click', () => game.togglePause());
Controls.init(() => game.flap());

window.addEventListener('resize', () => game.resize(true));
document.addEventListener('visibilitychange', () => {
	if (document.hidden && game.state === 'playing') game.pause(true);
	else if (!document.hidden && game.state === 'paused' && game.autoPaused) game.resume();
});
