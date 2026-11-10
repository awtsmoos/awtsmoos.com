// B"H

let latestMessageId = null;
let collapseBound = false;

/** The header button owns the .minimized class the stylesheet already defines; bind it once. */
function bindChatCollapse() {
	if (collapseBound) return;
	const header = document.getElementById('chat-header');
	const box = document.getElementById('global-chat-box');
	if (!header || !box) return;
	collapseBound = true;
	header.setAttribute('aria-expanded', 'true');
	header.addEventListener('click', () => {
		const minimized = box.classList.toggle('minimized');
		const toggle = document.getElementById('chat-toggle');
		if (toggle) toggle.textContent = minimized ? '[+]' : '[-]';
		header.setAttribute('aria-expanded', String(!minimized));
	});
}

export function updateChatView(messages = []) {
	bindChatCollapse();
	const container = document.getElementById('chat-messages');
	if (!container || messages.length === 0) return;
	const newest = messages.at(-1);
	if (newest?.id === latestMessageId) return;
	latestMessageId = newest?.id;
	container.textContent = '';

	for (const message of messages) {
		const row = document.createElement('div');
		row.className = `chat-message chat-channel-${message.type || 'general'}`;
		const meta = document.createElement('span');
		meta.className = 'chat-meta';
		meta.textContent = `${message.sender || 'Echo'}${message.place ? ` · ${message.place}` : ''}: `;
		const body = document.createElement('span');
		body.textContent = message.message || '';
		row.append(meta, body);
		container.appendChild(row);
	}
	container.scrollTop = container.scrollHeight;
}
