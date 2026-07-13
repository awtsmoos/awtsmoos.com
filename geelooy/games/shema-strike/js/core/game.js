//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Game coordinates focused services while Awtsmoos.com alone renews input, world, frame, and choice.
 * Campaign flow, menu flow, bindings, rendering, accessibility, persistence, and measurement remain separate vessels.
 */
import { AccessibilityProfile } from "../accessibility/accessibilityProfile.js";
import { AudioSystem } from "../audio/audio.js";
import { PerformanceProbe } from "../performance/performanceProbe.js";
import { Camera } from "../render/camera.js";
import { EffectSystem } from "../render/effects.js";
import { Renderer } from "../render/renderer.js";
import { InterfaceView } from "../ui/interface.js";
import { Campaign } from "../world/campaign.js";
import { LevelBuilder } from "../world/levelBuilder.js";
import { bindGameInterface } from "./gameBindings.js";
import { GameFlow } from "./gameFlow.js";
import { GameLoop } from "./gameLoop.js";
import { InputController } from "./input.js";
import { installFlowMethods } from "./installFlowMethods.js";
import { MenuFlow } from "./menuFlow.js";
import { ProgressStore } from "./storage.js";

export class Game {
	constructor(root = document) {
		this.root = root;
		this.canvas = root.getElementById("game-canvas");
		this.store = new ProgressStore();
		this.input = new InputController(root);
		this.audio = new AudioSystem();
		this.camera = new Camera();
		this.effects = new EffectSystem();
		this.accessibility = new AccessibilityProfile(
			this.store,
			this.effects,
			root
		);
		this.performance = new PerformanceProbe();
		this.campaign = new Campaign();
		this.builder = new LevelBuilder();
		this.renderer = new Renderer(this.canvas, this.camera, this.effects);
		this.ui = new InterfaceView(
			this.store,
			() => this.refreshEquipment(),
			() => this.applyPreferences(),
			root
		);
		this.state = "menu";
		this.stageNumber = this.store.data.currentStage || 1;
		this.scene = null;
		this.player = null;
		this.runtime = null;
		this.checkpointSnapshot = null;
		bindGameInterface(this);
		this.applyPreferences();
		this.loop = new GameLoop(
			(delta) => this.update(delta),
			() => this.render(),
			(milliseconds) => this.performance.record(
				milliseconds,
				this.scene,
				this.effects
			)
		);
		globalThis.__SHEMA_STRIKE__ = this;
	}

	applyPreferences() {
		this.accessibility.apply();
		this.ui.applyLanguage();
	}

	start() {
		this.ui.showMenu();
		this.loop.start();
	}

	update(delta) {
		if (this.input.consume("pause")) {
			this.state === "playing"
				? this.pauseGame()
				: this.resumeGame();
		}
		if (this.state !== "playing" || !this.runtime) {
			return;
		}
		const result = this.runtime.update(this.input, delta);
		this.checkpointSnapshot = result.checkpoint ?? this.checkpointSnapshot;
		if (result.checkpoint) {
			this.store.setCheckpoint(result.checkpoint);
		}
		this.camera.follow(this.player, this.scene.width, delta);
		this.ui.hud.update(this.player, this.scene, this.store.data);
		if (result.defeated) {
			this.defeat();
		}
		if (result.completed) {
			this.completeStage();
		}
	}

	render() {
		if (this.scene && this.player) {
			this.renderer.draw(this.scene, this.player);
		}
	}

	refreshEquipment() {
		this.player?.refreshEquipment(this.store.data);
	}
}

installFlowMethods(Game, [GameFlow, MenuFlow]);
