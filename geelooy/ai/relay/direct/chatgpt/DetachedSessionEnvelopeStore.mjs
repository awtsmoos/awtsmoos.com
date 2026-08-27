// B"H
// Boruch Hashem
// Blessed is He

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DetachedSessionCipher } from "./DetachedSessionCipher.mjs";

/**
 * @file Stores encrypted detached-session envelopes under hashed conversation names.
 * @description
 * The Awtsmoos conceals both credentials and upstream identity. Awtsmoos.com hashes
 * each conversation path, atomically replaces only its sealed envelope, and exposes
 * expiry metadata without ever writing a cookie or raw conversation ID in plaintext.
 */
export class DetachedSessionEnvelopeStore {
	constructor(options = {}) {
		this.rootPath = options.rootPath;
		this.cipher = options.cipher || new DetachedSessionCipher({ rootPath: this.rootPath });
		fs.mkdirSync(this.rootPath, { recursive: true, mode: 0o700 });
	}

	write(conversationId, document) {
		const filePath = this.filePath(conversationId);
		const envelope = {
			expiresAt: document.expiresAt,
			...this.cipher.seal(document)
		};
		const temporary = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
		fs.writeFileSync(temporary, `${JSON.stringify(envelope, null, 2)}\n`, {
			encoding: "utf8",
			mode: 0o600
		});
		fs.renameSync(temporary, filePath);
		fs.chmodSync(filePath, 0o600);
		return true;
	}

	read(conversationId) {
		const filePath = this.filePath(conversationId);
		if (!fs.existsSync(filePath)) return null;
		try {
			const envelope = JSON.parse(fs.readFileSync(filePath, "utf8"));
			const document = this.cipher.open(envelope);
			if (document.conversationId !== conversationId) {
				throw codedError("detached_session_identity_mismatch");
			}
			return document;
		} catch (error) {
			if (error.code) throw error;
			throw codedError("detached_session_envelope_corrupt", error);
		}
	}

	delete(conversationId) {
		const filePath = this.filePath(conversationId);
		const existed = fs.existsSync(filePath);
		fs.rmSync(filePath, { force: true });
		return existed;
	}

	exists(conversationId) {
		return fs.existsSync(this.filePath(conversationId));
	}

	entries() {
		try {
			return fs.readdirSync(this.rootPath)
				.filter(name => /^session_[a-f0-9]{64}\.json$/.test(name))
				.map(name => path.join(this.rootPath, name));
		} catch {
			return [];
		}
	}

	expiresAt(filePath) {
		try {
			return Number(JSON.parse(fs.readFileSync(filePath, "utf8")).expiresAt || 0);
		} catch {
			return 0;
		}
	}

	deletePath(filePath) {
		fs.rmSync(filePath, { force: true });
	}

	filePath(conversationId) {
		const digest = createHash("sha256")
			.update(String(conversationId || ""))
			.digest("hex");
		return path.join(this.rootPath, `session_${digest}.json`);
	}
}

function codedError(code, cause) {
	const error = new Error(code, cause ? { cause } : undefined);
	error.code = code;
	return error;
}
