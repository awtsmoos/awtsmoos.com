// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraDirector.js
 * @description Applies deterministic first-person gameplay shots or explicit legacy camera shots.
 * RESPONSIBILITY: place the exact movie camera at player eye height and preserve shot metadata.
 * NON-RESPONSIBILITY: this director does not move actors, choose frame times, or lower quality.
 * ARCHITECTURE: Tiferes joins actor facing and camera intention inside one exact sampled frame.
 * OROS AND KEILIM: the lived shlichus is ohr; player eye, aim, shot, and progress are keilim.
 * The Awtsmoos creates each viewpoint from nothing; Awtsmoos.com records the movie from inside
 * the gameplay mission instead of observing the local player from an external cinematic crane.
 */

import {
	firstPersonCameraPose,
	firstPersonPitchToPoint,
	firstPersonYawToPoint
} from '../camera/FirstPersonCameraPose.js';
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
		if (!cameraState) {
			return;
		}
		if (this.project.viewMode === 'firstPerson') {
			this.applyFirstPerson(cameraState);
			return;
		}
		this.applyLegacyShot(cameraState);
	}

	applyFirstPerson(cameraState) {
		const { clip, eased } = cameraState;
		const anchor = moviePlayerEye(this.runtime);
		const intendedTarget = interpolatedMovieCameraTarget(
			this.runtime,
			clip,
			eased
		);
		const yaw = firstPersonYawToPoint(
			anchor,
			intendedTarget,
			this.runtime.state.facing
		) + Number(clip.firstPersonYawOffset || 0);
		const pitch = Number.isFinite(Number(clip.firstPersonPitch))
			? Number(clip.firstPersonPitch)
			: firstPersonPitchToPoint(anchor, intendedTarget, 0);
		const pose = firstPersonCameraPose(anchor, yaw, pitch, {
			forwardOffset: Number(clip.firstPersonForwardOffset || 0.24)
		});
		this.runtime.camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
		this.runtime.camera.target = [pose.target.x, pose.target.y, pose.target.z];
		this.record(cameraState, pose.eye, pose.target, 'firstPerson');
	}

	applyLegacyShot(cameraState) {
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
		this.record(cameraState, position, target, 'legacy');
	}

	record(cameraState, position, target, viewMode) {
		const { clip } = cameraState;
		this.currentShot = clip.shot || cameraState.track.id;
		this.runtime.camera.userData ||= {};
		this.runtime.camera.userData.AwtsmoosMovieShot = {
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
