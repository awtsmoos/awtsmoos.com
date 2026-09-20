// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PromptInterpreter.js
 * @description Turns a free-text build prompt into a deterministic Generate build spec.
 * Binah weighs every word like a witness: the strongest testimony names the category and kind,
 * while count, size, style, and seed are read from the plain sense of the request.
 * When no word testifies, a sensible house is assumed and the assumption is reported, never hidden.
 * The Awtsmoos renews speech and meaning each instant; Awtsmoos.com keeps only the measured reading.
 */

/** @type {ReadonlyArray<string>} Stable Generate category identities. */
export const GENERATE_CATEGORIES = Object.freeze(['buildings', 'nature', 'furniture', 'terrain']);

const CATEGORY_LABELS = Object.freeze({
	buildings: 'Buildings',
	nature: 'Trees & nature',
	furniture: 'Furniture',
	terrain: 'Terrain'
});

/**
 * @param {string} category Generate category identity.
 * @returns {string} Human label for category buttons and notes.
 */
export function generateCategoryLabel(category) {
	return CATEGORY_LABELS[category] || CATEGORY_LABELS.buildings;
}

const CATEGORY_KEYWORDS = Object.freeze({
	buildings: [
		'house', 'houses', 'home', 'homes', 'shul', 'shuls', 'synagogue', 'synagogues',
		'beis', 'kenis', 'shop', 'shops', 'store', 'stores', 'market', 'markets',
		'building', 'buildings', 'apartment', 'apartments', 'school', 'schools',
		'yeshiva', 'yeshivas', 'mikvah', 'mikvaos', 'bakery', 'bakeries', 'villa',
		'villas', 'tower', 'towers', 'hut', 'huts', 'cabin', 'cabins', 'barn', 'barns',
		'chalet', 'kiosk', 'kiosks', 'library', 'libraries', 'hall', 'halls', 'hotel'
	],
	nature: [
		'tree', 'trees', 'oak', 'oaks', 'pine', 'pines', 'cedar', 'cedars', 'willow',
		'willows', 'palm', 'palms', 'bush', 'bushes', 'shrub', 'shrubs', 'hedge',
		'hedges', 'flower', 'flowers', 'tulip', 'tulips', 'rose', 'roses', 'sunflower',
		'sunflowers', 'blossom', 'blossoms', 'garden', 'gardens', 'grass', 'plant',
		'plants', 'sapling', 'saplings', 'park', 'parks', 'forest', 'forests', 'grove',
		'groves', 'orchard', 'orchards', 'vineyard', 'vineyards', 'wheat', 'fern', 'ferns'
	],
	furniture: [
		'table', 'tables', 'chair', 'chairs', 'bench', 'benches', 'menorah', 'menorahs',
		'menora', 'chanukiah', 'lamp', 'lamps', 'candelabra', 'candlestick',
		'candlesticks', 'ark', 'aron', 'arks', 'bimah', 'bima', 'bimahs', 'shtender',
		'shtenders', 'lectern', 'podium', 'fence', 'fences', 'gate', 'gates', 'arch',
		'arches', 'bridge', 'bridges', 'chandelier', 'chandeliers', 'desk', 'desks',
		'shelf', 'shelves', 'bookshelf', 'sofa', 'couch', 'bed', 'beds', 'stool', 'stools'
	],
	terrain: [
		'hill', 'hills', 'pond', 'ponds', 'lake', 'lakes', 'path', 'paths', 'road',
		'roads', 'trail', 'trails', 'rock', 'rocks', 'stone', 'stones', 'boulder',
		'boulders', 'meadow', 'meadows', 'valley', 'valleys', 'mountain', 'mountains',
		'mound', 'mounds', 'stream', 'streams', 'river', 'rivers', 'dune', 'dunes',
		'cliff', 'cliffs', 'island', 'islands', 'beach', 'beaches', 'sand', 'well',
		'wells', 'spring', 'springs', 'plaza', 'plazas', 'courtyard', 'courtyards',
		'field', 'fields', 'clearing'
	]
});

const KIND_KEYWORDS = Object.freeze({
	buildings: Object.freeze({
		shul: ['shul', 'shuls', 'synagogue', 'synagogues', 'beis', 'kenis'],
		house: ['house', 'houses', 'home', 'homes', 'villa', 'villas', 'hut', 'huts', 'cabin', 'cabins', 'chalet'],
		shop: ['shop', 'shops', 'store', 'stores', 'market', 'markets', 'bakery', 'bakeries', 'kiosk', 'kiosks'],
		school: ['school', 'schools', 'yeshiva', 'yeshivas', 'library', 'libraries'],
		tower: ['tower', 'towers'],
		hall: ['hall', 'halls', 'hotel', 'barn', 'barns', 'apartment', 'apartments', 'building', 'buildings']
	}),
	nature: Object.freeze({
		tree: ['tree', 'trees', 'oak', 'oaks', 'pine', 'pines', 'cedar', 'cedars', 'willow', 'willows', 'palm', 'palms', 'sapling', 'saplings'],
		bush: ['bush', 'bushes', 'shrub', 'shrubs', 'hedge', 'hedges', 'fern', 'ferns'],
		flower: ['flower', 'flowers', 'tulip', 'tulips', 'rose', 'roses', 'sunflower', 'sunflowers', 'blossom', 'blossoms'],
		garden: ['garden', 'gardens', 'grass', 'park', 'parks', 'orchard', 'orchards', 'vineyard', 'vineyards', 'forest', 'forests', 'grove', 'groves', 'wheat']
	}),
	furniture: Object.freeze({
		table: ['table', 'tables', 'desk', 'desks'],
		chair: ['chair', 'chairs', 'stool', 'stools', 'sofa', 'couch'],
		bench: ['bench', 'benches'],
		menorah: ['menorah', 'menorahs', 'menora', 'chanukiah', 'candelabra', 'candlestick', 'candlesticks'],
		lamp: ['lamp', 'lamps', 'chandelier', 'chandeliers'],
		ark: ['ark', 'aron', 'arks'],
		bimah: ['bimah', 'bima', 'bimahs', 'podium', 'lectern', 'shtender', 'shtenders'],
		fence: ['fence', 'fences', 'gate', 'gates'],
		bridge: ['bridge', 'bridges', 'arch', 'arches'],
		shelf: ['shelf', 'shelves', 'bookshelf', 'bed', 'beds']
	}),
	terrain: Object.freeze({
		hill: ['hill', 'hills', 'mound', 'mounds', 'dune', 'dunes', 'mountain', 'mountains'],
		pond: ['pond', 'ponds', 'lake', 'lakes', 'well', 'wells', 'spring', 'springs'],
		path: ['path', 'paths', 'road', 'roads', 'trail', 'trails', 'plaza', 'plazas', 'courtyard', 'courtyards'],
		rock: ['rock', 'rocks', 'stone', 'stones', 'boulder', 'boulders', 'cliff', 'cliffs'],
		field: ['field', 'fields', 'meadow', 'meadows', 'valley', 'valleys', 'island', 'islands', 'beach', 'beaches', 'sand', 'clearing', 'stream', 'streams', 'river', 'rivers']
	})
});

const DEFAULT_KIND = Object.freeze({
	buildings: 'house',
	nature: 'tree',
	furniture: 'table',
	terrain: 'hill'
});

const DEFAULT_STYLE = Object.freeze({
	buildings: 'old-city',
	nature: 'meadow',
	furniture: 'meadow',
	terrain: 'meadow'
});

const WORD_NUMBERS = Object.freeze({
	a: 1, an: 1, one: 1, single: 1,
	two: 2, pair: 2, couple: 2,
	three: 3, few: 3,
	four: 4, several: 4,
	five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
	eleven: 11, twelve: 12, dozen: 12
});

const SIZE_WORDS = Object.freeze({
	large: ['tall', 'taller', 'tallest', 'high', 'higher', 'big', 'bigger', 'biggest', 'large', 'larger', 'largest', 'huge', 'giant', 'grand'],
	small: ['small', 'smaller', 'smallest', 'tiny', 'tinier', 'little', 'mini', 'low'],
	wide: ['wide', 'wider', 'widest', 'broad', 'long', 'longer', 'spacious']
});

const MAX_COUNT = 12;

/**
 * @param {string} word Lowercase token.
 * @returns {string[]} The word plus its likely singular form.
 */
function wordForms(word) {
	const forms = [word];
	if (word.length > 3) {
		if (word.endsWith('ies')) {
			forms.push(word.slice(0, -3) + 'y');
		} else if (word.endsWith('es')) {
			forms.push(word.slice(0, -2));
			forms.push(word.slice(0, -1));
		} else if (word.endsWith('s')) {
			forms.push(word.slice(0, -1));
		}
	}
	return forms;
}

/**
 * @param {string[]} words Lowercase tokens.
 * @param {string[]} keywords Keyword list to match.
 * @returns {number} Count of matched tokens (singular/plural aware).
 */
function countKeywordHits(words, keywords) {
	const set = new Set(keywords);
	let hits = 0;
	for (const word of words) {
		if (wordForms(word).some(form => set.has(form))) {
			hits += 1;
		}
	}
	return hits;
}

/**
 * @param {string[]} words Lowercase tokens.
 * @returns {string|null} First size word found in prompt order, or null.
 */
function readSizeWord(words) {
	for (const word of words) {
		for (const size of Object.keys(SIZE_WORDS)) {
			if (SIZE_WORDS[size].includes(word)) {
				return size;
			}
		}
	}
	return null;
}

/**
 * @param {string} prompt Raw prompt text.
 * @param {string[]} words Lowercase tokens.
 * @returns {string|null} Style identity or null when the prompt names none.
 */
function readStyleWord(prompt, words) {
	const lowered = ` ${prompt.toLowerCase()} `;
	if (lowered.includes('old city') || lowered.includes('old-city')) {
		return 'old-city';
	}
	const styleWords = {
		'old-city': ['ancient', 'yerushalayim', 'jerusalem'],
		modern: ['modern', 'contemporary', 'sleek', 'glass'],
		meadow: ['meadow', 'garden', 'country', 'rustic', 'wooden', 'pastoral']
	};
	for (const word of words) {
		for (const style of Object.keys(styleWords)) {
			if (styleWords[style].includes(word)) {
				return style;
			}
		}
	}
	return null;
}

/**
 * @param {string[]} words Lowercase tokens.
 * @returns {number} Parsed count clamped to 1..MAX_COUNT.
 */
function readCount(words) {
	let count = 1;
	for (const word of words) {
		if (/^\d+$/.test(word)) {
			count = Math.max(count, parseInt(word, 10));
		} else if (WORD_NUMBERS[word]) {
			count = Math.max(count, WORD_NUMBERS[word]);
		}
	}
	return Math.min(Math.max(count, 1), MAX_COUNT);
}

/**
 * @param {string} prompt Lowercase prompt text.
 * @returns {number|null} Explicit seed from the prompt, or null.
 */
function readSeed(prompt) {
	const match = prompt.match(/seed\s*[=:\s]\s*(-?\d+)/i);
	if (!match) {
		return null;
	}
	return Math.abs(parseInt(match[1], 10)) || 7;
}

/**
 * @param {string} text Arbitrary text.
 * @returns {number} Deterministic positive seed from the text.
 */
export function hashPromptSeed(text) {
	const lowered = String(text || '').toLowerCase();
	let hash = 5381;
	for (let i = 0; i < lowered.length; i += 1) {
		hash = ((hash << 5) + hash + lowered.charCodeAt(i)) | 0;
	}
	return (hash >>> 0) || 7;
}

/**
 * @param {string[]} words Lowercase tokens.
 * @param {string} category Winning category.
 * @returns {{kind:string, kindWord:string|null}} Best kind and the word that named it.
 */
function readKind(words, category) {
	const kinds = KIND_KEYWORDS[category] || {};
	let bestKind = DEFAULT_KIND[category];
	let bestHits = 0;
	let bestWord = null;
	for (const kind of Object.keys(kinds)) {
		const keywords = kinds[kind];
		const set = new Set(keywords);
		let hits = 0;
		let word = null;
		for (const candidate of words) {
			const form = wordForms(candidate).find(f => set.has(f));
			if (form) {
				hits += 1;
				word = word || candidate;
			}
		}
		if (hits > bestHits) {
			bestHits = hits;
			bestKind = kind;
			bestWord = word;
		}
	}
	return { kind: bestKind, kindWord: bestWord };
}

/**
 * Interprets a free-text build prompt into a deterministic Generate build spec.
 * Never throws on ordinary text; unparseable input resolves to an assumed house
 * with the assumption reported in `note` so the UI can say what was assumed.
 * @param {string} text Raw prompt text.
 * @returns {{category:string, kind:string, kindWord:string|null, count:number, size:string, style:string, seed:number, assumed:boolean, note:string, prompt:string}} Build spec.
 */
export function interpretGeneratePrompt(text) {
	const prompt = String(text || '');
	const words = prompt.toLowerCase().match(/[a-z]+|\d+/g) || [];

	const scores = { buildings: 0, nature: 0, furniture: 0, terrain: 0 };
	for (const word of words) {
		for (const category of GENERATE_CATEGORIES) {
			scores[category] += countKeywordHits([word], CATEGORY_KEYWORDS[category]);
		}
	}
	let category = 'buildings';
	let bestScore = 0;
	for (const candidate of GENERATE_CATEGORIES) {
		if (scores[candidate] > bestScore) {
			bestScore = scores[candidate];
			category = candidate;
		}
	}

	const count = readCount(words);
	const size = readSizeWord(words) || 'medium';
	const explicitStyle = readStyleWord(prompt, words);
	const explicitSeed = readSeed(prompt.toLowerCase());
	const seed = explicitSeed === null ? hashPromptSeed(prompt) : explicitSeed;

	if (bestScore === 0) {
		const trimmed = prompt.trim().slice(0, 60);
		const note = trimmed
			? `I did not recognize what to build in "${trimmed}", so I assumed a house. Try "3 oak trees" or "a shul with tall windows".`
			: 'The prompt was empty, so I assumed a house. Describe what to build, for example "a shul with tall windows".';
		return {
			category: 'buildings',
			kind: 'house',
			kindWord: null,
			count,
			size,
			style: explicitStyle || DEFAULT_STYLE.buildings,
			seed,
			assumed: true,
			note,
			prompt
		};
	}

	const { kind, kindWord } = readKind(words, category);
	return {
		category,
		kind,
		kindWord,
		count,
		size,
		style: explicitStyle || DEFAULT_STYLE[category],
		seed,
		assumed: false,
		note: '',
		prompt
	};
}
