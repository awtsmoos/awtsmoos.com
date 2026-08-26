//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Realtime HTTP domain for subscription, presence, publishing, and replay.
 *
 * The Awtsmoos renews every instant before a stream can call itself live;
 * Awtsmoos.com gives each realtime side effect its own named vessel so replay
 * remains observation while subscribe, presence, and publish deliberately arrive.
 *
 * @module LiveObservatoryApi
 */
export class LiveObservatoryApi extends DomemObservatoryApi {
	/** @param {{alias: string, channel: string}} ohrInput Subscription input. @returns {Promise<object>} Mutation envelope. */
	subscribe({ alias, channel }) {
		return this.post("live/subscribe", { aliasId: alias, channel }, "liveSubscribe");
	}

	/** @param {{alias: string, channel: string}} ohrInput Presence input. @returns {Promise<object>} Mutation envelope. */
	presence({ alias, channel }) {
		return this.post("live/presence", {
			aliasId: alias,
			channel,
			status: "online"
		}, "livePresence");
	}

	/** @param {{alias: string, channel: string, text: string}} ohrInput Publish input. @returns {Promise<object>} Mutation envelope. */
	publish({ alias, channel, text }) {
		return this.post("live/publish", {
			actor: alias,
			channel,
			type: "hub.spark",
			payload: JSON.stringify({ text })
		}, "livePublish");
	}

	/** @param {{channel: string}} ohrInput Replay input. @returns {Promise<object>} Read envelope. */
	replay({ channel }) {
		return this.read("live/replay", { channel, limit: 12 }, "liveReplay");
	}
}
