// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceModel.js
 * @description Refreshes runtime roster, recorded voice, and immutable acting status after project changes.
 * The Awtsmoos renews every actor and sound without confusing runtime and authored memory;
 * Awtsmoos.com gives selection, capability, recording, recovery, voice, and settings one readable rhyme.
 */

import {
	catalogMoviePerformanceCharacters,
	discoverMoviePerformanceTargets
} from './MoviePerformanceRoster.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function refreshMovieStudioPerformanceModel(controller) {
	const phase = controller.recorder.status().phase;
	if (['countdown', 'preRoll', 'recording', 'paused', 'postRoll'].includes(phase)) {
		controller.recording.cancel('project-replaced');
	}
	const targets = discoverMoviePerformanceTargets(
		controller.session.runtime,
		controller.session.project
	);
	controller.targets = new Map(
		targets.map(target => [target.id, target])
	);
	controller.audioDirector?.setProject(
		controller.session.project
	);
	if (!controller.targets.has(controller.state.selectedCharacterId)) {
		const target = targets.find(item => item.model)
			|| targets[0]
			|| null;
		controller.state.select(target);
	}
	controller.renderStatus();
	return catalogMoviePerformanceCharacters(targets);
}

export function movieStudioPerformanceCharacters(controller) {
	return catalogMoviePerformanceCharacters(
		[...controller.targets.values()]
	);
}

export function movieStudioPerformanceTarget(controller, armed = false) {
	const id = armed
		? controller.state.armedCharacterId
		: controller.state.selectedCharacterId;
	return controller.targets.get(id) || null;
}

export function movieStudioPerformanceActions(controller, characterId) {
	const id = characterId || controller.state.selectedCharacterId;
	return moviePerformanceClone(
		controller.targets.get(id)?.actionCapabilities() || []
	);
}

export function movieStudioPerformanceStatus(controller) {
	const warning = controller.state.warning
		|| controller.lastMovement?.capabilityWarnings?.join(', ')
		|| null;
	return controller.state.snapshot({
		actions: movieStudioPerformanceActions(controller),
		active: controller.active(),
		characters: movieStudioPerformanceCharacters(controller),
		recorder: controller.recorder.status(),
		recovery: controller.session.project.performance.recovery,
		settings: controller.settings(),
		takes: controller.session.project.performance.takes,
		warning
	});
}
