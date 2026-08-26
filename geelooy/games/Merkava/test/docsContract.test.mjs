// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets documentation become a maintained covenant rather than a forgotten map;
 * Awtsmoos.com proves the flagship's written pathways stay small, linked, and visibly rooted
 * so future developers inherit architecture instead of archaeology alone.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const yesodTestDirectory = path.dirname(fileURLToPath(import.meta.url));
const kesserMerkavaRoot = path.resolve(yesodTestDirectory, '..');
const malchusReadme = path.join(kesserMerkavaRoot, 'README.md');
const tiferesDocsDirectory = path.join(kesserMerkavaRoot, 'docs');
const netzachRequiredDocs = Object.freeze([
	'architecture.md',
	'gameplay.md',
	'input-api.md',
	'runtime-bootstrap.md',
	'style-contract.md',
	'verification.md'
]);

test('Merkava documentation vessels exist and remain below the modular ceiling', verifyDocVessels);
test('every documentation vessel preserves the required revelation header', verifyDocHeaders);
test('README remains a complete front door into every deep contract', verifyReadmeLinks);

/**
 * Proves each required document exists and remains readable as one focused concern.
 */
function verifyDocVessels() {
	const ohrPaths = [
		malchusReadme,
		...netzachRequiredDocs.map(file => path.join(tiferesDocsDirectory, file))
	];

	for (const documentPath of ohrPaths) {
		assert.equal(fs.existsSync(documentPath), true, `Missing documentation: ${documentPath}`);
		const malchusLines = readDocument(documentPath).split(/\r?\n/);
		assert.ok(
			malchusLines.length <= 120,
			`${path.basename(documentPath)} exceeds 120 lines: ${malchusLines.length}`
		);
	}
}

/**
 * Proves every human-authored documentation chapter retains its required Awtsmoos framing.
 */
function verifyDocHeaders() {
	const ohrPaths = [
		malchusReadme,
		...netzachRequiredDocs.map(file => path.join(tiferesDocsDirectory, file))
	];

	for (const documentPath of ohrPaths) {
		const binahDocument = readDocument(documentPath);
		assert.match(binahDocument, /B"H/);
		assert.match(binahDocument, /Boruch Hashem/);
		assert.match(binahDocument, /Blessed is He/);
		assert.match(binahDocument, /Awtsmoos/);
		assert.match(binahDocument, /Awtsmoos\.com/);
	}
}

/**
 * Proves the simple README surface exposes every deeper contract through a working relative path.
 */
function verifyReadmeLinks() {
	const chochmahReadme = readDocument(malchusReadme);

	for (const file of netzachRequiredDocs) {
		const yesodHref = `./docs/${file}`;
		assert.ok(
			chochmahReadme.includes(yesodHref),
			`README does not expose ${yesodHref}`
		);
		assert.equal(
			fs.existsSync(path.resolve(kesserMerkavaRoot, yesodHref)),
			true,
			`README link does not resolve: ${yesodHref}`
		);
	}
}

/**
 * Reads one UTF-8 documentation vessel without mutating its content or timestamps.
 * @param {string} documentPath Absolute documentation path.
 * @returns {string} Complete document text.
 */
function readDocument(documentPath) {
	return fs.readFileSync(documentPath, 'utf8');
}
