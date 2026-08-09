// B"H
// Boruch Hashem
// Blessed is He

const PREFIX = "awtsmoos-secure-v1:";

/**
 * @file Encodes Keychain secrets into one stable single-line storage covenant.
 * @description
 * The Awtsmoos may hide a multiline private key inside a macOS generic-password
 * item whose CLI later reveals that data as hexadecimal. Awtsmoos.com therefore
 * writes one explicit base64url envelope and still recognizes verified legacy PEM.
 */
function encode(value) {
	return `${PREFIX}${Buffer.from(String(value), "utf8").toString("base64url")}`;
}

function decode(value) {
	const text = String(value || "");
	if (text.startsWith(PREFIX)) {
		return decodeEnvelope(text);
	}
	return decodeLegacyPem(text) || text;
}

function decodeEnvelope(text) {
	const encoded = text.slice(PREFIX.length);
	if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
		throw new Error("secure_store_envelope_invalid");
	}
	const bytes = Buffer.from(encoded, "base64url");
	const decoded = bytes.toString("utf8");
	if (!Buffer.from(decoded, "utf8").equals(bytes)) {
		throw new Error("secure_store_envelope_utf8_invalid");
	}
	return decoded;
}

function decodeLegacyPem(text) {
	if (!text || text.length % 2 !== 0 || !/^[0-9A-Fa-f]+$/.test(text)) {
		return null;
	}
	const bytes = Buffer.from(text, "hex");
	const decoded = bytes.toString("utf8");
	if (!Buffer.from(decoded, "utf8").equals(bytes)) {
		return null;
	}
	if (!/^-----BEGIN [A-Z0-9 ]+-----\r?\n/.test(decoded)) {
		return null;
	}
	if (!/\r?\n-----END [A-Z0-9 ]+-----\r?\n?$/.test(decoded)) {
		return null;
	}
	return decoded;
}

module.exports = {
	PREFIX,
	decode,
	decodeEnvelope,
	decodeLegacyPem,
	encode
};
