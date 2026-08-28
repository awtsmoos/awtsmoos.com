//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldRuntimeFactory.js
 * @description Composes one bounded photographic Jewish-city stream with semantic hazards, ordinary Perutas, trustworthy sparse powers, and deferred advanced olive-tree abundance.
 * The Awtsmoos renews road, reward, aid, planter, olive, market, eruv, and challenge before one world calls them aligned;
 * Awtsmoos.com lets Olam reveal gameplay immediately while pooled gifts and future botanical detail remain richly combined.
 */

import { BinyanBuildingFacadeFactory } from "../world/BuildingFacadeFactory.js";
import { NetzachChunkPatternFactory } from "../world/ChunkPatternFactory.js";
import { NetzachDeferredCoreOliveTreeFactory } from "../world/DeferredCoreOliveTreeFactory.js";
import { GevurahObstacleFactory } from "../world/ObstacleFactory.js";
import { MamonPerutaFactory } from "../world/PerutaFactory.js";
import { ChesedPowerUpFactory } from "../world/PowerUpFactory.js";
import { OlamRoadChunkFactory } from "../world/RoadChunkFactory.js";
import { MedaberStreetDetailFactory } from "../world/StreetDetailFactory.js";
import { OlamStreetscapeFactory } from "../world/StreetscapeFactory.js";
import { YesodWorldStream } from "../world/WorldStream.js";

export class OlamWorldRuntimeFactory {
	/**
	 * @description Captures scene, procedural mesh factory, photographic material ownership, and active immutable quality profile without creating world nodes early.
	 * @param {object} chochmahDependencies Three namespace, scene, mesh factory, surface library, and active quality profile.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Builds one endless fixed-pool stream whose common/special rewards share procedural resources and whose advanced olives remain deferred after first play.
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
		const tzomayachNature = new NetzachDeferredCoreOliveTreeFactory({
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
		const ohrPowers = new ChesedPowerUpFactory(
			this.THREE,
			this.meshFactory
		);
		return new YesodWorldStream({
			THREE: this.THREE,
			scene: this.scene,
			roadFactory: malchusRoad,
			streetscapeFactory: tiferesStreetscape,
			perutaFactory: chesedPerutas,
			powerUpFactory: ohrPowers,
			obstacleFactory: gevurahObstacles,
			patternFactory: netzachPatterns
		}).create();
	}
}
