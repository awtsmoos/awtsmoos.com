// B"H
// Boruch Hashem
// Blessed is He

import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	randomUUID
} from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ALGORITHM = "aes-256-gcm";
const AAD = Buffer.from("awtsmoos-detached-session-v1", "utf8");

/**
 * @file Seals detached browser credentials with one private device-local key.
 * @description
 * The Awtsmoos hides continuation vessels beneath authenticated encryption.
 * Awtsmoos.com creates one write-once recovery key, randomizes every envelope,
 * and rejects altered ciphertext before a cookie can return to the polling path.
 */
export class DetachedSessionCipher {
	constructor(options = {}) {
		this.rootPath = options.rootPath;
		this.keyPath = options.keyPath || path.join(this.rootPath, "device.key");
		this.cachedKey = null;
		fs.mkdirSync(this.rootPath, { recursive: true, mode: 0o700 });
	}

	seal(value) {
		const initializationVector = randomBytes(12);
		const cipher = createCipheriv(ALGORITHM, this.key(), initializationVector);
		cipher.setAAD(AAD);
		const ciphertext = Buffer.concat([
			cipher.update(JSON.stringify(value), "utf8"),
			cipher.final()
		]);
		return {
			version: 1,
			algorithm: ALGORITHM,
			initializationVector: initializationVector.toString("base64"),
			authenticationTag: cipher.getAuthTag().toString("base64"),
			ciphertext: ciphertext.toString("base64")
		};
	}

	open(envelope) {
		if (envelope?.version !== 1 || envelope.algorithm !== ALGORITHM) {
			throw codedError("detached_session_envelope_version_unsupported");
		}
		const decipher = createDecipheriv(
			ALGORITHM,
			this.key(),
			Buffer.from(envelope.initializationVector, "base64")
		);
		decipher.setAAD(AAD);
		decipher.setAuthTag(Buffer.from(envelope.authenticationTag, "base64"));
		const plaintext = Buffer.concat([
			decipher.update(Buffer.from(envelope.ciphertext, "base64")),
			decipher.final()
		]);
		return JSON.parse(plaintext.toString("utf8"));
	}

	key() {
		if (this.cachedKey) return this.cachedKey;
		this.cachedKey = this.readKey() || this.createKey();
		return this.cachedKey;
	}

	readKey() {
		try {
			const value = Buffer.from(fs.readFileSync(this.keyPath, "utf8").trim(), "base64");
			if (value.length !== 32) throw codedError("detached_session_key_invalid");
			return value;
		} catch (error) {
			if (error.code === "ENOENT") return null;
			throw error;
		}
	}

	createKey() {
		const value = randomBytes(32);
		const temporary = `${this.keyPath}.tmp-${process.pid}-${randomUUID()}`;
		fs.writeFileSync(temporary, `${value.toString("base64")}\n`, {
			encoding: "utf8",
			mode: 0o600,
			flag: "wx"
		});
		try {
			fs.linkSync(temporary, this.keyPath);
			fs.chmodSync(this.keyPath, 0o600);
			return value;
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			return this.readKey();
		} finally {
			fs.rmSync(temporary, { force: true });
		}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
