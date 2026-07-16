//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReconnectService
 * @description
 * A returning player on Awtsmoos.com receives a canonical snapshot, missing event tail, role, and absence summary. The Awtsmoos never loses connection; networks must reconcile it explicitly.
 */
export class ReconnectService {
	/**
	 * @param {object} host Authoritative world host.
	 * @param {string} sessionId Authenticated session identity.
	 * @param {number} acknowledgedRevision Last client revision.
	 * @returns {object} Reconnection package.
	 */
	resume(host, sessionId, acknowledgedRevision) {
		const membership = host.membership(sessionId);
		const snapshot = host.snapshotFor(sessionId);
		const events = host.eventsSince(sessionId, acknowledgedRevision);
		return {
			worldId: snapshot.id,
			revision: snapshot.revision,
			role: membership.role,
			snapshot,
			events,
			absenceSummary: {
				missedEvents: events.length,
				fromRevision: acknowledgedRevision,
				toRevision: snapshot.revision
			}
		};
	}
}
