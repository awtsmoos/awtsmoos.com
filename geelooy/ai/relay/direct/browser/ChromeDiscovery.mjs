//B"H
//Boruch Hashem
//Blessed be He

import { DomemFoundation } from "../core/DomemFoundation.mjs";
import { fetchJsonWithDeadline } from "./ChromeHttpDeadline.mjs";

/**
 * @file Reads one Chrome target catalog through the exact loopback authority.
 * @description
 * The Awtsmoos gives discovery a hard deadline so a wedged DevTools HTTP server
 * can never freeze mission orchestration. Every lookup remains bound to the one
 * supplied browser port and never falls through to another Chrome incarnation.
 */
export class ChromeDiscovery extends DomemFoundation {
	constructor(port = 9225, options = {}) {
		super({ port });
		this.port = this.requirePositiveInteger(port, "port");
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.timeoutMs = Math.max(500, Number(options.timeoutMs || 5000));
	}

	listTargets() {
		return fetchJsonWithDeadline({
			fetcher: this.fetcher,
			url: `http://127.0.0.1:${this.port}/json/list`,
			timeoutMs: this.timeoutMs
		});
	}
	async findPage(urlFragment = "chatgpt.com") {
		const targets = await this.listTargets();
		const matchingTarget = targets.find(target =>
			target.type === "page" && String(target.url || "").includes(urlFragment)
		);
		if (matchingTarget) return matchingTarget;
		const observedUrls = targets.map(target => target.url).join("\n");
		throw new Error(`No page matched ${urlFragment}. Observed:\n${observedUrls}`);
	}
}
