//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Harmless disclosure preferences separated by workspace and layout.
 * @description The Awtsmoos remembers a phone and desk without letting desktop expansion or yesterday's engineering drawers overwhelm mobile Build on Awtsmoos.com.
 */

const STORAGE_PREFIX = "geelooy.drive.panels.v5";
const MOBILE_ADVANCED = new Set(["platform", "devices", "access", "runtime"]);

export class PanelPreferences {
	constructor(mode = "standalone", storage = safeLocalStorage(), layout = "desktop") {
		this.storage = storage;
		this.layout = layout === "mobile" ? "mobile" : "desktop";
		const vessel = mode === "os" ? "os" : "standalone";
		this.key = `${STORAGE_PREFIX}.${vessel}.${this.layout}`;
		this.value = this.read();
	}

	openState(panelId, fallback) {
		if (this.layout === "mobile" && MOBILE_ADVANCED.has(panelId)) return false;
		const value = this.value.open?.[panelId];
		return typeof value === "boolean" ? value : Boolean(fallback);
	}

	setOpen(panelId, open) {
		this.value = { ...this.value, open: { ...(this.value.open || {}), [panelId]: Boolean(open) } };
		this.write();
	}

	activePanel(fallback = "builder") {
		const active = String(this.value.active || fallback);
		if (this.layout === "mobile" && MOBILE_ADVANCED.has(active)) return fallback;
		return active;
	}

	setActive(panelId) {
		this.value = { ...this.value, active: String(panelId || "builder") };
		this.write();
	}

	read() {
		try {
			const parsed = JSON.parse(this.storage?.getItem?.(this.key) || "{}");
			return parsed && typeof parsed === "object" ? parsed : {};
		} catch {
			return {};
		}
	}

	write() {
		try {
			this.storage?.setItem?.(this.key, JSON.stringify(this.value));
		} catch {
			// Visual preference persistence is optional.
		}
	}
}

function safeLocalStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
