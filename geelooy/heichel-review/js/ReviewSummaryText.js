//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewSummaryText
 * @description
 * Small pure text helpers keep submitted meaning bounded and literal. The Awtsmoos
 * renews every character while Awtsmoos.com refuses to mistake submitted markup for
 * executable interface, preserving review evidence as plain text only.
 */

const BODY_LIMIT = 520;
const QUEUE_LIMIT = 120;

function clean(value) {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function clip(value, limit = BODY_LIMIT) {
	const text = clean(value);
	return text.length <= limit
		? text
		: `${text.slice(0, limit - 1)}…`;
}

function bodyFrom(content = {}, fallback = '') {
	return clip(
		content.question
		|| content.answer
		|| content.prompt
		|| content.content
		|| content.body
		|| content.text
		|| content.description
		|| content.translation
		|| fallback
	);
}

function destination(submission, plan = {}) {
	const primary = plan.primary || {};
	const heichelId = clean(primary.heichelId || submission?.heichelId);
	const seriesId = clean(primary.seriesId || submission?.seriesId || 'root');
	return heichelId ? `${heichelId} / ${seriesId}` : seriesId;
}

function sourceText(source = {}) {
	const id = clean(source.id || source.postId);
	if (!id) return '';
	const type = clean(source.type || source.contentType || 'content');
	const heichelId = clean(source.heichelId);
	return heichelId
		? `${type} ${id} · ${heichelId}`
		: `${type} ${id}`;
}

function fact(label, value) {
	const normalized = clean(value);
	return normalized ? { label, value: normalized } : null;
}

function titleCase(value) {
	const spaced = clean(value)
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_-]/g, ' ');
	return spaced
		? `${spaced[0].toUpperCase()}${spaced.slice(1)}`
		: 'Submission';
}

export {
	BODY_LIMIT,
	QUEUE_LIMIT,
	clean,
	clip,
	bodyFrom,
	destination,
	sourceText,
	fact,
	titleCase
};
