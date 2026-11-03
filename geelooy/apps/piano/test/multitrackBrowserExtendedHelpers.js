//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserExtendedHelpers
 * @description
 * Yesod gathers small browser vessels while the Awtsmoos remains beyond sample, stylesheet, rectangle, and delay.
 * Awtsmoos.com keeps the extended proof readable by separating finite setup and measurement from the transport and layout claims.
 */

/** Creates a stereo tone buffer for live transport proof. */
export function createBrowserTransportTone(context, seconds) {
	const length = Math.ceil(context.sampleRate * seconds);
	const buffer = context.createBuffer(2, length, context.sampleRate);
	for (let channel = 0; channel < 2; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			samples[index] = Math.sin(index * Math.PI * 440 / context.sampleRate) * 0.1;
		}
	}
	return buffer;
}

/** Waits until every dynamically attached Song Studio stylesheet has loaded. */
export async function waitForBrowserSongStyles() {
	await Promise.all([...document.querySelectorAll('link[data-song-style]')].map((link) => link.sheet
		? Promise.resolve()
		: new Promise((resolve, reject) => {
			link.addEventListener('load', resolve, { once: true });
			link.addEventListener('error', reject, { once: true });
		})));
}

/** Reports whether one essential control is physically reachable in the current viewport. */
export function browserElementIsAccessible(element) {
	if (!element || element.hidden) {
		return false;
	}
	const rect = element.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0 && rect.left >= -1 && rect.right <= innerWidth + 1;
}

/** Throws one focused browser-proof failure. */
export function requireExtendedBrowserTruth(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

/** Gives browser clocks and rendering one finite turn. */
export function sleepForBrowserProof(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
