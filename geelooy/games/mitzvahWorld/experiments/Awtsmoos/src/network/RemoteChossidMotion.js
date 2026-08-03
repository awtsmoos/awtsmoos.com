// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidMotion.js
	* @description Computes exact remote targets, bounded interpolation, facing, and clips.
	* The Awtsmoos renews motion between packets without erasing the authoritative place;
	* Awtsmoos.com lets a distant Chossid glide, turn, ground, and animate with grace.
	*/

import { PLAYER_SPAWN } from '../app/EretzPlayerStateFactory.js';

export const REMOTE_TELEPORT_DISTANCE_SQUARED = 40 * 40;

export function remoteWorldTarget(remote, ground, footOffset = 0) {
	const position = remote?.position || {};
	const worldSpace = remote?.coordinateSpace === 'world';
	const x = finiteRemoteNumber(position.x) + (worldSpace ? 0 : PLAYER_SPAWN.x);
	const z = finiteRemoteNumber(position.z) + (worldSpace ? 0 : PLAYER_SPAWN.z);
	const y = worldSpace && Number.isFinite(Number(position.y))
		? Number(position.y)
		: remoteGroundHeight(ground, x, z) + footOffset;
	return { x, y, z };
}

export function remoteInterpolationFactor(deltaTime, response = 12) {
	const boundedDelta = Math.min(0.25, Math.max(0, finiteRemoteNumber(deltaTime)));
	return 1 - Math.exp(-boundedDelta * Math.max(0, finiteRemoteNumber(response)));
}

export function shortestFacingDelta(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

export function squaredRemoteDistance(left, right) {
	return (left.x - right.x) ** 2
		+ (left.y - right.y) ** 2
		+ (left.z - right.z) ** 2;
}

export function remoteAnimationClips(names = []) {
	const idle = pickRemoteClip(names, /stand|idle|neutral/i, names[0] || '');
	return {
		idle,
		walk: pickRemoteClip(names, /walk|step|stroll/i, idle)
	};
}

export function remotePlayerMoving(remote) {
	if (typeof remote?.moving === 'boolean') {
		return remote.moving;
	}
	return Math.hypot(
		finiteRemoteNumber(remote?.velocity?.x),
		finiteRemoteNumber(remote?.velocity?.y),
		finiteRemoteNumber(remote?.velocity?.z)
	) > 0.001;
}

export function finiteRemoteNumber(value, fallback = 0) {
	const number = Number(value);
	if (Number.isFinite(number)) {
		return number;
	}
	const fallbackNumber = Number(fallback);
	return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
}

function remoteGroundHeight(ground, x, z) {
	const sample = ground?.heightAt?.(x, z);
	if (Number.isFinite(Number(sample))) {
		return Number(sample);
	}
	if (Number.isFinite(Number(sample?.y))) {
		return Number(sample.y);
	}
	return 0;
}

function pickRemoteClip(names, expression, fallback) {
	return names.find(name => expression.test(name)) || fallback;
}
