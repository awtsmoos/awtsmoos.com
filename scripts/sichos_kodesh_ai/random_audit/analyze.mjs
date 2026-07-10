// B"H
import fs from 'node:fs';
import path from 'node:path';

function normalize(text = '') {
	return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function pairMap(source, translation) {
	const translatedSections = new Map(translation.sections.map(section => [section.sectionIndex, section]));
	return source.sections.flatMap(section => {
		const translated = translatedSections.get(section.sectionIndex);
		const paragraphs = new Map((translated?.paragraphs || []).map(item => [item.index, item]));
		return section.paragraphs.map(paragraph => ({
			key: `${section.sectionIndex}:${paragraph.paragraphIndex}`,
			sectionIndex: section.sectionIndex,
			paragraphIndex: paragraph.paragraphIndex,
			source: paragraph.text,
			english: paragraphs.get(paragraph.paragraphIndex)?.english || ''
		}));
	});
}

function inspectPair(pair) {
	const sourceLength = normalize(pair.source).length;
	const english = normalize(pair.english);
	const englishLength = english.length;
	const issues = [];
	if (!english) issues.push('missing_english');
	if (/[\u0590-\u05FF]/u.test(english)) issues.push('hebrew_or_yiddish_letters_in_english');
	if (sourceLength > 80 && englishLength < sourceLength * 0.18) issues.push('possible_omission');
	if (sourceLength > 20 && englishLength > sourceLength * 5) issues.push('possible_expansion');
	return { ...pair, sourceLength, englishLength, issues };
}

export function analyzeDocument(documentsDirectory, documentId) {
	const directory = path.join(documentsDirectory, documentId);
	const source = JSON.parse(fs.readFileSync(path.join(directory, 'source.json'), 'utf8'));
	const translation = JSON.parse(fs.readFileSync(path.join(directory, 'translation.parsed.json'), 'utf8'));
	const validation = JSON.parse(fs.readFileSync(path.join(directory, 'translation.validation.json'), 'utf8'));
	const pairs = pairMap(source, translation).map(inspectPair);
	return { documentId, title: source.title, sourcePath: source.sourcePath, validation, pairs };
}
