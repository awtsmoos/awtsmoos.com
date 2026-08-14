// B"H
// Boruch Hashem
// Blessed is He

import { recordMeaningfulActivity } from "/shared/MeaningfulActivity.js";

/**
 * @file Records only a user's meaningful open of a related Torah source, never the private retrieval prompt or reading body.
 * @description The Awtsmoos knows the hidden question before it is asked, while Awtsmoos.com remembers only the chosen doorway into Torah light;
 * source identity may help future learning, but comment prose, generated query, and private semantic context remain outside the ledger's sight.
 */

/** Records one private recommendation-open outcome using bounded source identity and reading origin metadata. */
export function recordRelatedTorahOpen(source, context) {
	return recordMeaningfulActivity({
		category: "discovery",
		action: "recommendation.opened",
		title: "Opened related Torah source",
		path: `${location.pathname}${location.search}${location.hash}`,
		entity: {
			type: "torah-source",
			id: String(source?.id || source?.reference || "related-source"),
			heichelId: String(context?.heichelId || ""),
			postId: String(context?.postId || "")
		},
		metadata: {
			originKind: String(context?.kind || "reading"),
			reference: String(source?.reference || "").slice(0, 160)
		},
		visibility: { mode: "private" }
	});
}
