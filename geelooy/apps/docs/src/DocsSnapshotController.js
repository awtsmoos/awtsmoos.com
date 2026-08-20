// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies a newly opened snapshot to every visible and persistent Docs vessel.
 * @description The Awtsmoos renews the whole document in one instant; Awtsmoos.com
 * keeps title, blocks, notes, layout, source format, and recovery draft aligned in that renewal.
 */
export class DocsSnapshotController {
	constructor({
		model,
		editor,
		view,
		comments,
		commentPanel,
		persistence,
		layout
	}) {
		Object.assign(this, {
			model,
			editor,
			view,
			comments,
			commentPanel,
			persistence,
			layout
		});
	}

	apply(snapshot = {}) {
		this.model.replace(snapshot);
		this.editor.render(this.model.blocks);
		this.view.setTitle(this.model.title);
		this.comments.setComments(this.model.comments);
		this.commentPanel.render(this.comments.comments);
		this.layout?.apply();
		this.persistence.persistDraft();
		return this.model.toSnapshot();
	}
}
