// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InlineDiscussion
 * @description
 * The Awtsmoos gathers comments, replies, and reactions beneath the teaching;
 * Awtsmoos.com lets every owned alias answer without leaving the reading.
 */
import { handleReply } from '../comments/actions/reply.js';

const EMOJIS = ['❤️', '🔥', '✨', '🤯', '🙏'];

function apiRoot() {
	return `/api/social/heichelos/${encodeURIComponent(window.post.heichel.id)}/posts/${encodeURIComponent(window.post.id)}`;
}

function cleanText(comment) {
	return String(comment?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function authorOf(comment) {
	return comment?.author || comment?.aliasId || 'anonymous';
}

async function reactionState(commentId) {
	const response = await fetch(`${apiRoot()}/comments/${encodeURIComponent(commentId)}/reactions`);
	const data = await response.json();
	return data?.success || { counts: {} };
}

async function react(commentId, emoji) {
	const aliasId = window.curAlias || localStorage.getItem('lastAliasUsed') || '';
	if (!aliasId) throw new Error('Choose an alias before reacting.');
	const response = await fetch(`${apiRoot()}/comments/${encodeURIComponent(commentId)}/reactions`, {
		method: 'POST',
		body: new URLSearchParams({ aliasId, emoji })
	});
	const data = await response.json();
	if (!data?.success) throw new Error(data?.error?.message || 'Reaction failed.');
	return data.success;
}

async function makeReactionBar(comment) {
	const bar = document.createElement('div');
	bar.className = 'awtsmoos-social-reactions';
	let state = await reactionState(comment.id);
	const paint = () => {
		bar.innerHTML = '';
		for (const emoji of EMOJIS) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'awtsmoos-reaction-chip';
			button.textContent = `${emoji} ${state.counts?.[emoji] || ''}`.trim();
			button.onclick = async () => {
				state = await react(comment.id, emoji);
				paint();
			};
			bar.appendChild(button);
		}
	};
	paint();
	return bar;
}

async function makeCard(comment, depth = 0) {
	const card = document.createElement('article');
	card.className = 'awtsmoos-social-comment';
	card.style.setProperty('--reply-depth', String(Math.min(depth, 4)));
	const alias = authorOf(comment);
	const header = document.createElement('header');
	header.innerHTML = `<span class="awtsmoos-social-avatar">${alias.slice(0, 1).toUpperCase()}</span><div><strong>@${alias}</strong><small>${new Date(comment.createdAt || Date.now()).toLocaleDateString()}</small></div>`;
	const body = document.createElement('p');
	body.textContent = cleanText(comment);
	const actions = document.createElement('div');
	actions.className = 'awtsmoos-social-actions';
	const reply = document.createElement('button');
	reply.type = 'button';
	reply.className = 'awtsmoos-social-reply';
	reply.textContent = 'Reply';
	reply.onclick = () => handleReply(comment, card);
	actions.append(await makeReactionBar(comment), reply);
	card.append(header, body, actions);
	for (const child of comment.replies || []) card.appendChild(await makeCard(child, depth + 1));
	return card;
}

export async function mountDiscussion(viewport) {
	document.getElementById('awtsmoos-social-discussion')?.remove();
	const section = document.createElement('section');
	section.id = 'awtsmoos-social-discussion';
	section.className = 'awtsmoos-social-discussion';
	section.innerHTML = '<header><span>Community</span><h2>Continue the conversation</h2><p>Insights, questions, replies, and reactions from the Awtsmoos community.</p></header><div class="awtsmoos-social-thread"></div>';
	viewport.appendChild(section);
	const response = await fetch(`${apiRoot()}/comment-tree`);
	const data = await response.json();
	const comments = Array.isArray(data?.success) ? data.success : [];
	const thread = section.querySelector('.awtsmoos-social-thread');
	if (!comments.length) thread.innerHTML = '<p class="awtsmoos-social-empty">Be the first to open a new line of thought.</p>';
	for (const comment of comments) thread.appendChild(await makeCard(comment));
	return section;
}
