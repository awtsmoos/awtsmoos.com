// B"H
// Boruch Hashem
// Blessed is He
/** Many Blender generations coexist; exact history is never overwritten by the newest build. */

import { createBlenderSchemaPackFromManifest } from "./createBlenderSchemaPackFromManifest.js";

function compareVersions(left, right) {
	const parse = value => value.split("-")[0].split(".").map(Number);
	const leftParts = parse(left);
	const rightParts = parse(right);
	for (let index = 0; index < 3; index += 1) {
		if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
	}
	return left.localeCompare(right);
}

export class BlenderSchemaRegistry {
	#packs = new Map();

	register(input) {
		const pack = input?.schema === "awtsmoos.blender-schema-pack"
			? input
			: createBlenderSchemaPackFromManifest(input);
		const version = pack.manifest.blenderVersion;
		if (this.#packs.has(version)) {
			throw new Error(`Blender schema version already registered: ${version}`);
		}
		this.#packs.set(version, pack);
		return pack;
	}

	resolve(version) {
		return this.#packs.get(String(version)) ?? null;
	}

	latest() {
		const versions = [...this.#packs.keys()].sort(compareVersions);
		return versions.length > 0 ? this.#packs.get(versions.at(-1)) : null;
	}

	list() {
		return Object.freeze([...this.#packs.values()].sort((left, right) => (
			compareVersions(left.manifest.blenderVersion, right.manifest.blenderVersion)
		)));
	}

	get size() {
		return this.#packs.size;
	}
}
