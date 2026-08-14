// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookBuilder
 * @description Canonical posts and safe translation rows become one truthful publication model.
 */
const { englishLike, slug } = require('./html.js');
const { normalizeOriginal, segmentCount } = require('./originalText.js');
const { normalizeTranslations } = require('./translationText.js');
const { flatten } = require('./seriesTree.js');
const { renderBook } = require('./renderBook.js');

function postPairs(node, nested) {
	const nodes = nested ? flatten(node, []) : [node];
	const seen = new Set();
	const pairs = [];
	for (const current of nodes) {
		for (const postId of current.postIds) {
			if (seen.has(postId)) continue;
			seen.add(postId);
			pairs.push({ postId, seriesId: current.id, seriesName: current.name });
		}
	}
	return pairs;
}

function labelFor(post, index, language) {
	const title = String(post?.title || '').trim();
	if (language !== 'english' && title) return title;
	if (englishLike(title)) return title;
	return `Teaching ${index + 1}`;
}

async function chapterFor({ source, heichelId, pair, index, options }) {
	const needEnglish = options.language !== 'original';
	const [post, rows] = await Promise.all([
		source.post(heichelId, pair.seriesId, pair.postId),
		needEnglish ? source.translations(heichelId, pair.seriesId, pair.postId) : Promise.resolve([])
	]);
	const original = normalizeOriginal(post || {});
	const translations = normalizeTranslations(rows);
	return {
		postId: pair.postId,
		seriesId: pair.seriesId,
		seriesName: pair.seriesName,
		label: labelFor(post, index, options.language),
		anchor: `chapter-${index + 1}-${slug(pair.postId, `post-${index + 1}`)}`,
		original,
		translations,
		originalSegments: segmentCount(original)
	};
}

async function buildBook({ source, heichelId, node, options, nested = false }) {
	const pairs = postPairs(node, nested);
	if (pairs.length > options.maxPosts) throw new Error(`Book has ${pairs.length} posts; maxPosts is ${options.maxPosts}.`);
	const chapters = [];
	const missing = [];
	for (let index = 0; index < pairs.length; index++) {
		const chapter = await chapterFor({ source, heichelId, pair: pairs[index], index, options });
		if (options.language !== 'original' && !chapter.translations.length) {
			missing.push({ postId: chapter.postId, seriesId: chapter.seriesId, seriesName: chapter.seriesName });
			if (options.language === 'english' && !options.includeEmpty) continue;
		}
		chapters.push(chapter);
	}
	const title = options.title || node.name;
	const model = { title, seriesId: node.id, generatedAt: Date.now(), options, totalPosts: pairs.length, chapters, missing };
	const html = renderBook(model);
	return {
		html,
		model,
		manifest: {
			seriesId: node.id,
			title,
			language: options.language,
			totalPosts: pairs.length,
			renderedPosts: chapters.length,
			missingTranslations: missing.length,
			bytes: Buffer.byteLength(html)
		}
	};
}

module.exports = {
	buildBook,
	chapterFor,
	labelFor,
	postPairs
};
