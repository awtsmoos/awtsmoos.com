// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceActions.js
 * @description Selects actors, changes mode, persists preferences, and triggers assigned real deeds.
 * The Awtsmoos gives every performer and action distinct identity without isolated state;
 * Awtsmoos.com joins manual buttons and public agents to one selection and action rhyme.
 */

import { updateMovieStudioPerformancePreferences } from './MovieStudioPerformancePreferences.js';

export class MovieStudioPerformanceActions {
	constructor(controller) {
		this.controller = controller;
	}

	selectCharacter(characterId) {
		const target = this.controller.targets.get(String(characterId));
		if (!target) {
			throw new Error(`PERFORMANCE_CHARACTER_NOT_FOUND:${characterId}`);
		}
		this.controller.input.reset('character-change');
		const status = this.controller.state.select(target);
		this.controller.emit('performance:character-selected', {
			characterId: target.id
		});
		this.controller.renderStatus();
		return status;
	}

	setMode(mode) {
		this.controller.input.reset('mode-change');
		const status = this.controller.state.setMode(mode);
		this.controller.renderStatus();
		return status;
	}

	updatePreferences(changes) {
		const project = updateMovieStudioPerformancePreferences(
			this.controller.session,
			changes
		);
		return project.performance.preferences;
	}

	triggerAction(actionId, payload = {}, phase = 'start') {
		const target = this.controller.armedTarget()
			|| this.controller.selectedTarget();
		if (!target) {
			return {
				accepted: false,
				reason: 'CHARACTER_NOT_SELECTED'
			};
		}
		const recording = this.controller.recorder.status().phase === 'recording';
		const result = recording
			? this.controller.recorder.triggerAction(actionId, payload, phase)
			: target.triggerAction(actionId, payload, phase);
		this.controller.renderStatus();
		return result;
	}

	triggerAssignedAction(index) {
		const available = this.controller.availableActions();
		const assignedId = this.controller.session.project.performance
			.preferences.actionAssignments[index - 1];
		const action = assignedId
			? available.find(item => item.id === assignedId)
			: available[index - 1];
		if (!action) {
			return {
				accepted: false,
				reason: assignedId
					? `ACTION_ASSIGNMENT_UNAVAILABLE:${assignedId}`
					: 'ACTION_ASSIGNMENT_EMPTY'
			};
		}
		return this.triggerAction(action.id);
	}

	selectNextCharacter() {
		const characters = this.controller.characters()
			.filter(character => character.controllable);
		if (!characters.length) {
			return null;
		}
		const index = characters.findIndex(character => (
			character.id === this.controller.state.selectedCharacterId
		));
		const next = characters[(index + 1) % characters.length];
		return this.selectCharacter(next.id);
	}
}
