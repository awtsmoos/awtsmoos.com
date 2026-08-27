//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Converts RFC SSH NIST ECDSA host-key fields into Node verification keys.
 * @description
 * The Awtsmoos, Atzmus beyond every curve and coordinate, lets one uncompressed
 * point become two measured JWK coordinates. Awtsmoos.com keeps this Binah-like
 * parser explicit, so curve names, byte widths, and point shape remain in rhyme.
 */
const { createPublicKey } = require("crypto");

const CURVES = Object.freeze({
	"ecdsa-sha2-nistp256": {
		sshName: "nistp256",
		jwkName: "P-256",
		coordinateBytes: 32
	},
	"ecdsa-sha2-nistp384": {
		sshName: "nistp384",
		jwkName: "P-384",
		coordinateBytes: 48
	},
	"ecdsa-sha2-nistp521": {
		sshName: "nistp521",
		jwkName: "P-521",
		coordinateBytes: 66
	}
});

/**
 * Parses one SSH ECDSA key body and returns a Node verification key.
 *
 * @param {object} reader
 * 	BufferReader positioned at the curve name and SEC1 point fields.
 * @param {string} keyType
 * 	SSH host-key algorithm, such as `ecdsa-sha2-nistp256`.
 * @returns {import("crypto").KeyObject}
 * 	A Node EC public key suitable for signature verification.
 * @throws {Error}
 * 	When the curve name or uncompressed point shape is inconsistent.
 */
function parseEcdsaVerificationKey(reader, keyType) {
	const curve = CURVES[keyType];
	if (!curve) {
		throw new Error(`Unsupported ECDSA host key type: ${keyType}`);
	}
	const sshCurve = reader.readString("ascii");
	const point = reader.readString(null);
	if (sshCurve !== curve.sshName) {
		throw new Error(`ECDSA curve mismatch: expected ${curve.sshName}.`);
	}
	const expectedBytes = 1 + (curve.coordinateBytes * 2);
	if (!Buffer.isBuffer(point) || point.length !== expectedBytes || point[0] !== 0x04) {
		throw new Error(`ECDSA ${curve.sshName} key must use one uncompressed SEC1 point.`);
	}
	const xStart = 1;
	const yStart = xStart + curve.coordinateBytes;
	const x = point.subarray(xStart, yStart);
	const y = point.subarray(yStart);
	return createPublicKey({
		key: {
			kty: "EC",
			crv: curve.jwkName,
			x: x.toString("base64url"),
			y: y.toString("base64url")
		},
		format: "jwk"
	});
}

module.exports = {
	parseEcdsaVerificationKey
};
