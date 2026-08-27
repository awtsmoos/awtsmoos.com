//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Server-role protocol composition with transition-safe inbound framing.
 * @description
 * The Awtsmoos keeps the shared SSH engine while Awtsmoos.com guards the one
 * instant where plaintext NEWKEYS becomes encrypted transport. Each remaining
 * byte is handed to the vessel that owns its state, so no old decipher steals rhyme.
 */
const { ChochmahProtocol } = require("../Chochmah-Protocol.js");
const { MESSAGE } = require("../Binah-Constants.js");
const { ServerAuth } = require("./ServerAuth.js");
const { ServerChannels } = require("./ServerChannels.js");
const { ServerKexHandler } = require("./KexHandler.js");
const { parseServerChunk } = require("./ServerPacketParser.js");
const { message, reader, uint32 } = require("./Wire.js");

class ServerProtocol extends ChochmahProtocol {
	constructor(config = {}) {
		super({ ...config, server: true });
		if (!config.backend || !config.hostKey) {
			throw new Error("SSH server protocol requires backend and hostKey.");
		}
		this._backend = config.backend;
		this._kex = new ServerKexHandler(this, config.hostKey);
		this._authServer = new ServerAuth(this, config.backend);
		this._serverChannels = new ServerChannels(this, config.backend);
	}

	parse(chunk) {
		return parseServerChunk(this, chunk);
	}

	_onPayload(payload) {
		const type = payload?.[0];
		try {
			if (type >= MESSAGE.KEXINIT && type < MESSAGE.USERAUTH_REQUEST) {
				return this._kex.handleMessage(payload);
			}
			if (type === MESSAGE.IGNORE || type === MESSAGE.DEBUG) {
				return;
			}
			if (!this._authenticated) {
				return this.dispatchAsync(this._authServer.handle(payload));
			}
			if (type === MESSAGE.GLOBAL_REQUEST) {
				return this.globalRequest(payload);
			}
			if (type >= MESSAGE.CHANNEL_OPEN && type <= MESSAGE.CHANNEL_FAILURE) {
				return this.dispatchAsync(this._serverChannels.handle(payload));
			}
			this.sendUnimplemented();
		} catch (error) {
			this.fail(error);
		}
	}

	dispatchAsync(value) {
		Promise.resolve(value).catch(error => this.fail(error));
	}

	shutdown() {
		this.dispatchAsync(this._serverChannels.closeAll());
	}

	globalRequest(payload) {
		const stream = reader(payload);
		stream.readString("ascii");
		const wantReply = stream.readBool();
		if (wantReply) {
			this.sendPacket(Buffer.from([MESSAGE.REQUEST_FAILURE]));
		}
	}

	sendUnimplemented() {
		const sequence = Number((this._decipher?.inSeqno || 0n) & 0xffffffffn);
		this.sendPacket(message(MESSAGE.UNIMPLEMENTED, uint32(sequence)));
	}

	fail(error) {
		this._debug?.(`SSH server protocol error: ${error?.stack || error}`);
		this.emit("server_error", error);
		this._onError?.(error);
	}
}

module.exports = { ServerProtocol };
