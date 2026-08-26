// B"H
import { createSocialClient } from './client.js';
import { createFeedApi } from './feed.js';
import { createProfilesApi } from './profiles.js';
import { createPostsApi } from './posts.js';
import { createCommentsApi } from './comments.js';
import { createGraphApi } from './graph.js';
import { createSectionsApi } from './sections.js';
import { createReferencesApi } from './references.js';
import { createMediaApi } from './media.js';
import { createSeriesApi } from './series.js';
import { createQaApi } from './qa.js';
import { createEmbedsApi } from './embeds.js';

/**
 * @module SocialApi
 * @description
 * Tiferes gathers the social endpoint families into one balanced registry without
 * erasing their independent responsibilities. Existing callers keep the exact
 * `api.feed`, `api.posts`, and related properties while internals remain extensible.
 */
export class TiferesSocialApiRegistry {
	/**
	 * Builds every domain service around one shared Yesod transport.
	 * @param {object} [options={}] - Social-client transport options.
	 */
	constructor(options = {}) {
		this.client = createSocialClient(options);
		this.feed = createFeedApi(this.client);
		this.profiles = createProfilesApi(this.client);
		this.posts = createPostsApi(this.client);
		this.comments = createCommentsApi(this.client);
		this.graph = createGraphApi(this.client);
		this.sections = createSectionsApi(this.client);
		this.references = createReferencesApi(this.client);
		this.media = createMediaApi(this.client);
		this.series = createSeriesApi(this.client);
		this.qa = createQaApi(this.client);
		this.embeds = createEmbedsApi(this.client);
	}
}

/**
 * Preserves the public social API factory while returning the class-based registry.
 * @param {object} [options={}] - Transport configuration.
 * @returns {TiferesSocialApiRegistry} Complete social API registry.
 */
export function createSocialApi(options = {}) {
	return new TiferesSocialApiRegistry(options);
}
