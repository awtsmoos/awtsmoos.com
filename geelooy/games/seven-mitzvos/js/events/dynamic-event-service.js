//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DynamicEventService
 * @description
 * Dynamic events on Awtsmoos.com declare causes, warnings, triggers, hidden
 * variables, role choices, recovery stages, and archival output. The Awtsmoos
 * creates every occurrence; finite events never appear without causal roots.
 */
export class DynamicEventService {
	create(definition, eventId) {
		validate(definition);
		return {
			id: eventId,
			family: definition.family,
			causes: [...definition.causes],
			prerequisites: [...definition.prerequisites],
			warnings: [...definition.warnings],
			trigger: { ...definition.trigger },
			affectedEntityIds: [...definition.affectedEntityIds],
			immediateEffects: clone(definition.immediateEffects),
			responses: clone(definition.responses),
			hiddenVariables: clone(definition.hiddenVariables || {}),
			recoveryStages: clone(definition.recoveryStages),
			longTermEffects: clone(definition.longTermEffects),
			regionalVariants: clone(definition.regionalVariants || {}),
			multiplayerRoles: [...(definition.multiplayerRoles || [])],
			difficultyScale: definition.difficultyScale || 1,
			status: 'warning',
			selectedResponseId: null,
			recoveryIndex: -1,
			archive: []
		};
	}

	trigger(event, simulationMinute) {
		if (event.status !== 'warning') {
			throw new Error('DynamicEventService: event cannot trigger now');
		}
		return {
			...event,
			status: 'active',
			triggeredAt: simulationMinute,
			archive: [...event.archive, { type: 'triggered', simulationMinute }]
		};
	}

	respond(event, responseId, actorId) {
		const response = event.responses.find(item => item.id === responseId);
		if (event.status !== 'active' || !response) {
			throw new Error('DynamicEventService: response is unavailable');
		}
		return {
			...event,
			status: 'recovering',
			selectedResponseId: responseId,
			recoveryIndex: 0,
			archive: [...event.archive, { type: 'response', responseId, actorId }]
		};
	}
}

function validate(definition) {
	const arrays = [
		'causes', 'prerequisites', 'warnings', 'affectedEntityIds',
		'immediateEffects', 'responses', 'recoveryStages', 'longTermEffects'
	];
	if (!definition.family || !definition.trigger) {
		throw new Error('DynamicEventService: family and trigger are required');
	}
	for (const key of arrays) {
		if (!Array.isArray(definition[key])) {
			throw new Error(`DynamicEventService: ${key} must be an array`);
		}
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
