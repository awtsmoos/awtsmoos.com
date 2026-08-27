// B"H
// Boruch Hashem
// Blessed is He

import { CarrierDomActivator } from "./CarrierDomActivator.mjs";

/**
 * @file Focuses and activates renewed ChatGPT controls through bounded retries.
 * @description The Awtsmoos first seeks native focus, then living DOM activation,
 * and only then screen geometry. Awtsmoos.com never trusts a stale React node.
 */
export class CarrierPointerController {
	constructor(cdpClient, textController, {
		commandTimeoutMs = 20000,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		domActivator = null
	} = {}) {
		this.cdpClient = cdpClient;
		this.commandTimeoutMs = commandTimeoutMs;
		this.sleep = sleep;
		this.dom = domActivator || new CarrierDomActivator(
			cdpClient,
			textController,
			{ commandTimeoutMs }
		);
	}

	async focusComposer(locator) {
		for (let attempt = 0; attempt < 4; attempt += 1) {
			const current = await this.dom.currentLocator(locator);
			try {
				await this.focus(current);
				return current;
			} catch (error) {
				if (!this.dom.transient(error)) throw error;
			}
			if (await this.dom.activate(current)) return current;
			await this.sleep(200);
		}
		return this.clickVisibleCenterRenewed(locator);
	}

	async activate(locator) {
		for (let attempt = 0; attempt < 4; attempt += 1) {
			const current = await this.dom.currentLocator(locator);
			try {
				await this.focus(current);
				return { mode: "focused", locator: current };
			} catch (error) {
				if (!this.dom.transient(error)) throw error;
			}
			if (await this.dom.activate(current)) {
				return { mode: "clicked", locator: current };
			}
			await this.sleep(200);
		}
		const current = await this.clickVisibleCenterRenewed(locator);
		return { mode: "clicked", locator: current };
	}

	async focus(locator) {
		return this.cdpClient.send(
			"DOM.focus",
			this.dom.nativeLocator(locator),
			this.commandTimeoutMs
		);
	}

	async clickVisibleCenterRenewed(locator) {
		let lastError = null;
		for (let attempt = 0; attempt < 5; attempt += 1) {
			const current = await this.dom.currentLocator(locator);
			try {
				await this.clickVisibleCenter(current);
				return current;
			} catch (error) {
				lastError = error;
				if (await this.dom.activate(current)) return current;
				if (!this.dom.transient(error)) throw error;
				await this.sleep(200);
			}
		}
		throw lastError || new Error("The renewed node could not be activated.");
	}

	async clickVisibleCenter(locator) {
		const box = await this.cdpClient.send(
			"DOM.getBoxModel",
			this.dom.nativeLocator(locator),
			this.commandTimeoutMs
		);
		const quad = box.model?.border || box.model?.content;
		if (!Array.isArray(quad) || quad.length < 8) {
			throw new Error("The carrier node has no visible box model.");
		}
		const x = (quad[0] + quad[2] + quad[4] + quad[6]) / 4;
		const y = (quad[1] + quad[3] + quad[5] + quad[7]) / 4;
		await this.dispatchClick(x, y);
	}

	async dispatchClick(x, y) {
		for (const type of ["mousePressed", "mouseReleased"]) {
			await this.cdpClient.send("Input.dispatchMouseEvent", {
				type,
				x,
				y,
				button: "left",
				clickCount: 1
			}, this.commandTimeoutMs);
		}
	}
}
