// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteChossidActor.js
 * @description Interpolates one real remote Chossid at its authoritative world position.
 * The Awtsmoos renews motion between network instants; Awtsmoos.com preserves exact targets,
 * shortest-path facing, grounded server fallback, and independent skeletal animation.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { PLAYER_SPAWN } from '../app/EretzPlayerStateFactory.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

const POSITION_RESPONSE = 12;
const FACING_RESPONSE = 16;
const TELEPORT_DISTANCE_SQUARED = 40 * 40;

export class RemoteChossidActor {
	constructor(gltf, remote, ground) {
		this.id = remote.id;
		this.ground = ground;
		this.model = gltf.scene;
		this.model.name = `Awtsmoos_remote_chossid_${remote.id}`;
		this.model.scale.set(1.52, 1.52, 1.52);
		this.model.position.set(0, 0, 0);
		this.footOffset = alignModelFeetToGround(this.model, 0).offset ?? 0;
		this.model.setBaseTransform();
		this.player = new TinyAnimationPlayer(this.model, gltf.animations);
		this.clips = animationClips(this.player.names);
		this.activeClip = this.clips.idle;
		this.player.play(this.activeClip);
		this.position = { x: 0, y: 0, z: 0 };
		this.target = { x: 0, y: 0, z: 0 };
		this.facing = finite(remote.facing);
		this.targetFacing = this.facing;
		this.moving = false;
		this.animationClock = 0;
		this.applySnapshot(remote, true);
	}

	applySnapshot(remote, snap = false) {
		Object.assign(
			this.target,
			remoteWorldTarget(remote, this.ground, this.footOffset)
		);
		this.targetFacing = finite(remote.facing, this.targetFacing);
		this.moving = typeof remote.moving === 'boolean'
			? remote.moving
			: Math.hypot(
				finite(remote.velocity?.x),
				finite(remote.velocity?.y),
				finite(remote.velocity?.z)
			) > 0.001;
		if (snap || squaredDistance(this.position, this.target) > TELEPORT_DISTANCE_SQUARED) {
			Object.assign(this.position, this.target);
			this.facing = this.targetFacing;
		}
	}

	update(deltaTime) {
		const positionBlend = remoteInterpolationFactor(deltaTime, POSITION_RESPONSE);
		const facingBlend = remoteInterpolationFactor(deltaTime, FACING_RESPONSE);
		this.position.x += (this.target.x - this.position.x) * positionBlend;
		this.position.y += (this.target.y - this.position.y) * positionBlend;
		this.position.z += (this.target.z - this.position.z) * positionBlend;
		this.facing += shortestFacingDelta(this.targetFacing - this.facing) * facingBlend;
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
		this.model.position.set(this.position.x, this.position.y, this.position.z);
		this.model.quaternion.set(0, Math.sin(this.facing / 2), 0, Math.cos(this.facing / 2));
	}
}

export function remoteWorldTarget(remote, ground, footOffset = 0) {
	const position = remote?.position || {};
	const worldSpace = remote?.coordinateSpace === 'world';
	const x = finite(position.x) + (worldSpace ? 0 : PLAYER_SPAWN.x);
	const z = finite(position.z) + (worldSpace ? 0 : PLAYER_SPAWN.z);
	const y = worldSpace && Number.isFinite(Number(position.y))
		? Number(position.y)
		: groundHeight(ground, x, z) + footOffset;
	return { x, y, z };
}

export function remoteInterpolationFactor(deltaTime, response = POSITION_RESPONSE) {
	const boundedDelta = Math.min(0.25, Math.max(0, finite(deltaTime)));
	return 1 - Math.exp(-boundedDelta * Math.max(0, finite(response)));
}

export function shortestFacingDelta(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

function groundHeight(ground, x, z) {
	const sample = ground?.heightAt?.(x, z);
	if (Number.isFinite(Number(sample))) return Number(sample);
	if (Number.isFinite(Number(sample?.y))) return Number(sample.y);
	return 0;
}

function squaredDistance(left, right) {
	return (left.x - right.x) ** 2
		+ (left.y - right.y) ** 2
		+ (left.z - right.z) ** 2;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : Number(fallback) || 0;
}

function animationClips(names) {
	const pick = (expression, fallback) => names.find(name => expression.test(name)) || fallback;
	const idle = pick(/stand|idle|neutral/i, names[0] || '');
	return { idle, walk: pick(/walk|step|stroll/i, idle) };
}
