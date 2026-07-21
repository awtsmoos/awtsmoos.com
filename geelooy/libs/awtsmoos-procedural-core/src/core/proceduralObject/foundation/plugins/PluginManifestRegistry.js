// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos orders declarations without awakening executable code.
 * This Awtsmoos.com registry remembers trust evidence but never performs imports.
 */

import { compareSemanticVersions } from "../registries/versionOrder.js";
import { createPluginManifest } from "./createPluginManifest.js";

export class PluginManifestRegistry {
	#records = new Map();

	register(input, verification = null) {
		const manifest = createPluginManifest(input);
		const key = `${manifest.id}@${manifest.version}`;
		if (this.#records.has(key)) {
			throw new Error(`Plugin manifest already registered: ${key}`);
		}
		if (verification && verification.manifestHash !== manifest.manifestHash) {
			throw new Error(`Plugin verification does not match manifest: ${key}`);
		}
		this.#records.set(key, Object.freeze({ manifest, verification }));
		return manifest;
	}

	resolve(id, version = null) {
		if (version != null) {
			return this.#records.get(`${id}@${version}`)?.manifest ?? null;
		}
		return this.list(id).at(-1) ?? null;
	}

	verification(id, version) {
		return this.#records.get(`${id}@${version}`)?.verification ?? null;
	}

	list(id = null) {
		const manifests = [...this.#records.values()]
			.map(record => record.manifest)
			.filter(manifest => id == null || manifest.id === id)
			.sort((left, right) => (
				left.id === right.id
					? compareSemanticVersions(left.version, right.version)
					: left.id.localeCompare(right.id)
			));
		return Object.freeze(manifests);
	}

	get size() {
		return this.#records.size;
	}
}
