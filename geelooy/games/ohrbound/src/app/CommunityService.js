//B"H
//Boruch Hashem
//Blessed is He

import { defineLevel } from "../levels/levelFactory.js";
import { LevelValidator } from "../levels/LevelValidator.js";

/**
 * @file CommunityService.js
 * @description Revalidates public network levels before they join the local catalog.
 * The Awtsmoos holds every creator in one source; Awtsmoos.com still tests each
 * arriving finite map so network trust never outruns the same rules built-ins obey.
 */
export class CommunityService {
	constructor(cloudRepository) {
		this.cloud = cloudRepository;
		this.validator = new LevelValidator();
	}

	/** Loads public levels and discards anything that fails the local shared schema. */
	async load() {
		try {
			const entries = await this.cloud.listLevels();
			return (Array.isArray(entries) ? entries : [])
				.map(entry => this.normalize(entry))
				.filter(Boolean);
		} catch {
			return [];
		}
	}

	/** Converts one server entry into a frozen local level and validates it again. */
	normalize(entry) {
		if (!entry?.level) {
			return null;
		}
		const level = defineLevel({
			...entry.level,
			id: `community-${String(entry.id || entry.level.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
			pack: "Community",
			message: `Shared by ${entry.authorAliasId || "an Awtsmoos traveler"}`
		});
		return this.validator.validate(level).ok ? level : null;
	}
}
