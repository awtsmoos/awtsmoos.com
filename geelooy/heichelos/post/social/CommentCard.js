// B"H
// Boruch Hashem
// Blessed is He

import { handleReply } from "/heichelos/post/comments/actions/reply.js";
import { startCommentReadingIntelligence } from "../intelligence/CommentReadingIntelligence.js";
import { createCommentReactionBar } from "./CommentReactions.js";
import { createConnectRequestGroup } from "./CommentSocialActions.js";
import { commentAuthor, commentVisibleText } from "./CommentText.js";
import { cleanExcerpt } from "./textExcerpt.js";

/**
 * @file Renders one comment tree safely, then layers replies and reading intelligence around its text.
 * @description The Awtsmoos hears the comment before DOM or button, while Awtsmoos.com keeps every alias and body in text-safe light;
 * old visual hooks remain intact, private contact remains consent-first, and related Torah waits for dwell instead of firing on sight.
 */

const STYLE_ID = "awtsmoos-social-more-style";
const COMMENT_EXCERPT_CHARS = 420;

/** Creates one safe comment card and recursively reveals any already-authorized replies. */
export async function createCommentCard(comment, depth = 0) {
	ensureMoreStyle();
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
	const full = String(text || "").trim() || "Comment";
	const { display, truncated } = cleanExcerpt(full, COMMENT_EXCERPT_CHARS);
	if (!truncated) {
		body.textContent = full;
		return body;
	}
	body.append(document.createTextNode(`${display} `), readMoreToggle(body, full, display));
	return body;
}

function readMoreToggle(body, full, collapsed) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "awtsmoos-social-readmore";
	button.textContent = "Read more";
	button.setAttribute("aria-expanded", "false");
	button.addEventListener("click", () => {
		const expanded = button.getAttribute("aria-expanded") !== "true";
		button.setAttribute("aria-expanded", String(expanded));
		button.textContent = expanded ? "Show less" : "Read more";
		body.replaceChildren(document.createTextNode(`${expanded ? full : collapsed} `), button);
	});
	return button;
}

function commentActions(card, comment, author) {
	const actions = document.createElement("div");
	actions.className = "awtsmoos-social-actions awtsmoos-social-comment-actions";
	const reply = document.createElement("button");
	reply.type = "button";
	reply.className = "awtsmoos-social-reply awtsmoos-social-reply-primary";
	reply.textContent = "Reply";
	reply.addEventListener("click", () => handleReply(comment, card));
	actions.append(reply, moreMenu(comment, author));
	return actions;
}

/**
 * One quiet "···" menu holding reactions and consent-first connect requests, so the card
 * itself stays a clean thread: identity, prose, Reply. Reaction state loads lazily on
 * first open instead of firing one request per card on every page view.
 */
function moreMenu(comment, author) {
	const wrap = document.createElement("div");
	wrap.className = "awtsmoos-social-more";
	const details = document.createElement("details");
	details.className = "awtsmoos-social-more-menu";
	const summary = document.createElement("summary");
	summary.className = "awtsmoos-social-more-toggle";
	summary.setAttribute("aria-label", "More comment actions");
	summary.title = "More actions";
	const dots = document.createElement("span");
	dots.setAttribute("aria-hidden", "true");
	dots.textContent = "···";
	summary.appendChild(dots);
	const panel = document.createElement("div");
	panel.className = "awtsmoos-social-more-panel";
	panel.setAttribute("role", "menu");
	const reactionsSection = document.createElement("div");
	reactionsSection.className = "awtsmoos-social-more-section";
	const reactionsLabel = document.createElement("span");
	reactionsLabel.className = "awtsmoos-social-more-label";
	reactionsLabel.textContent = "Reactions";
	const reactionsSlot = document.createElement("div");
	reactionsSlot.className = "awtsmoos-social-more-reactions";
	reactionsSection.append(reactionsLabel, reactionsSlot);
	panel.appendChild(reactionsSection);
	const connectGroup = createConnectRequestGroup(author);
	if (connectGroup) {
		const connectSection = document.createElement("div");
		connectSection.className = "awtsmoos-social-more-section";
		const connectLabel = document.createElement("span");
		connectLabel.className = "awtsmoos-social-more-label";
		connectLabel.textContent = "Connect";
		connectSection.append(connectLabel, connectGroup);
		panel.appendChild(connectSection);
	}
	details.append(summary, panel);
	let reactionsBuilt = false;
	details.addEventListener("toggle", async () => {
		if (!details.open || reactionsBuilt) {
			return;
		}
		reactionsBuilt = true;
		try {
			reactionsSlot.appendChild(await createCommentReactionBar(comment.id));
		} catch {
			const note = document.createElement("span");
			note.className = "awtsmoos-social-more-note";
			note.textContent = "Reactions are unavailable right now.";
			reactionsSlot.appendChild(note);
		}
	});
	wrap.appendChild(details);
	return wrap;
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

function ensureMoreStyle() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = `
.awtsmoos-social-readmore {
	padding: 0;
	border: 0;
	background: none;
	color: var(--reader-gold, #b98a2e);
	font: inherit;
	font-weight: 700;
	text-decoration: underline;
	text-underline-offset: 2px;
	cursor: pointer;
}
.awtsmoos-social-readmore:hover { filter: brightness(1.1); }
.awtsmoos-social-readmore:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.awtsmoos-social-reply-primary {
	font-weight: 800;
}
.awtsmoos-social-more {
	position: relative;
	margin-inline-start: auto;
}
.awtsmoos-social-more-menu > summary {
	list-style: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-inline-size: 2.75rem;
	min-block-size: 2.75rem;
	padding: .5rem .8rem;
	border: 1px solid var(--sefer-rule, rgb(0 0 0 / 12%));
	border-radius: 999px;
	background: var(--sefer-card, #fffdf8);
	color: var(--sefer-ink, #2a2118);
	font-size: 1.15rem;
	line-height: 1;
	letter-spacing: .1em;
	cursor: pointer;
}
.awtsmoos-social-more-menu > summary::-webkit-details-marker { display: none; }
.awtsmoos-social-more-menu > summary::marker { content: ""; }
.awtsmoos-social-more-menu:not([open]) > .awtsmoos-social-more-panel { display: none; }
.awtsmoos-social-more-menu > summary:hover { border-color: var(--reader-gold, #b98a2e); }
.awtsmoos-social-more-menu > summary:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.awtsmoos-social-more-panel {
	position: absolute;
	inset-inline-end: 0;
	top: calc(100% + .4rem);
	z-index: 30;
	display: grid;
	gap: .7rem;
	min-inline-size: 13.5rem;
	max-inline-size: min(78vw, 19rem);
	padding: .8rem;
	border: 1px solid var(--sefer-rule, rgb(0 0 0 / 12%));
	border-radius: 1rem;
	background: var(--sefer-card, #fffdf8);
	color: var(--sefer-ink, #2a2118);
	box-shadow: 0 .6rem 1.6rem rgb(0 0 0 / 18%);
}
.awtsmoos-social-more-section {
	display: grid;
	gap: .45rem;
}
.awtsmoos-social-more-label {
	font-size: .68rem;
	font-weight: 800;
	letter-spacing: .09em;
	text-transform: uppercase;
	opacity: .6;
	color: var(--sefer-ink, #2a2118);
}
.awtsmoos-social-more-reactions .awtsmoos-social-reactions {
	display: flex;
	flex-wrap: wrap;
	gap: .4rem;
}
.awtsmoos-social-more-note {
	font-size: .82rem;
	opacity: .7;
}
.awtsmoos-social-more-connect .awtsmoos-comment-connect-actions {
	display: flex;
	flex-wrap: wrap;
	gap: .4rem;
}
.awtsmoos-social-more-connect .awtsmoos-comment-connect-actions button {
	min-block-size: 2.5rem;
	padding: .5rem .8rem;
	border: 1px solid var(--sefer-rule, rgb(0 0 0 / 12%));
	border-radius: 999px;
	background: transparent;
	color: var(--sefer-ink, #2a2118);
	font: inherit;
	font-size: .85rem;
	font-weight: 700;
	cursor: pointer;
}
.awtsmoos-social-more-connect .awtsmoos-comment-connect-actions button:hover {
	border-color: var(--reader-gold, #b98a2e);
}
.awtsmoos-social-more-connect .awtsmoos-comment-connect-actions button:focus-visible {
	outline: 2px solid currentColor; outline-offset: 2px;
}
.awtsmoos-social-more-connect .awtsmoos-comment-connect-status {
	display: block;
	margin-top: .35rem;
	font-size: .78rem;
	opacity: .7;
}`;
	document.head.appendChild(style);
}
