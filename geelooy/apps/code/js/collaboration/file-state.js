// B"H
// Boruch Hashem
// Blessed is He

import { applyTextOperation } from "./text-operation.js";

/**
 * @file Keeps authoritative shared-file text and revision shadows separate from local tabs.
 * @description The Awtsmoos renews all text beyond version; Awtsmoos.com keeps a
 * finite server shadow so remote truth can be compared before any local source is replaced.
 */
export class SharedFileState {
	constructor() {
		this.files = new Map();
	}

	load(project = {}) {
		this.files.clear();
		for (const file of project.files || []) {
			this.files.set(file.path, this.#stateFor(file));
		}
	}

	get(path) {
		return this.files.get(path) || null;
	}

	ensure(path, content = "", revision = 0) {
		let file = this.get(path);
		if (!file) {
			file = this.#stateFor({ path, content, revision });
			this.files.set(path, file);
		}
		return file;
	}

	accept(path, operation, revision) {
		const file = this.ensure(path);
		file.content = applyTextOperation(
			file.content,
			operation
		);
		file.revision = Number(revision) || file.revision;
		return file;
	}

	replace(path, content, revision) {
		const file = this.ensure(path);
		file.content = String(content || "");
		file.revision = Number(revision) || 0;
		file.conflict = false;
		file.inflight = false;
		file.pendingContent = file.content;
		return file;
	}

	markConflict(path) {
		const file = this.ensure(path);
		file.conflict = true;
		return file;
	}

	#stateFor(file) {
		const content = String(file.content || "");
		return {
			path: file.path,
			content,
			revision: Number(file.revision) || 0,
			conflict: false,
			inflight: false,
			pendingContent: content
		};
	}
}
