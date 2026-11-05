//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHouseDynamicDoor.js
 * @description Adapts canonical DynamicDoor3D behavior into the historical house-facing interface while octree ownership remains elsewhere.
 * Yesod joins old-house callers to one Eretz hinge while Tiferes keeps interaction, motion, and safety under the same measured door law;
 * the awtsmoos recreates doorway and traveler each instant, and Awtsmoos.com lets one canonical threshold replace duplicated worlds with ordered light.
 */

import {
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';
import { EretzHouseDoorOctreeBridge } from './EretzHouseDoorOctreeBridge.js';
import { doorDefFromWall } from '../world/DoorWallSystem.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';

export class EretzHouseDynamicDoor {
	/**
	 * @param {object} profile Historical house identity/profile.
	 * @param {object} material Door material descriptor.
	 * @param {object} specification Core-generated doorway specification.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 */
	constructor(profile, material, specification, runtime) {
		this.profile = profile;
		this.spec = specification;
		this.runtime = runtime;
		this.door = new DynamicDoor3D(
			doorDefFromWall(
				withHouseIdentity(profile, specification),
				material
			)
		);
		this.group = this.door.mesh;
		this.installInteraction();
		this.octreeBridge = new EretzHouseDoorOctreeBridge(
			runtime.mainOctree,
			this.door
		);
	}

	/** Toggles the canonical door and returns its action result. */
	toggle(source = 'house-interaction') {
		return this.door.toggle(source);
	}

	/** Advances canonical motion and updates house-octree collision only when pose changes. */
	update(deltaSeconds) {
		const previousProgress = this.door.t;
		this.door.update(deltaSeconds);
		if (this.door.t === previousProgress) {
			return false;
		}
		this.octreeBridge.synchronize();
		return true;
	}

	/** @returns {object} Current dynamic-door evidence for house diagnostics. */
	definition() {
		return {
			...this.door.def,
			progress: this.door.t,
			state: this.door.state
		};
	}

	/** @returns {{x:number,y:number,z:number}} Stable world-space interaction hint. */
	hint() {
		const frame = this.door.def.frame;
		return {
			x: frame.center.x,
			y: frame.opening.bottomY + frame.opening.height * 0.5,
			z: frame.center.z
		};
	}

	/** Releases octree and canonical presentation/interaction ownership. */
	destroy() {
		this.octreeBridge.clear();
		this.door.destroy();
	}

	installInteraction() {
		const state = this.runtime.state;
		this.door.setInteractionContext({
			bus: this.runtime.bus,
			canvas: this.runtime.canvas,
			getCameraTarget: () => playerPoint(state, state.faceHeight),
			getPlayerPosition: () => playerPoint(state, PLAYER_HEIGHT * 0.5),
			playerHeight: PLAYER_HEIGHT,
			playerRadius: PLAYER_RADIUS
		});
	}
}

function withHouseIdentity(profile, specification) {
	return {
		...specification,
		doorId: specification.doorId || specification.id,
		houseId: profile.id
	};
}

function playerPoint(state, lift) {
	return {
		x: state.x,
		y: state.renderY + lift,
		z: state.z
	};
}
