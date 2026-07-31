// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformancePreferences.js
 * @description Exposes immutable settings, bindings, action slots, ranges, loops, and capability-aware setters.
 * The Awtsmoos remains one while finite intention wears many controls; Awtsmoos.com keeps
 * key, action, punch, roll, loop, voice, lens, pace, and unsupported requests truthful in rhyme.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import {
	setMovieStudioPerformanceBindings,
	updateMovieStudioPerformancePreferences
} from './MovieStudioPerformancePreferences.js';
import { requireMovieStudioPerformanceController } from './MovieStudioApiPerformanceControl.js';

const RECORDER_FIELDS = Object.freeze([
	'activeLoop', 'countIn', 'loopCount', 'metronome', 'postRoll', 'preRoll',
	'punchIn', 'punchOut', 'recordAudio', 'recordCamera', 'sampleRate'
]);

export function createMovieStudioPerformancePreferencesDomain(session) {
	return Object.freeze({
		actionAssignments: () => snapshot(preferences(session).actionAssignments),
		bindings: () => snapshot(preferences(session).bindings),
		mode: () => snapshot(controller(session).state.mode),
		preferences: () => snapshot(preferences(session)),
		recorderRanges: () => snapshot(recorderValues(preferences(session))),
		setActionAssignments: values => changed(session, { actionAssignments: values }),
		setBindings: bindings => snapshot(
			setMovieStudioPerformanceBindings(session, bindings).performance.preferences
		),
		setPreferences: values => changed(session, capabilityAware(session, values)),
		setRecorderRanges: values => changed(session, recorderChanges(values))
	});
}

function capabilityAware(session, values = {}) {
	if (!values.camera?.collisionAvoidance) {
		return values;
	}
	session.events.emit('performance:missing-capability', {
		capability: 'cameraCollision',
		code: 'PERFORMANCE_CAMERA_COLLISION_UNSUPPORTED',
		revision: session.revision
	});
	return {
		...values,
		camera: {
			...values.camera,
			collisionAvoidance: false
		}
	};
}

function recorderValues(source = {}) {
	return Object.fromEntries(RECORDER_FIELDS.map(field => [field, source[field]]));
}

function recorderChanges(source = {}) {
	return Object.fromEntries(RECORDER_FIELDS
		.filter(field => Object.hasOwn(source, field))
		.map(field => [field, source[field]]));
}

function changed(session, values) {
	const project = updateMovieStudioPerformancePreferences(session, values);
	return snapshot(project.performance.preferences);
}

function preferences(session) {
	return session.project.performance.preferences;
}

function controller(session) {
	return requireMovieStudioPerformanceController(session);
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}
