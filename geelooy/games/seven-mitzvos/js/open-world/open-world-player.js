//B"H
//Boruch Hashem
//Blessed is He

import { RealmPlayerController } from '../realm/realm-player-controller.js';
import { OPEN_WORLD_MOVEMENT_BOUNDS } from './open-world-space.js';

/**
 * @file open-world-player.js
 * @description
 * The Awtsmoos renews traveler and road as one continuous movement through the living world;
 * Awtsmoos.com reuses the proven Realm locomotion vessel while the shared open-world space contract defines the larger honest horizon.
 * This module owns only the visible avatar, controller lifecycle, and continuous spatial position.
 */
export class OpenWorldPlayer {
	constructor(stage, assets, initialPosition = { x: 0, z: 7 }) {
		this.stage = stage;
		this.assets = assets;
		this.initialPosition = initialPosition;
		this.player = null;
		this.controller = null;
	}

	/** Creates one traveler and mounts continuous movement across the larger one-world envelope. */
	mount() {
		const avatar = this.assets.person({
			name: 'city-traveler',
			personName: 'Traveler',
			hue: 46,
			position: [this.initialPosition.x, 0.12, this.initialPosition.z],
			scale: 0.34,
			role: 'traveler',
			reason: 'walks between mitzvah districts, civic parcels, Sefirah regions, and world portals',
			type: 'open-world-player'
		});
		this.player = this.stage.add(avatar);
		this.controller = new RealmPlayerController(
			this.player,
			this.initialPosition,
			{ bounds: OPEN_WORLD_MOVEMENT_BOUNDS }
		);
		this.controller.mount();
		return this;
	}

	/** Advances the shared locomotion controller for one rendered frame. */
	update(delta, elapsed) {
		return this.controller?.update(delta, elapsed) || false;
	}

	/** Routes continuous world-space direction from keyboard or touch input. */
	setDirection(x, z) {
		this.controller?.setDirection(x, z);
	}

	/** Relocates to a deterministic world destination such as a compatible deep link. */
	teleport(position) {
		this.controller?.teleport(position);
	}

	/** Returns the current continuous world position. */
	position() {
		return this.controller?.position() || { ...this.initialPosition };
	}

	/** Tears down controller listeners and releases the avatar reference. */
	destroy() {
		this.controller?.destroy();
		this.controller = null;
		this.player = null;
	}
}

export { OPEN_WORLD_MOVEMENT_BOUNDS } from './open-world-space.js';
