// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidActor.js
	* @description Animates and disposes one real remote Chossid deterministically.
	* The Awtsmoos gives each distant form a present target and a finite vessel;
	* Awtsmoos.com preserves exact motion, shortest facing, and complete departure cleanup.
	*/

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';
import { disposeRemoteChossidModel } from './RemoteChossidDisposal.js';
import {
	finiteRemoteNumber,
	remoteAnimationClips,
	remoteInterpolationFactor,
	remotePlayerMoving,
	remoteWorldTarget,
	REMOTE_TELEPORT_DISTANCE_SQUARED,
	shortestFacingDelta,
	squaredRemoteDistance
} from './RemoteChossidMotion.js';

const POSITION_RESPONSE = 12;
const FACING_RESPONSE = 16;

export class RemoteChossidActor {
	constructor(gltf, remote, ground) {
		this.disposed = false;
		this.id = remote.id;
		this.ground = ground;
		this.model = gltf.scene;
		this.model.name = `Awtsmoos_remote_chossid_${remote.id}`;
		this.model.scale.set(1.52, 1.52, 1.52);
		this.model.position.set(0, 0, 0);
		this.footOffset = alignModelFeetToGround(this.model, 0).offset ?? 0;
		this.model.setBaseTransform();
		this.player = new TinyAnimationPlayer(this.model, gltf.animations);
		this.clips = remoteAnimationClips(this.player.names);
		this.activeClip = this.clips.idle;
		this.player.play(this.activeClip);
		this.position = { x: 0, y: 0, z: 0 };
		this.target = { x: 0, y: 0, z: 0 };
		this.facing = finiteRemoteNumber(remote.facing);
		this.targetFacing = this.facing;
		this.moving = false;
		this.animationClock = 0;
		this.applySnapshot(remote, true);
	}
	applySnapshot(remote, snap = false) {
		if (this.disposed) return false;
		Object.assign(this.target, remoteWorldTarget(
			remote,
			this.ground,
			this.footOffset
		));
		this.targetFacing = finiteRemoteNumber(remote.facing, this.targetFacing);
		this.moving = remotePlayerMoving(remote);
		const distant = squaredRemoteDistance(this.position, this.target)
			> REMOTE_TELEPORT_DISTANCE_SQUARED;
		if (snap || distant) {
			Object.assign(this.position, this.target);
			this.facing = this.targetFacing;
		}
		return true;
	}
	update(deltaTime) {
		if (this.disposed) return false;
		const positionBlend = remoteInterpolationFactor(deltaTime, POSITION_RESPONSE);
		const facingBlend = remoteInterpolationFactor(deltaTime, FACING_RESPONSE);
		this.position.x += (this.target.x - this.position.x) * positionBlend;
		this.position.y += (this.target.y - this.position.y) * positionBlend;
		this.position.z += (this.target.z - this.position.z) * positionBlend;
		this.facing += shortestFacingDelta(this.targetFacing - this.facing)
			* facingBlend;
		this.updateAnimation(deltaTime);
		this.model.position.set(
			this.position.x,
			this.position.y,
			this.position.z
		);
		this.model.quaternion.set(
			0,
			Math.sin(this.facing / 2),
			0,
			Math.cos(this.facing / 2)
		);
		return true;
	}
	updateAnimation(deltaTime) {
		const wanted = this.moving ? this.clips.walk : this.clips.idle;
		if (wanted !== this.activeClip) {
			this.activeClip = wanted;
			this.player.play(wanted);
		}
		this.animationClock += deltaTime;
		if (this.animationClock >= 1 / 30) {
			this.player.update(this.animationClock);
			this.animationClock = 0;
		}
	}
	dispose() {
		if (this.disposed) return false;
		this.disposed = true;
		this.player?.stop?.();
		disposeRemoteChossidModel(this.model);
		return true;
	}
}

export {
	remoteInterpolationFactor,
	remoteWorldTarget,
	shortestFacingDelta
} from './RemoteChossidMotion.js';
