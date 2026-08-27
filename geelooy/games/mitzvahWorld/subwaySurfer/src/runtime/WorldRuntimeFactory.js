//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldRuntimeFactory.js
  * @description Composes one profile-aware photographic street from structural forms, advanced core olives, quality-aware Perutas, and
  * one semantic obstacle registry shared by visuals and challenge planning.
 * The Awtsmoos renews road, reward, tree, market, eruv, challenge, and registry before one world may call them aligned;
 * Awtsmoos.com lets Olam spend each quality vessel wisely while rendering and pacing drink from one semantic spring combined.
 */

import { BinyanBuildingFacadeFactory } from "../world/BuildingFacadeFactory.js";
import { NetzachChunkPatternFactory } from "../world/ChunkPatternFactory.js";
import { TzomayachCoreOliveTreeFactory } from "../world/CoreOliveTreeFactory.js";
import { GevurahObstacleFactory } from "../world/ObstacleFactory.js";
import { MamonPerutaFactory } from "../world/PerutaFactory.js";
import { OlamRoadChunkFactory } from "../world/RoadChunkFactory.js";
import { MedaberStreetDetailFactory } from "../world/StreetDetailFactory.js";
import { OlamStreetscapeFactory } from "../world/StreetscapeFactory.js";
import { YesodWorldStream } from "../world/WorldStream.js";

export class OlamWorldRuntimeFactory {
	/**
	  * @description Captures scene, renderer-neutral procedural factories, photographic material ownership, and the active immutable
	  * profile without creating world nodes until requested.
	 * @param {object} chochmahDependencies Three namespace, scene, mesh factory, surface library, and active quality profile.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Builds one bounded stream where roads, facades, details, trees, rewards, obstacles, and challenge selection all share the same profile and semantic registries.
	 * @returns {YesodWorldStream} Created and scene-attached endless procedural world stream.
	 */
	create() {
		const malchusRoad = new OlamRoadChunkFactory(
			this.THREE,
			this.meshFactory
		);
		const binahBuildings = new BinyanBuildingFacadeFactory(
			this.THREE,
			this.meshFactory,
			this.profile
		);
		const tzomayachNature = new TzomayachCoreOliveTreeFactory({
			THREE: this.THREE,
			meshFactory: this.meshFactory,
			profile: this.profile,
			surfaceLibrary: this.surfaceLibrary
		});
		const hodDetails = new MedaberStreetDetailFactory(
			this.THREE,
			this.meshFactory,
			this.profile
		);
		const tiferesStreetscape = new OlamStreetscapeFactory({
			THREE: this.THREE,
			meshFactory: this.meshFactory,
			buildingFactory: binahBuildings,
			natureFactory: tzomayachNature,
			detailFactory: hodDetails,
			profile: this.profile
		});
		const gevurahObstacles = new GevurahObstacleFactory(
			this.THREE,
			this.meshFactory
		);
		const netzachPatterns = new NetzachChunkPatternFactory(
			gevurahObstacles
		);
		const chesedPerutas = new MamonPerutaFactory(
			this.THREE,
			this.meshFactory,
			this.profile
		);
		return new YesodWorldStream({
			THREE: this.THREE,
			scene: this.scene,
			roadFactory: malchusRoad,
			streetscapeFactory: tiferesStreetscape,
			perutaFactory: chesedPerutas,
			obstacleFactory: gevurahObstacles,
			patternFactory: netzachPatterns
		}).create();
	}
}
