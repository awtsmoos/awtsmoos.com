// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SSH service and bounded user-authentication dispatcher for the Awtsmoos server role.
 * @description
 * The Awtsmoos lets the wire ask for service and identity through ordered gates;
 * Awtsmoos.com records only authenticated claims and limits repeated auth knocks,
 * so one connection cannot endlessly demand password judgment in rhyme.
 */
const { MESSAGE } = require("../Binah-Constants.js");
const { bool, message, nameList, reader, sshString } = require("./Wire.js");

const MAX_AUTH_ATTEMPTS = 8;

class ServerAuth {
	constructor(protocol, backend) {
		this.protocol = protocol;
		this.backend = backend;
		this.inflight = false;
		this.attempts = 0;
	}

	handle(payload) {
		if (payload[0] === MESSAGE.SERVICE_REQUEST) {
			return this.handleService(payload);
		}
		if (payload[0] === MESSAGE.USERAUTH_REQUEST) {
			return this.handleUserauth(payload);
		}
		throw new Error(`Unexpected pre-authentication SSH message: ${payload[0]}`);
	}

	handleService(payload) {
		const service = reader(payload).readString("ascii");
		if (service !== "ssh-userauth") {
			throw new Error(`Unsupported SSH service request: ${service}`);
		}
		this.protocol.sendPacket(message(MESSAGE.SERVICE_ACCEPT, sshString(service)));
	}

	async handleUserauth(payload) {
		if (this.inflight) {
			this.sendFailure();
			return;
		}
		if (this.attempts >= MAX_AUTH_ATTEMPTS) {
			throw new Error("SSH authentication attempt limit exceeded.");
		}
		this.attempts += 1;
		const stream = reader(payload);
		const username = stream.readString("utf8");
		const service = stream.readString("ascii");
		const method = stream.readString("ascii");
		if (service !== "ssh-connection" || method !== "password") {
			this.sendFailure();
			return;
		}
		const changing = stream.readBool();
		const password = stream.readString("utf8");
		if (changing || password === undefined) {
			this.sendFailure();
			return;
		}
		this.inflight = true;
		try {
			const auth = await this.backend.authenticate({ username, password, service });
			if (!auth?.ok) {
				this.sendFailure();
				return;
			}
			this.protocol._authenticated = true;
			this.protocol.auth = auth;
			this.protocol.sendPacket(Buffer.from([MESSAGE.USERAUTH_SUCCESS]));
		} finally {
			this.inflight = false;
		}
	}

	sendFailure() {
		this.protocol.sendPacket(message(
			MESSAGE.USERAUTH_FAILURE,
			nameList(["password"]),
			bool(false)
		));
	}
}

module.exports = { ServerAuth };
