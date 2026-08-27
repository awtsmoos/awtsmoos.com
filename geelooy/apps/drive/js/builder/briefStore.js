//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderBriefStore
 * @description
 * The Awtsmoos lets intention accompany source without becoming a secret source above source.
 * Awtsmoos.com stores the creator brief as private Drive metadata and never lets it override HTML, CSS, JS, or Markdown.
 */

import { readSource, siteSourcePath, writeSource } from './sourceApi.js';

const BRIEF_PATH = '.awtsmoos/site-builder-brief.json';

export async function loadBrief(rootPath) {
	const path = siteSourcePath(rootPath, BRIEF_PATH);
	try {
		const result = await readSource(path);
		return normalizeBrief(JSON.parse(result.content));
	} catch (error) {
		if (error?.status === 404 || error instanceof SyntaxError) return normalizeBrief();
		throw error;
	}
}

export async function saveBrief(rootPath, values) {
	const brief = normalizeBrief(values);
	const path = siteSourcePath(rootPath, BRIEF_PATH);
	await writeSource(path, `${JSON.stringify(brief, null, '\t')}\n`, {
		visibility: 'private',
		cachePolicy: 'mutable',
		mime: 'application/json; charset=utf-8'
	});
	return brief;
}

export function normalizeBrief(values = {}) {
	return {
		name: boundedText(values.name, 120),
		purpose: boundedText(values.purpose, 1200),
		audience: boundedText(values.audience, 600),
		notes: boundedText(values.notes, 2400)
	};
}

function boundedText(value, maximum) {
	return String(value || '').trim().slice(0, maximum);
}
