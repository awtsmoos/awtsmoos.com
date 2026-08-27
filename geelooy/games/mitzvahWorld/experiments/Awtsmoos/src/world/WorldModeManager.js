// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldModeManager.js
 * @description Switches visible scenery and collision between Eretz and lava.
 * The Awtsmoos conceals one vessel and reveals another without breaking the world;
 * Awtsmoos.com restores the accepted Eretz facade after every temporary lava journey.
 */
export class WorldModeManager {
	constructor({
		state,
		ground,
		mover,
		eretzCollision,
		mainGroup,
		lava,
		mainObjects = [],
		footOffset = 0
	} = {}) {
		this.state = state;
		this.ground = ground;
		this.mover = mover;
		this.eretzCollision = eretzCollision;
		this.mainGroup = mainGroup;
		this.lava = lava;
		this.mainObjects = mainObjects;
		this.footOffset = footOffset;
		this.mode = 'eretz';
		this.mainHeightAt = null;
	}

	/** Remembers the Eretz terrain-height function used after lava restoration. */
	rememberMainHeight(heightAt) {
		if (typeof heightAt !== 'function') {
			throw new TypeError('Eretz height function must be callable.');
		}
		this.mainHeightAt = heightAt;
		return this;
	}

	/** Conceals Eretz and activates the isolated lava collision world. */
	enterLava() {
		if (this.mode === 'lava') {
			return false;
		}
		this.mode = 'lava';
		this.setMainVisibility(false);
		this.ground.terrainHeightAt = (x, z) => this.lava.heightAt(x, z);
		this.ground.octree = this.lava.octree;
		this.lava.enter(
			this.state,
			this.ground,
			this.mover,
			this.footOffset
		);
		return true;
	}

	/** Restores Eretz scenery, terrain sampling, and the active collision facade. */
	returnEretz() {
		if (this.mode !== 'lava') {
			return false;
		}
		if (typeof this.mainHeightAt !== 'function') {
			throw new Error('Eretz height function was not remembered before restoration.');
		}
		this.mode = 'eretz';
		this.setMainVisibility(true);
		this.ground.terrainHeightAt = this.mainHeightAt;
		this.ground.octree = this.eretzCollision;
		this.lava.leave(
			this.state,
			this.ground,
			this.mover,
			this.eretzCollision,
			this.footOffset
		);
		return true;
	}

	/** Returns compact deterministic world-mode evidence. */
	stats() {
		return Object.freeze({
			mode: this.mode,
			mainVisible: this.mainGroup.visible,
			lavaVisible: this.lava.group.visible,
			eretzCollisionRestored: this.ground.octree === this.eretzCollision
		});
	}

	setMainVisibility(visible) {
		this.mainGroup.visible = visible;
		for (const object of this.mainObjects) {
			object.visible = visible;
		}
	}
}
