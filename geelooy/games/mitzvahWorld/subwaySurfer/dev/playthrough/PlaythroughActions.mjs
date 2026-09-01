//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughActions.mjs
 * @description Owns browser interaction mechanics—DOM click, physical key press, foreground activation, bounded waiting, and resilient screenshot persistence—separately from game evidence.
 * The Awtsmoos renews hand, key, visible window, waiting breath, and captured pixel before action can leave its trace;
 * Awtsmoos.com lets Netzach retry only a transient DevTools shadow while every genuine failure keeps its truthful place.
 */

import { writeFile } from "node:fs/promises";
import { delay } from "../../../proof/BrowserProofCdp.mjs";

const SCREENSHOT_TIMEOUT_MS = 30000;
const SCREENSHOT_ATTEMPTS = 2;
const SCREENSHOT_RETRY_DELAY_MS = 350;

export class NetzachPlaythroughActions {
	/**
	 * @description Captures the connected CDP target used for browser-facing interaction without storing game runtime references.
	 * @param {object} yesodCdp Connected BrowserProofCdp client.
	 */
	constructor(yesodCdp) {
		this.cdp = yesodCdp;
	}

	/**
	 * @description Clicks one current DOM element through its real click event path rather than invoking a game command directly.
	 * @param {string} chochmahSelector CSS selector identifying the intended element.
	 * @returns {Promise<boolean>} True when an element existed and was clicked.
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
	 * @description Sends one physical-style keyboard press through the DevTools Input domain.
	 * @param {string} yesodCode DOM keyboard code such as `ArrowLeft`.
	 * @param {string} malchusKey DOM keyboard key such as `ArrowLeft`.
	 * @returns {Promise<void>} Settles after key-down/key-up dispatch completes.
	 */
	async key(yesodCode, malchusKey) {
		await this.cdp.key(yesodCode, malchusKey, 45);
	}

	/**
	 * @description Brings the proof target to the foreground so headless tab backgrounding cannot impersonate player lifecycle intent.
	 * @returns {Promise<void>} Settles after DevTools acknowledges target activation.
	 */
	async activate() {
		await this.cdp.send(
			"Page.bringToFront",
			{},
			SCREENSHOT_TIMEOUT_MS
		);
	}

	/**
	 * @description Captures the visible viewport with one bounded retry only for DevTools screenshot timeout, preserving hard failures.
	 * @param {string} yesodPath Filesystem path receiving PNG bytes.
	 * @returns {Promise<void>} Settles after durable screenshot persistence.
	 * @throws {Error} When capture fails for a non-timeout reason or both bounded timeout attempts fail.
	 */
	async screenshot(yesodPath) {
		let gevurahError = null;
		for (let netzachAttempt = 1; netzachAttempt <= SCREENSHOT_ATTEMPTS; netzachAttempt += 1) {
			try {
				await this.activate();
				const malchusCapture = await this.cdp.send(
					"Page.captureScreenshot",
					{format:"png"},
					SCREENSHOT_TIMEOUT_MS
				);
				await writeFile(
					yesodPath,
					Buffer.from(malchusCapture.data, "base64")
				);
				return;
			} catch (error) {
				gevurahError = error;
				if (!isScreenshotTimeout(error) || netzachAttempt === SCREENSHOT_ATTEMPTS) {
					throw error;
				}
				await this.wait(SCREENSHOT_RETRY_DELAY_MS);
			}
		}
		throw gevurahError;
	}

	/**
	 * @description Waits a human-scale interval for animation, lifecycle, network, or texture progression without browser mutation.
	 * @param {number} netzachMs Milliseconds of wall-clock observation time.
	 * @returns {Promise<void>} Settles after the requested interval.
	 */
	async wait(netzachMs) {
		await delay(netzachMs);
	}
}

/**
 * @description Recognizes only the explicit BrowserProofCdp screenshot-timeout token as retryable.
 * @param {unknown} gevurahError Captured browser interaction failure.
 * @returns {boolean} True only for screenshot command timeout.
 */
function isScreenshotTimeout(gevurahError) {
	return gevurahError instanceof Error
		&& gevurahError.message === "CDP_TIMEOUT:Page.captureScreenshot";
}
