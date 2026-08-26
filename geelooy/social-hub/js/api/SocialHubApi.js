//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SocialHubApi.js
 * @description The Awtsmoos gathers many social routes behind one stable face while each focused vessel keeps its own grace;
 * Awtsmoos.com preserves familiar calls and now lets cancellation/timeouts flow through discovery without changing route space.
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

const GRAPH_METHODS = identityMethodMap(['people', 'profile', 'livingProfile', 'following', 'followers', 'follow', 'unfollow']);
const ACTIVITY_METHODS = Object.freeze({
	activity: 'timeline', recordActivity: 'record', savePreferences: 'savePreferences',
	updateActivity: 'update', deleteActivity: 'remove', clearActivity: 'clear', exportActivity: 'export'
});
const INTERACTION_METHODS = identityMethodMap(['createComment', 'embedPost', 'promotionPreview', 'promoteComment', 'uploadAsset']);

export class SocialHubApi {
	/** Builds one facade over domain APIs while sharing exactly one transport. */
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

	/** Resolves the current social identity; transport controls are additive and optional. */
	identity(preferredAlias = '', controls = {}) {
		return this.transport.request(`${API}/unified-social/identity${queryString({ preferredAlias })}`, controls);
	}

	/** Loads the canonical public feed while allowing AbortSignal/timeout controls. */
	feed(options = {}, controls = {}) {
		return this.transport.request(`${API}/feed${queryString(options)}`, controls);
	}

	/** Loads canonical trending content while allowing AbortSignal/timeout controls. */
	trending(options = {}, controls = {}) {
		return this.transport.request(`${API}/trending${queryString(options)}`, controls);
	}

	/** Searches public social content with query parameters separated from transport controls. */
	search(query, options = {}, controls = {}) {
		return this.transport.request(`${API}/search${queryString({ q: query, ...options })}`, controls);
	}
}

export { API, queryString };
