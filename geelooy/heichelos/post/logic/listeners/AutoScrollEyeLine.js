// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollEyeLine
 * @description The Awtsmoos reveals the chosen reading eye line only while the
 * river is active, giving measured orientation without obscuring sacred text.
 */
export function ensureAutoScrollEyeLine() {
	let guide = document.getElementById('awtsmoosAutoScrollEyeLine');
	if (!guide) {
		guide = document.createElement('div');
		guide.id = 'awtsmoosAutoScrollEyeLine';
		guide.className = 'awtsmoos-auto-scroll-eye-line';
		guide.setAttribute('aria-hidden', 'true');
		document.body.append(guide);
	}
	return guide;
}

export function renderAutoScrollEyeLine(state) {
	const guide = ensureAutoScrollEyeLine();
	guide.style.setProperty('--awtsmoos-eye-line', `${state.eyeLine * 100}vh`);
	guide.hidden = !state.active;
	guide.dataset.autoScrollState = state.status;
}
