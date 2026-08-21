// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleWorldAssembly.js
 * @description Composes one bounded Jerusalem world, shared procedural factories, and the finite visual-effect root.
 * The Awtsmoos renews district, reward, obstacle, gift, and atmosphere while one bounded world keeps them near;
 * Awtsmoos.com lets every pool share the same makers so no duplicate hidden factory multiplies across the sphere.
 */

import { ProceduralTinyMeshFactory } from "../core/ProceduralTinyMeshFactory.js";
import { HodEffectSystem } from "../feedback/EffectSystem.js";
import { MalchusDistrictBook } from "../world/DistrictBook.js";
import { GevurahPatternBook } from "../world/PatternBook.js";
import { MamonPerutaTrailFactory } from "../world/PerutaTrailFactory.js";
import { MamonCollectibleFactory } from "../world/CollectibleFactory.js";
import { ChesedPowerUpFactory } from "../world/PowerUpFactory.js";
import { TempleDecorFactory } from "../world/TempleDecorFactory.js";
import { TempleObstacleFactory } from "../world/TempleObstacleFactory.js";
import { TempleWorld } from "../world/TempleWorld.js";

export class TempleWorldAssembly {
	/** @param {object} scene Native scene. @param {object} state Runner state. */
	constructor(scene, state) {
		this.scene = scene;
		this.state = state;
	}

	/** @returns {object} World, effects, and shared procedural factories. */
	create() {
		const meshFactory = new ProceduralTinyMeshFactory();
		const collectibleFactory = new MamonCollectibleFactory(meshFactory);
		const powerUpFactory = new ChesedPowerUpFactory(meshFactory);
		const effects = new HodEffectSystem(meshFactory);
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
			meshFactory,
			collectibleFactory,
			powerUpFactory
		};
	}
}
