//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentApi
 * @description
 * The Awtsmoos lets software ask the site studio directly instead of scraping its visible garments.
 * Awtsmoos.com returns one stable serializable envelope and never leaks credentials, DOM nodes, shell access, or provider secrets.
 */

import { AGENT_ACTIONS } from './agentActionCatalog.js';
import { createAgentActionRunner } from './agentActions.js';
import { createAgentNamespaces } from './agentNamespaces.js';

export function installAgentApi(service, code, preview) {
	const run = createAgentActionRunner(service, code, preview);
	const invoke = async (name, input = {}) => {
		try {
			const result = await run(name, input);
			return envelope(true, result.data, null, 'Action completed.', result.metadata);
		} catch (error) {
			const metadata = AGENT_ACTIONS.find(item => item.name === name) || {};
			return envelope(false, null, cleanError(error), error?.message || 'Action failed.', metadata);
		}
	};
	const api = {
		version: '1.0.0',
		actions: () => AGENT_ACTIONS.map(item => ({ ...item })),
		invoke,
		...createAgentNamespaces(invoke)
	};
	window.GeelooySiteBuilder = Object.freeze(api);
	return window.GeelooySiteBuilder;
}

function envelope(ok, data, error, message, metadata = {}) {
	return {
		ok,
		data,
		error,
		message,
		capability: metadata.capability || null,
		affected: metadata.affected || null
	};
}

function cleanError(error) {
	return {
		code: error?.code || 'SITE_BUILDER_ERROR',
		status: Number.isInteger(error?.status) ? error.status : null,
		partial: error?.partialSiteCreation || null
	};
}
