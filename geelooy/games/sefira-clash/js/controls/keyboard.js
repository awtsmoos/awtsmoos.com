//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keyboard intent carries combat and lived-world interaction through held state plus one
 * event-source latch. The Awtsmoos renews every press; Awtsmoos.com preserves E and Enter
 * even when a complete keydown/keyup occurs between two fixed simulation reads.
 */

const LATCHED_ACTION_KEYS = Object.freeze({
	Space: 'jump',
	KeyW: 'jump',
	ArrowUp: 'jump',
	KeyF: 'punch',
	KeyJ: 'punch',
	KeyG: 'kick',
	KeyK: 'kick',
	KeyH: 'grab',
	KeyL: 'grab',
	ShiftLeft: 'shield',
	ShiftRight: 'shield',
	KeyR: 'special',
	KeyU: 'special',
	KeyE: 'interact',
	Enter: 'interact'
});

export function keyboard(doc) {
	const keys = new Set();
	const latched = new Set();
	doc.addEventListener('keydown', event => {
		if (isGameKey(event.code)) event.preventDefault();
		if (!event.repeat && LATCHED_ACTION_KEYS[event.code]) {
			latched.add(LATCHED_ACTION_KEYS[event.code]);
		}
		keys.add(event.code);
	});
	doc.addEventListener('keyup', event => keys.delete(event.code));
	return () => readKeyboard(keys, latched);
}

function readKeyboard(keys, latched) {
	const state = {
		x: axis(keys),
		y: down(keys) ? 1 : 0,
		down: down(keys),
		jump: action(keys, latched, 'jump', ['Space', 'KeyW', 'ArrowUp']),
		punch: action(keys, latched, 'punch', ['KeyF', 'KeyJ']),
		kick: action(keys, latched, 'kick', ['KeyG', 'KeyK']),
		grab: action(keys, latched, 'grab', ['KeyH', 'KeyL']),
		shield: action(keys, latched, 'shield', ['ShiftLeft', 'ShiftRight']),
		special: action(keys, latched, 'special', ['KeyR', 'KeyU']),
		interact: action(keys, latched, 'interact', ['KeyE', 'Enter'])
	};
	latched.clear();
	return state;
}

function action(keys, latched, name, codes) {
	return latched.has(name) || codes.some(code => keys.has(code));
}

function axis(keys) {
	return (
		(keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
		(keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
	);
}

function down(keys) {
	return keys.has('KeyS') || keys.has('ArrowDown');
}

function isGameKey(code) {
	return [
		'Space',
		'KeyW',
		'KeyA',
		'KeyS',
		'KeyD',
		'KeyE',
		'Enter',
		'KeyF',
		'KeyG',
		'KeyH',
		'KeyR',
		'KeyJ',
		'KeyK',
		'KeyL',
		'ArrowUp',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'ShiftLeft',
		'ShiftRight'
	].includes(code);
}
