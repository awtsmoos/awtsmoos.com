// B"H
// Boruch Hashem
// Blessed is He

import { createDocsCommandRouter } from "./commands/DocsCommandFactory.js";
import { DocsActionController } from "./DocsActionController.js";
import { DocsBindings } from "./DocsBindings.js";
import { createDocsComposition } from "./DocsComposition.js";
import { DocsMutationController } from "./DocsMutationController.js";
import { readShareLink } from "./share/SharePolicy.js";

/**
 * @file Boots Awtsmoos Docs after construction, mutations, actions, commands, and bindings divide.
 * @description The Awtsmoos is one beyond every controller; Awtsmoos.com begins the
 * document gently, letting page, source, collaboration, and writing reveal without becoming the whole.
 */
export class DocsApp {
	constructor() {
		Object.assign(this, createDocsComposition());
		this.mutations = new DocsMutationController(this);
		this.actions = new DocsActionController(this);
		this.commandRouter = createDocsCommandRouter({
			actions: this.actions,
			toast: this.toast,
			formatting: this.formatting,
			insertion: this.insertion,
			layout: this.layout,
			mutations: this.mutations,
			quickDialog: this.quickDialog,
			bookmark: this.bookmark,
			view: this.view
		});
		this.bindings = new DocsBindings({
			...this,
			mutations: this.mutations,
			actions: this.actions,
			commandRouter: this.commandRouter
		});
		this.fileController.onImported = () => {
			this.layout.apply();
			this.mutations.refreshDerived();
			this.toast.show("Document imported", "success");
		};
	}

	async start() {
		this.bindings.bind();
		this.toolbar.bind();
		this.embed.start();
		const shared = readShareLink();
		if (!shared.documentId) this.#loadLocalBeginning();
		this.editor.render(this.model.blocks);
		this.view.setTitle(this.model.title);
		this.commentPanel.render(this.comments.comments);
		this.layout.apply();
		this.mutations.refreshDerived();
		try {
			await this.collaboration.connectFromLocation();
			this.layout.apply();
		} catch (error) {
			this.status.live(error.message || "Offline draft", "warning");
		}
	}

	#loadLocalBeginning() {
		try {
			const consumed = this.fileController.consumeCrossAppIntent();
			if (!consumed) this.persistence.loadDraft("new");
		} catch (error) {
			this.status.drive(
				error.message || "Could not open handed-off file",
				"warning"
			);
			this.persistence.loadDraft("new");
		}
	}
}
