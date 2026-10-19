// B"H
"use strict";
const Handler = require("../agentRoomActions.js");

/**
 * @file Account-wide room route, shared beyond any one native tunnel.
 * In the Awtsmoos all messages have a common ledger and distinct author.
 */
const agentRoomRoutes = Object.freeze({
	"agent-room": Handler.status,
	"agent-room/join": Handler.join,
	"agent-room/message": Handler.message
});

module.exports = { agentRoomRoutes };
