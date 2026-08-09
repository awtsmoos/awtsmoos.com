// B"H

'use strict';

const { MESSAGE } = require('./Binah-Constants.js');
const Setup = require('./Chesed-KexSetup.js');
const Reply = require('./Chesed-KexReply.js');
const Keys = require('./Chesed-KexKeys.js');

/** Coordinates one RFC-compliant SSH key exchange through bounded helpers. */
class KexHandler {
	constructor(protocol) {
		this._protocol = protocol;
		this._debug = protocol._debug;
		this.negotiated = {};
		this.sessionID = null;
		this._kexinit_payload = null;
		this._remote_kexinit_payload = null;
		this._dh = null;
		this._kex_secret = null;
		this._exchange_hash = null;
		this._pendingCipher = null;
		this._pendingDecipher = null;
	}

	start(remotePayload) {
		this._debug?.('Key Exchange: Processing remote KEXINIT.');
		this._remote_kexinit_payload = remotePayload;
		this._negotiate();
		this._startKex();
	}

	_sendKexInit() {
		return Setup.sendKexInit.call(this);
	}

	_negotiate() {
		return Setup.negotiate.call(this);
	}

	_startKex() {
		return Setup.startKex.call(this);
	}

	handleMessage(payload) {
		if (payload[0] === MESSAGE.KEXDH_REPLY) return this._handleDhReply(payload);
		if (payload[0] !== MESSAGE.NEWKEYS) {
			throw new Error(`Unexpected KEX message type: ${payload[0]}`);
		}
		if (this._pendingDecipher) {
			const sequence = this._protocol._decipher?.inSeqno !== undefined
				? this._protocol._decipher.inSeqno + 1n : 0n;
			this._pendingDecipher.inSeqno = sequence;
			this._protocol.setInboundDecipher(this._pendingDecipher);
			this._pendingDecipher = null;
		}
		this._protocol._onHandshakeComplete();
	}

	_handleDhReply(payload) {
		return Reply.handleDhReply.call(this, payload);
	}

	_deriveKeysAndActivate() {
		return Keys.deriveKeysAndActivate.call(this);
	}
}

module.exports = { KexHandler };
