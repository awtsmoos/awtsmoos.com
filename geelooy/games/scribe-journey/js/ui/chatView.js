// B"H

let latestMessageId = null;

export function updateChatView(messages = []) {
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
