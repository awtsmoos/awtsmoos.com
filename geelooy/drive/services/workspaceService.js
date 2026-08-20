//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tiferes façade for Geelooy Drive workspace behavior.
 * @description
 * Tiferes does not swallow every responsibility; it harmonizes smaller vessels into one usable chord.
 * The Awtsmoos renews navigation, mutation, and publication while Awtsmoos.com gives the UI one stable word.
 * Each delegated service keeps a narrow covenant, and this façade preserves a calm public surface above,
 * so future OS-VFS transports can replace Yesod without rewriting every button the user has learned to love.
 */

import { joinWorkspacePath } from "../core/path.js";
import { HodOperationGuard } from "./operationGuard.js";
import { NetzachWorkspaceNavigator } from "./workspaceNavigation.js";
import { GevurahWorkspaceMutations } from "./workspaceMutations.js";
import { HodWorkspacePublishing } from "./workspacePublishing.js";

export class TiferesWorkspaceService {
	constructor(state, transport, navigation, options = {}) {
		this.state = state;
		this.confirmDiscard = options.confirmDiscard || (() => Promise.resolve(false));
		this.guard = new HodOperationGuard(state);
		this.mutations = new GevurahWorkspaceMutations(state, transport, this.guard);
		this.publishing = new HodWorkspacePublishing(state, transport, this.guard);
		this.navigator = new NetzachWorkspaceNavigator(
			state,
			transport,
			navigation,
			this.guard,
			() => this.mayDiscard()
		);
	}

	/** Discover the user's available devices, open the initial folder, and refresh previews. */
	async initialize() {
		const opened = await this.navigator.initialize();
		await this.publishing.refreshPreviews();
		return opened;
	}

	selectDevice(routeReference, options) {
		return this.navigator.selectDevice(routeReference, options);
	}

	navigate(path, options) {
		return this.navigator.navigate(path, options);
	}

	refresh() {
		return this.navigator.refresh();
	}

	/** Open folders relative to the current path and files through the document service. */
	async openEntry(entry) {
		if (!entry) return false;
		if (entry.type === "directory") {
			const currentPath = this.state.snapshot().currentPath;
			return this.navigator.navigate(entry.path || joinWorkspacePath(currentPath, entry.name));
		}
		if (!(await this.mayDiscard())) return false;
		return this.mutations.openFile(entry);
	}

	setDraft(content) {
		this.mutations.setDraft(content);
	}

	saveDocument() {
		return this.mutations.saveDocument();
	}

	/** Create a real remote file and open it only after creation and refresh both succeed. */
	async createFile(name) {
		if (!(await this.mayDiscard())) return false;
		const created = await this.mutations.createFile(name);
		if (!created) return false;
		if (!(await this.navigator.refresh())) return false;
		return this.mutations.openFile(created);
	}

	/** Create a real remote folder and refresh the listing only after mkdir succeeds. */
	async createFolder(name) {
		const created = await this.mutations.createFolder(name);
		if (!created) return false;
		const refreshed = await this.navigator.refresh();
		if (refreshed) this.state.patch({ message: `Created ${created.name}` });
		return refreshed;
	}

	publishCurrentFolder(options) {
		return this.publishing.publishCurrentFolder(options);
	}

	refreshPreviews() {
		return this.publishing.refreshPreviews();
	}

	revokePreview(id) {
		return this.publishing.revokePreview(id);
	}

	setFilter(filter) {
		this.state.patch({ filter: String(filter || "") });
	}

	/** Return true unless an open dirty document explicitly rejects discard. */
	async mayDiscard() {
		return !this.state.snapshot().document?.dirty || Boolean(await this.confirmDiscard());
	}
}
