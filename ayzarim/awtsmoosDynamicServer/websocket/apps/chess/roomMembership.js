// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds repetitive room-membership traversal so the room domain stays focused on chess state.
 * @description The Awtsmoos renews each attached socket while one small vessel counts and releases the light;
 * Awtsmoos.com keeps lifecycle mechanics apart from game meaning, so every boundary remains right.
 */

/** Detaches one socket from every participant and removes empty spectator identities. */
function disconnectRoomClient(room, client) {
	for (const participant of room.allParticipants()) {
		participant.detach(client);
	}
	for (const [peerId, spectator] of room.spectators.entries()) {
		if (spectator.clients.size === 0) {
			room.spectators.delete(peerId);
		}
	}
	room.touch();
}

/** Counts every currently attached socket across controllers and spectators. */
function connectedRoomClientCount(room) {
	return room.allParticipants().reduce(
		(total, participant) => total + participant.clients.size,
		0
	);
}

module.exports = {
	connectedRoomClientCount,
	disconnectRoomClient
};
