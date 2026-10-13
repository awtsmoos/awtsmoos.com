// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module QaAnswers
 * @description
 * Quora-style answers for question posts: ranked answer list, upvote/downvote,
 * best-answer badge, and an inline answer composer.
 */
import { createElement, createButton } from '../card/domFactory.js';

/**
 * Fetches answers for a question from the Q&A API.
 * @param {string} questionId
 * @param {string} heichelId
 * @returns {Promise<object>} { answers, bestAnswerId }
 */
export async function fetchAnswers(questionId, heichelId = 'chassidus') {
	try {
		const res = await fetch(`/api/social/qa/question/${encodeURIComponent(questionId)}?heichelId=${encodeURIComponent(heichelId)}`);
		if (!res.ok) return { answers: [], bestAnswerId: null };
		const data = await res.json();
		const payload = data.success || data;
		return {
			answers: Array.isArray(payload.answers) ? payload.answers : [],
			bestAnswerId: payload.bestAnswerId || payload.question?.bestAnswerId || null
		};
	} catch {
		return { answers: [], bestAnswerId: null };
	}
}

/**
 * Casts a vote on an answer via the reactions API.
 */
async function voteOnAnswer(answerId, heichelId, direction) {
	try {
		await fetch(`/api/social/reactions/${direction === 'up' ? 'upvote' : 'downvote'}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'answer', id: answerId, heichelId, direction })
		});
	} catch { /* vote failed silently */ }
}

/**
 * Marks an answer as the best answer.
 */
async function markBestAnswer(questionId, answerId, heichelId) {
	try {
		const res = await fetch(`/api/social/qa/question/${encodeURIComponent(questionId)}/best`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ answerId, heichelId })
		});
		return res.ok;
	} catch {
		return false;
	}
}

/**
 * Submits a new answer.
 */
async function submitAnswer(questionId, heichelId, text) {
	try {
		const res = await fetch(`/api/social/qa/question/${encodeURIComponent(questionId)}/answer`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: text, title: text.slice(0, 80), heichelId })
		});
		return res.ok;
	} catch {
		return false;
	}
}

function voteCount(answer) {
	return Number(answer.upvotes || answer.votes || 0);
}

function renderAnswerCard(answer, { questionId, heichelId, bestAnswerId, isAsker, onRefresh }) {
	const card = createElement('article', 'qa-answer-card' + (answer.id === bestAnswerId ? ' qa-best-answer' : ''), {
		'data-answer-id': answer.id || ''
	});

	// Vote column
	const votes = createElement('div', 'qa-vote-column');
	const upBtn = createButton('▲', 'qa-vote-btn qa-upvote');
	upBtn.setAttribute('aria-label', 'Upvote this answer');
	const count = createElement('span', 'qa-vote-count', {}, String(voteCount(answer)));
	const downBtn = createButton('▼', 'qa-vote-btn qa-downvote');
	downBtn.setAttribute('aria-label', 'Downvote this answer');

	upBtn.addEventListener('click', async () => {
		upBtn.disabled = true;
		await voteOnAnswer(answer.id, heichelId, 'up');
		count.textContent = String(voteCount(answer) + 1);
	});
	downBtn.addEventListener('click', async () => {
		downBtn.disabled = true;
		await voteOnAnswer(answer.id, heichelId, 'down');
		count.textContent = String(voteCount(answer) - 1);
	});
	votes.append(upBtn, count, downBtn);

	// Body
	const body = createElement('div', 'qa-answer-body');
	if (answer.id === bestAnswerId) {
		body.append(createElement('span', 'qa-best-badge', {}, '★ Best Answer'));
	}
	const author = createElement('div', 'qa-answer-author', {}, answer.aliasId || answer.author || 'Anonymous');
	const text = createElement('p', 'qa-answer-text', {}, answer.content || answer.body || answer.text || '');
	body.append(author, text);

	// Best-answer action (asker only)
	if (isAsker && answer.id !== bestAnswerId) {
		const bestBtn = createButton('Mark as best answer', 'qa-best-btn');
		bestBtn.addEventListener('click', async () => {
			bestBtn.disabled = true;
			bestBtn.textContent = 'Marking…';
			const ok = await markBestAnswer(questionId, answer.id, heichelId);
			if (ok && onRefresh) onRefresh();
			else { bestBtn.disabled = false; bestBtn.textContent = 'Mark as best answer'; }
		});
		body.append(bestBtn);
	}

	card.append(votes, body);
	return card;
}

function renderAnswerComposer(questionId, heichelId, onRefresh) {
	const form = createElement('form', 'qa-answer-form');
	const label = createElement('label', 'qa-answer-label', { for: `qa-answer-${questionId}` }, 'Your answer');
	const textarea = createElement('textarea', 'qa-answer-input', {
		id: `qa-answer-${questionId}`,
		placeholder: 'Share your wisdom…',
		rows: '3',
		required: ''
	});
	const submit = createButton('Post Answer', 'qa-answer-submit');
	const status = createElement('p', 'qa-answer-status', { 'aria-live': 'polite' });

	form.append(label, textarea, submit, status);
	form.addEventListener('submit', async event => {
		event.preventDefault();
		const text = textarea.value.trim();
		if (!text) return;
		submit.disabled = true;
		status.textContent = 'Posting…';
		const ok = await submitAnswer(questionId, heichelId, text);
		if (ok) {
			textarea.value = '';
			status.textContent = 'Answer posted!';
			if (onRefresh) onRefresh();
		} else {
			status.textContent = 'Could not post. Try again.';
		}
		submit.disabled = false;
	});
	return form;
}

/**
 * Renders the full Q&A answer section for a question post.
 * @param {object} options - { questionId, heichelId, askerAliasId, currentAliasId }
 * @returns {HTMLElement} The answer section.
 */
export function renderQaAnswerSection({ questionId, heichelId = 'chassidus', askerAliasId = '', currentAliasId = '' }) {
	const section = createElement('section', 'qa-answer-section', {
		'data-question-id': questionId,
		'aria-label': 'Answers'
	});
	const heading = createElement('h3', 'qa-answers-heading', {}, 'Answers');
	const list = createElement('div', 'qa-answers-list');
	const loading = createElement('p', 'qa-answers-loading', {}, 'Loading answers…');
	list.append(loading);
	section.append(heading, list);

	const isAsker = Boolean(currentAliasId && askerAliasId && currentAliasId === askerAliasId);

	async function refresh() {
		list.innerHTML = '';
		list.append(createElement('p', 'qa-answers-loading', {}, 'Loading answers…'));
		const { answers, bestAnswerId } = await fetchAnswers(questionId, heichelId);
		list.innerHTML = '';
		// Best answer first
		const sorted = [...answers].sort((a, b) => {
			if (a.id === bestAnswerId) return -1;
			if (b.id === bestAnswerId) return 1;
			return voteCount(b) - voteCount(a);
		});
		if (!sorted.length) {
			list.append(createElement('p', 'qa-no-answers', {}, 'No answers yet. Be the first to share wisdom!'));
		}
		for (const answer of sorted) {
			list.append(renderAnswerCard(answer, { questionId, heichelId, bestAnswerId, isAsker, onRefresh: refresh }));
		}
		heading.textContent = `Answers (${sorted.length})`;
	}

	section.append(renderAnswerComposer(questionId, heichelId, refresh));
	// Load answers when the section scrolls into view
	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(entries => {
			if (entries.some(e => e.isIntersecting)) {
				observer.disconnect();
				refresh();
			}
		}, { rootMargin: '200px' });
		observer.observe(section);
	} else {
		refresh();
	}
	return section;
}
