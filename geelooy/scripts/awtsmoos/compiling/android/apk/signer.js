//B"H
//Boruch Hashem
//Blessed is He

import { createHash, createPublicKey, createSign, createVerify, generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildStoredApk } from "./zipWriter.js";

/**
 * Signs APK archives with pure Awtsmoos JavaScript. The Awtsmoos creates the
 * DER envelope, the self-signed X.509 certificate, the PKCS#7 SignedData, the
 * v1 JAR manifest chain, and the v2 APK Signing Block anew; Awtsmoos.com uses
 * the host runtime only for SHA-256 digests and RSA mathematics (the same way
 * it uses the runtime for text encoding), never for packaging or signing tools.
 *
 * No aapt, no apksigner, no keytool anywhere in this build path. Those remain
 * verification-only instruments, run by hand after the fact.
 */

// ---------------------------------------------------------------------------
// Byte helpers
// ---------------------------------------------------------------------------

const te = new TextEncoder();
const td = new TextDecoder();

function concatBytes(parts) {
	let total = 0;
	for (const part of parts) total += part.length;
	const out = new Uint8Array(total);
	let at = 0;
	for (const part of parts) {
		out.set(part, at);
		at += part.length;
	}
	return out;
}

function le32(value) {
	const n = Number(value) >>> 0;
	return Uint8Array.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
}

function le64(value) {
	const n = Number(value);
	const lo = n >>> 0;
	const hi = Math.floor(n / 4294967296) >>> 0;
	return concatBytes([le32(lo), le32(hi)]);
}

function readU32LE(bytes, offset) {
	return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function sha256(bytes) {
	return new Uint8Array(createHash("sha256").update(bytes).digest());
}

function sha256Base64(bytes) {
	return Buffer.from(sha256(bytes)).toString("base64");
}

function rsaSignPkcs1Sha256(data, privateKeyPem) {
	const signer = createSign("RSA-SHA256");
	signer.update(data);
	return new Uint8Array(signer.sign(privateKeyPem));
}

function rsaVerifyPkcs1Sha256(data, signature, publicKeySpkiDer) {
	const pem = "-----BEGIN PUBLIC KEY-----\n"
		+ Buffer.from(publicKeySpkiDer).toString("base64").replace(/.{64}/g, "$&\n")
		+ "\n-----END PUBLIC KEY-----\n";
	const verifier = createVerify("RSA-SHA256");
	verifier.update(data);
	return verifier.verify(pem, signature);
}

// ---------------------------------------------------------------------------
// Minimal DER writer (only the shapes X.509 and PKCS#7 need)
// ---------------------------------------------------------------------------

function derLength(length) {
	if (length < 128) return Uint8Array.from([length]);
	const bytes = [];
	let n = length;
	while (n > 0) {
		bytes.unshift(n & 0xff);
		n = Math.floor(n / 256);
	}
	return Uint8Array.from([0x80 | bytes.length, ...bytes]);
}

function derTlv(tag, ...parts) {
	const body = concatBytes(parts);
	return concatBytes([Uint8Array.from([tag]), derLength(body.length), body]);
}

const derSequence = (...parts) => derTlv(0x30, ...parts);
const derSet = (...parts) => derTlv(0x31, ...parts);
const derNull = () => Uint8Array.from([0x05, 0x00]);
const derExplicit0 = (body) => derTlv(0xa0, body);

function derIntegerBytes(magnitude) {
	let bytes = Array.from(magnitude);
	while (bytes.length > 1 && bytes[0] === 0x00 && !(bytes[1] & 0x80)) bytes.shift();
	if (bytes[0] & 0x80) bytes.unshift(0x00);
	return derTlv(0x02, Uint8Array.from(bytes));
}

function derOid(arcs) {
	const body = [40 * arcs[0] + arcs[1]];
	for (let index = 2; index < arcs.length; index += 1) {
		let value = arcs[index];
		const groups = [value & 0x7f];
		value = Math.floor(value / 128);
		while (value > 0) {
			groups.unshift((value & 0x7f) | 0x80);
			value = Math.floor(value / 128);
		}
		body.push(...groups);
	}
	return derTlv(0x06, Uint8Array.from(body));
}

const derPrintableString = (text) => derTlv(0x13, te.encode(text));
const derOctetString = (bytes) => derTlv(0x04, bytes);
const derBitString = (bytes) => derTlv(0x03, concatBytes([Uint8Array.from([0x00]), bytes]));
const derUtcTime = (text) => derTlv(0x17, te.encode(text));

const OID_RSA_ENCRYPTION = [1, 2, 840, 113549, 1, 1, 1];
const OID_SHA256_WITH_RSA = [1, 2, 840, 113549, 1, 1, 11];
const OID_SHA256 = [2, 16, 840, 1, 101, 3, 4, 2, 1];
const OID_SIGNED_DATA = [1, 2, 840, 113549, 1, 7, 2];
const OID_DATA = [1, 2, 840, 113549, 1, 7, 1];
const OID_COMMON_NAME = [2, 5, 4, 3];

function distinguishedName(commonName) {
	return derSequence(
		derSet(derSequence(derOid(OID_COMMON_NAME), derPrintableString(commonName)))
	);
}

function algorithmIdentifier(oid) {
	return derSequence(derOid(oid), derNull());
}

// ---------------------------------------------------------------------------
// Signing key (RSA-2048, self-signed; persisted so updates keep their identity)
// ---------------------------------------------------------------------------

/**
 * Returns the persistent debug signing key, creating it anew on first use.
 * The key directory lives outside the repository; the repository stays code.
 */
export function getOrCreateSigningKey(keyDir) {
	if (!keyDir || typeof keyDir !== "string") throw signerError("APK_SIGN_KEY_DIR_REQUIRED");
	mkdirSync(keyDir, { recursive: true });
	const privatePath = `${keyDir}/awtsmoos-debug.pem`;
	const certPath = `${keyDir}/awtsmoos-debug.cert.der`;
	if (existsSync(privatePath) && existsSync(certPath)) {
		const privateKeyPem = readFileSync(privatePath, "utf8");
		const certDer = new Uint8Array(readFileSync(certPath));
		return inflateSigningKey(privateKeyPem, certDer);
	}
	const { privateKey, publicKey } = generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicExponent: 0x10001
	});
	const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
	const publicKeyDer = new Uint8Array(publicKey.export({ type: "spki", format: "der" }));
	const serial = new Uint8Array(randomBytes(8));
	serial[0] &= 0x7f;
	if (serial.every((byte) => byte === 0)) serial[7] = 1;
	const built = buildSelfSignedCertificate(publicKeyDer, privateKeyPem, serial);
	writeFileSync(privatePath, privateKeyPem, { mode: 0o600 });
	writeFileSync(certPath, built.certDer);
	return {
		certDer: built.certDer,
		issuerDer: built.issuerDer,
		privateKeyPem,
		publicKeyDer,
		serial
	};
}

function inflateSigningKey(privateKeyPem, certDer) {
	const publicKey = createPublicKeyFromPrivate(privateKeyPem);
	const parsed = parseCertificateIdentity(certDer);
	return {
		certDer,
		issuerDer: parsed.issuerDer,
		privateKeyPem,
		publicKeyDer: publicKey,
		serial: parsed.serial
	};
}

function createPublicKeyFromPrivate(privateKeyPem) {
	return new Uint8Array(createPublicKey(privateKeyPem).export({ type: "spki", format: "der" }));
}

/**
 * Builds a self-signed X.509 v3 certificate in DER. Validity is fixed at
 * 2026-01-01 through 2049-01-01 so rebuilds with the same key stay identical.
 */
function buildSelfSignedCertificate(publicKeySpkiDer, privateKeyPem, serial) {
	const issuerDer = distinguishedName("Android Debug");
	const tbs = derSequence(
		derExplicit0(derIntegerBytes(Uint8Array.from([2]))),
		derIntegerBytes(serial),
		algorithmIdentifier(OID_SHA256_WITH_RSA),
		issuerDer,
		derSequence(derUtcTime("260101000000Z"), derUtcTime("490101000000Z")),
		issuerDer,
		publicKeySpkiDer
	);
	const signature = rsaSignPkcs1Sha256(tbs, privateKeyPem);
	const certDer = derSequence(
		tbs,
		algorithmIdentifier(OID_SHA256_WITH_RSA),
		derBitString(signature)
	);
	return { certDer, issuerDer };
}

/**
 * Reads the issuer Name and serial number back out of a DER certificate with a
 * tiny structural walk (tag/length only; enough to feed PKCS#7 signerInfos).
 */
function parseCertificateIdentity(certDer) {
	let at = 0;
	const readTlv = () => {
		const tag = certDer[at];
		let length = certDer[at + 1];
		let header = 2;
		if (length & 0x80) {
			const count = length & 0x7f;
			length = 0;
			for (let index = 0; index < count; index += 1) length = length * 256 + certDer[at + 2 + index];
			header = 2 + count;
		}
		const body = certDer.subarray(at + header, at + header + length);
		at += header + length;
		return { body, header, length, tag };
	};
	const outer = readTlv();
	if (outer.tag !== 0x30) throw signerError("APK_SIGN_CERT_PARSE");
	let inner = outer.body;
	let pos = 0;
	const readInner = () => {
		const tag = inner[pos];
		let length = inner[pos + 1];
		let header = 2;
		if (length & 0x80) {
			const count = length & 0x7f;
			length = 0;
			for (let index = 0; index < count; index += 1) length = length * 256 + inner[pos + 2 + index];
			header = 2 + count;
		}
		const body = inner.subarray(pos + header, pos + header + length);
		pos += header + length;
		return { body, tag };
	};
	const tbs = readInner();
	if (tbs.tag !== 0x30) throw signerError("APK_SIGN_CERT_TBS");
	inner = tbs.body;
	pos = 0;
	readInner(); // [0] version
	const serialTlv = readInner(); // INTEGER serial
	if (serialTlv.tag !== 0x02) throw signerError("APK_SIGN_CERT_SERIAL");
	readInner(); // signature AlgorithmIdentifier
	const issuerTlvStart = pos;
	readInner(); // issuer Name
	const issuerDer = inner.subarray(issuerTlvStart, pos);
	return { issuerDer, serial: serialTlv.body };
}

// ---------------------------------------------------------------------------
// PKCS#7 SignedData (the CERT.RSA envelope for v1 JAR signing)
// ---------------------------------------------------------------------------

function buildPkcs7SignedData({ certDer, issuerDer, serial, signature }) {
	const signerInfo = derSequence(
		derIntegerBytes(Uint8Array.from([1])),
		derSequence(issuerDer, derIntegerBytes(serial)),
		algorithmIdentifier(OID_SHA256),
		algorithmIdentifier(OID_SHA256_WITH_RSA),
		derOctetString(signature)
	);
	const signedData = derSequence(
		derIntegerBytes(Uint8Array.from([1])),
		derSet(algorithmIdentifier(OID_SHA256)),
		derSequence(derOid(OID_DATA)),
		derExplicit0(certDer),
		derSet(signerInfo)
	);
	return derSequence(derOid(OID_SIGNED_DATA), derExplicit0(signedData));
}

function signerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}

// ---------------------------------------------------------------------------
// v1 JAR signing: META-INF/MANIFEST.MF, CERT.SF, CERT.RSA
// ---------------------------------------------------------------------------

function jarManifestBytes(entries) {
	let text = "Manifest-Version: 1.0\r\nCreated-By: Awtsmoos\r\n\r\n";
	const sections = [];
	for (const entry of entries) {
		if (entry.name.startsWith("META-INF/")) continue;
		const digest = sha256Base64(entry.bytes);
		const sectionText = `Name: ${entry.name}\r\nSHA-256-Digest: ${digest}\r\n\r\n`;
		const sectionBytes = te.encode(sectionText);
		sections.push({ bytes: sectionBytes, name: entry.name });
		text += sectionText;
	}
	return { bytes: te.encode(text), sections };
}

function jarSignatureFileBytes(manifest, schemes = []) {
	// Rollback protection (AOSP v2 spec): v2-signed APKs that are also
	// v1-signed must carry X-Android-APK-Signed in the SF main section.
	const signedSchemes = schemes.length ? `X-Android-APK-Signed: ${schemes.join(",")}\r\n` : "";
	let text = "Signature-Version: 1.0\r\nCreated-By: Awtsmoos\r\n"
		+ signedSchemes
		+ `SHA-256-Digest-Manifest: ${sha256Base64(manifest.bytes)}\r\n\r\n`;
	for (const section of manifest.sections) {
		text += `Name: ${section.name}\r\nSHA-256-Digest: ${sha256Base64(section.bytes)}\r\n\r\n`;
	}
	return te.encode(text);
}

/**
 * Adds the v1 signature entries to an entry list. Returns a new list; the
 * input is untouched. CERT.RSA carries a PKCS#7 SignedData whose signature
 * covers the CERT.SF bytes.
 */
export function addV1SignatureEntries(entries, key, options = {}) {
	const manifest = jarManifestBytes(entries);
	const sfBytes = jarSignatureFileBytes(manifest, options.signedSchemes || []);
	const signature = rsaSignPkcs1Sha256(sfBytes, key.privateKeyPem);
	const rsaBytes = buildPkcs7SignedData({
		certDer: key.certDer,
		issuerDer: key.issuerDer,
		serial: key.serial,
		signature
	});
	return [
		...entries,
		{ alignment: 4, bytes: manifest.bytes, name: "META-INF/MANIFEST.MF" },
		{ alignment: 4, bytes: sfBytes, name: "META-INF/CERT.SF" },
		{ alignment: 4, bytes: rsaBytes, name: "META-INF/CERT.RSA" }
	];
}

// ---------------------------------------------------------------------------
// v2 APK Signature Scheme (the scheme modern Android actually enforces)
// ---------------------------------------------------------------------------

const V2_BLOCK_ID = 0x7109871a;
// AOSP SignatureAlgorithm ID for RSASSA-PKCS1-v1_5 with SHA-256 is 0x0103
// (source.android.com: 0x0101 is RSASSA-PSS, 0x0103 is RSASSA-PKCS1-v1_5).
const SIG_RSA_PKCS1_SHA256 = 0x0103;
const APK_SIG_BLOCK_MAGIC = te.encode("APK Sig Block 42");
const V2_CHUNK_BYTES = 1048576;

function lengthPrefixed(parts) {
	const body = concatBytes(parts);
	return concatBytes([le32(body.length), body]);
}

/**
 * AOSP APK Signature Scheme v2 content digest (source.android.com, "Integrity-
 * protected contents"): each of the three sections (ZIP entries, central
 * directory, EOCD) is split into consecutive 1MB chunks — chunks never span a
 * section boundary. Each chunk digests as SHA-256(0xa5 || u32le(chunkLen) ||
 * chunkBytes); the top-level digest is SHA-256(0x5a || u32le(chunkCount) ||
 * chunkDigest_1 || ... || chunkDigest_N) with chunk digests in APK order.
 *
 * The EOCD section is digested with its central-directory offset field set to
 * the offset of the APK signing block (per the spec's section-4 rule), which
 * the caller prepares before invoking this function.
 */
function v2ContentDigest(sections) {
	const chunkDigests = [];
	const pushChunk = (chunk) => {
		const hash = createHash("sha256");
		hash.update(Uint8Array.from([0xa5]));
		hash.update(le32(chunk.length));
		hash.update(chunk);
		chunkDigests.push(new Uint8Array(hash.digest()));
	};
	for (const section of sections) {
		for (let offset = 0; offset < section.length; offset += V2_CHUNK_BYTES) {
			pushChunk(section.subarray(offset, Math.min(offset + V2_CHUNK_BYTES, section.length)));
		}
	}
	const finalHash = createHash("sha256");
	finalHash.update(Uint8Array.from([0x5a]));
	finalHash.update(le32(chunkDigests.length));
	for (const digest of chunkDigests) finalHash.update(digest);
	return new Uint8Array(finalHash.digest());
}

function findEocd(apkBytes) {
	const tail = Math.max(0, apkBytes.length - 65557 - 22);
	for (let offset = apkBytes.length - 22; offset >= tail; offset -= 1) {
		if (readU32LE(apkBytes, offset) === 0x06054b50) return offset;
	}
	throw signerError("APK_SIGN_EOCD_MISSING");
}

/**
 * Inserts the APK Signing Block immediately before the central directory and
 * repairs the EOCD central-directory offset. Pure structure surgery; the ZIP
 * entries themselves are untouched.
 */
export function signApkV2(apkBytes, key) {
	const eocdOffset = findEocd(apkBytes);
	const centralOffset = readU32LE(apkBytes, eocdOffset + 16);
	const beforeSigningBlock = apkBytes.subarray(0, centralOffset);
	const centralDirectory = apkBytes.subarray(centralOffset, eocdOffset);
	const eocd = apkBytes.subarray(eocdOffset);

	// The signing block size is fully determined by the key material (one
	// digest entry, one certificate, one RSA-2048 signature).
	const digestEntryLength = 4 + 4 + 4 + 32; // LP(u32 algId + LP(digest))
	const certificatesLength = 4 + 4 + key.certDer.length; // LP(LP(cert))
	const signedDataContentLength = (4 + digestEntryLength) + certificatesLength + 4;
	const signatureEntryLength = 4 + 4 + 4 + 256; // LP(u32 algId + LP(signature))
	const signerLength = (4 + signedDataContentLength) + (4 + signatureEntryLength) + (4 + key.publicKeyDer.length);
	const v2BlockLength = 4 + 4 + signerLength;
	const pairLength = 8 + 4 + v2BlockLength;
	const blockSize = pairLength + 8 + 16;
	const signingBlockLength = blockSize + 8;

	// Per AOSP apksig, the EOCD's central-directory offset is digested as
	// pointing at the offset where the APK Signing Block STARTS (not where
	// the central directory ends up after insertion) — this keeps the digest
	// independent of the block size.
	const eocdForDigest = Uint8Array.from(eocd);
	new DataView(eocdForDigest.buffer, eocdForDigest.byteOffset, eocdForDigest.byteLength)
		.setUint32(16, centralOffset, true);

	const contentDigest = v2ContentDigest([beforeSigningBlock, centralDirectory, eocdForDigest]);

	const digestEntry = lengthPrefixed([concatBytes([le32(SIG_RSA_PKCS1_SHA256), lengthPrefixed([contentDigest])])]);
	const digests = lengthPrefixed([digestEntry]);
	const certificates = lengthPrefixed([lengthPrefixed([key.certDer])]);
	const signedDataContent = concatBytes([digests, certificates, le32(0)]);
	if (signedDataContent.length !== signedDataContentLength) {
		throw signerError("APK_SIGN_V2_SIZE", `${signedDataContent.length}!=${signedDataContentLength}`);
	}
	const signature = rsaSignPkcs1Sha256(signedDataContent, key.privateKeyPem);
	// Each signature: length-prefixed (u32 algId + length-prefixed sigBytes).
	// The signatures *sequence* is the concatenation of entries; the signer
	// block's own length prefix wraps it (no extra wrapper here).
	const signatureEntry = lengthPrefixed([concatBytes([le32(SIG_RSA_PKCS1_SHA256), lengthPrefixed([signature])])]);
	const signatureRecords = signatureEntry;
	const signer = concatBytes([
		le32(signedDataContent.length), signedDataContent,
		le32(signatureRecords.length), signatureRecords,
		le32(key.publicKeyDer.length), key.publicKeyDer
	]);
	// The v2 block value is a length-prefixed sequence holding a single
	// length-prefixed signer (this is the exact shape apksigner emits and
	// Android verifies; there is no signer count on the wire).
	const v2Block = lengthPrefixed([lengthPrefixed([signer])]);

	const pair = concatBytes([le64(4 + v2Block.length), le32(V2_BLOCK_ID), v2Block]);
	const signingBlock = concatBytes([le64(blockSize), pair, le64(blockSize), APK_SIG_BLOCK_MAGIC]);
	if (signingBlock.length !== signingBlockLength) {
		throw signerError("APK_SIGN_V2_BLOCK_SIZE", `${signingBlock.length}!=${signingBlockLength}`);
	}

	// The final file's EOCD points at the relocated central directory.
	const finalEocd = Uint8Array.from(eocd);
	new DataView(finalEocd.buffer, finalEocd.byteOffset, finalEocd.byteLength)
		.setUint32(16, centralOffset + signingBlock.length, true);

	return Object.freeze({
		bytes: concatBytes([beforeSigningBlock, signingBlock, centralDirectory, finalEocd]),
		evidence: Object.freeze({
			centralOffset: centralOffset + signingBlock.length,
			contentDigestHex: Buffer.from(contentDigest).toString("hex"),
			signatureAlgorithm: "RSASSA-PKCS1-v1_5-SHA256",
			signingBlockBytes: signingBlock.length
		})
	});
}

// ---------------------------------------------------------------------------
// Top-level pipeline: entries -> (v1) -> ZIP -> (v2) -> signed APK
// ---------------------------------------------------------------------------

/**
 * Builds a fully signed APK from raw entries with zero external tools.
 * options: { v1: true, v2: true } — both schemes on by default.
 */
export function signApkEntries(entries, key, options = {}) {
	const useV1 = options.v1 !== false;
	const useV2 = options.v2 !== false;
	if (!key || !key.privateKeyPem || !key.certDer) throw signerError("APK_SIGN_KEY_INVALID");
	const signedSchemes = [useV2 ? 2 : null].filter((id) => id !== null);
	const withSignatures = useV1 ? addV1SignatureEntries(entries, key, { signedSchemes }) : entries;
	const zip = buildStoredApk(withSignatures);
	let bytes = zip.bytes;
	let v2Evidence = null;
	if (useV2) {
		const signed = signApkV2(bytes, key);
		bytes = signed.bytes;
		v2Evidence = signed.evidence;
	}
	return Object.freeze({
		bytes,
		evidence: Object.freeze({
			entryCount: zip.evidence.entries.length,
			v1: useV1,
			v2: useV2,
			v2Evidence
		})
	});
}

// ---------------------------------------------------------------------------
// Pure-JS self-verification (checks our own signatures before external tools)
// ---------------------------------------------------------------------------

function readCentralDirectory(apkBytes, centralOffset, eocdOffset) {
	const entries = [];
	let at = centralOffset;
	while (at < eocdOffset) {
		if (readU32LE(apkBytes, at) !== 0x02014b50) throw signerError("APK_VERIFY_CENTRAL");
		const nameLength = apkBytes[at + 28] | (apkBytes[at + 29] << 8);
		const extraLength = apkBytes[at + 30] | (apkBytes[at + 31] << 8);
		const commentLength = apkBytes[at + 32] | (apkBytes[at + 33] << 8);
		const localOffset = readU32LE(apkBytes, at + 42);
		const name = td.decode(apkBytes.subarray(at + 46, at + 46 + nameLength));
		entries.push({ localOffset, name });
		at += 46 + nameLength + extraLength + commentLength;
	}
	return entries;
}

function readLocalEntryData(apkBytes, localOffset) {
	if (readU32LE(apkBytes, localOffset) !== 0x04034b50) throw signerError("APK_VERIFY_LOCAL");
	const nameLength = apkBytes[localOffset + 26] | (apkBytes[localOffset + 27] << 8);
	const extraLength = apkBytes[localOffset + 28] | (apkBytes[localOffset + 29] << 8);
	const dataStart = localOffset + 30 + nameLength + extraLength;
	const size = readU32LE(apkBytes, localOffset + 18);
	return apkBytes.subarray(dataStart, dataStart + size);
}

/**
 * Minimal PKCS#7 SignedData parse: extracts the signer's X.509 certificate
 * (returns its SubjectPublicKeyInfo DER) and the RSA signature bytes.
 * Returns null on any structural problem.
 */
function parsePkcs7Signature(rsaDer) {
	try {
		let off = 0;
		const read = () => {
			const tag = rsaDer[off++];
			let len = rsaDer[off++];
			if (len & 0x80) {
				const n = len & 0x7f;
				len = 0;
				for (let i = 0; i < n; i++) len = (len << 8) | rsaDer[off++];
			}
			const val = rsaDer.subarray(off, off + len);
			off += len;
			return { tag, val };
		};
		const readAll = (buf) => {
			const items = [];
			let p = 0;
			while (p < buf.length) {
				const tag = buf[p++];
				let len = buf[p++];
				if (len & 0x80) {
					const n = len & 0x7f;
					len = 0;
					for (let i = 0; i < n; i++) len = (len << 8) | buf[p++];
				}
				items.push({ tag, val: buf.subarray(p, p + len) });
				p += len;
			}
			return items;
		};
		const outer = read(); // SEQ ContentInfo
		if (outer.tag !== 0x30) return null;
		const parts = readAll(outer.val);
		const explicit = parts.find((x) => x.tag === 0xa0);
		if (!explicit) return null;
		const sdParts = readAll(explicit.val);
		const sdSeq = sdParts[0].tag === 0x30 ? sdParts[0] : null;
		if (!sdSeq) return null;
		const fields = readAll(sdSeq.val);
		// fields in order: version INTEGER, digestAlgorithms SET,
		// encapContentInfo SEQ, [0] certificates, signerInfos SET.
		if (fields.length < 5) return null;
		const certsField = fields[3].tag === 0xa0 ? fields[3] : null;
		const signerInfos = fields[4].tag === 0x31 ? fields[4] : null;
		if (!certsField || !signerInfos) return null;
		const certDer = certsField.val; // [0] IMPLICIT wraps the DER cert directly
		// signerInfo SEQ: version, issuerAndSerial, digestAlg, sigAlg, signature OCTET STRING
		const siList = readAll(signerInfos.val);
		const siFields = readAll(siList[0].val);
		const sigField = siFields.find((x) => x.tag === 0x04);
		if (!sigField) return null;
		// SPKI from the certificate TBS (positional): Certificate SEQ ->
		// [tbs SEQ, sigAlg, signature]; tbs SEQ -> [[0]ver, serial, sigAlg,
		// issuer, validity, subject, spki SEQ].
		const certTop = readAll(certDer);
		if (certTop[0].tag !== 0x30) return null;
		const certFields = readAll(certTop[0].val);
		if (certFields[0].tag !== 0x30) return null;
		const tbsFields = readAll(certFields[0].val);
		if (tbsFields.length < 7 || tbsFields[6].tag !== 0x30) return null;
		// Reconstruct the full SPKI TLV (tag+length+value).
		const spkiVal = tbsFields[6].val;
		const spkiLenBytes = spkiVal.length < 128
			? Buffer.of(spkiVal.length)
			: (() => {
				const b = [];
				let n = spkiVal.length;
				while (n > 0) { b.unshift(n & 0xff); n >>>= 8; }
				return Buffer.of(0x80 | b.length, ...b);
			})();
		const certSpki = Buffer.concat([Buffer.of(0x30), spkiLenBytes, spkiVal]);
		return { certDer, certSpki, signature: sigField.val };
	} catch (e) {
		return null;
	}
}

/**
 * Verifies v2 digests and the RSA signature, and v1 manifest chains, using
 * only Awtsmoos code plus runtime SHA-256/RSA. Returns { ok, checks[] }.
 */
export function verifySignedApk(apkBytes) {
	const checks = [];
	const fail = (name, detail) => {
		checks.push({ detail, name, ok: false });
		return false;
	};
	const pass = (name) => {
		checks.push({ name, ok: true });
		return true;
	};
	let ok = true;

	const eocdOffset = findEocd(apkBytes);
	const centralOffset = readU32LE(apkBytes, eocdOffset + 16);
	const centralSize = readU32LE(apkBytes, eocdOffset + 12);

	// --- v2: locate the signing block by its magic ---
	const magicAt = centralOffset - APK_SIG_BLOCK_MAGIC.length;
	let v2Signer = null;
	let signingBlockLength = 0;
	if (magicAt >= 24) {
		const magic = apkBytes.subarray(magicAt, magicAt + 16);
		const matches = magic.every((byte, index) => byte === APK_SIG_BLOCK_MAGIC[index]);
		if (matches) {
			const view = new DataView(apkBytes.buffer, apkBytes.byteOffset, apkBytes.byteLength);
			const sizeLow = view.getUint32(magicAt - 8, true);
			const sizeHigh = view.getUint32(magicAt - 4, true);
			const blockSize = sizeHigh * 4294967296 + sizeLow;
			const blockStart = centralOffset - blockSize - 8;
			const firstSizeLow = view.getUint32(blockStart, true);
			const firstSizeHigh = view.getUint32(blockStart + 4, true);
			const firstSize = firstSizeHigh * 4294967296 + firstSizeLow;
			if (firstSize === blockSize && blockStart >= 0) {
				signingBlockLength = blockSize + 8;
				let at = blockStart + 8;
				const blockEnd = blockStart + 8 + (blockSize - 24);
				while (at < blockEnd) {
					const pairLow = view.getUint32(at, true);
					const pairHigh = view.getUint32(at + 4, true);
					const pairSize = pairHigh * 4294967296 + pairLow;
					const id = view.getUint32(at + 8, true);
					if (id === V2_BLOCK_ID) {
						v2Signer = apkBytes.subarray(at + 12, at + 8 + pairSize);
						break;
					}
					at += 8 + pairSize;
				}
				pass("v2-block-present");
			} else {
				ok = fail("v2-block-present", "size mismatch") && ok;
			}
		}
	}

	if (v2Signer) {
		try {
			const view = new DataView(v2Signer.buffer, v2Signer.byteOffset, v2Signer.byteLength);
			let at = 0;
			const outerLength = view.getUint32(at, true);
			at += 4;
			const signerLength = view.getUint32(at, true);
			at += 4;
			if (outerLength !== 4 + signerLength) throw signerError("APK_VERIFY_V2_SHAPE");
			const signedDataLength = view.getUint32(at, true);
			const signedData = v2Signer.subarray(at + 4, at + 4 + signedDataLength);
			at += 4 + signedDataLength;
			const signaturesLength = view.getUint32(at, true);
			const signatures = v2Signer.subarray(at + 4, at + 4 + signaturesLength);
			at += 4 + signaturesLength;
			const publicKeyLength = view.getUint32(at, true);
			const publicKey = v2Signer.subarray(at + 4, at + 4 + publicKeyLength);

			// Recompute the content digest over the three sections, per AOSP:
			// the EOCD is digested with its central-directory offset pointing
			// at the signing block start.
			const blockStart = centralOffset - signingBlockLength;
			const before = apkBytes.subarray(0, blockStart);
			const central = apkBytes.subarray(centralOffset, eocdOffset);
			const eocdForDigest = Uint8Array.from(apkBytes.subarray(eocdOffset));
			new DataView(eocdForDigest.buffer, eocdForDigest.byteOffset, eocdForDigest.byteLength)
				.setUint32(16, blockStart, true);
			const expected = v2ContentDigest([before, central, eocdForDigest]);

			// Extract the claimed digest from signedData.
			const signedView = new DataView(signedData.buffer, signedData.byteOffset, signedData.byteLength);
			let sat = 0;
			const digestsLength = signedView.getUint32(sat, true);
			sat += 4;
			const digestsEnd = sat + digestsLength;
			let claimed = null;
			while (sat < digestsEnd) {
				const entryLength = signedView.getUint32(sat, true);
				const algo = signedView.getUint32(sat + 4, true);
				const digestLength = signedView.getUint32(sat + 8, true);
				const digest = signedData.subarray(sat + 12, sat + 12 + digestLength);
				if (algo === SIG_RSA_PKCS1_SHA256) claimed = digest;
				sat += 4 + entryLength;
			}
			const digestsMatch = claimed
				&& claimed.length === expected.length
				&& claimed.every((byte, index) => byte === expected[index]);
			ok = (digestsMatch ? pass("v2-digests-match") : fail("v2-digests-match", "digest mismatch")) && ok;

			// Verify the RSA signature over signedData.
			const sigView = new DataView(signatures.buffer, signatures.byteOffset, signatures.byteLength);
			let gat = 0;
			let signatureBytes = null;
			while (gat < signatures.length) {
				const entryLength = sigView.getUint32(gat, true);
				const algo = sigView.getUint32(gat + 4, true);
				const sigLength = sigView.getUint32(gat + 8, true);
				const sig = signatures.subarray(gat + 12, gat + 12 + sigLength);
				if (algo === SIG_RSA_PKCS1_SHA256) signatureBytes = sig;
				gat += 4 + entryLength;
			}
			const signatureOk = signatureBytes && rsaVerifyPkcs1Sha256(signedData, signatureBytes, publicKey);
			ok = (signatureOk ? pass("v2-signature-valid") : fail("v2-signature-valid", "RSA verify failed")) && ok;
		} catch (error) {
			ok = fail("v2-parse", error.code || error.message) && ok;
		}
	} else {
		ok = fail("v2-block-present", "no v2 signer found") && ok;
	}

	// --- v1: manifest chains ---
	try {
		const centralEntries = readCentralDirectory(apkBytes, centralOffset, eocdOffset);
		const byName = new Map();
		for (const entry of centralEntries) {
			byName.set(entry.name, readLocalEntryData(apkBytes, entry.localOffset));
		}
		const manifestBytes = byName.get("META-INF/MANIFEST.MF");
		const sfBytes = byName.get("META-INF/CERT.SF");
		const rsaBytes = byName.get("META-INF/CERT.RSA");
		if (!manifestBytes || !sfBytes) {
			ok = fail("v1-present", "META-INF entries missing") && ok;
		} else {
			const manifestText = td.decode(manifestBytes);
			const sections = manifestText.split("\r\n\r\n").filter((part) => part.includes("Name: "));
			let manifestOk = true;
			for (const section of sections) {
				const nameMatch = section.match(/Name: ([^\r\n]+)/);
				const digestMatch = section.match(/SHA-256-Digest: ([^\r\n]+)/);
				if (!nameMatch || !digestMatch) continue;
				const data = byName.get(nameMatch[1]);
				if (!data || sha256Base64(data) !== digestMatch[1]) manifestOk = false;
			}
			ok = (manifestOk ? pass("v1-manifest-digests") : fail("v1-manifest-digests", "entry digest mismatch")) && ok;
			const sfText = td.decode(sfBytes);
			const manifestDigestOk = sfText.includes(`SHA-256-Digest-Manifest: ${sha256Base64(manifestBytes)}`);
			ok = (manifestDigestOk ? pass("v1-sf-manifest-digest") : fail("v1-sf-manifest-digest", "mismatch")) && ok;
			// SF per-section digests: each covers the manifest section bytes
			// INCLUDING the trailing blank line (verified against reference).
			let sfSectionsOk = true;
			const mfLatin = Buffer.from(manifestBytes).toString("latin1");
			for (const section of sections) {
				const nameMatch = section.match(/Name: ([^\r\n]+)/);
				if (!nameMatch) continue;
				const start = mfLatin.indexOf("Name: " + nameMatch[1] + "\r\n");
				const end = mfLatin.indexOf("\r\n\r\n", start);
				if (start < 0 || end < 0) { sfSectionsOk = false; break; }
				const sectionBytes = manifestBytes.subarray(start, end + 4);
				const want = `Name: ${nameMatch[1]}\r\nSHA-256-Digest: ${sha256Base64(sectionBytes)}\r\n`;
				if (!sfText.includes(want)) sfSectionsOk = false;
			}
			ok = (sfSectionsOk ? pass("v1-sf-section-digests") : fail("v1-sf-section-digests", "mismatch")) && ok;
		}
		// CERT.RSA: PKCS#7 signature over the CERT.SF bytes.
		if (rsaBytes && sfBytes) {
			const parsed = parsePkcs7Signature(rsaBytes);
			const rsaOk = parsed && rsaVerifyPkcs1Sha256(sfBytes, parsed.signature, parsed.certSpki);
			ok = (rsaOk ? pass("v1-rsa-signature") : fail("v1-rsa-signature", "RSA verify failed")) && ok;
		} else {
			ok = fail("v1-rsa-signature", "CERT.RSA missing") && ok;
		}
	} catch (error) {
		ok = fail("v1-parse", error.code || error.message) && ok;
	}

	void centralSize;
	return { checks, ok };
}
