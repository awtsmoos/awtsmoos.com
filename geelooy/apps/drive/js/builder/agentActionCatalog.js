//B"H
// Boruch Hashem
// Blessed is He

import { AGENT_ACTION_DEFINITIONS } from './agentActionDefinitions.js';

/**
 * @module AgentActionCatalog
 * @description
 * The Awtsmoos joins old flat compatibility with new organized discovery while Awtsmoos.com keeps replay, reconciliation, idempotency, and evidence law attached to the same stable action names;
 * this Tiferes compiler turns pure definitions into the public contracts consumed by both legacy callers and the richer discovery surface.
 */

const RECONCILIATION = Object.freeze({
	'site.project.setBrief': 'site.project.collect',
	'site.files.write': 'site.files.read',
	'site.files.create': 'site.files.read',
	'site.code.updateCurrent': 'site.code.inspect',
	'site.publish.apply': 'site.publish.status',
	'site.domain.claim': 'site.domain.plan',
	'site.domain.verify': 'site.domain.plan',
	'site.domain.activate': 'site.domain.plan',
	'site.domain.remove': 'site.domain.plan'
});

export const AGENT_ACTIONS = Object.freeze(
	AGENT_ACTION_DEFINITIONS.map(definition => Object.freeze(compileAction(definition)))
);

/** Returns one immutable action contract by exact machine name. */
export function actionMetadata(name) {
	return AGENT_ACTIONS.find(item => item.name === name) || null;
}

/** Returns immutable flat actions matching optional group and capability filters. */
export function filterAgentActions(filter = {}) {
	const group = String(filter.group || '').trim();
	const capability = String(filter.capability || '').trim();
	return AGENT_ACTIONS.filter(item => {
		if (group && item.group !== group) {
			return false;
		}
		if (capability && item.capability !== capability) {
			return false;
		}
		return true;
	});
}

function compileAction(definition) {
	const mutates = definition.mutates === true;
	return {
		...definition,
		available: true,
		evidenceScope: evidenceScope(definition.name, definition.group),
		replay: mutates ? 'reconcile-before-replay' : 'safe-read',
		reconcileAction: RECONCILIATION[definition.name] || null,
		idempotency: mutates ? 'not-provided' : 'not-applicable',
		externalVerification: 'not-implied'
	};
}

function evidenceScope(name, group) {
	if (name.startsWith('site.publish.')) {
		return 'canonical-publication';
	}
	if (name.startsWith('site.domain.')) {
		return 'domain-hosting';
	}
	if (name.startsWith('site.nameservers.')) {
		return 'nameserver-plan';
	}
	if (name.startsWith('site.preview.')) {
		return 'source-preview';
	}
	if (name.startsWith('site.code.')) {
		return 'editor-and-source';
	}
	if (group === 'source') {
		return 'drive-source';
	}
	return 'project-testimony';
}
