// B"H
// Boruch Hashem
// Blessed is He

import { MeaningfulReadingObserver } from "./MeaningfulReadingObserver.js";
import { commentRelatedContext } from "./RelatedTorahContext.js";
import { RelatedTorahSearch } from "./RelatedTorahSearch.js";
import { RelatedTorahView } from "./RelatedTorahView.js";

/**
 * @file Gives one substantial English comment a one-shot related-Torah path only after meaningful dwell.
 * @description The Awtsmoos hears every voice before language is measured, while Awtsmoos.com keeps retrieval patient and light;
 * short reactions and passing comments remain silent, and only sustained English reading opens a bounded Torah-search sight.
 */

/** Attaches a lazy related-Torah region to one already-safe rendered comment card. */
export function startCommentReadingIntelligence(card, comment, visibleText) {
	const context = commentRelatedContext(comment, visibleText, window.post);
	if (!context) {
		return null;
	}
	const view = new RelatedTorahView(context);
	card.appendChild(view.root);
	const search = new RelatedTorahSearch();
	const observer = new MeaningfulReadingObserver(card, {
		dwellMs: 3000,
		threshold: 0.65,
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
