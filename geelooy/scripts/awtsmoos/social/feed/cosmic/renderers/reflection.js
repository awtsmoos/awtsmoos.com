// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos speaks creation into the present tense. This Awtsmoos.com
 * renderer lets reflection, quotation, and canonical source remain distinct voices.
 */

import { appendChildren, createElement, createIcon } from "../dom.js";

function paragraphs(documentRef, text) {
	const fragment = documentRef.createDocumentFragment();
	for (const paragraphText of String(text || "").split(/\n{2,}/).filter(Boolean).slice(0, 4)) {
		fragment.append(createElement(documentRef, "p", "cosmic-body-paragraph", {
			text: paragraphText
		}));
	}
	return fragment;
}

function participantStack(documentRef, model) {
	if (!model.participants.length) {
		return null;
	}
	const wrap = createElement(documentRef, "div", "cosmic-participants");
	const stack = createElement(documentRef, "div", "cosmic-avatar-stack", {
		"aria-hidden": "true"
	});
	for (const person of model.participants) {
		const name = person?.name || person?.alias || String(person);
		stack.append(createElement(documentRef, "span", "cosmic-mini-avatar", {
			text: name.slice(0, 1).toUpperCase()
		}));
	}
	appendChildren(
		wrap,
		stack,
		createElement(documentRef, "span", "cosmic-participant-label", {
			text: `${model.participants.length} voices are unfolding this idea`
		})
	);
	return wrap;
}

/**
 * Renders a source reflection.
 * @param {Document} documentRef Active document.
 * @param {Record<string, unknown>} model Card model.
 * @returns {HTMLElement}
 */
export function renderReflection(documentRef, model) {
	const layout = createElement(documentRef, "div", "cosmic-reflection-layout");
	const body = createElement(documentRef, "div", "cosmic-primary-copy");
	appendChildren(body, paragraphs(documentRef, model.body || model.summary));
	const aside = createElement(documentRef, "aside", "cosmic-source-panels", {
		"aria-label": "Quotation and source"
	});
	if (model.quote) {
		const quote = createElement(documentRef, "blockquote", "cosmic-quote-panel");
		appendChildren(
			quote,
			createIcon(documentRef, "“"),
			createElement(documentRef, "p", "", { text: model.quote })
		);
		aside.append(quote);
	}
	if (model.citation) {
		const citation = model.citationHref ?
			createElement(documentRef, "a", "cosmic-citation-card", {
				href: model.citationHref
			}) :
			createElement(documentRef, "div", "cosmic-citation-card");
		appendChildren(
			citation,
			createIcon(documentRef, "▤"),
			createElement(documentRef, "span", "", { text: model.citation })
		);
		aside.append(citation);
	}
	if (!aside.childElementCount) {
		aside.append(createElement(documentRef, "div", "cosmic-source-note", {
			text: "Open the source path to explore its full context."
		}));
	}
	appendChildren(layout, body, aside);
	const wrapper = createElement(documentRef, "div", "cosmic-specialized-content");
	appendChildren(wrapper, layout, participantStack(documentRef, model));
	return wrapper;
}
