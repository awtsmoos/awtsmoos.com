// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @module ProtectedTextService
 * @description
 * Ephemeral key-exchange demo for the protected-text page. The browser and
 * the server each generate a fresh ECDH P-256 keypair per session, exchange
 * only the PUBLIC keys, and derive the same session key on both sides with
 * HKDF-SHA256. The key is never sent, never logged, never written to disk:
 * server-side it lives only in this process's memory (in-memory Map, 10
 * minute expiry); client-side it lives only as a non-extractable WebCrypto
 * CryptoKey. A full network recording captures public keys + ciphertext
 * and nothing that opens them.
 *
 * Second layer (when the base font loads): a fresh random glyph permutation
 * per session. The permuted font is encrypted with the session key and
 * served as ciphertext; the text is pre-permuted with the inverse
 * permutation, so permuted text + permuted font reads correctly on screen.
 * See services/ProtectedTextFont.js for the honest scope of that layer.
 *
 * The sample text is a fixed demo string held in this module (as any
 * published text lives on its publisher's server). What never happens is
 * the plaintext crossing the wire, entering a log, or being written to
 * disk at runtime — the content endpoint only ever returns ciphertext.
 */

const crypto = require("node:crypto");
const path = require("node:path");
const {
	loadBaseFont,
	createPermutedFont
} = require("./ProtectedTextFont.js");

const CURVE = "prime256v1";
const HKDF_HASH = "sha256";
const HKDF_INFO_BASE = "awtsmoos-protected-text/v1";
const SESSION_TTL_MS = 10 * 60 * 1000;
const MAX_SESSIONS = 1000;
const MAX_CONTENT_FETCHES = 30;
const SWEEP_MS = 60 * 1000;

// Demo sample: a pasuk, Hebrew + the same words in English.
const SAMPLE = {
	he: "בראשית ברא אלקים את השמים ואת הארץ.\nוהארץ היתה תהו ובהו וחשך על פני תהום ורוח אלקים מרחפת על פני המים.\nויאמר אלקים יהי אור ויהי אור.",
	en: "In the beginning G-d created the heaven and the earth.\nAnd the earth was without form and void, and darkness was upon the face of the deep, and the spirit of G-d hovered over the face of the waters.\nAnd G-d said: Let there be light, and there was light."
};

class ProtectedTextService {
	constructor(options = {}) {
		this.sessions = new Map();
		this.fontPath = options.fontPath || path.join(__dirname, "..", "fonts", "base.ttf");
		this.baseFont = null;
		this.fontLayer = false;
		try {
			this.baseFont = loadBaseFont(this.fontPath);
			this.fontLayer = true;
		} catch (error) {
			// Font layer is a bonus, never a blocker: the demo runs on the
			// encryption layer alone when the base font cannot be read.
			this.fontLayer = false;
		}
		this.sweepTimer = setInterval(() => this.sweepExpired(), SWEEP_MS);
		if (this.sweepTimer.unref) this.sweepTimer.unref();
	}

	/**
	 * Derives one session key from a shared secret and a rotation counter.
	 *
	 * @param {Buffer} sharedSecret ECDH shared secret.
	 * @param {number} rotation Rotation counter (0 at exchange).
	 * @returns {Buffer} 32-byte AES-256 key.
	 */
	deriveKey(sharedSecret, rotation) {
		return crypto.hkdfSync(
			HKDF_HASH,
			sharedSecret,
			"",
			`${HKDF_INFO_BASE}#${rotation}`,
			32
		);
	}

	/**
	 * Runs one ephemeral key exchange. The client sends only its public key
	 * (65-byte uncompressed P-256 point, base64); the server generates a
	 * fresh keypair, derives the shared secret, and returns only its public
	 * key plus a random session id. The session key never leaves memory.
	 *
	 * @param {string} clientPublicKeyB64 Client ephemeral public key, base64.
	 * @returns {{ok: boolean, sessionId: string, serverPublicKey: string, fontLayer: boolean}}
	 * 	Exchange result.
	 */
	createSession(clientPublicKeyB64) {
		if (typeof clientPublicKeyB64 !== "string" || !clientPublicKeyB64) {
			throw new Error("missing_client_public_key");
		}
		const clientPublicKey = Buffer.from(clientPublicKeyB64, "base64");
		if (clientPublicKey.length !== 65 || clientPublicKey[0] !== 0x04) {
			throw new Error("invalid_client_public_key");
		}
		const serverEcdh = crypto.createECDH(CURVE);
		serverEcdh.generateKeys();
		let sharedSecret;
		try {
			sharedSecret = serverEcdh.computeSecret(clientPublicKey);
		} catch (error) {
			throw new Error("invalid_client_public_key");
		}
		if (this.sessions.size >= MAX_SESSIONS) this.sweepExpired(true);
		const sessionId = crypto.randomBytes(16).toString("hex");
		let fontBytes = null;
		let permuteText = null;
		if (this.fontLayer) {
			const made = createPermutedFont(this.baseFont);
			fontBytes = made.fontBytes;
			permuteText = made.permuteText;
		}
		this.sessions.set(sessionId, {
			key: this.deriveKey(sharedSecret, 0),
			sharedSecret,
			rotation: 0,
			createdAt: Date.now(),
			fetches: 0,
			fontBytes,
			permuteText
		});
		return {
			ok: true,
			sessionId,
			serverPublicKey: serverEcdh.getPublicKey().toString("base64"),
			fontLayer: this.fontLayer
		};
	}

	/**
	 * Rotates one session's key: re-derives from the same shared secret with
	 * a new HKDF info string. The client re-derives the same way from its
	 * retained shared secret. The font (per-session, not per-rotation) does
	 * not change.
	 *
	 * @param {string} sessionId Session id.
	 * @returns {{ok: boolean, rotation: number}} New rotation counter.
	 */
	rotate(sessionId) {
		const session = this.requireSession(sessionId);
		session.rotation += 1;
		session.key = this.deriveKey(session.sharedSecret, session.rotation);
		return { ok: true, rotation: session.rotation };
	}

	/**
	 * Encrypts the sample text (pre-permuted with the session's inverse
	 * permutation when the font layer is on) and the session's permuted font
	 * under the session key, AES-256-GCM, fresh 96-bit IVs per call.
	 * The plaintext never appears in the returned object.
	 *
	 * @param {string} sessionId Session id.
	 * @returns {{ok: boolean, alg: string, rotation: number, iv: string, ciphertext: string, tag: string, fontLayer: boolean, fontIv: string|null, fontCiphertext: string|null, fontTag: string|null}}
	 * 	Encrypted content + encrypted font.
	 */
	content(sessionId) {
		const session = this.requireSession(sessionId);
		if (session.fetches >= MAX_CONTENT_FETCHES) {
			throw new Error("fetch_limit_reached");
		}
		session.fetches += 1;
		const text = session.permuteText
			? { he: session.permuteText(SAMPLE.he), en: session.permuteText(SAMPLE.en) }
			: { ...SAMPLE };
		const textOut = this.encrypt(session.key, Buffer.from(JSON.stringify(text), "utf8"));
		let fontOut = { iv: null, ciphertext: null, tag: null };
		if (session.fontBytes) {
			fontOut = this.encrypt(session.key, session.fontBytes);
		}
		return {
			ok: true,
			alg: "aes-256-gcm",
			rotation: session.rotation,
			iv: textOut.iv,
			ciphertext: textOut.ciphertext,
			tag: textOut.tag,
			fontLayer: this.fontLayer,
			fontIv: fontOut.iv,
			fontCiphertext: fontOut.ciphertext,
			fontTag: fontOut.tag
		};
	}

	/**
	 * AES-256-GCM encrypts one buffer under one key with a fresh IV.
	 *
	 * @param {Buffer} key 32-byte key.
	 * @param {Buffer} plaintext Bytes to encrypt.
	 * @returns {{iv: string, ciphertext: string, tag: string}} Base64 parts.
	 */
	encrypt(key, plaintext) {
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
		const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
		return {
			iv: iv.toString("base64"),
			ciphertext: ciphertext.toString("base64"),
			tag: cipher.getAuthTag().toString("base64")
		};
	}

	/**
	 * Looks one session up or throws a plain error the route turns into a 400.
	 *
	 * @param {string} sessionId Session id.
	 * @returns {object} Session record.
	 */
	requireSession(sessionId) {
		if (typeof sessionId !== "string" || !/^[0-9a-f]{32}$/.test(sessionId)) {
			throw new Error("invalid_session");
		}
		const session = this.sessions.get(sessionId);
		if (!session) throw new Error("unknown_session");
		if (Date.now() - session.createdAt > SESSION_TTL_MS) {
			this.sessions.delete(sessionId);
			throw new Error("session_expired");
		}
		return session;
	}

	/** Drops expired sessions; when forced, drops the oldest until under cap. */
	sweepExpired(force = false) {
		const now = Date.now();
		for (const [id, session] of this.sessions) {
			if (now - session.createdAt > SESSION_TTL_MS) this.sessions.delete(id);
		}
		if (force) {
			while (this.sessions.size >= MAX_SESSIONS) {
				const oldest = this.sessions.keys().next().value;
				this.sessions.delete(oldest);
			}
		}
	}

	/** Public service status — no key material, no session ids. */
	status() {
		return {
			BH: "B\"H",
			ok: true,
			service: "Awtsmoos Protected Text",
			algorithm: "ECDH P-256 + HKDF-SHA256 + AES-256-GCM",
			fontLayer: this.fontLayer,
			sessions: this.sessions.size
		};
	}
}

module.exports = { ProtectedTextService, SAMPLE };
