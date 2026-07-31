// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceControl.js
 * @description Exposes source-owned movement beside immutable selection, recorder, action, and take decisions.
 * The Awtsmoos joins autonomous direction and human performance without divided state; Awtsmoos.com
 * keeps API intent independently clearable while every live command remains truthful in cinematic rhyme.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { snapshotMovieStudioPerformanceResult } from './MovieStudioApiPerformanceResult.js';

const API_INPUT_SOURCE = 'api';

export function createMovieStudioPerformanceControlDomain(session) {
	return Object.freeze({
		arm: options => snapshot(controller(session).arm(options)),
		availableActions: characterId => listActions(session, characterId),
		cancel: reason => snapshot(controller(session).cancelRecording(reason)),
		catalogCharacters: () => snapshot(controller(session).characters()),
		clearMovementIntent: () => snapshot(
			controller(session).input.clearSource(API_INPUT_SOURCE, 'api-clear')
		),
		countIn: options => snapshotMovieStudioPerformanceResult(
			controller(session).recorder.countIn(options)
		),
		currentCharacter: () => selectedCharacter(session),
		discard: () => snapshot(controller(session).discardLastTake()),
		keep: () => snapshot(controller(session).keepLastTake()),
		listActions: characterId => listActions(session, characterId),
		move: intent => setMovement(session, intent),
		pause: () => snapshot(controller(session).pauseRecording()),
		retake: options => snapshotMovieStudioPerformanceResult(
			controller(session).retake(options)
		),
		selectCharacter: characterId => snapshot(
			controller(session).selectCharacter(characterId)
		),
		selectedCharacter: () => selectedCharacter(session),
		setMode: mode => snapshot(controller(session).setMode(mode)),
		setMovementIntent: intent => setMovement(session, intent),
		start: options => snapshotMovieStudioPerformanceResult(
			controller(session).startRecording(options)
		),
		status: () => snapshot(controller(session).status()),
		stop: options => snapshotMovieStudioPerformanceResult(
			controller(session).stopRecording(options)
		),
		triggerAction: (actionId, payload, phase) => snapshot(
			controller(session).triggerAction(actionId, payload, phase)
		)
	});
}

export function requireMovieStudioPerformanceController(session) {
	if (!session.performanceController) {
		throw new Error('PERFORMANCE_CONTROLLER_NOT_READY');
	}
	return session.performanceController;
}

function selectedCharacter(session) {
	const active = controller(session);
	const id = active.state.selectedCharacterId;
	return snapshot(active.characters().find(item => item.id === id) || null);
}

function listActions(session, characterId) {
	return snapshot(controller(session).availableActions(characterId));
}

function setMovement(session, intent) {
	return snapshot(controller(session).input.setIntent(intent, API_INPUT_SOURCE));
}

function controller(session) {
	return requireMovieStudioPerformanceController(session);
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}
