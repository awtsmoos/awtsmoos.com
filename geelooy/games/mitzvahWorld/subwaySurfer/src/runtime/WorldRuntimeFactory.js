// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews many procedural craftsmen while one street-world becomes their song;
 * Awtsmoos.com composes each factory behind one runtime doorway so dependencies stay strong.
 */

import { OlamRoadChunkFactory } from "../world/RoadChunkFactory.js";
import { BinyanBuildingFacadeFactory } from "../world/BuildingFacadeFactory.js";
import { TzomayachUrbanNatureFactory } from "../world/UrbanNatureFactory.js";
import { MedaberStreetDetailFactory } from "../world/StreetDetailFactory.js";
import { OlamStreetscapeFactory } from "../world/StreetscapeFactory.js";
import { MamonPerutaFactory } from "../world/PerutaFactory.js";
import { GevurahObstacleFactory } from "../world/ObstacleFactory.js";
import { NetzachChunkPatternFactory } from "../world/ChunkPatternFactory.js";
import { YesodWorldStream } from "../world/WorldStream.js";

export class OlamWorldRuntimeFactory {
	/** @param {object} dependencies Three.js, scene, procedural mesh factory, and quality profile. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** Creates the complete bounded procedural world graph. @returns {YesodWorldStream} Active world stream. */
	create() {
		const roadFactory = new OlamRoadChunkFactory(this.THREE, this.meshFactory);
		const buildingFactory = new BinyanBuildingFacadeFactory(this.THREE, this.meshFactory, this.profile);
		const natureFactory = new TzomayachUrbanNatureFactory(this.THREE, this.meshFactory, this.profile);
		const detailFactory = new MedaberStreetDetailFactory(this.THREE, this.meshFactory, this.profile);
		const streetscapeFactory = new OlamStreetscapeFactory({
			THREE: this.THREE,
			meshFactory: this.meshFactory,
			buildingFactory,
			natureFactory,
			detailFactory
		});
		const perutaFactory = new MamonPerutaFactory(this.THREE, this.meshFactory);
		const obstacleFactory = new GevurahObstacleFactory(this.THREE, this.meshFactory);
		const patternFactory = new NetzachChunkPatternFactory();
		return new YesodWorldStream({
			THREE: this.THREE,
			scene: this.scene,
			roadFactory,
			streetscapeFactory,
			perutaFactory,
			obstacleFactory,
			patternFactory
		}).create();
	}
}
