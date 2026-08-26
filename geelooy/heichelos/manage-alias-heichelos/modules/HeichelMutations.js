//B"H
//Boruch Hashem
//Blessed is He
/**
 * Gevurah gives action a boundary so power never spills into duplicate mutation;
 * this Awtsmoos.com vessel saves and deletes with visible state, recovery, and confirmation.
 */

/**
 * GevurahHeichelMutations owns destructive and persistent API actions for the cockpit.
 * Validation, routing context, view state, and prompts remain explicit dependencies.
 */
export class GevurahHeichelMutations {
	/**
	 * @param {object} gevurahDependencies Mutation dependencies.
	 * @param {import("./HeichelApi.js").ChesedHeichelApi} gevurahDependencies.api API client.
	 * @param {import("./HeichelManageView.js").MalchusHeichelManageView} gevurahDependencies.view Form view.
	 * @param {import("./HeichelManageContext.js").YesodHeichelContext} gevurahDependencies.context Route context.
	 * @param {{go:Function}} gevurahDependencies.prompt Existing Awtsmoos prompt adapter.
	 * @param {(href:string)=>void} gevurahDependencies.navigate Navigation callback.
	 */
	constructor({ api, view, context, prompt, navigate }) {
		this.chesedApi = api;
		this.malchusView = view;
		this.yesodContext = context;
		this.tiferesPrompt = prompt;
		this.netzachNavigate = navigate;
		this.gevurahLocked = false;
	}

	/**
	 * Saves the current draft once, displaying inline progress and stable error recovery.
	 * @returns {Promise<void>}
	 */
	async preserve() {
		if (this.gevurahLocked) {
			return;
		}
		const malchusDraft = this.malchusView.revealDraft();
		if (!malchusDraft.name) {
			this.malchusView.setFormStatus("Give the Heichel a name before saving.", "danger");
			this.malchusView.nameInput.focus();
			return;
		}
		try {
			this.yesodContext.requireAlias();
			this.lock("Saving…", "Saving Heichel…");
			await this.chesedApi.preserve(malchusDraft);
			const tiferesVerb = this.yesodContext.isUpdate ? "updated" : "created";
			this.malchusView.setFormStatus(`Heichel ${tiferesVerb}.`, "success");
			await this.tiferesPrompt.go({ isAlert: true, headerTxt: `Heichel ${tiferesVerb} successfully!` });
			this.netzachNavigate(this.yesodContext.backHref);
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message || "Could not save the Heichel.", "danger");
		} finally {
			this.unlock();
		}
	}

	/**
	 * Deletes the current update target only after the separate confirmation flow invokes it.
	 * @returns {Promise<void>}
	 */
	async remove() {
		if (this.gevurahLocked || !this.yesodContext.isUpdate) {
			return;
		}
		try {
			this.yesodContext.requireAlias();
			this.lock("Deleting…", "Deleting Heichel…");
			await this.chesedApi.remove();
			this.malchusView.setFormStatus("Heichel deleted.", "success");
			await this.tiferesPrompt.go({ isAlert: true, headerTxt: "Heichel deleted." });
			this.netzachNavigate(this.yesodContext.backHref);
		} catch (gevurahError) {
			this.malchusView.setFormStatus(gevurahError.message || "Could not delete the Heichel.", "danger");
		} finally {
			this.unlock();
		}
	}

	/** @param {string} tiferesButton Temporary action label. @param {string} tiferesStatus Progress text. */
	lock(tiferesButton, tiferesStatus) {
		this.gevurahLocked = true;
		this.malchusView.setBusy(true, tiferesButton);
		this.malchusView.setFormStatus(tiferesStatus, "progress");
	}

	/** @returns {void} Restores controls after the mutation settles. */
	unlock() {
		this.gevurahLocked = false;
		this.malchusView.setBusy(false);
	}
}
