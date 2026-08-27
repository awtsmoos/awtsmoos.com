//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives every spreadsheet command one permission-aware view of selection, workbook, actions, and UI hooks.
 * @description The Awtsmoos lets many commands receive one ordered context without dividing the source of light;
 * Awtsmoos.com keeps mutation gates, prompts, and selected ranges together so every action stays bounded and right.
 */
export class YesodCommandContext {
	constructor({ actions, selection, workbook }) {
		this.actions = actions;
		this.selection = selection;
		this.workbook = workbook;
		this.hooks = {};
	}

	/** Returns whether the current workbook capability permits mutation. */
	get canEdit() {
		return Boolean(this.workbook?.data?.canEdit);
	}

	/** Returns the focused A1 address shared by menu and toolbar commands. */
	get focusAddress() {
		return this.selection?.focus || "A1";
	}

	/** Returns selected addresses beneath the server's multi-cell mutation boundary. */
	addresses(limit = 500) {
		return (this.selection?.addresses?.() || [this.focusAddress])
			.slice(0, Math.max(1, limit));
	}

	/** Returns the focused sparse cell record. */
	cell() {
		return this.workbook.cell(this.focusAddress);
	}

	/** Registers UI-specific capabilities such as dialogs, clipboard, file I/O, or view toggles. */
	registerHooks(hooks = {}) {
		Object.assign(this.hooks, hooks);
	}

	/** Requests one user string through a composed hook or browser prompt fallback. */
	ask(message, fallback = "") {
		if (typeof this.hooks.ask === "function") {
			return this.hooks.ask(message, fallback);
		}
		return globalThis.prompt?.(message, fallback) ?? null;
	}

	/** Announces one lightweight command result through the composed message hook. */
	message(text) {
		this.hooks.message?.(text);
	}

	/** Applies one style patch to the current bounded selection when editing is permitted. */
	async style(patch) {
		if (!this.canEdit) {
			return false;
		}
		await this.actions.style(this.addresses(), patch);
		return true;
	}

	/** Applies explicit value patches through the existing bounded collaboration action. */
	async values(patches) {
		if (!this.canEdit) {
			return false;
		}
		await this.actions.values((patches || []).slice(0, 500));
		return true;
	}
}
