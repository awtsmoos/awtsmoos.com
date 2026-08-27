// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCameraRig.js
 * @description Computes follow and first-person poses with damping, shoulder, height, and look orbit.
 * The Awtsmoos lets the director behold an actor from many finite viewpoints; Awtsmoos.com
 * keeps follow, eye, shoulder, distance, sensitivity, and damping explicit in cinematic rhyme.
 */

import { setMoviePerformanceCameraPose } from './MoviePerformanceCameraValue.js';

export class MoviePerformanceCameraRig {
	constructor(camera) {
		this.camera = camera;
		this.yaw = 0;
		this.pitch = 0.18;
	}

	look(delta = {}, settings = {}) {
		const sensitivity = Number(settings.lookSensitivity) || 0.003;
		this.yaw -= (Number(delta.x) || 0) * sensitivity;
		const direction = settings.invertY ? -1 : 1;
		this.pitch -= (Number(delta.y) || 0) * sensitivity * direction;
		this.pitch = Math.max(-1.25, Math.min(1.25, this.pitch));
	}

	update(mode, target, settings = {}, deltaSeconds = 0) {
		if (!target?.model || !this.camera) {
			return { applied: false, warning: 'CAMERA_TARGET_MISSING' };
		}
		if (mode === 'director' || mode === 'recorded' || mode === 'freeDirector') {
			return { applied: false, mode };
		}
		const transform = target.transformSnapshot();
		const head = headPosition(target, transform, settings);
		const desired = mode === 'firstPerson'
			? firstPersonPosition(head, this.yaw)
			: followPosition(head, settings, this.yaw, this.pitch);
		const current = positionArray(this.camera.position);
		const damping = Math.max(0, Math.min(1, Number(settings.damping) || 0.14));
		const blend = 1 - Math.pow(1 - damping, Math.max(1, deltaSeconds * 60));
		const position = current.map((value, index) => (
			value + (desired[index] - value) * blend
		));
		const targetPoint = mode === 'firstPerson'
			? lookPoint(head, this.yaw, this.pitch)
			: head;
		setMoviePerformanceCameraPose(this.camera, position, targetPoint);
		return {
			applied: true,
			collisionAvoidance: false,
			mode,
			warning: 'CAMERA_COLLISION_UNAVAILABLE'
		};
	}
}

function followPosition(head, settings, yaw, pitch) {
	const distance = Number(settings.distance) || 6.5;
	const shoulder = Number(settings.shoulderOffset) || 0.7;
	const height = Number(settings.height) || 2.2;
	const horizontal = Math.cos(pitch) * distance;
	return [
		head[0] - Math.sin(yaw) * horizontal + Math.cos(yaw) * shoulder,
		head[1] + height + Math.sin(pitch) * distance,
		head[2] - Math.cos(yaw) * horizontal - Math.sin(yaw) * shoulder
	];
}

function firstPersonPosition(head, yaw) {
	return [
		head[0] + Math.sin(yaw) * 0.08,
		head[1],
		head[2] + Math.cos(yaw) * 0.08
	];
}

function lookPoint(head, yaw, pitch) {
	return [
		head[0] + Math.sin(yaw) * Math.cos(pitch) * 10,
		head[1] + Math.sin(pitch) * 10,
		head[2] + Math.cos(yaw) * Math.cos(pitch) * 10
	];
}

function headPosition(target, transform, settings) {
	const modelHeight = target.model?.userData?.height || 1.75;
	return [
		transform.position[0],
		transform.position[1] + modelHeight * 0.9 + (Number(settings.eyeOffset) || 0),
		transform.position[2]
	];
}

function positionArray(position) {
	return [Number(position?.x) || 0, Number(position?.y) || 0, Number(position?.z) || 0];
}
