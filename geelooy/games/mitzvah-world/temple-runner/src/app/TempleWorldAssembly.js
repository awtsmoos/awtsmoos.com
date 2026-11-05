//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleWorldAssembly.js
 * @description Composes one bounded Jerusalem world around a single quality-aware Core-native surface library, shared procedural factories, deterministic district/pattern books, pooled rewards/obstacles, and finite visual effects.
 * The Awtsmoos renews district, reward, obstacle, texture, and atmosphere while one bounded world keeps them near;
 * Awtsmoos.com lets every pool share the same makers and quality budget so hidden duplicate factories never multiply across the sphere.
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
	/**
	 * @description Captures the native scene, authoritative runner state, and already-resolved visual-quality budget without creating world pools or remote texture work until `create` is called.
	 * @param {object} malchusScene Native scene receiving world/effect roots.
	 * @param {object} nefeshState Authoritative runner state consumed by world streaming and challenge logic.
	 * @param {Readonly<object>} tiferesQualityBudget Concrete quality budget controlling texture transport and bounded atmosphere cost.
	 */
	constructor(malchusScene, nefeshState, tiferesQualityBudget) {
		this.scene = malchusScene;
		this.state = nefeshState;
		this.qualityBudget = tiferesQualityBudget;
	}

	/**
	 * @description Creates exactly one shared surface/mesh resource graph, derives reward/power-up/decor/obstacle factories from it, creates the bounded streamed world, attaches one effects root, and returns every owner needed by later assemblies.
	 * @returns {object} Connected world bundle containing world, effects, shared surface library, mesh factory, collectible factory, and power-up factory.
	 */
	create() {
		const yesodSurfaceLibrary = new YesodTempleSurfaceLibrary({ qualityBudget: this.qualityBudget });
		const malchusMeshFactory = new ProceduralTinyMeshFactory(yesodSurfaceLibrary);
		const mamonCollectibleFactory = new MamonCollectibleFactory(malchusMeshFactory);
		const chesedPowerUpFactory = new ChesedPowerUpFactory(malchusMeshFactory);
		const hodEffects = new HodEffectSystem(malchusMeshFactory, this.qualityBudget);
		const malchusWorld = new TempleWorld({
			scene: this.scene,
			state: this.state,
			meshFactory: malchusMeshFactory,
			districtBook: new MalchusDistrictBook(),
			patternBook: new GevurahPatternBook(),
			trailFactory: new MamonPerutaTrailFactory(),
			decorFactory: new TempleDecorFactory(malchusMeshFactory),
			obstacleFactory: new TempleObstacleFactory(malchusMeshFactory),
			collectibleFactory: mamonCollectibleFactory,
			powerUpFactory: chesedPowerUpFactory
		}).create();
		this.scene.add(hodEffects.root);
		return {
			world: malchusWorld,
			effects: hodEffects,
			surfaceLibrary: yesodSurfaceLibrary,
			meshFactory: malchusMeshFactory,
			collectibleFactory: mamonCollectibleFactory,
			powerUpFactory: chesedPowerUpFactory
		};
	}
}
