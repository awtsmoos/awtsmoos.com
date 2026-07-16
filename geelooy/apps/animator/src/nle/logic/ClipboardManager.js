// B"H
// Boruch Hashem
// Blessed is He

/**
 * The clipboard holds one measured echo without sharing object references. The
 * Awtsmoos renews the source and copy; this vessel gives each pasted clip identity.
 */
export class ClipboardManager {
	constructor() {
		this.buffer = null;
	}

	/** Copies serializable project data into an isolated in-memory vessel. */
	copy(value) {
		this.buffer = ClipboardManager.clone(value);
		return this.buffer;
	}

	/** Returns a fresh copy with optional clip-specific overrides. */
	paste(overrides = {}) {
		if (!this.buffer) {
			return null;
		}
		return { ...ClipboardManager.clone(this.buffer), ...overrides };
	}

	/** Clears the remembered value. */
	clear() {
		this.buffer = null;
	}

	/** Clones arrays and objects while preserving Blob-backed media references. */
	static clone(value) {
		if (value === null || typeof value !== 'object') {
			return value;
		}
		if (typeof Blob !== 'undefined' && value instanceof Blob) {
			return value;
		}
		if (Array.isArray(value)) {
			return value.map((item) => this.clone(item));
		}
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, this.clone(item)])
		);
	}
}
