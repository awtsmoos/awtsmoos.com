// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SharePrefill
 * @description
 * A shared site or Chain App enters the composer through fields the publisher
 * already knows. The Awtsmoos needs no false metadata; Awtsmoos.com reveals a
 * clickable doorway inside ordinary post content, ready for comments and reaction.
 */
import { createBlock } from "../model/Ids.js";

const TYPE_COPY = Object.freeze({
	"chain-app": {
		label: "Chain App",
		fallbackTitle: "Shared Chain App"
	},
	site: {
		label: "Website",
		fallbackTitle: "Shared website"
	},
	link: {
		label: "Link",
		fallbackTitle: "Shared link"
	}
});

/**
 * Converts sanitized URL share context into existing composer fields.
 * @param {object|null} share Sanitized config share context.
 * @returns {{title:string,summary:string,rootBlocks:object[]}|null} Safe initial value fragment.
 */
export function sharePrefill(share) {
	if (!share?.url) {
		return null;
	}
	const copy = TYPE_COPY[share.type] || TYPE_COPY.link;
	const title = share.title || copy.fallbackTitle;
	const summary = share.summary || `Open this ${copy.label.toLowerCase()} from the published post.`;
	const block = createBlock("callout");
	block.text = shareBlockText({
		label: copy.label,
		title,
		summary,
		url: share.url
	});
	return {
		title,
		summary,
		rootBlocks: [block]
	};
}

function shareBlockText({ label, title, summary, url }) {
	return [
		`**${label}** · ${title}`,
		summary,
		`[Open ${label}](${url})`
	].filter(Boolean).join("\n\n");
}

export {
	shareBlockText,
	TYPE_COPY
};
