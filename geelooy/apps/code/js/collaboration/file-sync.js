// B"H
// Boruch Hashem
// Blessed is He

import { UI } from "../ui.js";
import { deriveTextOperation } from "./text-operation.js";

/**
 * @file Serializes outbound source edits and guards remote reconciliation per shared file.
 * @description The Awtsmoos renews every letter without conflict; Awtsmoos.com must
 * compare finite revisions carefully, refusing silent overwrite when local and remote histories diverge.
 */
export class CodeFileSync {
	constructor({ realtime, files, adapter, projectId, canEdit }) {
		this.realtime = realtime;
		this.files = files;
		this.adapter = adapter;
		this.projectId = projectId;
		this.canEdit = canEdit;
	}

	localInput(context, content) {
		if (!context || !this.projectId() || !this.canEdit()) return;
		const file = this.files.get(context.path);
		if (!file || file.conflict) return;
		file.pendingContent = String(content);
		if (!file.inflight) void this.#flush(context.path);
	}

	remoteFile(payload) {
		const file = this.files.get(payload.path);
		if (!file) return;
		const localBefore = this.adapter.contentForPath(payload.path);
		const serverBefore = file.content;
		this.files.accept(
			payload.path,
			payload.operation,
			payload.revision
		);
		if (localBefore === serverBefore) {
			this.adapter.applyPath(payload.path, file.content);
			return;
		}
		this.files.markConflict(payload.path);
		UI.showToast(
			`Remote edit conflicts with local changes in ${payload.path}.`,
			"warning"
		);
	}

	async resolveActiveConflict() {
		const context = this.adapter.activeContext();
		if (!context || !this.projectId()) return false;
		const remote = await this.realtime.sync(
			this.projectId(),
			context.path
		);
		const replace = await UI.showDialog({
			title: "Resolve collaboration conflict",
			message: "Replace this tab with the authoritative shared version? Cancel keeps your local divergent text.",
			okText: "Use shared version",
			cancelText: "Keep local"
		});
		if (!replace) return false;
		this.files.replace(
			context.path,
			remote.content,
			remote.revision
		);
		this.adapter.applyPath(context.path, remote.content);
		UI.showToast("Shared version restored.", "success");
		return true;
	}

	async #flush(path) {
		const file = this.files.get(path);
		if (!file || file.inflight || file.conflict) return;
		const desired = String(
			file.pendingContent ?? this.adapter.contentForPath(path)
		);
		const operation = deriveTextOperation(file.content, desired);
		if (!operation) return;
		file.inflight = true;
		try {
			const result = await this.realtime.patch(
				this.projectId(),
				path,
				file.revision,
				operation
			);
			this.files.accept(
				path,
				result.operation || operation,
				result.revision
			);
		} catch {
			this.files.markConflict(path);
			UI.showToast(
				`Collaboration conflict in ${path}.`,
				"warning"
			);
		} finally {
			file.inflight = false;
			if (
				!file.conflict &&
				this.adapter.contentForPath(path) !== file.content
			) {
				void this.#flush(path);
			}
		}
	}
}
