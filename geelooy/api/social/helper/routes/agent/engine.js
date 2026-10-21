//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngine
 * @description
 * Agent-first translation engine for Awtsmoos.com. It segments Hebrew/Aramaic
 * source text, applies the bundled prescribed glossary deterministically, and
 * produces machine-readable translation envelopes (segments, alignment,
 * glossary hits). The calling AI agent supplies the prose: either through a
 * configured engine relay (AWTSMOOS_TRANSLATE_ENGINE_URL) or by translating
 * scaffold segments itself and submitting via /agent/translate/submit.
 *
 * Nothing here touches existing behavior; it only reads $i.db for job and
 * idempotency persistence. No external libraries; node builtins only.
 */

const { GLOSSARY, CORPORA, MAX_TEXT_CHARS, MAX_SEGMENTS, MAX_BATCH_ITEMS, detectLang, sha256, randomId } = require('./engineData.js');
const { segmentText, applyGlossary } = require('./engineSegment.js');
const { translateText } = require('./engineTranslate.js');
const { checkRateLimit } = require('./engineRate.js');
const { createIdempotencyStore } = require('./engineIdempotency.js');
const { createJobStore, processJob } = require('./engineJobs.js');
const { createSubmissionStore } = require('./engineSubmissions.js');

module.exports = {
	GLOSSARY,
	CORPORA,
	MAX_TEXT_CHARS,
	MAX_SEGMENTS,
	MAX_BATCH_ITEMS,
	detectLang,
	segmentText,
	applyGlossary,
	translateText,
	checkRateLimit,
	createIdempotencyStore,
	createJobStore,
	processJob,
	createSubmissionStore,
	sha256,
	randomId
};
