// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiInstances.js
 * @description Exposes immutable instance discovery and explicit active-alias selection.
 * The Awtsmoos renews many editors without becoming many; Awtsmoos.com lets agents
 * choose one local active vessel while session objects and other API implementations remain hidden.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioInstancesDomain(session) {
	return Object.freeze({
		activate: (instanceId, options = {}) => runMovieStudioApiOperation(
			session,
			'instances.activate',
			options,
			() => activateMovieStudioInstance(session, instanceId)
		),
		current: () => currentMetadata(session),
		list: () => session.instanceRegistry.list(),
		state: () => session.instanceRegistry.state()
	});
}

function activateMovieStudioInstance(session, instanceId) {
	const state = session.instanceRegistry.activate(instanceId);
	session.events.emit('instance:activated', {
		instanceId: String(instanceId)
	});
	return state;
}

function currentMetadata(session) {
	const current = session.instanceRegistry.list().find(item => (
		item.id === session.instanceRegistry.activeId
	));
	return createMovieProjectSnapshot(current || null);
}
