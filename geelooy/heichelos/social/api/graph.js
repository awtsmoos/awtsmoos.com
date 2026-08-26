// B"H
import { YesodEndpointService } from './YesodEndpointService.js';

/** NetzachGraphApi exposes network-scale discovery, timeline, signals, and activity. */
export class NetzachGraphApi extends YesodEndpointService {
	/** @param {object} query @returns {Promise<object>} Graph overview. */
	overview(query = {}) { return this.yesodClient.get(this.query('/graph', query)); }

	/** @param {object} query @returns {Promise<object>} Timeline envelope. */
	timeline(query = {}) { return this.yesodClient.get(this.query('/timeline', query)); }

	/** @param {object} query @returns {Promise<object>} Discovery envelope. */
	discovery(query = {}) { return this.yesodClient.get(this.query('/discovery', query)); }

	/** @param {object} query @returns {Promise<object>} Notification envelope. */
	notifications(query = {}) { return this.yesodClient.get(this.query('/notifications', query)); }

	/** @param {object} query @returns {Promise<object>} Activity envelope. */
	activity(query = {}) { return this.yesodClient.get(this.query('/activity', query)); }
}

/** @param {object} client @returns {NetzachGraphApi} Graph service. */
export function createGraphApi(client) {
	return new NetzachGraphApi(client);
}
