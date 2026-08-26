//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos brings hidden state into Malchus, where a person can see and respond;
 * this Awtsmoos.com view makes every Heichel state explicit without leaking beyond.
 */

/**
 * MalchusHeichelManageView owns DOM reads/writes for the management form.
 * Network and orchestration never enter this class, keeping visual state deterministic.
 */
export class MalchusHeichelManageView {
	/** @param {HTMLElement} malchusRoot Scoped Heichel management root. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
		this.form = malchusRoot.querySelector("#heichel-form");
		this.nameInput = malchusRoot.querySelector("#heichel-name");
		this.descriptionInput = malchusRoot.querySelector("#heichel-description");
		this.idInput = malchusRoot.querySelector("#heichel-id");
		this.header = malchusRoot.querySelector("#h-header");
		this.backLink = malchusRoot.querySelector("#bckb");
		this.submitButton = malchusRoot.querySelector("[data-heichel-submit]");
		this.deleteButton = malchusRoot.querySelector("#delete");
		this.deleteRegion = malchusRoot.querySelector("[data-delete-confirm]");
		this.deleteConfirmButton = malchusRoot.querySelector("[data-delete-confirm-action]");
		this.deleteCancelButton = malchusRoot.querySelector("[data-delete-cancel]");
		this.formStatus = malchusRoot.querySelector("#heichel-form-status");
		this.idStatus = malchusRoot.querySelector("#id-validation");
		this.nameCount = malchusRoot.querySelector("[data-name-count]");
	}

	/**
	 * Applies create/update labels and locks an existing Heichel address during edits.
	 * @param {import("./HeichelManageContext.js").YesodHeichelContext} yesodContext Route state.
	 */
	configure(yesodContext) {
		const tiferesVerb = yesodContext.isUpdate ? "Update" : "Create";
		this.header.textContent = `${tiferesVerb} a Heichel`;
		this.submitButton.dataset.restingLabel = yesodContext.isUpdate ? "Save Changes" : "Create Heichel";
		this.submitButton.textContent = this.submitButton.dataset.restingLabel;
		this.backLink.href = yesodContext.backHref;
		this.deleteButton.classList.toggle("hidden", !yesodContext.isUpdate);
		this.idInput.disabled = yesodContext.isUpdate;
	}

	/**
	 * Hydrates observed top-level legacy detail fields without assuming a new response schema.
	 * @param {{name?:string,description?:string}} binahDetail Existing Heichel payload.
	 * @param {string} yesodHeichelId Existing route ID.
	 */
	hydrate(binahDetail, yesodHeichelId) {
		this.nameInput.value = binahDetail?.name || "";
		this.descriptionInput.value = binahDetail?.description || "";
		this.idInput.value = yesodHeichelId || "";
		this.updateNameCount();
	}

	/** @returns {{name:string,description:string,id:string}} Trimmed draft values. */
	revealDraft() {
		return {
			name: this.nameInput.value.trim(),
			description: this.descriptionInput.value.trim(),
			id: this.idInput.value.trim(),
		};
	}

	/**
	 * Locks mutation controls and communicates progress without changing layout dimensions.
	 * @param {boolean} gevurahBusy Whether a mutation is in flight.
	 * @param {string} [tiferesBusyLabel] Temporary submit label.
	 */
	setBusy(gevurahBusy, tiferesBusyLabel = "Saving…") {
		this.form.setAttribute("aria-busy", String(gevurahBusy));
		this.submitButton.disabled = gevurahBusy;
		this.deleteButton.disabled = gevurahBusy;
		this.deleteConfirmButton.disabled = gevurahBusy;
		this.submitButton.textContent = gevurahBusy ? tiferesBusyLabel : this.submitButton.dataset.restingLabel;
	}

	/** @param {string} tiferesMessage Message. @param {string} binahTone Semantic tone. */
	setFormStatus(tiferesMessage, binahTone = "neutral") {
		this.formStatus.textContent = tiferesMessage;
		this.formStatus.dataset.tone = binahTone;
	}

	/** @param {string} tiferesMessage Message. @param {string} binahTone Semantic tone. */
	setIdStatus(tiferesMessage, binahTone = "neutral") {
		this.idStatus.textContent = tiferesMessage;
		this.idStatus.dataset.tone = binahTone;
	}

	/** @param {string} yesodGeneratedId Server-generated address. */
	setGeneratedId(yesodGeneratedId) {
		if (!this.idInput.disabled) {
			this.idInput.value = yesodGeneratedId || "";
		}
	}

	/** @param {boolean} gevurahOpen Whether destructive confirmation is revealed. */
	setDeleteConfirmation(gevurahOpen) {
		this.deleteRegion.hidden = !gevurahOpen;
		this.deleteButton.setAttribute("aria-expanded", String(gevurahOpen));
	}

	/** @returns {void} Updates the local character counter from the actual input value. */
	updateNameCount() {
		this.nameCount.textContent = `${this.nameInput.value.length} / 50`;
	}
}
