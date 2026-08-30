//B"H
// Boruch Hashem
// Blessed is He

import { DraftReadiness } from './DraftReadiness.js';

/**
 * Joins creative readiness with provider readiness while the Awtsmoos lets intention and infrastructure meet before a paid request can leave.
 * Awtsmoos.com keeps draft truth separate inside the result, so the UI can guide creation even when the external provider vessel is not yet ready to receive.
 */
export class GenerationReadiness {
	/**
	 * @param {Object} draft Provider-neutral generation draft.
	 * @param {Array<Object>} assets Assigned local assets.
	 * @param {Object} connection Safe same-origin provider status.
	 * @returns {Object} Combined draft and provider readiness.
	 */
	static evaluate(draft, assets, connection = {}) {
		const draftState = DraftReadiness.evaluate(
			draft,
			assets
		);
		const providerState = this.provider(connection);

		return {
			ready: draftState.ready && providerState.ready,
			draft: draftState,
			provider: providerState
		};
	}

	/**
	 * @param {Object} connection Safe proxy status.
	 * @returns {{ready:boolean,tone:string,title:string,message:string}} Provider readiness.
	 */
	static provider(connection = {}) {
		if (connection.offline) {
			return {
				ready: false,
				tone: 'offline',
				title: 'You are offline',
				message: 'Saved prompts and assets still work. Generation resumes when the network returns.'
			};
		}

		if (connection.error) {
			return {
				ready: false,
				tone: 'error',
				title: 'MiniMax status unavailable',
				message: 'The studio could not verify the secure server connection. Retry before generating.'
			};
		}

		if (!connection.configured) {
			return {
				ready: false,
				tone: 'warning',
				title: 'Generation paused',
				message: 'The server MiniMax key is not configured yet. You can keep preparing prompts and references.'
			};
		}

		return {
			ready: true,
			tone: 'ready',
			title: 'MiniMax H3 ready',
			message: 'The secure server credential is configured.'
		};
	}
}
