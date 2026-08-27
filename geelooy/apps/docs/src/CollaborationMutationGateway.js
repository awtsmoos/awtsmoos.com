// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sends title, layout, comment, and presence mutations after local authority checks.
 * @description The Awtsmoos renews every act before a socket can carry it; Awtsmoos.com
 * keeps small document-level mutations together while body-block conflict logic remains elsewhere.
 */
export class CollaborationMutationGateway {
	constructor({ realtime, model, canEdit, onError }) {
		this.realtime = realtime;
		this.model = model;
		this.canEdit = canEdit;
		this.onError = onError;
	}

	title(title) {
		if (!this.#canMutate()) return;
		this.realtime.title(
			this.model.id,
			this.model.revision,
			title
		).catch(this.onError);
	}

	layout(layout) {
		if (!this.#canMutate()) return Promise.resolve(null);
		return this.realtime.layout(
			this.model.id,
			layout
		).then(result => {
			this.model.revision = Math.max(
				this.model.revision,
				Number(result.revision) || 0
			);
			return result;
		}).catch(error => {
			this.onError(error);
			return null;
		});
	}

	comment(mutation) {
		if (!this.#canMutate()) return;
		this.realtime.comment(
			this.model.id,
			mutation
		).catch(this.onError);
	}

	presence(blockId = "") {
		if (!this.model.id) return;
		this.realtime.presence(
			this.model.id,
			blockId,
			this.canEdit() ? "editing" : "viewing"
		).catch(() => {});
	}

	#canMutate() {
		return Boolean(
			this.model.id &&
			this.canEdit()
		);
	}
}
