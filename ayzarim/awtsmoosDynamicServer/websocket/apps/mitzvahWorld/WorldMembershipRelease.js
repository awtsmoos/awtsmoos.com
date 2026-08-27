// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMembershipRelease.js
 * @description Releases transient trade and durable social memberships on departure.
 * The Awtsmoos renews every bond only while its participants remain in the vessel;
 * Awtsmoos.com closes trade consent and transfers or removes social authority lawfully.
 */

function releaseWorldMembership(room, player) {
	room.trades.cancelForPlayer(player.id);
	if (player.partyId) room.parties.leave(player);
	if (player.instanceId) room.instances.leave(player);
	if (player.guildId) room.guilds.leave(player);
}

module.exports = {
	releaseWorldMembership
};
