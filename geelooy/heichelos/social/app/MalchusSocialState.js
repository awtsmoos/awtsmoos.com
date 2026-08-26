// B"H
import { createDraft } from '../composer/composerDraft.js';

/**
 * @module MalchusSocialState
 * @description
 * Malchus gives the social controller one finite, honest state vessel. Awtsmoos.com
 * keeps initialization, runtime Alias context, loading truth, and error truth here
 * so lifecycle orchestration never fabricates content or grows into a state monolith.
 */
export class MalchusSocialState {
	/**
	 * Creates the initial controller state from supplied content and runtime Alias context.
	 * @param {object} [binahData={}] - Optional preloaded social data.
	 * @returns {object} Mutable controller state whose nested draft remains immutable-by-update.
	 */
	static initial(binahData = {}) {
		const yesodAlias = this.alias();
		return {
			data: this.hasContent(binahData) ? binahData : this.loadingData(),
			draft: createDraft({
				aliasId: yesodAlias,
				profileHeichelId: yesodAlias,
				...(binahData.draft || {})
			}),
			status: '',
			statusKind: ''
		};
	}

	/**
	 * Determines whether a caller supplied real social content rather than an empty shell.
	 * @param {object} [binahData={}] - Candidate data payload.
	 * @returns {boolean} True when one recognized social data collection or profile exists.
	 */
	static hasContent(binahData = {}) {
		return Array.isArray(binahData.posts)
			|| Array.isArray(binahData.items)
			|| Boolean(binahData.profile)
			|| Array.isArray(binahData.comments);
	}

	/**
	 * Reads Alias context without inventing a fallback identity.
	 * @returns {string} Current Alias or an empty string when none is selected.
	 */
	static alias() {
		return globalThis.curAlias
			|| new URLSearchParams(globalThis.location?.search || '').get('alias')
			|| '';
	}

	/**
	 * Creates the non-fabricated loading shell shown before live APIs resolve.
	 * @returns {object} Empty social data with explicit loading copy.
	 */
	static loadingData() {
		return {
			profile: {
				name: 'Awtsmoos Social',
				bio: 'Loading /api/social...'
			},
			posts: [],
			comments: []
		};
	}

	/**
	 * Creates an honest empty error shell without demo posts or invented identities.
	 * @param {string} malchusError - User-readable transport or domain error.
	 * @returns {object} Empty social data carrying the error as profile context.
	 */
	static errorData(malchusError) {
		return {
			profile: {
				name: 'Awtsmoos Social',
				bio: malchusError
			},
			posts: [],
			comments: []
		};
	}
}
