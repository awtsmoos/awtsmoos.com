// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module EntityPreviewCard
 * @description The Awtsmoos lets question, answer, comment, alias, Heichel, and series share one visual grammar without flattening them;
 * Awtsmoos.com renders type-aware context and only measured social consequence, with variants for compact or immersive space.
 */
import { createUniversalActionRail } from './UniversalActionRail.js';

function metric(document, label, value, lowerBound = false) {
	if (!Number(value)) return null;
	const span = document.createElement('span');
	span.textContent = `${label} ${Number(value)}${lowerBound ? '+' : ''}`;
	return span;
}

export function createEntityPreviewCard({ document = globalThis.document, model, variant = 'standard', handlers = {} }) {
	const article = document.createElement('article');
	article.className = `awtsmoosEntityPreview awtsmoosEntityPreview--${variant} awtsmoosEntityPreview--${model.type}`;
	article.dataset.socialEntityKey = model.key;
	const header = document.createElement('header');
	const kind = document.createElement('span');
	kind.className = 'awtsmoosEntityPreview__kind';
	kind.textContent = model.type;
	const title = document.createElement('h3');
	title.textContent = model.title;
	header.append(kind, title);
	const excerpt = document.createElement('p');
	excerpt.className = 'awtsmoosEntityPreview__excerpt';
	excerpt.textContent = model.excerpt || contextualExcerpt(model);
	const metrics = document.createElement('div');
	metrics.className = 'awtsmoosEntityPreview__metrics';
	const lower = Boolean(model.summary?.comments?.truncated);
	for (const item of [
		metric(document, 'Answers', model.metrics.answers),
		metric(document, 'Discuss', model.metrics.comments, lower),
		metric(document, 'Reactions', model.metrics.reactions),
		metric(document, 'References', model.metrics.references)
	].filter(Boolean)) metrics.append(item);
	article.append(header, excerpt, metrics);
	if (model.actions?.length) article.append(createUniversalActionRail({ document, model, handlers }));
	return article;
}

function contextualExcerpt(model) {
	if (model.type === 'question') return 'A question awaiting formal answers and discussion.';
	if (model.type === 'answer') return 'A formal answer in the shared conversation graph.';
	if (model.type === 'series') return 'A living sequence of related social content.';
	if (model.type === 'heichel') return 'A community and knowledge space.';
	return '';
}

export { contextualExcerpt, metric };
