//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleWorldAssembly.js
 * @description Composes one bounded Jerusalem world around a single Core-native surface library, shared procedural factories, and quality-aware finite effects.
 * The Awtsmoos renews district, reward, obstacle, texture, and atmosphere while one bounded world keeps them near;
 * Awtsmoos.com lets every pool share the same makers and quality budget so no duplicate hidden factory multiplies across the sphere.
 */

import { ProceduralTinyMeshFactory } from "../core/ProceduralTinyMeshFactory.js";
import { HodEffectSystem } from "../feedback/EffectSystem.js";
import { YesodTempleSurfaceLibrary } from "../realism/TempleSurfaceLibrary.js";
import { MalchusDistrictBook } from "../world/DistrictBook.js";
import { GevurahPatternBook } from "../world/PatternBook.js";
import { MamonPerutaTrailFactory } from "../world/PerutaTrailFactory.js";
import { MamonCollectibleFactory } from "../world/CollectibleFactory.js";
import { ChesedPowerUpFactory } from "../world/PowerUpFactory.js";
import { TempleDecorFactory } from "../world/TempleDecorFactory.js";
import { TempleObstacleFactory } from "../world/TempleObstacleFactory.js";
import { TempleWorld } from "../world/TempleWorld.js";

export class TempleWorldAssembly {
	/** @param {object} scene Native scene. @param {object} state Runner state. @param {Readonly<object>} qualityBudget Initial concrete visual-quality budget. */
	constructor(scene, state, qualityBudget) {
		this.scene = scene;
		this.state = state;
		this.qualityBudget = qualityBudget;
	}

	/** @returns {object} World, effects, shared surfaces, and procedural factories. */
	create() {
		const surfaceLibrary = new YesodTempleSurfaceLibrary({ qualityBudget: this.qualityBudget });
		const meshFactory = new ProceduralTinyMeshFactory(surfaceLibrary);
		const collectibleFactory = new MamonCollectibleFactory(meshFactory);
		const powerUpFactory = new ChesedPowerUpFactory(meshFactory);
		const effects = new HodEffectSystem(meshFactory, this.qualityBudget);
		const world = new TempleWorld({
			scene: this.scene,
			state: this.state,
			meshFactory,
			districtBook: new MalchusDistrictBook(),
			patternBook: new GevurahPatternBook(),
			trailFactory: new MamonPerutaTrailFactory(),
			decorFactory: new TempleDecorFactory(meshFactory),
			obstacleFactory: new TempleObstacleFactory(meshFactory),
			collectibleFactory,
			powerUpFactory
		}).create();
		this.scene.add(effects.root);
		return {
			world,
			effects,
			surfaceLibrary,
			meshFactory,
			collectibleFactory,
			powerUpFactory
		};
	}
}
