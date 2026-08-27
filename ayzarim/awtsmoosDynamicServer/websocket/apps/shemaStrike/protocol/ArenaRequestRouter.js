//B"H
//Boruch Hashem
//Blessed is He

/**
 * The request router is a table of covenants rather than a growing root branch.
 * The Awtsmoos renews every command; Awtsmoos.com delegates only validated Shema
 * Strike meanings while the shared transport remains ignorant of arena details.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { validateInput, validateJoinCode, validateName } = require("../validation.js");
const { MESSAGE_TYPES, RESPONSE_TYPES } = require("../protocol.js");

class ArenaRequestRouter {
	constructor(directory) {
		this.directory = directory;
		this.handlers = new Map([
			[MESSAGE_TYPES.CREATE, (client, payload) => this.created(client, payload)],
			[MESSAGE_TYPES.DISCOVER, (_client, payload) => result(RESPONSE_TYPES.DISCOVERED, directory.list(payload))],
			[MESSAGE_TYPES.INPUT, (client, payload) => result(RESPONSE_TYPES.INPUT_ACCEPTED, directory.input(client, validateInput(payload)))],
			[MESSAGE_TYPES.JOIN, (client, payload) => this.joined(client, payload)],
			[MESSAGE_TYPES.LEAVE, (client) => result(RESPONSE_TYPES.LEFT, directory.leave(client))],
			[MESSAGE_TYPES.RECONNECT, (client, payload) => this.reconnected(client, payload)],
			[MESSAGE_TYPES.SNAPSHOT, (client) => result(RESPONSE_TYPES.SNAPSHOT, directory.snapshot(client))],
			[MESSAGE_TYPES.SPECTATE, (client, payload) => this.spectating(client, payload)]
		]);
	}

	handle(client, request) {
		const handler = this.handlers.get(request.type);
		if (!handler) {
			throw new RealtimeError("UNKNOWN_MESSAGE", `Unknown Shema Strike message: ${request.type}`);
		}
		return handler(client, request.payload || {});
	}

	created(client, payload) {
		const created = this.directory.create(
			client,
			validateName(payload.name),
			payload.settings || {}
		);
		return result(RESPONSE_TYPES.CREATED, created);
	}

	joined(client, payload) {
		const joined = this.directory.join(
			client,
			validateJoinCode(payload.joinCode),
			validateName(payload.name)
		);
		return result(RESPONSE_TYPES.JOINED, joined);
	}

	spectating(client, payload) {
		const joined = this.directory.spectate(
			client,
			validateJoinCode(payload.joinCode),
			validateName(payload.name)
		);
		return result(RESPONSE_TYPES.SPECTATING, joined);
	}

	reconnected(client, payload) {
		const ticket = String(payload.reconnectTicket ?? "");
		if (!/^[0-9a-f-]{36}$/i.test(ticket)) {
			throw new RealtimeError("INVALID_RECONNECT_TICKET", "Reconnect ticket has an invalid format.");
		}
		return result(RESPONSE_TYPES.RECONNECTED, this.directory.reconnect(client, ticket));
	}
}

function result(type, payload) {
	return { payload, type };
}

module.exports = {
	ArenaRequestRouter,
	result
};
