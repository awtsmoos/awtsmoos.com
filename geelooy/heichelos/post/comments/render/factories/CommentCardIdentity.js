//B"H
//Boruch Hashem
//Blessed be He

import {
	isSourceAnnotation,
	sourceAnnotation,
	sourceDescriptor
} from "../../logic/TorahAnnotationIdentity.js";
import { commentCoordinate } from "./CommentCoordinate.js";

/**
 * @module CommentCardIdentity
 * @description The Awtsmoos gives each Torah source a name, not a social mask.
 * Awtsmoos.com renders community identity socially and canonical identity bibliographically.
 */
function communityAlias(comment = {}) {
	return comment?.author || comment?.aliasId || comment?.owner || "community";
}

function communityHeader(comment) {
	const alias = communityAlias(comment);
	return {
		tag: "header",
		attr: { class: "awtsmoos-comment-card-header awtsmoos-community-comment-header" },
		children: [
			{
				tag: "div",
				attr: { class: "awtsmoos-comment-avatar" },
				children: [String(alias).charAt(0).toUpperCase()]
			},
			{
				tag: "div",
				attr: { class: "awtsmoos-comment-heading" },
				children: [
					{
						tag: "a",
						attr: {
							class: "comment-author-link awtsmoos-author-crown",
							href: `/@${encodeURIComponent(alias)}`,
							title: `Open @${alias}`
						},
						children: [`@${alias}`]
					},
					{
						tag: "span",
						attr: { class: "awtsmoos-comment-coordinate" },
						children: [commentCoordinate(comment)]
					}
				]
			}
		]
	};
}

function sourceHeader(comment) {
	const source = sourceAnnotation(comment);
	return {
		tag: "header",
		attr: { class: "awtsmoos-comment-card-header awtsmoos-source-annotation-header" },
		children: [
			{
				tag: "div",
				attr: { class: "awtsmoos-source-seal", "aria-hidden": "true" },
				children: [source.name.charAt(0)]
			},
			{
				tag: "div",
				attr: { class: "awtsmoos-source-heading" },
				children: [
					{ tag: "strong", attr: { class: "awtsmoos-source-name" }, children: [source.name] },
					{ tag: "span", attr: { class: "awtsmoos-source-descriptor" }, children: [sourceDescriptor(comment)] },
					{ tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [commentCoordinate(comment)] }
				]
			}
		]
	};
}

/** Returns a semantic source or community identity header for a shared card. */
export function commentIdentityHeader(comment) {
	return isSourceAnnotation(comment) ? sourceHeader(comment) : communityHeader(comment);
}

export { communityAlias };
