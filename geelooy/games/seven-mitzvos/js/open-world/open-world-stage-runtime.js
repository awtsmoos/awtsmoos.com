//B"H
//Boruch Hashem
//Blessed is He

import { OpenWorldCamera } from './open-world-camera.js';
import { OpenWorldContext } from './open-world-context.js';
import { OpenWorldPlayer } from './open-world-player.js';
import { semanticPickRoot } from '../city/living-city-landmarks.js';

/**
 * @file open-world-stage-runtime.js
 * @description
 * The Awtsmoos renews traveler, camera, proximity, and picked meaning as one runtime;
 * Awtsmoos.com lets districts, Realm, civic sites, and Sefirah runes contribute semantic candidates without leaking their laws here.
 * This vessel owns spatial intent only and can explicitly invalidate cached context after a world object's action state changes.
 */
export class OpenWorldStageRuntime {
	constructor(options = {}) {
		this.stage = options.stage;
		this.assets = options.assets;
		this.definitions = options.definitions || [];
		this.districtRoots = options.districtRoots || (() => ({}));
		this.realmPortal = options.realmPortal;
		this.extraContexts = options.extraContexts || (() => []);
		this.initialPosition = options.initialPosition || { x: 0, z: 7 };
		this.onContext = options.onContext || (() => {});
		this.onInteract = options.onInteract || (() => {});
		this.currentContext = null;
	}

	mount() {
		this.contextResolver = new OpenWorldContext(this.definitions);
		this.player = new OpenWorldPlayer(
			this.stage,
			this.assets,
			this.initialPosition
		).mount();
		this.camera = new OpenWorldCamera(this.stage, this.player);
		this.stage.onPick(object => this.handlePick(object));
		this.camera.update();
		this.refreshContext();
		return this;
	}

	update(delta, elapsed) {
		this.player?.update(delta, elapsed);
		this.camera?.update();
		this.refreshContext();
	}

	/** Recomputes nearest context and optionally forces a fresh projection after a state-changing world action. */
	refreshContext(force = false) {
		const position = this.position();
		const next = this.contextResolver?.nearest(
			position,
			this.districtRoots(),
			this.realmPortal,
			this.extraContexts(position)
		) || null;
		if (!force && sameContextProjection(next, this.currentContext)) {
			return;
		}
		this.currentContext = next;
		this.onContext(next);
	}

	setDirection(x, z) {
		this.player?.setDirection(x, z);
	}

	/** Emits only enabled spatial actions, including semantic-pick interaction paths. */
	interact() {
		if (this.currentContext && !this.currentContext.disabled) {
			this.onInteract(this.currentContext);
		}
	}

	focusDistrict(id) {
		const spawn = this.contextResolver?.spawnFor(id, this.districtRoots());
		if (!spawn) {
			return;
		}
		this.player?.teleport(spawn);
		this.camera?.update();
		this.refreshContext();
	}

	position() {
		return this.player?.position() || { ...this.initialPosition };
	}

	handlePick(object) {
		if (this.currentContext?.root === semanticPickRoot(object)) {
			this.interact();
		}
	}

	destroy() {
		this.player?.destroy();
		this.player = null;
		this.camera = null;
		this.currentContext = null;
	}
}

function sameContextProjection(first, second) {
	if (!first || !second) {
		return first === second;
	}
	return first.id === second.id &&
		first.type === second.type &&
		first.label === second.label &&
		Boolean(first.disabled) === Boolean(second.disabled) &&
		first.text === second.text;
}
