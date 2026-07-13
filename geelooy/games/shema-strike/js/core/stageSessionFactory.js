//B"H
// Boruch Hashem
// Blessed is He
/**
 * A stage session joins recipe, player, systems, preferences, and remembered return while Awtsmoos.com renews the whole encounter.
 * Construction stays separate from navigation so campaign state and executable dependencies remain explicit.
 */
import { DIFFICULTIES } from "../config/catalogs.js";
import { Player } from "../entities/player.js";
import { CombatSystem } from "../systems/combat.js";
import { PickupSystem } from "../systems/pickupSystem.js";
import { StageRuntime } from "../world/stageRuntime.js";

const resolveCheckpoint = (game, stageNumber, retrySnapshot) => {
	const candidate = retrySnapshot ?? game.store.data.checkpoint;
	if (candidate?.stageNumber === stageNumber) {
		return candidate;
	}
	if (game.store.data.checkpoint) {
		game.store.clearCheckpoint();
	}
	return null;
};

export const createStageSession = (game, stageNumber, retrySnapshot = null) => {
	const recipe = game.campaign.get(stageNumber);
	const difficulty = DIFFICULTIES[game.store.data.difficulty] ?? DIFFICULTIES.normal;
	const scene = game.builder.build(recipe, difficulty);
	const player = new Player(scene.spawn.x, scene.spawn.y, game.store.data);
	const combat = new CombatSystem(game.effects, game.audio, game.camera);
	const pickups = new PickupSystem(
		game.effects,
		game.audio,
		(amount) => game.store.addCoins(amount),
		(secretId) => game.store.discoverSecret?.(secretId)
	);
	const checkpointSnapshot = resolveCheckpoint(game, stageNumber, retrySnapshot);
	const runtime = new StageRuntime(
		scene,
		player,
		{ combat, pickups, effects: game.effects, preferences: game.store.data.preferences },
		checkpointSnapshot
	);
	return { recipe, scene, player, runtime, checkpointSnapshot };
};
