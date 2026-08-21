//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentApi
 * @description
 * The Awtsmoos lets software ask the site studio directly while Awtsmoos.com returns a stable covenant for correlation, action law, lifecycle, and evidence;
 * correlation stays outside action input so no browser request marker can accidentally become project data, and no receipt pretends to be external verification.
 */

import { AGENT_ACTIONS, actionMetadata } from './agentActionCatalog.js';
import { createAgentActionRunner } from './agentActions.js';
import { beginAgentInvocation } from './agentInvocation.js';
import { createAgentNamespaces } from './agentNamespaces.js';
import {
	AGENT_API_VERSION,
	describeAgentProtocol,
	failureAgentEnvelope,
	successAgentEnvelope
} from './agentProtocol.js';

/** Installs the backward-compatible Website Maker automation API on the browser window. */
export function installAgentApi(service, code, preview) {
	const run = createAgentActionRunner(service, code, preview);
	const invoke = async (name, input = {}, options = {}) => {
		const invocation = beginAgentInvocation(name, options);
		try {
			const result = await run(name, input);
			return successAgentEnvelope(invocation, result);
		} catch (error) {
			const metadata = actionMetadata(name) || {};
			return failureAgentEnvelope(invocation, error, metadata);
		}
	};
	const api = Object.freeze({
		version: AGENT_API_VERSION,
		protocol: describeAgentProtocol,
		actions: () => AGENT_ACTIONS.map(item => ({ ...item })),
		invoke,
		...createAgentNamespaces(invoke)
	});
	window.GeelooySiteBuilder = api;
	return api;
}
