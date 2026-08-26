// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GevurahHeichelIdentityController
 * @description
 * The Awtsmoos gives infinite possibility, while Gevurah gives each chosen name
 * a truthful boundary. Awtsmoos.com validates Heichel identity without stale
 * responses repainting newer input, so every visible address remains trustworthy.
 */
export class GevurahHeichelIdentityController {
	/**
	 * @param {object} options - Identity-validation collaborators.
	 * @param {import('./HeichelApi.js').ChesedHeichelApi} options.api - Heichel API client.
	 * @param {import('./HeichelManageView.js').MalchusHeichelManageView} options.view - Scoped DOM view.
	 * @param {import('./HeichelManageContext.js').YesodHeichelContext} options.context - Route context.
	 */
	constructor({ api, view, context }) {
		this.chesedApi = api;
		this.malchusView = view;
		this.yesodContext = context;
		this.gevurahSequence = 0;
	}

	/**
	 * Validates the current name/address and ignores responses superseded by newer input.
	 * @returns {Promise<void>} Completes after the latest validation is reflected.
	 */
	async validate() {
		if (this.yesodContext.isUpdate) {
			return;
		}
		const malchusDraft = this.malchusView.revealDraft();
		if (!malchusDraft.name && !malchusDraft.id) {
			this.malchusView.setIdStatus('Enter a name to generate an address.', 'neutral');
			return;
		}
		const gevurahTicket = ++this.gevurahSequence;
		this.malchusView.setIdStatus('Checking address…', 'progress');
		try {
			const binahResult = await this.chesedApi.discernIdentity({
				name: malchusDraft.name,
				id: malchusDraft.id
			});
			if (gevurahTicket !== this.gevurahSequence) {
				return;
			}
			this.revealSuccess(binahResult, malchusDraft.id);
		} catch (gevurahError) {
			if (gevurahTicket === this.gevurahSequence) {
				this.malchusView.setIdStatus(gevurahError.message, 'danger');
			}
		}
	}

	/**
	 * Applies a successful validation result and generated ID without overriding an explicit ID.
	 * @param {object} binahResult - API identity response.
	 * @param {string} yesodExplicitId - Address typed by the user before the request.
	 */
	revealSuccess(binahResult, yesodExplicitId) {
		const yesodGenerated = binahResult.aliasId || binahResult.heichelId || binahResult.id || '';
		if (!yesodExplicitId && yesodGenerated) {
			this.malchusView.setGeneratedId(yesodGenerated);
		}
		this.malchusView.setIdStatus('Address is available.', 'success');
	}
}
