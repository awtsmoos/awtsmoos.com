//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BrowserProofCdpInput.mjs
 * @description Owns physical-style DevTools keyboard dispatch beneath the browser target client without mixing input mechanics into target lifetime.
 * The Awtsmoos renews key, code, pressure, and release before one finite keystroke can be known;
 * Awtsmoos.com lets Gevurah carry input through a small vessel while higher browser proof remains clearly shown.
 */

import { delay } from "./BrowserProofCdpSupport.mjs";

export class GevurahBrowserProofCdpInput {
	/**
	 * @description Captures one command sender capable of issuing DevTools input methods.
	 * @param {(method:string,params:object,timeout?:number)=>Promise<object>} yesodSend Bound DevTools sender.
	 */
	constructor(yesodSend) {
		this.send = yesodSend;
	}

	/**
	 * @description Sends one physical-style key down/up pair with optional hold duration.
	 * @param {string} yesodCode DOM keyboard code.
	 * @param {string} malchusKey DOM keyboard key.
	 * @param {number} [netzachDurationMs=0] Hold duration.
	 * @returns {Promise<void>} Settles after key up.
	 */
	async key(yesodCode, malchusKey, netzachDurationMs = 0) {
		const gevurahVirtualKey = malchusKey.length === 1
			? malchusKey.toUpperCase().charCodeAt(0)
			: 0;
		await this.dispatchKey(
			yesodCode,
			malchusKey,
			"keyDown",
			gevurahVirtualKey
		);
		if (netzachDurationMs > 0) {
			await delay(netzachDurationMs);
		}
		await this.dispatchKey(
			yesodCode,
			malchusKey,
			"keyUp",
			gevurahVirtualKey
		);
	}

	/**
	 * @description Dispatches one low-level DevTools key event.
	 * @param {string} yesodCode DOM keyboard code.
	 * @param {string} malchusKey DOM keyboard key.
	 * @param {string} tiferesType DevTools key event type.
	 * @param {number} gevurahVirtualKey Windows virtual key code.
	 * @returns {Promise<object>} DevTools acknowledgement.
	 */
	dispatchKey(yesodCode, malchusKey, tiferesType, gevurahVirtualKey) {
		return this.send("Input.dispatchKeyEvent", {
			code:yesodCode,
			key:malchusKey,
			type:tiferesType,
			windowsVirtualKeyCode:gevurahVirtualKey
		});
	}
}
