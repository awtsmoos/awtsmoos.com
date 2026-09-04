// B"H
// Boruch Hashem
// Blessed is He

import { MeaningfulReadingObserver } from "./MeaningfulReadingObserver.js";
import { postRelatedContext } from "./RelatedTorahContext.js?v=related-torah-002";
import { RelatedTorahSearch } from "./RelatedTorahSearch.js";
import { RelatedTorahView } from "./RelatedTorahView.js";

/**
 * @file Coordinates one post-level related-Torah revelation after sustained reading without delaying the canonical reader.
 * @description The Awtsmoos shines before every article is read, while Awtsmoos.com waits for genuine dwell before asking Torah search for light;
 * one bounded 500-character private prompt becomes one retrieval, then a quiet module appears before community discussion without changing public speech in sight.
 */

/** Starts a one-shot related-Torah observer for the already-rendered canonical post. */
export function startPostReadingIntelligence(viewport, post = window.post) {
	const target = readingTarget(viewport);
	const context = postRelatedContext(post, target?.textContent || viewport?.textContent || "");
	if (!target || !context) {
		return null;
	}
	const view = new RelatedTorahView(context);
	placeView(viewport, view.root);
	const search = new RelatedTorahSearch();
	const observer = new MeaningfulReadingObserver(target, {
		dwellMs: 5000,
		threshold: 0.55,
		onMeaningful: async () => {
			view.loading();
			try {
				view.render(await search.search(context));
			} catch (error) {
				view.error(error?.message);
			}
		}
	});
	observer.start();
	return observer;
}

function readingTarget(viewport) {
	if (!viewport) {
		return null;
	}
	const selectors = ["article", ".post-content", ".main-post", ".content"];
	for (const selector of selectors) {
		const candidate = viewport.querySelector(selector);
		if (candidate && candidate.textContent.trim().length >= 180) {
			return candidate;
		}
	}
	return [...viewport.children].find((child) => {
		return child.id !== "awtsmoos-social-discussion" && child.textContent.trim().length >= 180;
	}) || viewport;
}

function placeView(viewport, root) {
	const discussion = viewport.querySelector("#awtsmoos-social-discussion");
	if (discussion) {
		viewport.insertBefore(root, discussion);
		return;
	}
	viewport.appendChild(root);
}
