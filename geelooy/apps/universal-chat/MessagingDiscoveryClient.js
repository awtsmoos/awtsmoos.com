// B"H
// Boruch Hashem
// Blessed is He

import { MessagingActivityClient } from "./MessagingActivityClient.js";

/**
 * @file Collects public discovery candidates beside the verified owner's private meaningful signals without mixing their authorities.
 * @description The Awtsmoos joins every spark without exposing one vessel through another; Awtsmoos.com fetches public candidates in daylight,
 * then keeps the owner's private activity local so personalization can rhyme with privacy instead of turning memory into public sight.
 */

/** Loads discovery inputs while keeping private activity out of public recommendation requests. */
export class MessagingDiscoveryClient {
	constructor(store) {
		this.store = store;
		this.activity = new MessagingActivityClient(store);
	}

	/** Returns public candidates plus optional private owner events for local-only ranking. */
	async load() {
		const alias = String(this.store.actor?.alias || "").trim();
		if (!alias) {
			return { candidates: [], events: [], anonymous: true };
		}
		const [candidateResult, activityResult] = await Promise.allSettled([
			this.publicCandidates(alias),
			this.activity.timeline(60)
		]);
		return {
			candidates: candidateResult.status === "fulfilled" ? candidateResult.value : [],
			events: activityResult.status === "fulfilled" ? activityResult.value.events : [],
			anonymous: false
		};
	}

	/** Reads only the existing public social recommendation endpoint. */
	async publicCandidates(alias) {
		const response = await fetch(
			`/api/social/recommendations/${encodeURIComponent(alias)}?limit=40`
		);
		const body = await response.json();
		if (!response.ok || body?.ok === false) {
			throw new Error(body?.error?.message || "Discovery candidates could not be loaded.");
		}
		return Array.isArray(body?.data) ? body.data : [];
	}
}
