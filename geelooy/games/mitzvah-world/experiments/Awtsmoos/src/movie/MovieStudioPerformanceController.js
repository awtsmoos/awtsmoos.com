// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceController.js
 * @description Unifies performers, gameplay input, cameras, recording, takes, UI, and revisioned API truth.
 * The Awtsmoos is one beyond every finite actor and control; Awtsmoos.com lets hand,
 * keyboard, touch, gamepad, microphone, timeline, and agent reveal one cinematic rhyme.
 */

import { MoviePerformanceCameraRig } from './MoviePerformanceCameraRig.js';
import { MoviePerformanceInputState } from './MoviePerformanceInputState.js';
import { MoviePerformanceMovement } from './MoviePerformanceMovement.js';
import { MoviePerformanceRecorder } from './MoviePerformanceRecorder.js';
import { MovieStudioPerformanceActions } from './MovieStudioPerformanceActions.js';
import { MovieStudioPerformanceDelegates } from './MovieStudioPerformanceDelegates.js';
import {
	movieStudioPerformanceActions,
	movieStudioPerformanceCharacters,
	movieStudioPerformanceStatus,
	movieStudioPerformanceTarget,
	refreshMovieStudioPerformanceModel
} from './MovieStudioPerformanceModel.js';
import { MovieStudioPerformanceRecording } from './MovieStudioPerformanceRecording.js';
import {
	destroyMovieStudioPerformanceAdapters,
	installMovieStudioPerformanceAdapters
} from './MovieStudioPerformanceSetup.js';
import { MovieStudioPerformanceState } from './MovieStudioPerformanceState.js';
import { MovieStudioPerformanceTakeActions } from './MovieStudioPerformanceTakeActions.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export class MovieStudioPerformanceController extends MovieStudioPerformanceDelegates {
	constructor(session, options = {}) {
		super();
		this.session = session;
		this.environment = options.environment || globalThis;
		this.state = new MovieStudioPerformanceState();
		this.input = new MoviePerformanceInputState();
		this.movement = new MoviePerformanceMovement(this.input);
		this.cameraRig = new MoviePerformanceCameraRig(session.runtime.camera);
		this.recorder = new MoviePerformanceRecorder({
			camera: session.runtime.camera,
			emit: (name, detail) => this.emit(name, detail),
			environment: this.environment
		});
		this.actions = new MovieStudioPerformanceActions(this);
		this.takeActions = new MovieStudioPerformanceTakeActions(this);
		this.recording = new MovieStudioPerformanceRecording(this);
		this.targets = new Map();
		this.lastMovement = null;
		installMovieStudioPerformanceAdapters(this, this.environment);
		this.refreshProject();
	}

	refreshProject() {
		return refreshMovieStudioPerformanceModel(this);
	}

	characters() {
		return movieStudioPerformanceCharacters(this);
	}

	selectedTarget() {
		return movieStudioPerformanceTarget(this);
	}

	armedTarget() {
		return movieStudioPerformanceTarget(this, true);
	}

	availableActions(characterId) {
		return movieStudioPerformanceActions(this, characterId);
	}

	active() {
		return !this.session.destroyed && this.state.mode === 'performance';
	}

	settings() {
		return moviePerformanceClone(
			this.session.project.performance.preferences
		);
	}

	status() {
		return movieStudioPerformanceStatus(this);
	}

	renderStatus() {
		this.view?.render(this.status());
	}

	emit(name, detail = {}) {
		return this.session.events.emit(name, {
			...moviePerformanceClone(detail),
			revision: this.session.revision
		});
	}

	destroy() {
		this.recorder.destroy();
		this.movement.destroy();
		this.input.reset('controller-destroy');
		destroyMovieStudioPerformanceAdapters(this);
	}
}
