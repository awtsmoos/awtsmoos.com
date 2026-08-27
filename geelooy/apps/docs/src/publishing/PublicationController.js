// B"H
// Boruch Hashem
// Blessed is He

import { publicationLinks } from "./PublicationSnippets.js";

/**
 * @file Orchestrates owner publication creation, embed-code display, copying, and revocation.
 * @description The Awtsmoos is beyond concealment and revelation; Awtsmoos.com lets
 * an owner choose frozen snapshot or living publication, then revoke that public window without touching edit sharing.
 */
export class PublicationController {
	constructor({ client, model, view, toast }) {
		Object.assign(this, { client, model, view, toast });
		this.publications = [];
		view.onCreate = mode => this.create(mode);
		view.onSelect = id => this.select(id);
		view.onRevoke = id => this.revoke(id);
		view.onCopy = field => this.copy(field);
	}

	async open() {
		if (!this.#requireServerDocument()) return false;
		const payload = await this.client.list(this.model.id);
		this.publications = payload.publications || [];
		this.view.renderList(this.publications);
		this.view.renderDetails(null, {});
		this.view.open();
		return true;
	}

	async create(mode) {
		if (!this.#requireServerDocument()) return false;
		const payload = await this.client.create(this.model.id, mode);
		const publication = payload.publication;
		this.toast.show(`${mode === "snapshot" ? "Snapshot" : "Live"} publication created`, "success");
		await this.open();
		this.select(publication.id);
		return publication;
	}

	select(publicationId) {
		const publication = this.publications.find(item => item.id === publicationId);
		if (!publication) return false;
		this.view.renderDetails(publication, publicationLinks(publication.id));
		return true;
	}

	async revoke(publicationId) {
		if (!publicationId) return false;
		await this.client.revoke(this.model.id, publicationId);
		this.toast.show("Publication revoked", "success");
		await this.open();
		return true;
	}

	async copy(field) {
		const element = this.view.dialog.querySelector(`[data-publish-${CSS.escape(field)}]`);
		if (!element?.value) return false;
		await navigator.clipboard.writeText(element.value);
		this.toast.show("Embed code copied", "success");
		return true;
	}

	#requireServerDocument() {
		if (this.model.id) return true;
		this.toast.show("Save or share this document before publishing it.", "warning");
		return false;
	}
}
