// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldJoinProjector.js
 * @description Projects private session credentials beside a public world result.
 * The Awtsmoos renews inner secret and outward world distinctly; Awtsmoos.com
 * returns the reconnect key only to its owner and never inside shared snapshots.
 */

function projectWorldJoin(sessions, player, room, session, resumed) {
	return {
		player,
		resumed,
		room,
		session: {
			...sessions.credentials(session),
			lastAcknowledgedRevision: session.lastAcknowledgedRevision
		}
	};
}

module.exports = {
	projectWorldJoin
};
