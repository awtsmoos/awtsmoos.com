// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCameraActionController.js
 * @description Creates camera shots and runtime-discovered actor actions at the current playhead.
 * The Awtsmoos renews lens and deed from one cinematic intention; Awtsmoos.com routes
 * captured pose, discovered action, preview, and insertion through canonical project installation.
 */

import { MovieStudioActionBrowser } from './MovieStudioActionBrowser.js';
import {
	addMovieActorAction,
	addMovieCameraShot,
	boundedMovieNumber,
	captureMovieCameraPose
} from './MovieStudioCameraActionProject.js';

export class MovieStudioCameraActionController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.listeners = [];
		this.capturedPose = null;
		this.selectedAction = null;
		this.browser = new MovieStudioActionBrowser(
			session.runtime,
			view,
			record => this.selectAction(record)
		);
		this.bind();
	}

	bind() {
		this.listen(this.view.cameraAddShot, 'click', () => this.addShot());
		this.listen(this.view.cameraAddAction, 'click', () => this.addAction());
		this.listen(this.view.cameraCapturePose, 'click', () => this.capturePose());
	}

	selectAction(record) {
		this.selectedAction = record;
		if (this.view.cameraActionName) this.view.cameraActionName.value = record.id;
		if (record.duration && this.view.cameraShotDuration) {
			this.view.cameraShotDuration.value = String(record.duration);
		}
	}

	capturePose() {
		this.capturedPose = captureMovieCameraPose(this.session.runtime.camera);
		this.status('Camera pose captured.');
	}

	addShot() {
		const style = this.view.cameraShotStyle?.value || 'wide';
		const project = addMovieCameraShot(clone(this.session.project), {
			duration: this.duration(),
			fieldOfView: boundedMovieNumber(this.view.cameraShotFov?.value, 15, 120, 50),
			pose: this.capturedPose,
			start: this.session.time,
			style,
			targetMode: this.view.cameraShotTarget?.value || 'player'
		});
		this.install(project, `Add ${style} camera shot`);
	}

	addAction() {
		const target = String(this.view.cameraActionTarget?.value || 'player');
		const action = String(this.selectedAction?.id || this.view.cameraActionName?.value || 'stand');
		const project = addMovieActorAction(clone(this.session.project), {
			action,
			duration: this.duration(),
			start: this.session.time,
			target
		});
		this.install(project, `Add ${target} action ${action}`);
	}

	duration() {
		return boundedMovieNumber(this.view.cameraShotDuration?.value, 0.1, 60, 3);
	}

	install(project, reason) {
		this.session.installProject(project, { preserveTime: true, preserveTimeline: true, reason });
		this.status(reason);
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}

	status(message) {
		if (this.view.cameraActionStatus) this.view.cameraActionStatus.textContent = message;
	}

	destroy() {
		this.browser.destroy();
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function clone(value) {
	return structuredClone(value);
}
