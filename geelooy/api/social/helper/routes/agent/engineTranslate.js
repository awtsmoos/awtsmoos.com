//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineTranslate
 * @description
 * Sibling of AgentTranslateEngine: the translation pipeline, relocated verbatim.
 */

const { GLOSSARY, MAX_TEXT_CHARS } = require('./engineData.js');
const { segmentText, applyGlossary } = require('./engineSegment.js');

/**
 * Runs the translation pipeline for one text. Mode "engine" requires
 * AWTSMOOS_TRANSLATE_ENGINE_URL; otherwise scaffold mode applies the
 * glossary and returns segments for the calling agent to translate.
 */
async function translateText(text, { mode = 'scaffold', targetLang = 'en', fetchImpl = globalThis.fetch } = {}) {
	if (typeof text !== 'string' || !text.trim()) {
		return { error: { code: 'EMPTY_TEXT', message: 'text is required.' } };
	}
	if (text.length > MAX_TEXT_CHARS) {
		return { error: { code: 'TEXT_TOO_LARGE', message: `text exceeds ${MAX_TEXT_CHARS} characters.` } };
	}
	const { segments, sourceLang, truncated } = segmentText(text);
	const glossed = applyGlossary(segments);
	if (mode === 'engine') {
		const engineUrl = process.env.AWTSMOOS_TRANSLATE_ENGINE_URL;
		if (!engineUrl) {
			return { error: { code: 'NO_ENGINE', message: 'AWTSMOOS_TRANSLATE_ENGINE_URL is unset; use mode "scaffold".' } };
		}
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 120000);
		try {
			const response = await fetchImpl(engineUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: controller.signal,
				body: JSON.stringify({ segments: glossed.map(s => ({ index: s.index, text: s.text })), sourceLang, targetLang, glossary: GLOSSARY.version })
			});
			const body = await response.json().catch(() => null);
			if (!response.ok || !body || !Array.isArray(body.translations)) {
				return { error: { code: 'ENGINE_FAILED', message: 'Translation engine returned an unusable response.' } };
			}
			const byIndex = new Map(body.translations.map(t => [t.index, String(t.text || '')]));
			const out = glossed.map(s => ({ ...s, translation: byIndex.has(s.index) ? byIndex.get(s.index) : null }));
			return { ok: { engine: 'engine', sourceLang, targetLang, truncated, segments: out, alignment: out.map(s => ({ sourceIndex: s.index, targetIndex: s.translation == null ? null : s.index })) } };
		} catch (e) {
			return { error: { code: 'ENGINE_ERROR', message: String((e && e.message) || e) } };
		} finally {
			clearTimeout(timer);
		}
	}
	const out = glossed.map(s => ({ ...s, translation: null }));
	return {
		ok: {
			engine: 'scaffold',
			sourceLang,
			targetLang,
			truncated,
			segments: out,
			alignment: out.map(s => ({ sourceIndex: s.index, targetIndex: null })),
			note: 'Scaffold mode: glossary applied, prose translation left to the calling agent. POST the finished translation to /agent/translate/submit.'
		}
	};
}

module.exports = { translateText };
