//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SocialHubApi
 * @description
 * Identity and profile remain at the root while activity and interaction transports
 * are delegated to focused families. The Awtsmoos gives every request one current;
 * Awtsmoos.com preserves the earlier call surface without one oversized gateway.
 */

import { ActivityApi } from './ActivityApi.js';
import { ApiTransport } from './ApiTransport.js';
import { InteractionApi } from './InteractionApi.js';

const API = '/api/social';

export class SocialHubApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.transport = new ApiTransport(fetcher);
		this.activityApi = new ActivityApi(this.transport);
		this.interactionApi = new InteractionApi(this.transport);
	}

	identity(preferredAlias = '') {
		const query = preferredAlias
			? `?preferredAlias=${encodeURIComponent(preferredAlias)}`
			: '';
		return this.transport.request(`${API}/unified-social/identity${query}`);
	}

	profile(aliasId, viewerAliasId = '') {
		const query = viewerAliasId
			? `?aliasId=${encodeURIComponent(viewerAliasId)}`
			: '';
		return this.transport.request(
			`${API}/unified-social/profile-hub/${encodeURIComponent(aliasId)}${query}`
		);
	}

	activity(...args) {
		return this.activityApi.timeline(...args);
	}

	recordActivity(...args) {
		return this.activityApi.record(...args);
	}

	savePreferences(...args) {
		return this.activityApi.savePreferences(...args);
	}

	updateActivity(...args) {
		return this.activityApi.update(...args);
	}

	deleteActivity(...args) {
		return this.activityApi.remove(...args);
	}

	clearActivity(...args) {
		return this.activityApi.clear(...args);
	}

	exportActivity(...args) {
		return this.activityApi.export(...args);
	}

	createComment(...args) {
		return this.interactionApi.createComment(...args);
	}

	embedPost(...args) {
		return this.interactionApi.embedPost(...args);
	}

	promotionPreview(...args) {
		return this.interactionApi.promotionPreview(...args);
	}

	promoteComment(...args) {
		return this.interactionApi.promoteComment(...args);
	}

	uploadAsset(...args) {
		return this.interactionApi.uploadAsset(...args);
	}
}
