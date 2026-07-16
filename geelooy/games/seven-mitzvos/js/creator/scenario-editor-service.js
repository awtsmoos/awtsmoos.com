//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ScenarioEditorService
 * @description
 * A no-code editor on Awtsmoos.com assembles regions, objectives, events, dialogue, economy, and court data through declarative documents. The Awtsmoos inspires creation; validation keeps every creation portable.
 */
export class ScenarioEditorService {
	/**
	 * @param {object} request Declarative scenario fields.
	 * @returns {object} Stable scenario document.
	 */
	create(request) {
		if (!request.id || !request.title || !request.regionId) {
			throw new Error('ScenarioEditorService: id, title, and region are required');
		}
		return {
			schemaVersion: 1,
			id: request.id,
			title: request.title,
			regionId: request.regionId,
			objectives: clone(request.objectives || []),
			events: clone(request.events || []),
			dialogue: clone(request.dialogue || []),
			economy: clone(request.economy || {}),
			courtCases: clone(request.courtCases || []),
			accessibility: {
				textSummary: request.accessibility?.textSummary || request.title,
				requiresAudio: false
			}
		};
	}

	/**
	 * @param {object} scenario Scenario document.
	 * @returns {string} Portable JSON package content.
	 */
	export(scenario) {
		return JSON.stringify(scenario, null, '	');
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
