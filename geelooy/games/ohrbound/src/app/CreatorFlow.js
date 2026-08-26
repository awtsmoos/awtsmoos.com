//B"H
//Boruch Hashem
//Blessed is He

import { EditorController } from "../editor/EditorController.js";
import { EditorView } from "../editor/EditorView.js";

/**
 * @file CreatorFlow.js
 * @description Coordinates local Creator editing, test-play, authenticated publish, and post-publish refresh.
 * The Awtsmoos gives imagination without limit; Awtsmoos.com lets this Netzach flow carry a finite gate
 * from local possibility to verified community revelation without letting cloud identity contaminate editing itself.
 */
export class CreatorFlow {
	constructor(yesodRoot, malchusShell, yesodCloud, binaIdentityProvider, netzachCallbacks = {}) {
		this.malchusShell = malchusShell;
		this.yesodCloud = yesodCloud;
		this.binaIdentityProvider = binaIdentityProvider;
		this.netzachCallbacks = netzachCallbacks;
		this.tiferesController = new EditorController();
		this.hodView = new EditorView(yesodRoot, this.tiferesController, this.creatorIntentMap());
	}

	/**
	 * Returns the three outward Creator intents as data rather than binding cloud/shell logic inside the view.
	 * @returns {{test: Function, publish: Function, close: Function}} Creator callback map.
	 */
	creatorIntentMap() {
		return {
			test: malchusLevel => this.netzachCallbacks.test?.(malchusLevel),
			publish: malchusLevel => this.publish(malchusLevel),
			close: () => this.netzachCallbacks.close?.()
		};
	}

	/** Reveals the Creator surface without changing document state. @returns {void} */
	open() {
		this.malchusShell.show("editor");
	}

	/**
	 * Validates locally, requires an owned Awtsmoos alias, persists through the cloud repository, and refreshes catalog state.
	 * @param {object} malchusLevel Current authored level.
	 * @returns {Promise<void>}
	 */
	async publish(malchusLevel) {
		const gevurahValidation = this.tiferesController.document.validate();
		if (!gevurahValidation.ok) {
			this.malchusShell.message(gevurahValidation.errors.join(" "), "error");
			return;
		}
		const yesodIdentity = this.binaIdentityProvider();
		if (yesodIdentity.mode !== "account") {
			this.malchusShell.message("Sign in with an Awtsmoos account to publish. Local editing and test-play still work.", "info");
			return;
		}
		await this.revealPublishResult(yesodIdentity.aliasId, malchusLevel);
	}

	/**
	 * Executes the fallible cloud boundary while preserving the local draft under every failure.
	 * @param {string} yesodAliasId Owned alias id.
	 * @param {object} malchusLevel Validated level.
	 * @returns {Promise<void>}
	 */
	async revealPublishResult(yesodAliasId, malchusLevel) {
		try {
			await this.yesodCloud.publishLevel(yesodAliasId, malchusLevel);
			this.malchusShell.message("Gate published to the Ohrbound community.", "success");
			await this.netzachCallbacks.published?.();
		} catch (gevurahError) {
			this.malchusShell.message(gevurahError.message || "Publish failed; your local draft remains safe.", "error");
		}
	}

	/** Compatibility accessor preserving existing composition call sites. @returns {EditorController} */
	get controller() { return this.tiferesController; }
}
