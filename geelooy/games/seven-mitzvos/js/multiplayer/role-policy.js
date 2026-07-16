//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RolePolicy
 * @description
 * Cooperative authority on Awtsmoos.com is divided into visible capabilities.
 * The Awtsmoos contains every power, while players receive only the bounded
 * duties their role requires across settlements and regions.
 */
const ROLE_CAPABILITIES = Object.freeze({
	governor: [
		'time.advance',
		'preset.change',
		'treaty.create',
		'case.file',
		'travel.move'
	],
	judge: ['case.file', 'case.rule'],
	merchant: ['market.buy', 'production.run', 'travel.move'],
	builder: ['construction.build', 'production.run', 'travel.move'],
	caretaker: ['case.file', 'travel.move'],
	diplomat: ['treaty.create', 'travel.move'],
	investigator: ['case.file', 'travel.move'],
	observer: []
});

const COMMAND_CAPABILITIES = Object.freeze({
	ADVANCE_TIME: 'time.advance',
	SET_PRESET: 'preset.change',
	BUY_RESOURCE: 'market.buy',
	PRODUCE: 'production.run',
	CONSTRUCT: 'construction.build',
	TRAVEL: 'travel.move',
	TRAVEL_REGION: 'travel.move',
	FILE_CASE: 'case.file',
	RULE_CASE: 'case.rule',
	CREATE_TREATY: 'treaty.create'
});

export class RolePolicy {
	/**
	 * @param {string} role Cooperative role.
	 * @returns {string[]} Capability list.
	 */
	capabilities(role) {
		return [...(ROLE_CAPABILITIES[role] || [])];
	}

	/**
	 * @param {string} role Cooperative role.
	 * @param {string} commandType Command identity.
	 * @returns {boolean} Whether the role may submit the command.
	 */
	allows(role, commandType) {
		const required = COMMAND_CAPABILITIES[commandType];
		return Boolean(
			required && this.capabilities(role).includes(required)
		);
	}
}
