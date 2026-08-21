// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Server-role key-exchange coordinator for the inherited Awtsmoos protocol parser.
 * @description
 * The Awtsmoos lets both peers announce their KEX vessels before temporary keys
 * can meet. Awtsmoos.com accepts the client's KEXINIT, negotiates one truthful
 * algorithm set, and only then receives ephemeral light for the encrypted rhyme.
 */
const { MESSAGE } = require("../Binah-Constants.js");
const Algorithms = require("./KexAlgorithms.js");
const Exchange = require("./KexExchange.js");

class ServerKexHandler {
	constructor(protocol, hostKey) {
		this._protocol = protocol;
		this._hostKey = hostKey;
		this._debug = protocol._debug;
		this.negotiated = {};
		this.sessionID = null;
		this._kexinit_payload = null;
		this._remote_kexinit_payload = null;
		this._kex_secret = null;
		this._exchange_hash = null;
		this._pendingDecipher = null;
	}

	_sendKexInit() {
		return Algorithms.sendKexInit(this);
	}

	start(remotePayload) {
		if (!remotePayload?.length) {
			throw new Error("Peer KEXINIT payload is required.");
		}
		this._remote_kexinit_payload = Buffer.from(remotePayload);
		this._sendKexInit();
		Algorithms.negotiate(this);
		this._debug?.(`Server KEX negotiated: ${JSON.stringify(this.negotiated)}`);
	}

	handleMessage(payload) {
		const type = payload[0];
		if (type === MESSAGE.KEXINIT) {
			this.start(payload);
			return;
		}
		if (type === MESSAGE.KEXDH_INIT) {
			if (!this._remote_kexinit_payload) {
				throw new Error("Peer ephemeral key arrived before KEXINIT negotiation.");
			}
			return Exchange.handleInit(this, payload);
		}
		if (type !== MESSAGE.NEWKEYS) {
			throw new Error(`Unexpected server KEX message type: ${type}`);
		}
		this.activateInboundKeys();
	}

	activateInboundKeys() {
		if (!this._pendingDecipher) {
			throw new Error("Peer NEWKEYS arrived before server key material was prepared.");
		}
		const sequence = this._protocol._decipher?.inSeqno !== undefined
			? this._protocol._decipher.inSeqno + 1n
			: 0n;
		this._pendingDecipher.inSeqno = sequence;
		this._protocol.setInboundDecipher(this._pendingDecipher);
		this._pendingDecipher = null;
		this._protocol._onHandshakeComplete();
	}
}

module.exports = { ServerKexHandler };
