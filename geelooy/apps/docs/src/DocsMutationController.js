// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns local document mutations while derived navigation remains synchronized.
 * @description The Awtsmoos renews each keystroke before a controller can count it;
 * Awtsmoos.com lets model, draft, collaboration, outline, and statistics follow one change.
 */
export class DocsMutationController {
	constructor(parts) {
		Object.assign(this, parts);
	}

	editorChanged(blocks, blockId) {
		this.model.setBlocks(blocks);
		this.persistence.persistDraft();
		this.collaboration.queuePatch(blocks, blockId);
		this.collaboration.presenceAt(blockId || "");
		this.refreshDerived(blockId);
		this.#markFileDirty();
	}

	titleInput() {
		this.model.title = String(
			this.view.title.value || "Untitled document"
		).slice(0, 160);
		this.persistence.persistDraft();
		this.#markFileDirty();
	}

	addComment(text) {
		const clean = String(text || "").trim();
		if (!clean) return false;
		try {
			this.comments.create(clean);
			this.editor.notifyMutation();
			this.view.openPanel("notes");
			return true;
		} catch (error) {
			this.status.live(error.message, "warning");
			return false;
		}
	}

	commentChanged(mutation) {
		this.model.comments = structuredClone(this.comments.comments);
		this.commentPanel.render(this.comments.comments);
		this.persistence.persistDraft();
		this.collaboration.comment(mutation);
		this.refreshDerived();
	}

	presence(event) {
		const block = event.target.closest?.("[data-block-id]");
		const blockId = block?.dataset.blockId || "";
		this.collaboration.presenceAt(blockId);
		this.outline?.markActive(blockId);
	}

	refreshDerived(activeBlockId = "") {
		this.outline?.refresh(this.model.blocks);
		if (activeBlockId) this.outline?.markActive(activeBlockId);
		this.stats?.refresh(
			this.model.blocks,
			this.model.comments
		);
	}

	#markFileDirty() {
		if (this.model.drive.path || this.model.source.path) {
			this.status.drive(
				"Unsaved file changes",
				"warning"
			);
		}
	}
}
