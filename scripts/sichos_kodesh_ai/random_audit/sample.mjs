// B"H
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function score(seed, value) {
	return crypto.createHash('sha256').update(`${seed}:${value}`).digest('hex');
}

export function listCompletedDocuments(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.filter(id => ['source.json', 'translation.parsed.json', 'translation.validation.json']
			.every(file => fs.existsSync(path.join(directory, id, file))));
}

export function chooseDocuments(ids, count, seed) {
	return [...ids]
		.sort((left, right) => score(seed, left).localeCompare(score(seed, right)))
		.slice(0, Math.min(count, ids.length));
}

export function choosePairs(pairs, count, seed, documentId) {
	return [...pairs]
		.sort((left, right) => score(seed, `${documentId}:${left.key}`)
			.localeCompare(score(seed, `${documentId}:${right.key}`)))
		.slice(0, Math.min(count, pairs.length));
}
