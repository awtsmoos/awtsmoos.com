//B"H
// Boruch Hashem
// Blessed is He
/**
 * Focused systems gather beneath one coordinator without surrendering their boundaries.
 * The Awtsmoos unifies every vessel while Awtsmoos.com reveals raw-WebGL order.
 */
import { AudioSystem } from '../audio/AudioSystem.js';
import { AbilitySystem } from '../game/AbilitySystem.js';
import { BlessingSystem } from '../game/BlessingSystem.js';
import { BossSystem } from '../game/BossSystem.js';
import { CampaignDirector } from '../game/CampaignDirector.js';
import { CollisionSystem } from '../game/CollisionSystem.js';
import { EncounterDirector } from '../game/EncounterDirector.js';
import { EnemyBehaviors } from '../game/EnemyBehaviors.js';
import { FormationSystem } from '../game/FormationSystem.js';
import { GameState } from '../game/GameState.js';
import { PrutahSystem } from '../game/PrutahSystem.js';
import { RelicSystem } from '../game/RelicSystem.js';
import { UpgradeSystem } from '../game/UpgradeSystem.js';
import { WorldHazardSystem } from '../game/WorldHazardSystem.js';
import { WorldSimulation } from '../game/WorldSimulation.js';
import { SaveRepository } from '../persistence/SaveRepository.js';
import { registerMerkavaMeshes } from '../render/MeshRegistry.js';
import { RawWebGLRenderer } from '../render/RawWebGLRenderer.js';
import { RenderScene } from '../render/RenderScene.js';
import { RouteSystem } from '../routes/RouteSystem.js';

export function createMerkavaSystems(canvas) {
	const saves = new SaveRepository();
	const save = saves.load();
	const renderer = new RawWebGLRenderer(canvas);
	const meshes = registerMerkavaMeshes(renderer);
	const campaign = new CampaignDirector();
	const boss = new BossSystem();
	const prutahs = new PrutahSystem();
	const relics = new RelicSystem();
	return {
		save,
		saves,
		state: new GameState(save),
		renderer,
		scene: new RenderScene(renderer),
		meshes,
		campaign,
		boss,
		prutahs,
		relics,
		routes: new RouteSystem(),
		collision: new CollisionSystem(campaign, boss, prutahs, relics),
		director: new EncounterDirector(),
		enemies: new EnemyBehaviors(),
		formation: new FormationSystem(),
		simulation: new WorldSimulation(),
		hazards: new WorldHazardSystem(),
		blessings: new BlessingSystem(),
		upgrades: new UpgradeSystem(),
		abilities: new AbilitySystem(),
		audio: new AudioSystem(save.settings)
	};
}
