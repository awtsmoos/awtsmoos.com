// B"H
// Boruch Hashem
// Blessed is He
/**
 * A question is a vessel opened toward wisdom. The Awtsmoos sustains both
 * uncertainty and answer, while Awtsmoos.com never invents missing poll content.
 */
import { appendChildren, createElement, safeHref, toDomToken } from "../dom.js";

function principleTiles(documentRef, model) {
	const supplied = Array.isArray(model.raw?.principles) ? model.raw.principles : [];
	const labels = supplied.length ? supplied.slice(0, 4).map(String) :
		model.pollOptions.slice(0, 4).map((option) => option.label);
	if (!labels.length) {
		return null;
	}
	const grid = createElement(documentRef, "div", "cosmic-principle-grid", {
		"aria-label": "Question principles"
	});
	for (const label of labels) {
		grid.append(createElement(documentRef, "div", "cosmic-principle-tile", { text: label }));
	}
	return grid;
}

function poll(documentRef, model) {
	if (!model.pollOptions.length) {
		return null;
	}
	const fieldset = createElement(documentRef, "fieldset", "cosmic-poll", {
		dataset: { cosmicPoll: model.id }
	});
	fieldset.append(createElement(documentRef, "legend", "cosmic-poll-question", {
		text: model.raw?.poll?.question || model.title
	}));
	for (const option of model.pollOptions) {
		const label = createElement(documentRef, "label", "cosmic-poll-option");
		const input = createElement(documentRef, "input", "cosmic-poll-input", {
			type: "radio", name: `poll-${toDomToken(model.id)}`, value: option.id,
			dataset: { pollChoice: option.id }
		});
		const copy = createElement(documentRef, "span", "cosmic-poll-copy");
		const track = createElement(documentRef, "span", "cosmic-poll-track", {
			"aria-hidden": "true"
		});
		const fill = createElement(documentRef, "span", "cosmic-poll-fill");
		fill.style.setProperty("--poll-value", `${Math.max(0, Math.min(100, option.percent))}%`);
		track.append(fill);
		appendChildren(copy,
			createElement(documentRef, "span", "cosmic-poll-label", { text: option.label }),
			track,
			createElement(documentRef, "span", "cosmic-poll-percent", { text: `${option.percent}%` })
		);
		appendChildren(label, input, copy);
		fieldset.append(label);
	}
	fieldset.append(createElement(documentRef, "p", "cosmic-poll-status", {
		dataset: { pollStatus: model.id }, "aria-live": "polite",
		text: model.participantCount ? `${model.participantCount.toLocaleString()} participants` :
			"Choose an option; submission continues in the discussion."
	}));
	return fieldset;
}

function responsePreview(documentRef, response) {
	const href = response?.href || response?.url;
	const element = createElement(documentRef, href ? "a" : "article", "cosmic-expert-response",
		href ? { href: safeHref(href) } : {});
	appendChildren(element,
		createElement(documentRef, "strong", "", {
			text: response?.author || response?.name || "Response"
		}),
		createElement(documentRef, "span", "", {
			text: response?.summary || response?.text || String(response || "")
		})
	);
	return element;
}

function responses(documentRef, model) {
	if (!model.responses.length) {
		return null;
	}
	const list = createElement(documentRef, "div", "cosmic-expert-responses", {
		"aria-label": "Expert response previews"
	});
	for (const response of model.responses) {
		list.append(responsePreview(documentRef, response));
	}
	return list;
}

/** Renders a community question with a real fieldset. */
export function renderQuestion(documentRef, model) {
	const root = createElement(documentRef, "section", "cosmic-question");
	appendChildren(root, principleTiles(documentRef, model),
		model.body ? createElement(documentRef, "p", "cosmic-question-body", { text: model.body }) : null,
		poll(documentRef, model), responses(documentRef, model));
	return root;
}
