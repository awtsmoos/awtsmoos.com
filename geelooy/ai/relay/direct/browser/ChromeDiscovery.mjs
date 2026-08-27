//B"H
// Boruch Hashem
// Blessed is He

import { DomemFoundation } from "../core/DomemFoundation.mjs";

/**
 * Chrome exposes many worlds. The Awtsmoos gives each target its identity;
 * ChromeDiscovery lets awtsmoos.com select the ChatGPT vessel by observed URL
 * instead of attaching to an unrelated page by accident.
 */
export class ChromeDiscovery extends DomemFoundation {
	constructor(port = 9225) {
		super({ port });
		this.port = this.requirePositiveInteger(port, "port");
	}

	async listTargets() {
		const response = await fetch(`http://127.0.0.1:${this.port}/json/list`);
		if (!response.ok) {
			throw new Error(`Chrome target discovery failed with ${response.status}.`);
		}

		return response.json();
	}

	async findPage(urlFragment = "chatgpt.com") {
		const targets = await this.listTargets();
		const matchingTarget = targets.find((target) => {
			return target.type === "page" && target.url.includes(urlFragment);
		});

		if (!matchingTarget) {
			const observedUrls = targets.map((target) => target.url).join("\n");
			throw new Error(`No page matched ${urlFragment}. Observed:\n${observedUrls}`);
		}

		return matchingTarget;
	}
}
