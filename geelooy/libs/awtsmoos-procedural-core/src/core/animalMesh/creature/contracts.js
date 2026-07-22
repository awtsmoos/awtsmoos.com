// B"H
// Boruch Hashem
// Blessed is He

/**
 * Public Four-Worlds type names. These are architectural contracts rather than
 * decorative aliases: intent descends through anatomy and formation into output.
 * The Awtsmoos is not divided by the worlds, yet each world reveals a distinct
 * responsibility and prevents renderer geometry from ruling semantic anatomy.
 */
export const CREATURE_WORLD_TYPES = Object.freeze({
	atzilus: "atzilus-genome",
	briah: "briah-creature",
	yetzirah: "yetzirah-rig",
	asiyah: "asiyah-creature-artifacts"
});

export const CREATURE_VERSION = "1.0.0";

export const DEFAULT_CREATURE_BUDGET = Object.freeze({
	maximumParts: 256,
	maximumBones: 512,
	maximumVertices: 250000,
	maximumTriangles: 500000,
	maximumMaterialLayers: 16,
	maximumTextureBytes: 268435456,
	maximumSkinInfluences: 4,
	maximumCompileTime: 30000,
	maximumTemporaryMemory: 536870912
});

/**
 * Normalized local operation failure carrying a stable machine code.
 * @extends Error
 */
export class CreatureOperationError extends Error {
	constructor(code, message, details = {}) {
		super(message);
		this.name = "CreatureOperationError";
		this.code = code;
		this.details = details;
	}
}
