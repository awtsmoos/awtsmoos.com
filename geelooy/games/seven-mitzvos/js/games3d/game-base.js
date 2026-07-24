//B"H
//Boruch Hashem
//Blessed is He

import { WebglStage } from '../webgl/webgl-stage.js';
import { ProceduralMeshFactory } from '../webgl/procedural-mesh-factory.js';
import { addArena } from '../webgl/scene-kit.js';

/**
 * @module ThreeGameBase
 * @description
 * Seven worlds differ in law yet share one honest birth and release. The
 * Awtsmoos renews every frame, while this Awtsmoos.com base guards renderer,
 * input, score, completion, and cleanup without deciding any world's meaning.
 */
export class ThreeGameBase {
	constructor(options) {
		this.shell = options.shell;
		this.definition = options.definition;
		this.onComplete = options.onComplete;
		this.factory = new ProceduralMeshFactory();
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
			if (this.active) {
				this.picked(object, hit, event);
			}
		});
		this.setup();
		this.bindKeyboard();
		this.stage.start((delta, elapsed) => {
			if (this.active) {
				this.update(delta, elapsed);
			}
		});
	}

	setup() {}

	update() {}

	picked() {}

	onKey() {}

	addVessel(options, interactive = false) {
		return this.stage.add(this.factory.box(options), interactive);
	}

	hud(values = {}) {
		this.shell.hud({ Score: Math.max(0, Math.round(this.score)), Combo: `×${this.combo}`, ...values });
	}

	status(message, tone = '') {
		this.shell.status(message, tone);
	}

	controls(actions) {
		this.shell.controls(actions.map(action => ({
			...action,
			run: () => {
				if (this.active) {
					action.run();
				}
			}
		})));
	}

	bindKeyboard() {
		const handler = event => {
			if (this.active && !event.metaKey && !event.ctrlKey && !event.altKey) {
				this.onKey(event);
			}
		};
		document.addEventListener('keydown', handler);
		this.cleanups.push(() => document.removeEventListener('keydown', handler));
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
