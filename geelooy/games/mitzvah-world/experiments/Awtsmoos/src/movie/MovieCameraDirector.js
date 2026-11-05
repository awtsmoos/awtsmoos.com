// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraDirector.js
 * @description Applies deterministic first-person or legacy camera position, target, lens, and metadata.
 * The Awtsmoos creates each viewpoint and breadth of sight from nothing; Awtsmoos.com records
 * gameplay eye or cinematic lens as exact finite camera state inside every sampled movie frame.
 */

import {
	firstPersonCameraPose,
	firstPersonPitchToPoint,
	firstPersonYawToPoint
} from '../camera/FirstPersonCameraPose.js';
import { applyMovieCameraLens } from './MovieCameraLens.js';
import { lerpPoint } from './MovieEasing.js';
import {
	interpolatedMovieCameraTarget,
	movieCameraEndpointTarget,
	moviePlayerEye
} from './MovieCameraTarget.js';

export class MovieCameraDirector {
	constructor(runtime, project = {}) {
		this.runtime = runtime;
		this.project = project;
		this.currentShot = '';
	}

	apply(cameraState) {
		if (!cameraState) return;
		const fieldOfView = applyMovieCameraLens(
			this.runtime.camera,
			cameraState.clip,
			cameraState.eased ?? cameraState.progress
		);
		if (this.project.viewMode === 'firstPerson') {
			this.applyFirstPerson(cameraState, fieldOfView);
			return;
		}
		this.applyLegacyShot(cameraState, fieldOfView);
	}

	applyFirstPerson(cameraState, fieldOfView) {
		const { clip, eased } = cameraState;
		const anchor = moviePlayerEye(this.runtime);
		const intendedTarget = interpolatedMovieCameraTarget(this.runtime, clip, eased);
		const yaw = firstPersonYawToPoint(
			anchor, intendedTarget, this.runtime.state.facing
		) + Number(clip.firstPersonYawOffset || 0);
		const pitch = Number.isFinite(Number(clip.firstPersonPitch))
			? Number(clip.firstPersonPitch)
			: firstPersonPitchToPoint(anchor, intendedTarget, 0);
		const pose = firstPersonCameraPose(anchor, yaw, pitch, {
			forwardOffset: Number(clip.firstPersonForwardOffset || 0.24)
		});
		this.runtime.camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
		this.runtime.camera.target = [pose.target.x, pose.target.y, pose.target.z];
		this.record(cameraState, pose.eye, pose.target, 'firstPerson', fieldOfView);
	}

	applyLegacyShot(cameraState, fieldOfView) {
		const { clip, eased } = cameraState;
		const from = clip.from || clip.to || {};
		const to = clip.to || clip.from || {};
		const position = lerpPoint(from.position, to.position, eased);
		const target = lerpPoint(
			movieCameraEndpointTarget(this.runtime, from),
			movieCameraEndpointTarget(this.runtime, to),
			eased
		);
		this.runtime.camera.position.set(position.x, position.y, position.z);
		this.runtime.camera.target = [target.x, target.y, target.z];
		this.record(cameraState, position, target, 'legacy', fieldOfView);
	}

	record(cameraState, position, target, viewMode, fieldOfView) {
		const { clip } = cameraState;
		this.currentShot = clip.shot || cameraState.track.id;
		this.runtime.camera.userData ||= {};
		this.runtime.camera.userData.AwtsmoosMovieShot = {
			fieldOfView,
			id: clip.id,
			position,
			progress: cameraState.progress,
			shot: this.currentShot,
			target,
			viewMode
		};
	}
}

export default MovieCameraDirector;
