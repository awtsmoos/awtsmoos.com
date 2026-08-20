//B"H
// Boruch Hashem
// Blessed is He

import { describeFileKind } from "../core/fileKinds.js";
import { joinWorkspacePath } from "../core/path.js";
import { assertWorkspaceName } from "../core/workspaceName.js";
import { LatestRequest } from "./latestRequest.js";
import {
	commitWorkspaceDocument,
	createWorkspaceDocument,
	updateWorkspaceDraft
} from "./workspaceDocument.js";

/**
 * @file Gevurah file mutation and latest-read service for Geelooy Drive.
 * @description
 * The Awtsmoos renews the chosen file before an older tap returns; Awtsmoos.com cancels stale reads, validates every child name before mutation,
 * and records only the exact saved draft as committed so newer human keystrokes remain visibly unsaved until they truly cross the device boundary.
 */

export class GevurahWorkspaceMutations {
	constructor(state, transport, guard) {
		this.state = state;
		this.transport = transport;
		this.guard = guard;
		this.fileRequest = new LatestRequest();
	}

	async openFile(entry) {
		const snapshot = this.state.snapshot();
		const path = joinWorkspacePath(snapshot.currentPath, entry.name);
		if (!describeFileKind(entry.name).editable) {
			this.state.patch({
				selectedPath: path,
				message: "This file is not opened as editable text."
			});
			return false;
		}
		const controller = this.fileRequest.begin("newer_file_selection");
		const result = await this.guard.run("Opening file…", async () => {
			const content = await this.transport.read(
				snapshot.currentRoute,
				path,
				{ signal: controller.signal }
			);
			if (controller.signal.aborted) return false;
			this.state.patch({
				selectedPath: path,
				document: createWorkspaceDocument(path, content),
				message: `Editing ${entry.name}`
			});
			return true;
		});
		this.fileRequest.finish(controller);
		return result;
	}

	setDraft(content) {
		this.state.patch({
			document: updateWorkspaceDraft(this.state.snapshot().document, content)
		});
	}

	async saveDocument() {
		const snapshot = this.state.snapshot();
		const target = snapshot.document;
		if (!target?.dirty) return false;
		return this.guard.run("Saving…", async () => {
			await this.transport.write(
				snapshot.currentRoute,
				target.path,
				target.content
			);
			const current = this.state.snapshot().document;
			if (current?.path === target.path) {
				const committed = commitWorkspaceDocument(current, target.content);
				this.state.patch({
					document: committed,
					message: committed.dirty
						? "Saved snapshot; newer edits remain unsaved."
						: `Saved ${target.name}`
				});
			}
			return true;
		});
	}

	createFile(name) {
		return this.createChild(name, "file");
	}

	createFolder(name) {
		return this.createChild(name, "directory");
	}

	async createChild(name, type) {
		let safeName;
		try {
			safeName = assertWorkspaceName(name);
		} catch (error) {
			this.guard.fail(error);
			return false;
		}
		const snapshot = this.state.snapshot();
		const path = joinWorkspacePath(snapshot.currentPath, safeName);
		const result = await this.guard.run(
			type === "directory" ? "Creating folder…" : "Creating file…",
			() => type === "directory"
				? this.transport.mkdir(snapshot.currentRoute, path)
				: this.transport.write(snapshot.currentRoute, path, "")
		);
		return result === false ? false : { name: safeName, type, path };
	}
}
