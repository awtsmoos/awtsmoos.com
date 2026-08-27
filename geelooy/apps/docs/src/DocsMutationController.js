// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns local Awtsmoos document mutations through an explicit dependency vessel.
 * @description The Awtsmoos is beyond property and method; Awtsmoos.com keeps block,
 * comment, title, and semantic registry changes explicit so no view can shadow behavior
 * while drafts, collaboration, references, outline, statistics, and file state stay aligned.
 */
export class DocsMutationController {
	constructor(parts) {
		this.model = parts.model;
		this.persistence = parts.persistence;
		this.collaboration = parts.collaboration;
		this.outline = parts.outline;
		this.comments = parts.comments;
		this.editor = parts.editor;
		this.view = parts.view;
		this.status = parts.status;
		this.commentPanel = parts.commentPanel;
		this.stats = parts.stats;
		this.references = parts.references;
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
		this.model.title = String(this.view.title.value || "Untitled document").slice(0, 160);
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

	/** Persists registry truth independently from the block carrying its inline reference. */
	semanticObjectsChanged(objects) {
		this.model.setSemanticObjects(objects);
		this.persistence.persistDraft();
		this.refreshDerived();
		this.#markFileDirty();
	}

	focusPresence(event) {
		const block = event.target.closest?.("[data-block-id]");
		const blockId = block?.dataset.blockId || "";
		this.collaboration.presenceAt(blockId);
		this.outline?.markActive(blockId);
	}

	refreshDerived(activeBlockId = "") {
		this.outline?.refresh(this.model.blocks);
		if (activeBlockId) this.outline?.markActive(activeBlockId);
		this.stats?.refresh(this.model.blocks, this.model.comments);
		this.references?.refresh();
	}

	#markFileDirty() {
		if (!this.model.drive.path && !this.model.source.path) return;
		this.status.drive("Unsaved file changes", "warning");
	}
}
