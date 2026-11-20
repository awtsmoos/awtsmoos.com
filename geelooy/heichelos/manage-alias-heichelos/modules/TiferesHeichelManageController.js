// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TiferesHeichelManageController
 * @description
 * The Awtsmoos unites giving and boundary in a single harmonious act; Tiferes
 * coordinates this Awtsmoos.com Heichel studio without absorbing transport,
 * DOM, route, preview, validation, or event-registration responsibilities.
 */
export class TiferesHeichelManageController {
	/**
	 * @param {object} options - Explicit collaborators for one mounted studio.
	 */
	constructor(options) {
		this.yesodContext = options.context;
		this.chesedApi = options.api;
		this.malchusView = options.view;
		this.tiferesPreview = options.preview;
		this.netzachBindings = options.bindings;
		this.gevurahIdentity = options.identity;
		this.malchusLocation = options.location || globalThis.location;
	}

	/**
	 * Configures the studio, binds interactions once, hydrates update data, and reveals preview state.
	 * @returns {Promise<void>} Resolves when initial state is ready.
	 */
	async start() {
		// Configure and bind BEFORE the alias check: when the check ran
		// first, its throw skipped binding entirely and the form stayed a
		// native GET form whose submission dropped ?alias= and stranded
		// the studio. Bound first, a missing alias is an inline message,
		// never a navigation.
		this.malchusView.configure(this.yesodContext);
		this.netzachBindings.bind(this.actions());
		try {
			this.yesodContext.requireAlias();
			if (this.yesodContext.isUpdate) {
				const binahDetail = await this.chesedApi.revealDetails();
				this.malchusView.hydrate(binahDetail, this.yesodContext.heichelId);
			}
			this.revealDraft();
			this.malchusView.setFormStatus('Ready.', 'neutral');
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message, 'danger');
		}
	}

	/** @returns {object} Stable callbacks consumed by NetzachHeichelBindings. */
	actions() {
		return {
			onDraft: () => this.revealDraft(),
			onIdentity: () => void this.gevurahIdentity.validate(),
			onSubmit: () => void this.preserve(),
			onDeleteRequest: () => this.malchusView.setDeleteConfirmation(true),
			onDeleteCancel: () => this.malchusView.setDeleteConfirmation(false),
			onDeleteConfirm: () => void this.remove()
		};
	}

	/** Mirrors current form data into the local preview with no network side effects. */
	revealDraft() {
		this.tiferesPreview.reveal(this.malchusView.revealDraft());
	}

	/**
	 * Creates or updates the current Heichel and returns to the safe route on success.
	 * @returns {Promise<void>}
	 */
	async preserve() {
		const malchusDraft = this.malchusView.revealDraft();
		if (!malchusDraft.name) {
			this.malchusView.setFormStatus('Give this Heichel a name first.', 'danger');
			return;
		}
		this.malchusView.setBusy(true, this.yesodContext.isUpdate ? 'Saving…' : 'Creating…');
		this.malchusView.setFormStatus('Saving Heichel…', 'progress');
		try {
			this.yesodContext.requireAlias();
			await this.chesedApi.preserve(malchusDraft);
			this.malchusView.setFormStatus(this.yesodContext.isUpdate ? 'Heichel updated.' : 'Heichel created.', 'success');
			// Let the confirmation actually be seen before leaving;
			// navigating in the same tick made success a silent redirect.
			await new Promise(resolve => setTimeout(resolve, 1400));
			this.navigateBack();
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message, 'danger');
		} finally {
			this.malchusView.setBusy(false);
		}
	}

	/**
	 * Permanently removes the update target after the explicit in-page confirmation step.
	 * @returns {Promise<void>}
	 */
	async remove() {
		this.malchusView.setBusy(true, 'Deleting…');
		this.malchusView.setFormStatus('Deleting Heichel…', 'progress');
		try {
			await this.chesedApi.remove();
			this.malchusView.setFormStatus('Heichel deleted.', 'success');
			await new Promise(resolve => setTimeout(resolve, 1400));
			this.navigateBack();
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message, 'danger');
		} finally {
			this.malchusView.setBusy(false);
			this.malchusView.setDeleteConfirmation(false);
		}
	}

	/** Navigates only to the safe destination already normalized by YesodHeichelContext. */
	navigateBack() {
		this.malchusLocation.href = this.yesodContext.backHref;
	}
}
