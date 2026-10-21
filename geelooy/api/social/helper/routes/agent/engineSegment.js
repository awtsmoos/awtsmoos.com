//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateEngineSegment
 * @description
 * Sibling of AgentTranslateEngine: segmentation and glossary application, relocated verbatim.
 */

const { GLOSSARY, SEGMENT_SPLIT_RE, MAX_SEGMENTS, detectLang } = require('./engineData.js');

/**
 * Splits source text into bounded segments on sentence/verse boundaries.
 * Returns { segments, sourceLang } where each segment carries its char range.
 */
function segmentText(text) {
	const source = String(text || '');
	if (!source) return { segments: [], sourceLang: 'unknown' };
	const sourceLang = detectLang(source);
	const parts = source.split(SEGMENT_SPLIT_RE);
	const segments = [];
	let offset = 0;
	let buffer = '';
	let bufferStart = 0;
	function flush() {
		const trimmed = buffer.trim();
		if (trimmed) {
			segments.push({
				index: segments.length,
				text: trimmed,
				lang: detectLang(trimmed),
				charRange: [bufferStart + (buffer.length - buffer.trimStart().length), bufferStart + buffer.length - (buffer.length - buffer.trimEnd().length)]
			});
		}
		buffer = '';
	}
	for (const part of parts) {
		if (!part) continue;
		if (SEGMENT_SPLIT_RE.test(part) || part === '\n') {
			buffer += part;
			bufferStart = offset;
			flush();
		} else {
			if (!buffer) bufferStart = offset;
			buffer += part;
		}
		offset += part.length;
	}
	if (buffer.trim()) flush();
	return { segments: segments.slice(0, MAX_SEGMENTS), sourceLang, truncated: segments.length > MAX_SEGMENTS };
}

/**
 * Applies the bundled glossary to segments. Records every hit with its
 * position and produces scaffoldEn: the segment text with matched Hebrew
 * terms replaced by their prescribed English.
 */
function applyGlossary(segments, glossary = GLOSSARY) {
	const forms = [];
	for (const entry of glossary.entries || []) {
		for (const he of entry.he || []) {
			forms.push({ he, en: entry.en, id: entry.id, len: he.length });
		}
	}
	forms.sort((a, b) => b.len - a.len);
	return segments.map(seg => {
		const hits = [];
		const claimed = [];
		for (const form of forms) {
			let from = 0;
			for (;;) {
				const at = seg.text.indexOf(form.he, from);
				if (at < 0) break;
				const overlaps = claimed.some(([s, e]) => at < e && at + form.len > s);
				if (!overlaps) {
					hits.push({ term: form.id, he: form.he, en: form.en, start: at, end: at + form.len });
					claimed.push([at, at + form.len]);
				}
				from = at + form.len;
			}
		}
		hits.sort((a, b) => a.start - b.start);
		let scaffoldEn = seg.text;
		for (const hit of [...hits].sort((a, b) => b.start - a.start)) {
			scaffoldEn = scaffoldEn.slice(0, hit.start) + hit.en + scaffoldEn.slice(hit.end);
		}
		return { ...seg, glossaryHits: hits, scaffoldEn };
	});
}

module.exports = {
	segmentText,
	applyGlossary
};
