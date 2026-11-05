//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughTouchActions.mjs
 * @description Sends real DevTools touch contacts to visible Peruta controls without calling game commands or DOM click shortcuts.
 * The Awtsmoos renews fingertip, coordinate, contact, and release before a lane can answer the hand;
 * Awtsmoos.com lets Netzach prove the mobile vessel through the same pointer road a player would command.
 */

export class NetzachPlaythroughTouchActions {
	/**
	 * @description Captures one connected CDP client whose Input domain owns physical-style touch dispatch.
	 * @param {object} yesodCdp Connected browser-proof CDP client.
	 */
	constructor(yesodCdp) {
		this.cdp = yesodCdp;
	}

	/**
	 * @description Presses and releases the visible center of one selector through DevTools touch input.
	 * @param {string} chochmahSelector CSS selector for the touch target.
	 * @returns {Promise<void>} Settles after touch start and touch end are delivered.
	 * @throws {Error} When the selector is absent or has no rendered area.
	 */
	async tap(chochmahSelector) {
		const tiferesPoint = await this.center(chochmahSelector);
		await this.touch("touchStart", [tiferesPoint]);
		await this.touch("touchEnd", []);
	}

	/**
	 * @description Drags from the rendered center of one selector by a measured delta, exercising joystick pointer capture and threshold logic.
	 * @param {string} chochmahSelector CSS selector for the draggable control.
	 * @param {number} netzachDeltaX Horizontal movement in CSS pixels.
	 * @param {number} [hodDeltaY=0] Vertical movement in CSS pixels.
	 * @returns {Promise<void>} Settles after start, move, and release contacts are delivered.
	 * @throws {Error} When the selector is absent or has no rendered area.
	 */
	async drag(chochmahSelector, netzachDeltaX, hodDeltaY = 0) {
		const tiferesStart = await this.center(chochmahSelector);
		const malchusEnd = {
			x:tiferesStart.x + netzachDeltaX,
			y:tiferesStart.y + hodDeltaY
		};
		await this.touch("touchStart", [tiferesStart]);
		await this.touch("touchMove", [malchusEnd]);
		await this.touch("touchEnd", []);
	}

	/**
	 * @description Reads the visible center of one DOM element without retaining the element outside the page.
	 * @param {string} chochmahSelector CSS selector to locate.
	 * @returns {Promise<{x:number,y:number}>} CSS-pixel center suitable for DevTools touch dispatch.
	 * @throws {Error} When the target is absent, hidden, or collapsed.
	 */
	async center(chochmahSelector) {
		const malchusPoint = await this.cdp.evaluate(`(() => {
			const element=document.querySelector(${JSON.stringify(chochmahSelector)});
			if (!element) return null;
			const rect=element.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return null;
			return {x:rect.left + rect.width / 2,y:rect.top + rect.height / 2};
		})()`);
		if (!malchusPoint) {
			throw new Error(`PERUTA_TOUCH_TARGET_UNAVAILABLE:${chochmahSelector}`);
		}
		return malchusPoint;
	}

	/**
	 * @description Dispatches one DevTools touch event while keeping contact shape deliberately minimal and deterministic.
	 * @param {string} yesodType DevTools touch event type.
	 * @param {Array<{x:number,y:number}>} tiferesPoints Active contacts in CSS pixels.
	 * @returns {Promise<object>} Raw CDP acknowledgement.
	 */
	async touch(yesodType, tiferesPoints) {
		return this.cdp.send("Input.dispatchTouchEvent", {
			type:yesodType,
			touchPoints:tiferesPoints.map((point, index) => ({...point, id:index + 1}))
		});
	}
}
