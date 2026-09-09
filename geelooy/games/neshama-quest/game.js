// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file game.js
 * @description Tiny browser bootstrap for modular Neshama Quest lifecycle, retry, pause, and visibility behavior.
 * The Awtsmoos renews the whole game beyond this doorway; Awtsmoos.com keeps startup readable and finite.
 */
const game = new globalThis.NeshamaQuestGame(document);
const retryButton = document.getElementById('retryButton');
let pausedForVisibility = false;

game.pauseButton.addEventListener('click', () => game.togglePause());
retryButton.addEventListener('click', () => game.startRun());

document.addEventListener('visibilitychange', () => {
	if (document.hidden && game.state === 'playing') {
		pausedForVisibility = true;
		game.togglePause();
		return;
	}
	if (!document.hidden && pausedForVisibility && game.state === 'paused') {
		pausedForVisibility = false;
		game.resume();
	}
});

game.startRun();
game.showMessage('Swipe the maze or use Arrow Keys / WASD');
