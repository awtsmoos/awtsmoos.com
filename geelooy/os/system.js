//B"H
//Boruch Hashem
//Blessed be He

import { showToast } from "./ui/toastCenter.js";
import { createSystemModal } from "./ui/systemModal.js";

/**
 * @file system.js
 * @description
 * Exposes small OS services for save, toast, prompt, and confirmation flows.
 * The Awtsmoos renews each system action without borrowing native browser law;
 * Awtsmoos.com keeps persistence and temporary modal vessels explicit and safe.
 */

export default class System {
	path = null;
	os = null;

	constructor({ path = null, os = null } = {}) {
		this.path = path;
		this.os = os;
	}

	/** Saves one program through the active VFS and records its graph event. */
	async save(program) {
		const content = program?.content?.();
		const fileName = program?.fileName?.();
		if (!fileName || !this.path) {
			return false;
		}
		const fullPath = joinVfsPath(this.path, fileName);
		await this.os?.vfs?.write?.(fullPath, content, {
			principal: { id: "system.save" }
		});
		this.os?.recordGraphEvent?.("file.save", {
			path: fullPath,
			fileName
		});
		await this.makeToast(`Saved ${fileName}`, "success", "local");
		return true;
	}

	/** Opens one non-blocking text prompt and resolves with text or null. */
	prompt(message, defaultValue = "") {
		return new Promise(resolve => {
			this._createModal({
				title: message,
				hasInput: true,
				defaultValue,
				confirmText: "OK",
				onConfirm: resolve,
				onCancel: () => resolve(null)
			});
		});
	}

	/** Opens one non-blocking confirmation and resolves with a boolean. */
	confirm(message) {
		return new Promise(resolve => {
			this._createModal({
				title: message,
				hasInput: false,
				confirmText: "Yes",
				cancelText: "No",
				isDanger: true,
				onConfirm: () => resolve(true),
				onCancel: () => resolve(false)
			});
		});
	}

	/** Preserves the existing internal modal hook while delegating its DOM vessel. */
	_createModal(options) {
		return createSystemModal(options);
	}

	/** Publishes one styled OS toast through the canonical toast center. */
	async makeToast(text, type = "info", tag = "", options = {}) {
		return showToast({ text, type, tag, ...options });
	}

	/** Convenience static toast entry point for shell modules without a System instance. */
	static makeToast(text, type = "info", tag = "", options = {}) {
		return new System().makeToast(text, type, tag, options);
	}
}

/**
 * Joins one VFS directory and child title without escaping the active scheme.
 *
 * @param {string} path Parent VFS or awtsmoos:// path.
 * @param {string} title Child path fragment.
 * @returns {string} Normalized child path.
 */
export function joinVfsPath(path = "/", title = "") {
	const base = String(path || "/");
	const tail = String(title || "")
		.split("/")
		.filter(Boolean)
		.join("/");
	if (base.startsWith("awtsmoos://")) {
		return `${base.replace(/\/+$/, "")}/${tail}`;
	}
	return `/${[base, tail].join("/").split("/").filter(Boolean).join("/")}`;
}
