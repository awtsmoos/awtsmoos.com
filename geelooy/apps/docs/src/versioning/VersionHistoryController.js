// B"H
// Boruch Hashem
// Blessed is He

import {
	summarizeVersionDiff,
	versionDiffText
} from "./VersionDiffSummary.js";

/**
 * @file Orchestrates history loading, naming, comparison preview, and append-only restore.
 * @description The Awtsmoos is beyond memory and return; Awtsmoos.com lets a writer
 * inspect an older garment before restoring it as a new present rather than erasing the path that led there.
 */
export class VersionHistoryController {
	constructor({ client, model, view, quickDialog, toast }) {
		Object.assign(this, { client, model, view, quickDialog, toast });
		this.selected = null;
		view.onSelect = id => this.select(id);
		view.onRestore = id => this.restore(id);
		view.onName = () => this.nameCurrent();
	}

	async open() {
		if (!this.#requireServerDocument()) return false;
		const payload = await this.client.list(this.model.id);
		this.view.renderList(payload.versions || []);
		this.view.renderPreview(null, "Select a version to inspect it.");
		this.view.open();
		return true;
	}

	async select(versionId) {
		if (!versionId) return false;
		const payload = await this.client.get(this.model.id, versionId);
		this.selected = payload.version || null;
		const diff = summarizeVersionDiff(this.model.toSnapshot(), this.selected?.snapshot || {});
		this.view.renderPreview(this.selected, versionDiffText(diff));
		return true;
	}

	async nameCurrent() {
		if (!this.#requireServerDocument()) return false;
		const values = await this.quickDialog.ask({
			title: "Name current version",
			fields: [
				{ name: "label", label: "Version name", required: true, maxlength: 120 },
				{ name: "note", label: "Note", maxlength: 1000 }
			],
			submitLabel: "Save version"
		});
		if (!values) return false;
		await this.client.name(this.model.id, values.label, values.note || "");
		this.toast.show("Named version saved", "success");
		if (this.view.dialog.open) await this.open();
		return true;
	}

	async restore(versionId) {
		if (!versionId) return false;
		await this.client.restore(this.model.id, versionId);
		this.toast.show("Version restored as the latest revision", "success");
		this.view.close();
		return true;
	}

	#requireServerDocument() {
		if (this.model.id) return true;
		this.toast.show("Save or share this document before using version history.", "warning");
		return false;
	}
}
