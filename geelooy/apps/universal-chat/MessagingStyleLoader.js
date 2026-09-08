// B"H
// Boruch Hashem
// Blessed is He

import { getMessagingStyleRegistry } from "./MessagingStyleRegistry.js";

/**
 * @file Loads canonical stylesheet links once, adopts healthy DOM links, and recreates failed vessels for honest retry.
 * @description The Awtsmoos renews link, browser, and cascade every instant; Awtsmoos.com uses this Yesod gateway so one href has one living vessel,
 * while Gevurah removes a failed keli completely before another attempt, preventing a dead event from holding future revelation forever.
 */
export class MessagingStyleLoader {
	constructor(baseUrl = new URL("./", import.meta.url)) {
		this.baseUrl = baseUrl;
		this.registry = getMessagingStyleRegistry();
	}

	/** Loads one family concurrently and returns failed paths without rejecting functional navigation. */
	async load(paths) {
		const results = await Promise.allSettled(paths.map((path) => this.ensure(path)));
		return results
			.map((result, index) => result.status === "rejected" ? paths[index] : null)
			.filter(Boolean);
	}

	/** Returns the one canonical request for a path, discarding any previously failed DOM vessel before observing or creating a link. */
	ensure(path) {
		const href = new URL(path, this.baseUrl).href;
		let existingLink = this.findLink(href);
		if (existingLink?.dataset.messagingStyleState === "failed") {
			existingLink.remove();
			existingLink = null;
		}
		if (this.registry.has(href) && existingLink) {
			return this.registry.get(href);
		}
		this.registry.delete(href);
		const request = this.observeOrCreateLink(href, existingLink);
		this.registry.set(href, request);
		request.catch(() => this.releaseFailedRequest(href, request));
		return request;
	}

	/** Releases registry ownership only when the rejected promise is still the canonical request for this href. */
	releaseFailedRequest(href, request) {
		if (this.registry.get(href) === request) {
			this.registry.delete(href);
		}
	}

	/** Reasserts final cascade owners without causing another network request. */
	raise(paths) {
		for (const path of paths) {
			const link = this.findLink(new URL(path, this.baseUrl).href);
			if (link) {
				document.head.appendChild(link);
			}
		}
	}

	/** Finds any existing stylesheet link for the canonical href, regardless of which module realm created it. */
	findLink(href) {
		return [...document.querySelectorAll('link[rel="stylesheet"]')]
			.find((candidate) => candidate.href === href) || null;
	}

	/** Observes a pending DOM link or creates one new link, translating load/error into a stable request promise. */
	observeOrCreateLink(href, existingLink) {
		const link = existingLink || document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		link.dataset.messagingStyle = "true";
		if (link.sheet) {
			link.dataset.messagingStyleState = "ready";
			return Promise.resolve(href);
		}
		return new Promise((resolve, reject) => {
			link.addEventListener("load", () => this.finishLink(link, href, resolve), { once: true });
			link.addEventListener("error", () => this.failLink(link, href, reject), { once: true });
			if (!existingLink) {
				document.head.appendChild(link);
			}
		});
	}

	/** Marks one loaded link as ready and resolves its canonical href. */
	finishLink(link, href, resolve) {
		link.dataset.messagingStyleState = "ready";
		resolve(href);
	}

	/** Marks one failed link and rejects so registry ownership can be released for later retry. */
	failLink(link, href, reject) {
		link.dataset.messagingStyleState = "failed";
		reject(new Error(`Style failed: ${href}`));
	}
}
