// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module QuestionComposer
 * @description
 * Quora-style "Ask a Question" composer: title, details, tags.
 * Opens as a modal, posts via the Q&A API.
 */

const MODAL_ID = 'qa-composer-modal';

function esc(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Submits a question to the Q&A API.
 */
async function submitQuestion({ title, details, tags, heichelId }) {
	const res = await fetch('/api/social/qa/question', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
		body: JSON.stringify({
			title,
			content: details,
			tags: tags.split(',').map(t => t.trim()).filter(Boolean),
			heichelId: heichelId || 'chassidus',
			postKind: 'question'
		})
	});
	if (!res.ok) throw new Error('Server rejected the question.');
	const data = await res.json();
	if (data.error) throw new Error(data.error.message || 'Could not post question.');
	return data;
}

function buildModal() {
	const overlay = document.createElement('div');
	overlay.id = MODAL_ID;
	overlay.className = 'qa-composer-overlay';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', 'Ask a question');
	overlay.innerHTML = `
		<div class="qa-composer">
			<div class="qa-composer__head">
				<h2 class="qa-composer__title">❓ Ask a Question</h2>
				<button type="button" class="qa-composer__close" aria-label="Close">✕</button>
			</div>
			<form class="qa-composer__form">
				<label class="qa-composer__label" for="qa-q-title">Question</label>
				<input id="qa-q-title" name="title" class="qa-composer__input"
					placeholder="What do you want to know?" maxlength="200" required>
				<label class="qa-composer__label" for="qa-q-details">Details <span class="qa-composer__opt">(optional)</span></label>
				<textarea id="qa-q-details" name="details" class="qa-composer__textarea" rows="4"
					placeholder="Add context, what you've tried, sources you're curious about…"></textarea>
				<label class="qa-composer__label" for="qa-q-tags">Topics <span class="qa-composer__opt">(comma separated)</span></label>
				<input id="qa-q-tags" name="tags" class="qa-composer__input"
					placeholder="halachah, tefillah, chassidus">
				<p class="qa-composer__status" aria-live="polite"></p>
				<div class="qa-composer__actions">
					<button type="button" class="qa-composer__cancel">Cancel</button>
					<button type="submit" class="qa-composer__submit">Ask Question</button>
				</div>
			</form>
		</div>`;
	return overlay;
}

/**
 * Opens the "Ask a Question" modal.
 * @param {object} options - { heichelId }
 */
export function openQuestionComposer({ heichelId = 'chassidus' } = {}) {
	closeQuestionComposer();
	const overlay = buildModal();
	document.body.appendChild(overlay);
	document.body.style.overflow = 'hidden';

	const close = () => closeQuestionComposer();
	overlay.querySelector('.qa-composer__close').addEventListener('click', close);
	overlay.querySelector('.qa-composer__cancel').addEventListener('click', close);
	overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
	document.addEventListener('keydown', function onKey(e) {
		if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
	});

	const form = overlay.querySelector('.qa-composer__form');
	const status = overlay.querySelector('.qa-composer__status');
	form.addEventListener('submit', async e => {
		e.preventDefault();
		const title = form.title.value.trim();
		if (!title) return;
		const submit = form.querySelector('.qa-composer__submit');
		submit.disabled = true;
		status.textContent = 'Posting your question…';
		status.className = 'qa-composer__status';
		try {
			await submitQuestion({
				title,
				details: form.details.value.trim(),
				tags: form.tags.value,
				heichelId
			});
			status.textContent = '✦ Question posted! It will appear in the feed shortly.';
			status.className = 'qa-composer__status qa-composer__status--ok';
			form.reset();
			setTimeout(close, 1500);
		} catch (err) {
			status.textContent = `Could not post: ${esc(err.message)}`;
			status.className = 'qa-composer__status qa-composer__status--err';
			submit.disabled = false;
		}
	});

	overlay.querySelector('#qa-q-title').focus();
}

/**
 * Closes the question composer modal.
 */
export function closeQuestionComposer() {
	const existing = document.getElementById(MODAL_ID);
	if (existing) existing.remove();
	document.body.style.overflow = '';
}

/**
 * Attaches "Ask a Question" triggers (buttons with [data-ask-question]).
 */
export function initQuestionComposer() {
	document.addEventListener('click', e => {
		const trigger = e.target.closest('[data-ask-question]');
		if (trigger) {
			e.preventDefault();
			openQuestionComposer({ heichelId: trigger.dataset.heichel || 'chassidus' });
		}
	});
}

// Auto-init
if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initQuestionComposer);
	} else {
		initQuestionComposer();
	}
}
