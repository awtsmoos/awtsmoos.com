//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChatContinue
 * @description
 * One-click chat continuation: builds a copy-ready prompt that hands an agent
 * the ABSOLUTE chat location — both the VFS path (/Chats/<YYYY>/<MM>/<DD>/<slug>)
 * and the stable entity reference (awts://entity/chat/<id>) — so the new chat
 * can pick up exactly where the old one left off.
 */

/**
 * Build the continuation prompt text.
 * @param {object} input - { chatPath, chatId, title?, summary? }
 *   chatPath must be the absolute /Chats/... path (never a relative one).
 */
export function buildContinuationPrompt({ chatPath, chatId, title, summary } = {}) {
	const path = String(chatPath || '').trim();
	if (!path.startsWith('/Chats/')) {
		throw new Error('buildContinuationPrompt: chatPath must be an absolute /Chats/... path');
	}
	const id = String(chatId || '').trim();
	const lines = [
		'Please continue this chat exactly where it left off.',
		'',
		`Chat: ${title ? `"${title}"` : '(untitled)'}`,
		`Absolute chat path: \`${path}\``,
	];
	if (id) lines.push(`Chat entity: \`awts://entity/chat/${id}\``);
	lines.push(
		'',
		'Before answering, read these two files from the chat folder:',
		`1. \`${path}/transcript.md\` — the full conversation so far`,
		`2. \`${path}/summary.md\` — the recorded summary and key decisions`
	);
	if (summary) lines.push('', `Known summary: ${summary}`);
	lines.push(
		'',
		'Then continue as the same assistant, with the same context, goals, and tone. ' +
		'Do not re-ask anything already answered in the transcript.'
	);
	return lines.join('\n');
}

/**
 * Mount a "Continue this chat" button into a container element.
 * Copies the continuation prompt via navigator.clipboard, with a
 * textarea+execCommand fallback for older contexts.
 * @param {Element} container - DOM element to append the button to.
 * @param {object} input - same shape as buildContinuationPrompt.
 * @returns {HTMLButtonElement} the mounted button.
 */
export function mountContinueButton(container, input = {}) {
	if (!container || typeof container.appendChild !== 'function') {
		throw new Error('mountContinueButton: container must be a DOM element');
	}
	const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
	const button = doc ? doc.createElement('button') : { textContent: '' };
	button.type = 'button';
	button.className = 'chat-continue-button';
	button.textContent = 'Continue this chat';
	button.setAttribute('data-chat-path', input.chatPath || '');
	button.setAttribute('data-chat-id', input.chatId || '');

	const prompt = buildContinuationPrompt(input);

	async function copyText(text) {
		try {
			if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
				await navigator.clipboard.writeText(text);
				return true;
			}
		} catch { /* fall through to legacy path */ }
		try {
			const host = doc || (typeof document !== 'undefined' ? document : null);
			if (!host) return false;
			const ta = host.createElement('textarea');
			ta.value = text;
			ta.setAttribute('readonly', '');
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			host.body.appendChild(ta);
			ta.select();
			const done = host.execCommand ? host.execCommand('copy') : false;
			host.body.removeChild(ta);
			return !!done;
		} catch { return false; }
	}

	button.addEventListener('click', async () => {
		const copied = await copyText(prompt);
		button.textContent = copied ? 'Prompt copied — paste into a new chat' : 'Copy failed — prompt in console';
		if (!copied && typeof console !== 'undefined') console.log(prompt);
		setTimeout(() => { button.textContent = 'Continue this chat'; }, 4000);
	});

	container.appendChild(button);
	return button;
}
