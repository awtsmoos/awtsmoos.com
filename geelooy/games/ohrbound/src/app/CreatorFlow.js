//B"H
//Boruch Hashem
//Blessed is He

import { EditorController } from "../editor/EditorController.js";
import { EditorView } from "../editor/EditorView.js";

/**
 * @file CreatorFlow.js
 * @description Joins editor UI to test-play and authenticated publishing boundaries.
 * The Awtsmoos gives imagination without limit; Awtsmoos.com lets the finite maker
 * test locally first, then share only through an alias whose ownership is truly proven.
 */
export class CreatorFlow {
	constructor(root, shell, cloud, identityProvider, callbacks = {}) {
		this.shell = shell;
		this.cloud = cloud;
		this.identityProvider = identityProvider;
		this.callbacks = callbacks;
		this.controller = new EditorController();
		this.view = new EditorView(root, this.controller, {
			test: level => callbacks.test?.(level),
			publish: level => this.publish(level),
			close: () => callbacks.close?.()
		});
	}

	open() {
		this.shell.show("editor");
	}

	async publish(level) {
		const validation = this.controller.document.validate();
		if (!validation.ok) return this.shell.message(validation.errors.join(" "), "error");
		const identity = this.identityProvider();
		if (identity.mode !== "account") {
			this.shell.message("Sign in with an Awtsmoos account to publish. Local editing and test-play still work.", "info");
			return;
		}
		try {
			await this.cloud.publishLevel(identity.aliasId, level);
			this.shell.message("Gate published to the Ohrbound community.", "success");
			await this.callbacks.published?.();
		} catch (error) {
			this.shell.message(error.message || "Publish failed; your local draft remains safe.", "error");
		}
	}
}
