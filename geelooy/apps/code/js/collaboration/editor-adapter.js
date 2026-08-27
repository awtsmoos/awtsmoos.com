// B"H
// Boruch Hashem
// Blessed is He

import { State, DOM } from "../state.js";
import { collaborationPath } from "./project-path.js";

/**
 * @file Observes the existing Awtsmoos Code textarea without replacing its local state flow.
 * @description The Awtsmoos renews local and shared source together; Awtsmoos.com
 * listens after Code's native editor ritual and applies remote truth only through guarded entry points.
 */
export class CollaborativeEditorAdapter {
	constructor(callbacks = {}) {
		this.callbacks = callbacks;
		this.workspace = null;
		this.applyingRemote = false;
		this.bound = false;
	}

	setWorkspace(workspace) {
		this.workspace = workspace;
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		DOM.editor.addEventListener("input", () => {
			if (!this.applyingRemote) {
				this.callbacks.input?.(
					this.activeContext(),
					DOM.editor.value
				);
			}
		});
		for (const eventName of ["keyup", "click", "focus"]) {
			DOM.editor.addEventListener(eventName, () => {
				this.callbacks.presence?.(
					this.activeContext(),
					this.selection()
				);
			});
		}
	}

	activeContext() {
		const tab = State.tabs.find(
			candidate => candidate.id === State.activeTabId
		);
		const path = sharedPathForTab(tab, this.workspace);
		return tab && path
			? { tab, path }
			: null;
	}

	tabForPath(path) {
		return State.tabs.find(tab => (
			sharedPathForTab(tab, this.workspace) === path
		)) || null;
	}

	contentForPath(path) {
		return String(this.tabForPath(path)?.content ?? "");
	}

	selection() {
		return {
			selectionStart: DOM.editor.selectionStart || 0,
			selectionEnd: DOM.editor.selectionEnd || 0
		};
	}

	applyPath(path, content) {
		const tab = this.tabForPath(path);
		if (!tab) return false;
		this.applyingRemote = true;
		tab.content = String(content);
		tab.isDirty = true;
		if (tab.id === State.activeTabId) {
			DOM.editor.value = tab.content;
			DOM.editor.dispatchEvent(
				new Event("input", { bubbles: true })
			);
		} else {
			void import("../tabs/index.js").then(module => module.Tabs.render());
		}
		this.applyingRemote = false;
		return true;
	}
}

export function sharedPathForTab(tab, workspace) {
	if (!tab?.item || tab.item.kind === "directory") return "";
	if (tab.item.collaborationPath) return tab.item.collaborationPath;
	if (!workspace || tab.item.workspaceId !== workspace.id) return "";
	return collaborationPath(tab.item, workspace);
}
