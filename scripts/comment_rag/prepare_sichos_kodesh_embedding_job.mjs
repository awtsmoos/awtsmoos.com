#!/usr/bin/env node
// B"H
import fs from 'node:fs';
import path from 'node:path';
import { JOB_ROOT, MANIFEST, MAX_TOKENS, OVERLAP_SUBSECTIONS, TARGET_TOKENS, TRANSLATION_ROOT } from './sichos_kodesh/config.mjs';
import { findCanonicalPostsByTitle, normalizeTitle } from './sichos_kodesh/live-posts.mjs';
import { buildRecords } from './sichos_kodesh/records.mjs';

if (process.argv.includes('--run-embeddings')) throw new Error('Preparation never runs embeddings.');
const documents = [];
for (const documentId of fs.readdirSync(TRANSLATION_ROOT).sort()) {
	const directory = path.join(TRANSLATION_ROOT, documentId);
	const files = ['source.json', 'translation.parsed.json', 'translation.validation.json'].map(name => path.join(directory, name));
	if (!files.every(fs.existsSync)) continue;
	const [source, translation, validation] = files.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
	documents.push({ documentId, source, translation, validation });
}

const groups = new Map();
for (const document of documents) {
	const key = normalizeTitle(document.source.title);
	if (!groups.has(key)) groups.set(key, []);
	groups.get(key).push(document);
}

const assignments = [];
const blockers = [];
for (const group of groups.values()) {
	if (group.some(document => !document.validation.ok)) {
		blockers.push({ title: group[0].source.title, reason: 'translation_validation_failed' });
		continue;
	}
	const matches = await findCanonicalPostsByTitle(group[0].source.title);
	const sortedDocuments = [...group].sort((left, right) => left.documentId.localeCompare(right.documentId));
	const sortedMatches = [...matches].sort((left, right) => {
		if (right.contentLength !== left.contentLength) return right.contentLength - left.contentLength;
		return `${left.seriesId}:${left.postId}`.localeCompare(`${right.seriesId}:${right.postId}`);
	});
	if (sortedDocuments.length === 1 && sortedMatches.length >= 1) {
		assignments.push({
			document: sortedDocuments[0],
			mapping: sortedMatches[0],
			method: sortedMatches.length === 1 ? 'unique-normalized-title' : 'duplicate-title-longest-production-record'
		});
		continue;
	}
	if (sortedDocuments.length === sortedMatches.length && sortedDocuments.length > 1) {
		for (let index = 0; index < sortedDocuments.length; index += 1) {
			assignments.push({
				document: sortedDocuments[index],
				mapping: sortedMatches[index],
				method: 'duplicate-title-deterministic-one-to-one'
			});
		}
		continue;
	}
	blockers.push({
		title: group[0].source.title,
		reason: 'production_mapping_cardinality_mismatch',
		translationCount: sortedDocuments.length,
		productionPostCount: sortedMatches.length
	});
}
if (blockers.length) throw new Error(`Refusing manifest with ${blockers.length} blockers: ${JSON.stringify(blockers.slice(0, 20))}`);

const records = [];
for (const assignment of assignments) {
	const { document, mapping, method } = assignment;
	records.push(...buildRecords({
		documentId: document.documentId,
		postId: mapping.postId,
		seriesId: mapping.seriesId,
		productionMappingMethod: method,
		title: document.source.title
	}, document.translation, {
		targetTokens: TARGET_TOKENS,
		maxTokens: MAX_TOKENS,
		overlapSubsections: OVERLAP_SUBSECTIONS
	}));
}
fs.mkdirSync(JOB_ROOT, { recursive: true });
fs.writeFileSync(MANIFEST, records.map(JSON.stringify).join('\n') + '\n');
const summary = {
	BH: 'B"H',
	status: 'prepared-not-embedded',
	documents: assignments.length,
	productionPosts: new Set(assignments.map(assignment => assignment.mapping.postId)).size,
	records: records.length,
	targetTokens: TARGET_TOKENS,
	maxTokens: MAX_TOKENS,
	overlapSubsections: OVERLAP_SUBSECTIONS,
	mappingMethods: assignments.reduce((counts, assignment) => {
		counts[assignment.method] = (counts[assignment.method] || 0) + 1;
		return counts;
	}, {}),
	manifest: MANIFEST,
	preparedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(JOB_ROOT, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
