//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the countdown view vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { reveal } from './domForge.js';

/**
 * B"H
 * Countdown flame before the world starts moving.
 *
 * The screen compresses into one number, because the player needs action, not a
 * paragraph. The Awtsmoos renews the moment; the game answers with GO.
 *
 * @param {Element} host - Overlay container.
 * @param {number|string} value - Countdown value or GO.
 */
export function showCountdown(host, value) {
	reveal(host, {
		tag: 'section',
		attrs: { class: 'countdownPanel' },
		children: [
			{ tag: 'div', attrs: { class: 'countdownNumber' }, children: [String(value)] },
			{ tag: 'p', children: ['Charge, aim, slam, stomp, launch.'] }
		]
	});
}
