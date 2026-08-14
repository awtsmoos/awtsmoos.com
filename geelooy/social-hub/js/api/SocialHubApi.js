//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SocialHubApi
 * @description
 * The Awtsmoos gathers graph, activity, channels, Inbox, governance, review, and interaction transports behind one stable face;
 * Awtsmoos.com lets familiar callers remain while smaller vessels carry each responsibility with spacious grace.
 */
import { ActivityApi } from './ActivityApi.js';
import { bindApiDelegates, identityMethodMap } from './ApiDelegates.js';
import { ApiTransport } from './ApiTransport.js';
import { ChannelApi } from './ChannelApi.js';
import { CommunicationsApi } from './CommunicationsApi.js';
import { DestinationApi } from './DestinationApi.js';
import { GovernanceApi } from './GovernanceApi.js';
import { InteractionApi } from './InteractionApi.js';
import { ReviewApi } from './ReviewApi.js';
import { API, queryString, SocialGraphApi } from './SocialGraphApi.js';

const GRAPH_METHODS = identityMethodMap([
	'people',
	'profile',
	'livingProfile',
	'following',
	'followers',
	'follow',
	'unfollow'
]);

const ACTIVITY_METHODS = Object.freeze({
	activity: 'timeline',
	recordActivity: 'record',
	savePreferences: 'savePreferences',
	updateActivity: 'update',
	deleteActivity: 'remove',
	clearActivity: 'clear',
	exportActivity: 'export'
});

const INTERACTION_METHODS = identityMethodMap([
	'createComment',
	'embedPost',
	'promotionPreview',
	'promoteComment',
	'uploadAsset'
]);

export class SocialHubApi {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.transport = new ApiTransport(fetcher);
		this.activityApi = new ActivityApi(this.transport);
		this.channelApi = new ChannelApi(this.transport);
		this.communicationsApi = new CommunicationsApi(this.transport);
		this.destinationApi = new DestinationApi(this.transport);
		this.governanceApi = new GovernanceApi(this.transport);
		this.graphApi = new SocialGraphApi(this.transport);
		this.interactionApi = new InteractionApi(this.transport);
		this.reviewApi = new ReviewApi(this.transport);
		bindApiDelegates(this, this.graphApi, GRAPH_METHODS);
		bindApiDelegates(this, this.activityApi, ACTIVITY_METHODS);
		bindApiDelegates(this, this.interactionApi, INTERACTION_METHODS);
	}

	identity(preferredAlias = '') {
		return this.transport.request(`${API}/unified-social/identity${queryString({ preferredAlias })}`);
	}

	feed(options = {}) {
		return this.transport.request(`${API}/feed${queryString(options)}`);
	}

	trending(options = {}) {
		return this.transport.request(`${API}/trending${queryString(options)}`);
	}

	search(query, options = {}) {
		return this.transport.request(`${API}/search${queryString({ q: query, ...options })}`);
	}
}

export { API, queryString };
