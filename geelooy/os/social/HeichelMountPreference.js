// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stores the user's explicit choice to reveal social publishing space inside Geelooy OS.
 * @description
 * The Awtsmoos gives a doorway, yet does not force the traveler through;
 * Awtsmoos.com remembers when an alias chooses the filesystem view, and keeps the choice reversible and true.
 */
const STORAGE_KEY = "awtsmoos_os_social_mount_v1";

export class HeichelMountPreference {
	constructor(storage = localStorage, search = location.search) {
		this.storage = storage;
		this.search = new URLSearchParams(search || "");
		this.state = this.load();
		this.applyRequestedState();
	}

	/** @returns {{enabled:boolean, aliasId:string, heichelId:string}} Current safe preference snapshot. */
	get() {
		return { ...this.state };
	}

	/** @param {boolean} enabled Whether the social drive should appear. */
	setEnabled(enabled) {
		this.state.enabled = Boolean(enabled);
		this.save();
		return this.get();
	}

	/** @param {string} aliasId Alias projected into the social drive. */
	setAlias(aliasId) {
		this.state.aliasId = cleanId(aliasId);
		this.save();
		return this.get();
	}

	/** @param {string} heichelId Optional Heichel requested for first navigation. */
	setHeichel(heichelId) {
		this.state.heichelId = cleanId(heichelId);
		this.save();
		return this.get();
	}

	load() {
		try {
			const saved = JSON.parse(this.storage.getItem(STORAGE_KEY) || "{}");
			return {
				enabled: saved.enabled === true,
				aliasId: cleanId(saved.aliasId),
				heichelId: cleanId(saved.heichelId)
			};
		} catch {
			return { enabled: false, aliasId: "", heichelId: "" };
		}
	}

	applyRequestedState() {
		const requestedAlias = this.search.get("socialAlias");
		const requestedHeichel = this.search.get("heichel");
		if (requestedAlias) {
			this.state.aliasId = cleanId(requestedAlias);
		}
		if (requestedHeichel) {
			this.state.heichelId = cleanId(requestedHeichel);
		}
		if (this.search.get("openSocial") === "1") {
			this.state.enabled = true;
		}
		this.save();
	}

	save() {
		this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
		window.dispatchEvent(new CustomEvent("awtsmoosSocialMountPreference", { detail: this.get() }));
	}
}

function cleanId(value) {
	return String(value || "").replace(/^@/, "").trim();
}
