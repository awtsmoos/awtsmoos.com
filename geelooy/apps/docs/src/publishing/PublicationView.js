// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders active/revoked publications and copyable live/snapshot embed doorways.
 * @description The Awtsmoos is beyond public and private; Awtsmoos.com lets an owner
 * see exactly which finite windows remain open, which are frozen, and which have been deliberately closed.
 */
export class PublicationView {
	constructor(dialog) {
		this.dialog = dialog;
		this.list = dialog.querySelector("[data-publication-list]");
		this.details = dialog.querySelector("[data-publication-details]");
		this.onCreate = () => {};
		this.onSelect = () => {};
		this.onRevoke = () => {};
		this.onCopy = () => {};
		this.#bind();
	}

	open() {
		if (!this.dialog.open) this.dialog.showModal();
	}

	close() {
		if (this.dialog.open) this.dialog.close();
	}

	renderList(publications = []) {
		this.list.replaceChildren(...publications.map(publicationButton));
		this.list.classList.toggle("is-empty", publications.length === 0);
	}

	renderDetails(publication, links) {
		this.dialog.dataset.selectedPublication = publication?.id || "";
		this.details.hidden = !publication;
		if (!publication) return;
		setValue(this.dialog, "[data-publish-url]", links.viewerUrl);
		setValue(this.dialog, "[data-publish-iframe]", links.iframe);
		setValue(this.dialog, "[data-publish-script]", links.script);
		const status = this.dialog.querySelector("[data-publish-status]");
		status.textContent = publication.revokedAt
			? `${publication.mode} · revoked`
			: `${publication.mode} · active`;
		this.dialog.querySelector("[data-publish-revoke]").disabled = Boolean(publication.revokedAt);
	}

	#bind() {
		this.dialog.addEventListener("click", event => {
			const create = event.target.closest("[data-publish-create]");
			if (create) void this.onCreate(create.dataset.publishCreate);
			const item = event.target.closest("[data-publication-id]");
			if (item) this.onSelect(item.dataset.publicationId);
			if (event.target.closest("[data-publish-revoke]")) {
				void this.onRevoke(this.dialog.dataset.selectedPublication || "");
			}
			const copy = event.target.closest("[data-publish-copy]");
			if (copy) void this.onCopy(copy.dataset.publishCopy);
			if (event.target.closest("[data-publish-close]")) this.close();
		});
	}
}

function publicationButton(publication) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "publication-item";
	button.dataset.publicationId = publication.id;
	button.textContent = `${publication.mode} · ${publication.revokedAt ? "revoked" : "active"} · ${new Date(publication.createdAt).toLocaleString()}`;
	return button;
}

function setValue(root, selector, value) {
	const element = root.querySelector(selector);
	if (element) element.value = value;
}
