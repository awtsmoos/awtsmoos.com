#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublishSichosKodeshCommentSidecars
 * @description
 * The Awtsmoos gathers each translated paragraph into a small document vessel,
 * so Awtsmoos.com may reveal exact comments without scanning the whole corpus.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
	OUTPUT_ROOT,
	TRANSLATION_ROOT
} from './sichos_kodesh/config.mjs';
import { cleanEnglish } from './sichos_kodesh/text.mjs';

const stagingRoot = process.env.AWTSMOOS_SICHOS_KODESH_RAG_ROOT
	|| path.join(OUTPUT_ROOT, 'rag-staging');
const sidecarRoot = path.join(stagingRoot, 'comments', 'sichos-kodesh');
const documentIds = fs.readdirSync(TRANSLATION_ROOT).sort();
let publishedDocuments = 0;
let publishedComments = 0;

fs.mkdirSync(sidecarRoot, { recursive: true });

for (const documentId of documentIds) {
	const translationFile = path.join(
		TRANSLATION_ROOT,
		documentId,
		'translation.parsed.json'
	);
	if (!fs.existsSync(translationFile)) {
		continue;
	}
	const translation = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
	const comments = commentRows(translation);
	if (!comments.length) {
		continue;
	}
	const outputFile = path.join(sidecarRoot, `${documentId}.json`);
	fs.writeFileSync(outputFile, JSON.stringify({
		BH: 'B"H',
		documentId,
		comments
	}));
	publishedDocuments += 1;
	publishedComments += comments.length;
}

console.log(JSON.stringify({
	BH: 'B"H',
	stagingRoot,
	sidecarRoot,
	publishedDocuments,
	publishedComments
}, null, 2));

function commentRows(translation = {}) {
	const sections = Array.isArray(translation.sections)
		? translation.sections
		: [];
	return sections.flatMap(section => {
		const paragraphs = Array.isArray(section.paragraphs)
			? section.paragraphs
			: [];
		return paragraphs.flatMap(paragraph => {
			const content = cleanEnglish(paragraph.english);
			if (!content) {
				return [];
			}
			return [{
				verseSection: Number(section.sectionIndex),
				subsectionId: Number(paragraph.index),
				content
			}];
		});
	});
}
