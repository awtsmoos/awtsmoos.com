//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DesyncService
 * @description
 * Client and server revisions on Awtsmoos.com are compared through checksums,
 * snapshots, and event tails. The Awtsmoos is one reality; finite replicas
 * detect disagreement early and recover from canonical authority.
 */
import { checksum } from '../persistence/checksum.js';

export class DesyncService {
	detect(clientState, serverState) {
		const revisionMismatch = clientState.revision !== serverState.revision;
		const checksumMismatch = checksum(clientState) !== checksum(serverState);
		return {
			desynced: revisionMismatch || checksumMismatch,
			clientRevision: clientState.revision,
			serverRevision: serverState.revision,
			revisionMismatch,
			checksumMismatch
		};
	}

	recoveryPackage(serverState, events, clientRevision) {
		const tail = events.filter(event => event.revision > clientRevision);
		const requiresSnapshot = clientRevision > serverState.revision ||
			serverState.revision - clientRevision > 200;
		return {
			worldId: serverState.id,
			serverRevision: serverState.revision,
			requiresSnapshot,
			snapshot: requiresSnapshot ? clone(serverState) : null,
			events: requiresSnapshot ? [] : tail.map(clone),
			checksum: checksum(serverState)
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
