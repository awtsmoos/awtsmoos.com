// B"H

/** Desktop controls include play, pause, restart, mode cycling, surge, and level keys. */
export function bindKeyboard(world, actions) {
	const keys = new Set();
	addEventListener('keydown', event => keyDown(event, keys, world, actions));
	addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
	return () => pollKeys(keys, world);
}

function keyDown(event, keys, world, actions) {
	const key = event.key.toLowerCase();
	if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
	keys.add(key);
	if (event.code === 'Space') actions.pulse();
	if (event.key === 'Enter') actions.primary();
	if (key === 'r') actions.restart();
	if (key === 'p' || event.key === 'Escape') actions.pause();
	if (key === 'm' && world.mode !== 'playing') actions.cycleMode();
	if (/^[1-6]$/.test(key) && world.mode !== 'playing') actions.selectLevel(Number(key) - 1);
}

function pollKeys(keys, world) {
	world.input.x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
	world.input.y = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
}
