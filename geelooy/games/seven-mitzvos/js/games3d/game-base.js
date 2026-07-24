//B"H
//Boruch Hashem
//Blessed is He

import { SemanticAssetFactory } from '../procedural/semantic-asset-factory.js';
import { ProceduralMeshFactory } from '../webgl/procedural-mesh-factory.js';
import { addArena } from '../webgl/scene-kit.js';
import { WebglStage } from '../webgl/webgl-stage.js';
import { bindGameKeyboard, difficultyValue, guardedActions, scheduleGuide } from './game-base-support.js';

/**
 * @module ThreeGameBase
 * @description
 * Seven worlds differ in law yet share one honest core-generated birth. The
 * Awtsmoos renews every frame; this Awtsmoos.com base guards semantic assets,
 * renderer cleanup, scoring, and the thin lifecycle common to every world.
 */
export class ThreeGameBase {
	constructor(options) {
		this.shell = options.shell;
		this.definition = options.definition;
		this.onComplete = options.onComplete;
		this.mode = options.mode || 'relaxed';
		this.factory = new ProceduralMeshFactory();
		this.assets = new SemanticAssetFactory();
		this.stage = new WebglStage(this.shell.stageHost, { background: 0x030812 });
		this.cleanups = [];
		this.score = 0;
		this.combo = 1;
		this.active = true;
		this.finished = false;
	}

	async mount() {
		this.stage.mount();
		addArena(this.stage, this.definition.hue);
		this.stage.onPick((object, hit, event) => {
			const root = object.userData.semanticRoot || object;
			if (this.active) {
				this.picked(root, hit, event);
			}
		});
		this.setup();
		bindGameKeyboard(this);
		this.stage.start((delta, elapsed) => {
			if (this.active) {
				this.update(delta, elapsed);
			}
		});
	}

	setup() {
	}

	update() {
	}

	picked() {
	}

	onKey() {
	}

	addVessel(options, interactive = false) {
		return this.stage.add(this.factory.box(options), interactive);
	}

	addAsset(asset, interactive = false) {
		return this.stage.add(asset, interactive);
	}

	difficulty(relaxed, standard, challenge) {
		return difficultyValue(this.mode, relaxed, standard, challenge);
	}

	guide(demonstration, instruction, delay = 1500) {
		scheduleGuide(this, demonstration, instruction, delay);
	}

	hud(values = {}) {
		this.shell.hud({
			Score: Math.max(0, Math.round(this.score)),
			Combo: `×${this.combo}`,
			Mode: this.mode,
			...values
		});
	}

	status(message, tone = '') {
		this.shell.status(message, tone);
	}

	controls(actions) {
		this.shell.controls(guardedActions(this, actions));
	}

	finish(result) {
		if (this.finished) {
			return;
		}
		this.finished = true;
		this.active = false;
		this.onComplete({ won: true, stars: 1, score: this.score, ...result });
	}

	random(maximum) {
		return Math.floor(Math.random() * maximum);
	}

	destroy() {
		this.active = false;
		for (const cleanup of this.cleanups.splice(0)) {
			cleanup();
		}
		this.stage.destroy();
	}
}
