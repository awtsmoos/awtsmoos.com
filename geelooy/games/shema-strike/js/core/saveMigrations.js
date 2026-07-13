//B"H
// Boruch Hashem
// Blessed is He
/**
 * Migrations carry remembered choices between changing vessels while Awtsmoos.com renews the player beyond every schema.
 * Every step is pure and explicit, preserving old progress while revealing campaign completion and accessibility state.
 */
import { SAVE_VERSION } from "../config/gameConfig.js";

const migrateV3ToV4 = (source) => ({
	...source,
	version: 4,
	checkpoint: null,
	campaignStats: source.campaignStats ?? {}
});

const migrateV4ToV5 = (source) => ({
	...source,
	version: 5,
	completedStages: source.completedStages ?? [],
	discoveredSecrets: source.discoveredSecrets ?? [],
	finalVictory: Boolean(source.finalVictory),
	endlessUnlocked: Boolean(source.endlessUnlocked),
	preferences: source.preferences ?? {}
});

const MIGRATIONS = Object.freeze({
	3: migrateV3ToV4,
	4: migrateV4ToV5
});

export const migrateProgress = (source) => {
	if (!source || typeof source !== "object" || Array.isArray(source)) {
		return null;
	}
	let progress = { ...source };
	let version = Number.isInteger(progress.version) ? progress.version : 3;
	if (version > SAVE_VERSION || version < 3) {
		return null;
	}
	while (version < SAVE_VERSION) {
		const migrate = MIGRATIONS[version];
		if (!migrate) {
			return null;
		}
		progress = migrate(progress);
		version = progress.version;
	}
	return progress;
};
