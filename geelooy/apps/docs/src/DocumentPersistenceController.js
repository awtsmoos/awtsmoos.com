// B"H
// Boruch Hashem
// Blessed is He

import { SourceFormatCodec } from "./formats/SourceFormatCodec.js";
import { DocumentSerializer } from "./model/DocumentSerializer.js";

/**
 * @file Keeps local recovery, source-format saving, Drive persistence, and OS save distinct.
 * @description The Awtsmoos renews one living document while Awtsmoos.com remembers
 * which finite vessel received it, so live sync, local recovery, and filesystem save never blur.
 */
export class DocumentPersistenceController {
	constructor({ model, editor, localStore, drive, embed, status, view }) {
		Object.assign(this, {
			model,
			editor,
			localStore,
			drive,
			embed,
			status,
			view
		});
	}

	serializeDraft() {
		return DocumentSerializer.stringify(this.model.toSnapshot());
	}

	persistDraft() {
		const serialized = this.serializeDraft();
		this.localStore.save(this.model.id || "new", serialized);
		this.embed.changed(serialized);
		return serialized;
	}

	loadDraft(key = "new") {
		const value = this.localStore.load(key);
		return value ? this.loadSerialized(value) : false;
	}

	loadSerialized(value) {
		const snapshot = DocumentSerializer.parse(value);
		this.model.replace(snapshot);
		this.editor.render(this.model.blocks);
		this.view.setTitle(this.model.title);
		return true;
	}

	needsDriveDestination() {
		return !this.embed.enabled && !(
			this.model.drive.aliasId &&
			(this.model.source.path || this.model.drive.path)
		);
	}

	defaultDriveDestination() {
		const source = SourceFormatCodec.serialize(this.model.toSnapshot());
		return {
			aliasId: this.model.drive.aliasId || "",
			path: currentPath(this.model, source.extension)
		};
	}

	async save(destination = {}) {
		const source = SourceFormatCodec.serialize(this.model.toSnapshot());
		if (this.embed.enabled) return this.#saveThroughOs(source);
		return await this.#saveToDrive(source, destination);
	}

	acceptOsSaveResult(payload = {}) {
		if (payload.ok === false) {
			this.status.drive(payload.message || "OS save failed", "warning");
			return;
		}
		if (payload.path) {
			this.model.drive.path = payload.path;
			this.model.source.path = payload.path;
		}
		this.status.drive("Saved by Geelooy OS", "ok");
	}

	#saveThroughOs(source) {
		this.embed.send("save-request", {
			content: source.content,
			mime: source.mime,
			extension: source.extension,
			source: this.model.source
		});
		this.status.drive("Save requested from Geelooy OS", "neutral");
		return null;
	}

	async #saveToDrive(source, destination) {
		const aliasId = String(destination.aliasId || this.model.drive.aliasId || "").trim();
		const path = String(destination.path || currentPath(this.model, source.extension)).trim();
		if (!aliasId) throw new Error("A Drive alias is required to save this document");
		if (!path) throw new Error("A Drive path is required to save this document");
		const visibility = this.model.access.mode === "public-view" ? "public" : "private";
		const result = await this.drive.save({ aliasId, path, content: source.content, mime: source.mime, visibility });
		this.model.drive = { aliasId, path, visibility };
		this.model.source.path = path;
		this.status.drive("Saved to Drive", "ok");
		return result;
	}
}

function currentPath(model, extension) {
	return model.source.path || model.drive.path || model.source.fileName || `${model.title || "Untitled document"}${extension}`;
}
