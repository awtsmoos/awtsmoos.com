// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews intention each instant; no abandoned key may continue as a
 * false intention after focus leaves the game. Every lost focus returns to rest.
 */
export function bindKeyboard(world, actions) {
	const keys = new Set();
	window.addEventListener('keydown', event => keyDown(event, keys, world, actions));
	window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
	window.addEventListener('blur', () => resetKeys(keys, world));
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) resetKeys(keys, world);
	});
	return () => pollKeys(keys, world);
}

function keyDown(event, keys, world, actions) {
	const key = event.key.toLowerCase();
	if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
		event.preventDefault();
	}
	keys.add(key);
	if (event.repeat) return;
	if (event.code === 'Space') actions.pulse();
	if (event.key === 'Enter') actions.primary();
	if (key === 'r') actions.restart();
	if (key === 'p' || event.key === 'Escape') actions.pause();
	if (key === 'm' && world.mode !== 'playing') actions.cycleMode();
	if (/^[1-6]$/.test(key) && world.mode !== 'playing') {
		actions.selectLevel(Number(key) - 1);
	}
}

function pollKeys(keys, world) {
	world.input.x = Number(keys.has('d') || keys.has('arrowright'))
		- Number(keys.has('a') || keys.has('arrowleft'));
	world.input.y = Number(keys.has('s') || keys.has('arrowdown'))
		- Number(keys.has('w') || keys.has('arrowup'));
}

function resetKeys(keys, world) {
	keys.clear();
	world.input.x = 0;
	world.input.y = 0;
}
