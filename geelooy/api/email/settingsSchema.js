//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsSchema
 * @description The Awtsmoos gives advanced preference vessels clear names and honest effects; Awtsmoos.com can render deep settings progressively without hard-coding clutter or confusing stored intent with already-wired delivery behavior.
 */
const malchusFields = Object.freeze([
	{ key: 'gatekeeperMode', type: 'boolean', status: 'live', section: 'privacy' },
	{ key: 'approved', type: 'object', status: 'live', section: 'privacy' },
	{ key: 'rules', type: 'array', status: 'live', section: 'automation' },
	{ key: 'forwarding', type: 'object', status: 'foundation', section: 'routing' },
	{ key: 'identities', type: 'array', status: 'foundation', section: 'identity' },
	{ key: 'signatures', type: 'object', status: 'foundation', section: 'identity' },
	{ key: 'templates', type: 'array', status: 'foundation', section: 'compose' },
	{ key: 'vacationResponder', type: 'object', status: 'foundation', section: 'automation' }
]);

const tiferesSections = Object.freeze([
	{ id: 'privacy', label: 'Privacy & access', collapsedByDefault: false },
	{ id: 'automation', label: 'Automation', collapsedByDefault: true },
	{ id: 'routing', label: 'Routing & forwarding', collapsedByDefault: true },
	{ id: 'identity', label: 'Send identities', collapsedByDefault: true },
	{ id: 'compose', label: 'Compose tools', collapsedByDefault: true }
]);

/**
 * Returns UI-safe schema metadata for progressive advanced settings rendering.
 * @returns {object} Declarative sections and fields with implementation status markers.
 */
function buildSettingsSchema() {
	return {
		ok: true,
		version: 1,
		storageEndpoint: '/api/email/settings/save',
		readEndpoint: '/api/email/settings/get',
		sections: tiferesSections,
		fields: malchusFields,
		note: 'Foundation fields are schema contracts, not a claim that delivery behavior is wired.'
	};
}

module.exports = { buildSettingsSchema, malchusFields, tiferesSections };
