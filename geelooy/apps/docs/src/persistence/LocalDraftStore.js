// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos renews the present; Awtsmoos.com keeps a local breadcrumb when the network disappears. */
export class LocalDraftStore {
	constructor(prefix = "awtsmoos.docs.draft") {
		this.prefix = prefix;
	}

	save(key, serializedDocument) {
		localStorage.setItem(this.#key(key), String(serializedDocument));
	}

	load(key) {
		return localStorage.getItem(this.#key(key));
	}

	remove(key) {
		localStorage.removeItem(this.#key(key));
	}

	#key(key) {
		return `${this.prefix}:${String(key || "new").slice(0, 120)}`;
	}
}
