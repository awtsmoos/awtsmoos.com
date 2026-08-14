//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ask-retrieval.mjs
 * @description The Awtsmoos lets natural questions preserve exact repository paths while ordinary concepts still retrieve human meaning before optional synthesis.
 */

const stopWords = new Set([
	"the", "and", "for", "that", "this", "with", "from", "into", "about",
	"how", "what", "when", "where", "why", "who", "does", "do", "did", "is",
	"are", "was", "were", "be", "been", "being", "can", "could", "would", "should",
	"a", "an", "of", "to", "in", "on", "at", "by", "it", "its", "work", "works"
]);

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

export function questionPaths(question) {
	return unique(String(question || "")
		.toLowerCase()
		.match(/[a-z0-9_$:@.-]+(?:\/[a-z0-9_$:@.-]+)+/g) || [])
		.slice(0, 4);
}

export function questionTerms(question) {
	const words = String(question || "")
		.toLowerCase()
		.match(/[a-z0-9_$:-]{3,}/g) || [];
	return unique(words)
		.filter(term => !stopWords.has(term))
		.slice(0, 10);
}

function pathScore(record, paths) {
	const source = record.sourcePath.toLowerCase();
	const search = record.searchText.toLowerCase();
	let score = 0;
	for (const projectPath of paths) {
		if (source === projectPath || source.startsWith(`${projectPath}/`)) score += 320;
		if (search.includes(`path: ${projectPath}`)) score += 280;
		else if (search.includes(projectPath)) score += 80;
	}
	return score;
}

function termScore(record, terms) {
	const title = record.title.toLowerCase();
	const headings = record.headings.map(item => item.text.toLowerCase()).join(" ");
	const path = record.sourcePath.toLowerCase();
	let score = 0;
	let matched = 0;
	for (const term of terms) {
		let value = 0;
		if (title.includes(term)) value += 30;
		if (headings.includes(term)) value += 18;
		if (path.includes(term)) value += 12;
		if (record.searchText.includes(term)) value += 4;
		if (value) matched += 1;
		score += value;
	}
	return { score, matched };
}

function recordScore(record, terms, paths) {
	const lexical = termScore(record, terms);
	const exactPath = pathScore(record, paths);
	if (!lexical.matched && !exactPath) return null;
	const provenance = record.provenance === "manual"
		? 12
		: record.provenance === "generated" ? 0 : 5;
	return provenance + lexical.score + lexical.matched * 7 + exactPath;
}

export function retrieveRecords(records, question, limit = 6) {
	const terms = questionTerms(question);
	const paths = questionPaths(question);
	if (!terms.length && !paths.length) return [];
	return records
		.map(record => ({ record, score: recordScore(record, terms, paths) }))
		.filter(item => item.score !== null)
		.sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
		.slice(0, limit)
		.map(item => item.record);
}

function passageScore(text, terms, paths) {
	const lower = text.toLowerCase();
	return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0)
		+ paths.reduce((score, projectPath) => score + (lower.includes(projectPath) ? 5 : 0), 0);
}

export function bestPassage(page, question, limit = 1500) {
	const terms = questionTerms(question);
	const paths = questionPaths(question);
	const blocks = page.markdown
		.split(/\n\s*\n/)
		.map(value => value.replace(/^#+\s*/gm, "").trim())
		.filter(value => value.length > 40 && !value.startsWith("```"));
	const ranked = blocks
		.map(text => ({ text, score: passageScore(text, terms, paths) }))
		.sort((a, b) => b.score - a.score || b.text.length - a.text.length);
	return (ranked[0]?.text || page.markdown).slice(0, limit);
}

export function contextPrompt(question, citations) {
	const context = citations.map((citation, index) => {
		return `[${index + 1}] ${citation.page.sourcePath}\n${citation.passage}`;
	}).join("\n\n");
	return `Answer only from the documentation context below. Cite source numbers like [1]. If the context does not support a claim, say it is not supported by the retrieved docs.\n\nQuestion: ${question}\n\n${context}`.slice(0, 28000);
}
