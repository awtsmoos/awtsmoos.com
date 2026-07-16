//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SandboxPolicy
 * @description
 * Creator data on Awtsmoos.com may describe worlds but may not execute code,
 * read secrets, reach networks, or escape bounded simulation actions. The
 * Awtsmoos is unlimited; community packages remain deliberately finite.
 */
const ALLOWED_ACTIONS = Object.freeze([
	'emit_event',
	'change_resource',
	'open_case',
	'advance_objective',
	'show_dialogue',
	'schedule_event'
]);

export class SandboxPolicy {
	/**
	 * @param {object} scenario Declarative scenario.
	 * @returns {{valid: boolean, errors: string[]}} Sandbox decision.
	 */
	validate(scenario) {
		const errors = [];
		for (const event of scenario.events || []) {
			if (!ALLOWED_ACTIONS.includes(event.action)) {
				errors.push(`forbidden_action:${event.action}`);
			}
			if (containsExecutable(event)) {
				errors.push(`executable_payload:${event.id || 'unknown'}`);
			}
		}
		return { valid: errors.length === 0, errors };
	}
}

function containsExecutable(value) {
	const serialized = JSON.stringify(value).toLowerCase();
	return [
		'javascript:',
		'function(',
		'=>',
		'process.env',
		'child_process',
		'fetch('
	].some(marker => serialized.includes(marker));
}
