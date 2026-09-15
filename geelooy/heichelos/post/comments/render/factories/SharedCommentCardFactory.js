//B"H
//Boruch Hashem
//Blessed be He

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { isSourceAnnotation, sourceDescriptor, sourceAnnotation } from "../../logic/TorahAnnotationIdentity.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { getCommentPlacementKind } from "../../logic/inlineManifest/realCommentCoordinate.js";
import { populateCommentElement } from "../corePopulation.js";
import { commentActionDock, commentMoreMenu } from "./CommentCardActions.js";
import { commentCoordinate } from "./CommentCoordinate.js";
import { commentIdentityHeader, communityAlias } from "./CommentCardIdentity.js";

/**
 * @module SharedCommentCardFactory
 * @description The Awtsmoos gives Torah sources a bibliographic vessel and community words a social vessel.
 * Awtsmoos.com keeps the sacred text visually primary while source cards remain calm, readable, and useful.
 */
const NOISY_TITLES = /^(insight|inline insight\s*\d*|inline commentary|commentary)$/i;

function rawTitle(comment) {
	return comment?.dayuh?.title || comment?.content?.title || comment?.title || "";
}

function titleBand(comment) {
	const title = String(rawTitle(comment) || "").trim();
	if (!title || NOISY_TITLES.test(title)) return null;
	return {
		tag: "div",
		attr: { class: "awtsmoos-comment-title-band", dir: "auto" },
		children: [title]
	};
}

function inlineSourceHeader(comment) {
	const source = sourceAnnotation(comment);
	return {
		tag: "header",
		attr: { class: "awtsmoos-comment-card-header awtsmoos-inline-source-header" },
		children: [
			{
				tag: "div",
				attr: { class: "awtsmoos-inline-source-identity" },
				children: [
					{ tag: "strong", attr: { class: "awtsmoos-source-name" }, children: [source.name] },
					{ tag: "span", attr: { class: "awtsmoos-source-descriptor" }, children: [sourceDescriptor(comment)] },
					{ tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [commentCoordinate(comment)] }
				]
			},
			commentMoreMenu(comment, "inline")
		]
	};
}

function inlineCommunityHeader(comment) {
	return {
		tag: "header",
		attr: { class: "awtsmoos-comment-card-header awtsmoos-inline-card-header" },
		children: [
			{ tag: "span", attr: { class: "awtsmoos-comment-coordinate" }, children: [commentCoordinate(comment)] },
			commentMoreMenu(comment, "inline")
		]
	};
}

function cardHeader(comment, mode) {
	if (mode !== "inline") return commentIdentityHeader(comment);
	return isSourceAnnotation(comment)
		? inlineSourceHeader(comment)
		: inlineCommunityHeader(comment);
}

/** Builds one source-aware sidebar or inline card without changing the comment body renderer. */
export function makeSharedCommentCard(comment, { mode = "sidebar" } = {}) {
	if (!comment) return document.createComment("No comment");
	const source = isSourceAnnotation(comment);
	const alias = communityAlias(comment);
	const kind = getCommentPlacementKind(comment);
	const modeClass = mode === "inline"
		? "inline-comment awtsmoos-inline-commentary-root awtsmoos-inline-card-v3 awtsmoos-readable-inline-card"
		: "awtsmoos-sidebar-comment-card";
	const classes = [
		"comment-content",
		"awtsmoos-card",
		"awtsmoos-shared-comment-card",
		modeClass,
		source ? "awtsmoos-source-annotation-card" : "awtsmoos-community-discussion-card",
		kind === "summary" ? "awtsmoos-summary-comment" : "",
		isAliasInline(alias) ? "is-inline-enabled" : ""
	].filter(Boolean).join(" ");
	const card = BlueprintManifestor.manifest({
		tag: "article",
		attr: {
			class: classes,
			"data-cid": comment.id,
			"data-alias": alias,
			"data-from-alias": alias,
			"data-torah-source": source ? "true" : "false",
			"data-source-id": source ? sourceAnnotation(comment)?.sourceId || "" : "",
			"data-comment-kind": kind,
			id: `comment-${comment.id}`,
			dir: "auto"
		},
		children: [
			cardHeader(comment, mode),
			titleBand(comment),
			{ tag: "div", attr: { class: "comment-text-root awtsmoos-comment-body", dir: "auto" } },
			mode === "sidebar" ? commentActionDock(comment) : null,
			mode === "sidebar" ? commentMoreMenu(comment, mode) : null
		]
	});
	populateCommentElement(comment, card.querySelector(".comment-text-root"));
	return card;
}
