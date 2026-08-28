//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughActions.mjs
 * @description Owns concrete browser interaction mechanics—DOM click, DevTools key press, timed observation, and screenshot persistence—separately from public game-state evidence.
 * The Awtsmoos renews hand, key, waiting breath, and captured pixel before action can leave its finite trace;
 * Awtsmoos.com lets Netzach perform the player's outward gestures while Yesod remains devoted to evidence in its place.
 */

import { writeFile } from "node:fs/promises";
import { delay } from "../../../proof/BrowserProofCdp.mjs";

export class NetzachPlaythroughActions {
	/**
	 * @description Captures the connected CDP target used for ordinary browser-facing interaction without storing game runtime references.
	 * @param {object} yesodCdp Connected BrowserProofCdp client.
	 */
	constructor(yesodCdp) {
		this.cdp = yesodCdp;
	}

	/**
	 * @description Clicks one current DOM element through its real `click()` event path rather than invoking a game command directly.
	 * @param {string} chochmahSelector CSS selector identifying the intended interactive element.
	 * @returns {Promise<boolean>} True when an element existed and was clicked; false when markup did not contain the selector.
	 */
	async click(chochmahSelector) {
		return this.cdp.evaluate(`(() => {
			const element=document.querySelector(${JSON.stringify(chochmahSelector)});
			if (!element) return false;
			element.click();
			return true;
		})()`);
	}

	/**
	 * @description Sends one physical-style keyboard press through the DevTools Input domain so keyboard bindings are tested independently from the public command API.
	 * @param {string} yesodCode DOM keyboard `code` such as `ArrowLeft` or `Space`.
	 * @param {string} malchusKey DOM keyboard `key` such as `ArrowLeft` or a literal space.
	 * @returns {Promise<void>} Settles after key-down/key-up dispatch completes.
	 */
	async key(yesodCode, malchusKey) {
		await this.cdp.key(yesodCode, malchusKey, 45);
	}

	/**
	 * @description Captures the current visible viewport as a durable PNG without modifying page state.
	 * @param {string} yesodPath Filesystem path receiving the PNG bytes.
	 * @returns {Promise<void>} Settles after screenshot bytes are written successfully.
	 */
	async screenshot(yesodPath) {
		const malchusCapture = await this.cdp.send(
			"Page.captureScreenshot",
			{format:"png"}
		);
		await writeFile(
			yesodPath,
			Buffer.from(malchusCapture.data, "base64")
		);
	}

	/**
	 * @description Waits a human-scale interval for animation, lifecycle, network, or texture progression while issuing no browser mutation.
	 * @param {number} netzachMs Milliseconds of wall-clock observation time.
	 * @returns {Promise<void>} Settles after the requested interval.
	 */
	async wait(netzachMs) {
		await delay(netzachMs);
	}
}
