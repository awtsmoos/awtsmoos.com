#!/usr/bin/env node
// B"H
import { analyzeDocument } from './random_audit/analyze.mjs';
import { DOCUMENTS_DIR, parseArguments } from './random_audit/config.mjs';
import { writeReports } from './random_audit/report.mjs';
import { chooseDocuments, choosePairs, listCompletedDocuments } from './random_audit/sample.mjs';

const options = parseArguments(process.argv);
const available = listCompletedDocuments(DOCUMENTS_DIR);
const selected = chooseDocuments(available, options.samples, options.seed);
const documents = selected.map(documentId => {
	const result = analyzeDocument(DOCUMENTS_DIR, documentId);
	return {
		...result,
		sampledPairs: choosePairs(result.pairs, options.paragraphs, options.seed, documentId)
	};
});
const sampledPairs = documents.flatMap(document => document.sampledPairs);
const audit = {
	generatedAt: new Date().toISOString(),
	seed: options.seed,
	options,
	summary: {
		availableDocuments: available.length,
		documents: documents.length,
		paragraphs: sampledPairs.length,
		structuralFailures: documents.filter(document => !document.validation.ok).length,
		flags: sampledPairs.reduce((count, pair) => count + pair.issues.length, 0)
	},
	documents
};
const files = writeReports(options.output, audit);
console.log(JSON.stringify({ summary: audit.summary, files }, null, 2));
