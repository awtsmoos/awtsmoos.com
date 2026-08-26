//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldRuntimeFactory.js
 * @description Composes one profile-aware photographic street from large structural forms, advanced core olives, pooled obstacles, and shared materials.
 * The Awtsmoos renews many craftsmen while one measured world remains their song;
 * Awtsmoos.com lets Olam pass one quality covenant through every factory so beauty and smoothness travel along.
 */

import { OlamRoadChunkFactory } from "../world/RoadChunkFactory.js";
import { BinyanBuildingFacadeFactory } from "../world/BuildingFacadeFactory.js";
import { TzomayachCoreOliveTreeFactory } from "../world/CoreOliveTreeFactory.js";
import { MedaberStreetDetailFactory } from "../world/StreetDetailFactory.js";
import { OlamStreetscapeFactory } from "../world/StreetscapeFactory.js";
import { MamonPerutaFactory } from "../world/PerutaFactory.js";
import { GevurahObstacleFactory } from "../world/ObstacleFactory.js";
import { NetzachChunkPatternFactory } from "../world/ChunkPatternFactory.js";
import { YesodWorldStream } from "../world/WorldStream.js";

export class OlamWorldRuntimeFactory {
	/** @param {object} dependencies Three, scene, mesh factory, surface library, and quality profile. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @returns {YesodWorldStream} Complete bounded procedural world stream. */
	create() {
		const roadFactory = new OlamRoadChunkFactory(this.THREE, this.meshFactory);
		const buildingFactory = new BinyanBuildingFacadeFactory(
			this.THREE,
			this.meshFactory,
			this.profile
		);
		const natureFactory = new TzomayachCoreOliveTreeFactory({
			THREE: this.THREE,
			meshFactory: this.meshFactory,
			profile: this.profile,
			surfaceLibrary: this.surfaceLibrary
		});
		const detailFactory = new MedaberStreetDetailFactory(
			this.THREE,
			this.meshFactory,
			this.profile
		);
		const streetscapeFactory = new OlamStreetscapeFactory({
			THREE: this.THREE,
			meshFactory: this.meshFactory,
			buildingFactory,
			natureFactory,
			detailFactory,
			profile: this.profile
		});
		return new YesodWorldStream({
			THREE: this.THREE,
			scene: this.scene,
			roadFactory,
			streetscapeFactory,
			perutaFactory: new MamonPerutaFactory(this.THREE, this.meshFactory),
			obstacleFactory: new GevurahObstacleFactory(this.THREE, this.meshFactory),
			patternFactory: new NetzachChunkPatternFactory()
		}).create();
	}
}
