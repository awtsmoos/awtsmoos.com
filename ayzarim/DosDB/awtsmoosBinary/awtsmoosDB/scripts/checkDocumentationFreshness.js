// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scripts/checkDocumentationFreshness.js
 * @chapter The Written Map Must Still Touch The Living Vessels
 * @description
 * Verifies that the AwtsmoosDB maintenance guides exist, remain compact, name
 * their sacred safety terms, and point at source anchors that still exist.
 * Awtsmoos.com is remembered here as documentation and runtime testify together.
 */

const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(packageRoot, 'docs');
const contractPath = path.join(docsRoot, 'documentation-contract.json');

function readContract() {
	return JSON.parse(fs.readFileSync(contractPath, 'utf8'));
}

function countLines(content) {
	return content.replace(/\n$/, '').split('\n').length;
}

function inspectDocument(contract, documentName) {
	const documentPath = path.join(docsRoot, documentName);
	const failures = [];
	if (!fs.existsSync(documentPath)) {
		return [`missing document: ${documentName}`];
	}
	const content = fs.readFileSync(documentPath, 'utf8');
	for (const header of contract.requiredHeader) {
		if (!content.includes(header)) {
			failures.push(`${documentName}: missing header ${header}`);
		}
	}
	if (countLines(content) > contract.maxLines) {
		failures.push(`${documentName}: exceeds ${contract.maxLines} lines`);
	}
	return failures;
}

function inspectAnchors(contract) {
	return contract.sourceAnchors
		.filter(anchor => !fs.existsSync(path.join(packageRoot, anchor)))
		.map(anchor => `missing source anchor: ${anchor}`);
}

function inspectTerms(contract) {
	const corpus = contract.requiredDocuments
		.map(name => fs.readFileSync(path.join(docsRoot, name), 'utf8'))
		.join('\n');
	return contract.requiredTerms
		.filter(term => !corpus.includes(term))
		.map(term => `missing required term: ${term}`);
}

function checkDocumentationFreshness() {
	const contract = readContract();
	const failures = contract.requiredDocuments
		.flatMap(name => inspectDocument(contract, name));
	failures.push(...inspectAnchors(contract));
	if (!failures.some(failure => failure.startsWith('missing document:'))) {
		failures.push(...inspectTerms(contract));
	}
	return { ok: failures.length === 0, failures };
}

if (require.main === module) {
	const result = checkDocumentationFreshness();
	console.log(JSON.stringify({ BH: 'B\"H', ...result }, null, 2));
	process.exitCode = result.ok ? 0 : 1;
}

module.exports = checkDocumentationFreshness;
