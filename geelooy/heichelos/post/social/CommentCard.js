// B"H
// Boruch Hashem
// Blessed is He

import { handleReply } from "/heichelos/post/comments/actions/reply.js";
import { startCommentReadingIntelligence } from "../intelligence/CommentReadingIntelligence.js";
import { createCommentReactionBar } from "./CommentReactions.js";
import { createCommentSocialActions } from "./CommentSocialActions.js";
import { commentAuthor, commentVisibleText } from "./CommentText.js";

/**
 * @file Renders one comment tree safely, then layers reactions, consent requests, replies, and reading intelligence around its text.
 * @description The Awtsmoos hears the comment before DOM or button, while Awtsmoos.com keeps every alias and body in text-safe light;
 * old visual hooks remain intact, private contact remains consent-first, and related Torah waits for dwell instead of firing on sight.
 */

/** Creates one safe comment card and recursively reveals any already-authorized replies. */
export async function createCommentCard(comment, depth = 0) {
	const card = document.createElement("article");
	card.className = "awtsmoos-social-comment";
	card.id = `social-comment-${String(comment?.id || "unknown")}`;
	card.style.setProperty("--reply-depth", String(Math.min(depth, 4)));
	const author = commentAuthor(comment);
	const visibleText = commentVisibleText(comment);
	card.append(
		commentHeader(author, comment?.createdAt),
		commentBody(visibleText),
		await commentActions(card, comment, author)
	);
	startCommentReadingIntelligence(card, comment, visibleText);
	await appendReplies(card, comment?.replies, depth);
	return card;
}

function commentHeader(author, createdAt) {
	const header = document.createElement("header");
	const avatar = document.createElement("span");
	avatar.className = "awtsmoos-social-avatar";
	avatar.textContent = author.slice(0, 1).toUpperCase() || "A";
	const identity = document.createElement("div");
	const alias = document.createElement("strong");
	alias.textContent = `@${author}`;
	const time = document.createElement("small");
	time.textContent = formatDate(createdAt);
	identity.append(alias, time);
	header.append(avatar, identity);
	return header;
}

function commentBody(text) {
	const body = document.createElement("p");
	body.className = "awtsmoos-social-comment-body";
	body.textContent = text || "Comment";
	return body;
}

async function commentActions(card, comment, author) {
	const actions = document.createElement("div");
	actions.className = "awtsmoos-social-actions awtsmoos-social-comment-actions";
	actions.appendChild(await createCommentReactionBar(comment.id));
	const reply = document.createElement("button");
	reply.type = "button";
	reply.className = "awtsmoos-social-reply";
	reply.textContent = "Reply";
	reply.addEventListener("click", () => handleReply(comment, card));
	actions.appendChild(reply);
	const connect = createCommentSocialActions(author);
	if (connect) {
		actions.appendChild(connect);
	}
	return actions;
}

async function appendReplies(card, replies, depth) {
	for (const reply of Array.isArray(replies) ? replies : []) {
		card.appendChild(await createCommentCard(reply, depth + 1));
	}
}

function formatDate(value) {
	const date = new Date(value || Date.now());
	return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString();
}
