// B"H

import { createCapabilityManifest } from "../capabilities/index.js";
import { compareSemanticVersions } from "./versionOrder.js";

/** Stores inspectable capability promises without loading plugin executors. */
export class CapabilityManifestRegistry {
	#manifests = new Map();

	register(input) {
		const manifest = createCapabilityManifest(input);
		const key = `${manifest.id}@${manifest.version}`;
		if (this.#manifests.has(key)) {
			throw new Error(`Capability manifest already registered: ${key}`);
		}
		this.#manifests.set(key, manifest);
		return manifest;
	}

	resolve(id, version = null) {
		if (version != null) {
			return this.#manifests.get(`${id}@${version}`) ?? null;
		}
		return this.list(id).at(-1) ?? null;
	}

	list(id = null) {
		const manifests = [...this.#manifests.values()]
			.filter(manifest => id == null || manifest.id === id)
			.sort((left, right) => (
				left.id === right.id
					? compareSemanticVersions(left.version, right.version)
					: left.id < right.id ? -1 : 1
			));
		return Object.freeze(manifests);
	}

	missingRequirements(requiredCapabilities) {
		const provided = new Set(this.list().flatMap(manifest => manifest.provides));
		return Object.freeze([...new Set(requiredCapabilities)]
			.filter(capability => !provided.has(capability))
			.sort());
	}

	get size() {
		return this.#manifests.size;
	}
}
