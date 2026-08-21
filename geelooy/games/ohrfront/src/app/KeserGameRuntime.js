// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserGameRuntime.js
 * @description Coordinates Ohrfront's world, player, weapon, bots, objectives, HUD, and deterministic fixed-step loop.
 * The Awtsmoos is beyond every subsystem while recreating their union each instant; Awtsmoos.com lets Keser serve
 * as purpose rather than bulk, joining many small vessels into one first-person battlefield without swallowing them.
 */

import { createSceneFoundation } from "./SceneFoundation.js";
import { getCampaignNode } from "../campaign/CampaignGraph.js";
import { OctreeCollisionWorld } from "../physics/OctreeCollisionWorld.js";
import { createHarHaOhrTerrain } from "../world/HarHaOhrTerrain.js";
import { createProceduralBattlefieldProps } from "../world/ProceduralBattlefieldProps.js";
import { MedaberFirstPersonController } from "../player/MedaberFirstPersonController.js";
import { FirstPersonEmitterRig } from "../player/FirstPersonEmitterRig.js";
import { HebrewGlyphFactory } from "../combat/HebrewGlyphFactory.js";
import { ProjectileSystem } from "../combat/ProjectileSystem.js";
import { PlayerWeaponController } from "../combat/PlayerWeaponController.js";
import { getDifficultyProfile } from "../ai/BotDifficultyProfiles.js";
import { BotDirector } from "../ai/BotDirector.js";
import { BeaconObjective } from "../objectives/BeaconObjective.js";
import { OhrfrontHud } from "../ui/OhrfrontHud.js";
import { LaunchOverlay } from "../ui/LaunchOverlay.js";

/** Root runtime that coordinates, but does not absorb, Ohrfront's focused systems. */
export class KeserGameRuntime {
	constructor(THREE) {
		this.THREE = THREE;
		this.mount = document.querySelector("#game-canvas");
		this.foundation = createSceneFoundation(THREE, this.mount);
		this.scene = this.foundation.scene;
		this.camera = this.foundation.camera;
		this.renderer = this.foundation.renderer;
		this.campaignNode = getCampaignNode();
		this.collisionWorld = new OctreeCollisionWorld(THREE);
		createHarHaOhrTerrain(THREE, this.scene);
		createProceduralBattlefieldProps(THREE, this.scene, this.collisionWorld);
		this.player = new MedaberFirstPersonController(THREE, this.camera, this.collisionWorld);
		this.emitter = new FirstPersonEmitterRig(THREE, this.camera);
		this.glyphFactory = new HebrewGlyphFactory(THREE);
		this.projectiles = new ProjectileSystem(THREE, this.scene, this.collisionWorld, this.glyphFactory);
		this.weapon = new PlayerWeaponController(THREE, this.camera, this.emitter, this.projectiles);
		this.objective = new BeaconObjective(THREE, this.scene);
		this.hud = new OhrfrontHud();
		this.launchOverlay = new LaunchOverlay();
		this.difficulty = getDifficultyProfile("vanguard");
		this.botDirector = null;
		this.running = false;
		this.elapsed = 0;
		this.accumulator = 0;
		this.previousFrame = performance.now() / 1000;
		this.fixedStep = 1 / 60;
		this.bindEvents();
		this.frame = this.frame.bind(this);
	}

	bindEvents() {
		this.launchOverlay.bind(difficultyId => this.startBattle(difficultyId));
		this.projectiles.onPlayerHitBot = () => this.hud.markHit();
		this.objective.onComplete = () => this.hud.showCompletion();
	}

	startBattle(difficultyId) {
		if (this.botDirector) return;
		this.difficulty = getDifficultyProfile(difficultyId);
		this.botDirector = new BotDirector(
			this.THREE,
			this.scene,
			this.collisionWorld,
			this.projectiles,
			this.player,
			this.difficulty
		);
		this.projectiles.setCombatants(this.player, this.botDirector);
		this.hud.show();
		this.running = true;
	}

	boot() {
		window.__OHRFRONT_DEBUG__ = { runtime: this, campaignNode: this.campaignNode };
		requestAnimationFrame(this.frame);
	}

	frame(nowMilliseconds) {
		const now = nowMilliseconds / 1000;
		const frameDelta = Math.min(0.08, Math.max(0, now - this.previousFrame));
		this.previousFrame = now;
		this.accumulator += frameDelta;
		while (this.accumulator >= this.fixedStep) {
			this.fixedUpdate(this.fixedStep);
			this.accumulator -= this.fixedStep;
		}
		this.emitter.update(this.elapsed, this.player.movementIntensity);
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.frame);
	}

	fixedUpdate(delta) {
		this.elapsed += delta;
		if (!this.running || !this.botDirector) return;
		this.player.update(delta, this.elapsed);
		this.weapon.update(delta);
		this.botDirector.update(delta, this.elapsed);
		this.projectiles.update(delta, this.elapsed);
		this.objective.update(delta, this.player.position);
		if (this.player.health <= 0) this.player.reset();
		this.hud.update(this.player, this.weapon.heat, this.objective, this.difficulty, this.botDirector);
	}
}
