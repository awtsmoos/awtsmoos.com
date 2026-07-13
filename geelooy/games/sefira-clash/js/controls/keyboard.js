//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the keyboard vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Keyboard gates for sane desktop fighting.
 *
 * Chapter 70: broken controls are exile. This file restores the covenant:
 * F punches immediately, G kicks immediately, H grabs, Shift shields, R is
 * special, W/Space jump, S/Down reads as down for fast-fall and short-hop.
 */
export function keyboard(doc) {
	const keys = new Set();
	doc.addEventListener('keydown', event => {
		if (isGameKey(event.code)) event.preventDefault();
		keys.add(event.code);
	});
	doc.addEventListener('keyup', event => keys.delete(event.code));
	return () => ({
		x: axis(keys),
		y: down(keys) ? 1 : 0,
		down: down(keys),
		jump: keys.has('Space') || keys.has('KeyW') || keys.has('ArrowUp'),
		punch: keys.has('KeyF') || keys.has('KeyJ'),
		kick: keys.has('KeyG') || keys.has('KeyK'),
		grab: keys.has('KeyH') || keys.has('KeyL'),
		shield: keys.has('ShiftLeft') || keys.has('ShiftRight'),
		special: keys.has('KeyR') || keys.has('KeyU')
	});
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
