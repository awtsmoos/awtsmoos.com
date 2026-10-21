//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineData
 * @description
 * Sibling of AgentTranslateEngine: bundled data, limits and base helpers, relocated verbatim.
 */

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const GLOSSARY = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary.json'), 'utf8'));
const CORPORA = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpora.json'), 'utf8'));

const HEBREW_RE = /[\u0590-\u05FF]/;
const ARAMAIC_RE = /[\u0600-\u06FF]/;
const SEGMENT_SPLIT_RE = /([׃.!?;\n]+)/u;

const MAX_TEXT_CHARS = 50000;
const MAX_SEGMENTS = 200;
const MAX_BATCH_ITEMS = 50;
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function sha256(text) {
	return crypto.createHash('sha256').update(String(text), 'utf8').digest('hex');
}

function randomId(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
}

/** Detects the dominant script of a text: he, ar, or mixed. */
function detectLang(text) {
	const hebrew = HEBREW_RE.test(text);
	const arabic = ARAMAIC_RE.test(text);
	if (hebrew && arabic) return 'mixed';
	if (arabic) return 'ar';
	if (hebrew) return 'he';
	return 'unknown';
}

module.exports = {
	GLOSSARY,
	CORPORA,
	HEBREW_RE,
	ARAMAIC_RE,
	SEGMENT_SPLIT_RE,
	MAX_TEXT_CHARS,
	MAX_SEGMENTS,
	MAX_BATCH_ITEMS,
	IDEMPOTENCY_TTL_MS,
	sha256,
	randomId,
	detectLang
};
