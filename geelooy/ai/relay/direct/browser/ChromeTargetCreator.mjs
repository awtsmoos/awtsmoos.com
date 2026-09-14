//B"H
//Boruch Hashem
//Blessed be He

import { fetchJsonWithDeadline } from "./ChromeHttpDeadline.mjs";

/**
 * @file Creates one disposable Chrome target without blind retries.
 * @description
 * The Awtsmoos snapshots target identity before creation. If Chrome creates the
 * page but withholds the HTTP response, Awtsmoos.com rediscovers and adopts only
 * one unambiguous new blank target; ambiguity fails closed instead of duplicating.
 */
export class ChromeTargetCreator {
	constructor({ port, discovery, fetcher, timeoutMs = 5000 } = {}) {
		this.port = port;
		this.discovery = discovery;
		this.fetcher = fetcher;
		this.timeoutMs = Math.max(500, Number(timeoutMs) || 5000);
	}

	async create() {
		const baseline = await this.discovery.listTargets();
		const knownIds = new Set(baseline.map(target => target.id));
		try {
			return await fetchJsonWithDeadline({
				fetcher: this.fetcher,
				url: this.endpoint(),
				method: "PUT",
				timeoutMs: this.timeoutMs
			});
		} catch (error) {
			return this.reconcile(knownIds, error);
		}
	}
	async reconcile(knownIds, originalError) {
		const targets = await this.discovery.listTargets();
		const created = targets.filter(target =>
			!knownIds.has(target.id) && isBlankPage(target)
		);
		if (created.length === 1) return created[0];
		const code = created.length > 1
			? "chrome_target_creation_ambiguous"
			: "chrome_target_creation_failed";
		throw codedError(code, originalError, created.map(target => target.id));
	}

	endpoint() {
		return `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
	}
}

function isBlankPage(target = {}) {
	return target.type === "page" &&
		typeof target.webSocketDebuggerUrl === "string" &&
		["about:blank", "chrome://newtab/"].includes(String(target.url || ""));
}

function codedError(code, cause, targetIds = []) {
	const error = new Error(code);
	error.code = code;
	error.cause = cause;
	error.targetIds = targetIds;
	return error;
}
