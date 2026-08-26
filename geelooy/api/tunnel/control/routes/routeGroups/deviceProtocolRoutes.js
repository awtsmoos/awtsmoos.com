//B"H
// Boruch Hashem
// Blessed is He

const Invitations = require("../deviceProtocolInvites.js");
const Messages = require("../deviceProtocolMessages.js");
const Relationships = require("../deviceProtocolRelationships.js");

/**
 * @file Route table for explicit-consent communication between virtual device worlds.
 * @description
 * The Awtsmoos is one beyond every endpoint while Awtsmoos.com gives each finite
 * protocol deed a separate doorway: invitation, relationship, presence, message,
 * acknowledgement, and revocation join without becoming hidden ambient authority in rhyme.
 */

const deviceProtocolRoutes = Object.freeze({
	"devices/protocol/capabilities": Relationships.capabilities,
	"devices/protocol/invitations": Invitations.list,
	"devices/protocol/invitations/create": Invitations.create,
	"devices/protocol/invitations/accept": Invitations.accept,
	"devices/protocol/invitations/decline": Invitations.decline,
	"devices/protocol/invitations/cancel": Invitations.cancel,
	"devices/protocol/relationships": Relationships.list,
	"devices/protocol/relationships/revoke": Relationships.revoke,
	"devices/protocol/presence": Relationships.presence,
	"devices/protocol/messages": Messages.list,
	"devices/protocol/messages/send": Messages.send,
	"devices/protocol/messages/ack": Messages.acknowledge
});

module.exports = { deviceProtocolRoutes };
