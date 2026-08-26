//B"H
//Boruch Hashem
//Blessed is He
/**
 * Daas joins separate powers into one conscious path while the Awtsmoos renews the whole;
 * this Awtsmoos.com controller coordinates context, view, preview, validation, and action without global control.
 */

/**
 * DaasHeichelManageController is the page-level coordinator.
 * It owns startup and event intent only; transport, rendering, validation, and mutations stay delegated.
 */
export class DaasHeichelManageController {
	/**
	 * @param {object} daasDependencies Explicit collaborating vessels.
	 * @param {import("./HeichelManageContext.js").YesodHeichelContext} daasDependencies.context Route context.
	 * @param {import("./HeichelApi.js").ChesedHeichelApi} daasDependencies.api API client.
	 * @param {import("./HeichelManageView.js").MalchusHeichelManageView} daasDependencies.view Form view.
	 * @param {import("./HeichelPreviewView.js").TiferesHeichelPreview} daasDependencies.preview Preview view.
	 * @param {import("./HeichelManageBindings.js").NetzachHeichelBindings} daasDependencies.bindings Event bindings.
	 * @param {import("./HeichelIdOracle.js").BinahHeichelIdOracle} daasDependencies.oracle ID oracle.
	 * @param {import("./HeichelMutations.js").GevurahHeichelMutations} daasDependencies.mutations Mutations.
	 */
	constructor({ context, api, view, preview, bindings, oracle, mutations }) {
		this.yesodContext = context;
		this.chesedApi = api;
		this.malchusView = view;
		this.tiferesPreview = preview;
		this.netzachBindings = bindings;
		this.binahOracle = oracle;
		this.gevurahMutations = mutations;
	}

	/**
	 * Initializes labels, event channels, optional update hydration, preview, and validation state.
	 * @returns {Promise<void>}
	 */
	async start() {
		this.malchusView.configure(this.yesodContext);
		this.bindActions();
		try {
			this.yesodContext.requireAlias();
			if (this.yesodContext.isUpdate) {
				this.malchusView.setFormStatus("Loading Heichel…", "progress");
				const binahDetail = await this.chesedApi.revealDetails();
				this.malchusView.hydrate(binahDetail, this.yesodContext.heichelId);
			}
			this.syncDraft();
			this.binahOracle.schedule(this.malchusView.revealDraft());
			this.malchusView.setFormStatus("Ready.");
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message || "This Heichel could not be loaded.", "danger");
		}
	}

	/** @returns {void} Converts DOM events into controller intent without exposing globals. */
	bindActions() {
		this.netzachBindings.bind({
			onDraft: () => this.syncDraft(),
			onIdentity: () => this.binahOracle.schedule(this.malchusView.revealDraft()),
			onSubmit: () => this.gevurahMutations.preserve(),
			onDeleteRequest: () => this.revealDelete(),
			onDeleteCancel: () => this.concealDelete(),
			onDeleteConfirm: () => this.gevurahMutations.remove(),
		});
	}

	/** @returns {void} Reflects the current draft in the isolated live preview. */
	syncDraft() {
		this.tiferesPreview.reveal(this.malchusView.revealDraft());
	}

	/** @returns {void} Opens inline destructive confirmation and places focus on its safe exit. */
	revealDelete() {
		this.malchusView.setDeleteConfirmation(true);
		this.malchusView.deleteCancelButton.focus();
	}

	/** @returns {void} Closes destructive confirmation and restores focus to the originating control. */
	concealDelete() {
		this.malchusView.setDeleteConfirmation(false);
		this.malchusView.deleteButton.focus();
	}
}
