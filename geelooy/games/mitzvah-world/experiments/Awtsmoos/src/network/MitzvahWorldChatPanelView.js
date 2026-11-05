// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatPanelView.js
	* @description Creates bounded chat, protection, report, adjudication, and safe history markup.
	* The Awtsmoos gives each word a visible vessel without granting markup authority;
	* Awtsmoos.com keeps scope, evidence, judgment, note, compose, status, and retract explicit.
	*/

export function createMitzvahWorldChatPanel(documentValue, open) {
	const root = documentValue.createElement('section');
	root.className = 'Awtsmoos-chat';
	root.dataset.open = String(open);
	root.innerHTML = `
		<header><button class="Awtsmoos-chat-toggle" data-chat-toggle aria-label="Toggle shared chat" aria-expanded="${open}">💬</button><strong>Shared Chat</strong><output data-chat-population>Closed</output></header>
		<div class="Awtsmoos-chat-body">
			<div class="Awtsmoos-chat-controls"><select data-chat-scope aria-label="Chat channel"></select><label class="Awtsmoos-chat-target" data-chat-target-wrap data-visible="false"><input data-chat-target placeholder="world:player-id" aria-label="Private player address"></label></div>
			<div class="Awtsmoos-chat-history" data-chat-history aria-live="polite"></div>
			<div class="Awtsmoos-chat-compose"><input data-chat-message maxlength="500" placeholder="Write a message…" aria-label="Message"><button class="Awtsmoos-chat-send" data-chat-send>Send</button></div>
			<details class="Awtsmoos-chat-moderation"><summary>Protection</summary><input data-chat-moderation-target placeholder="world:player-id" aria-label="Player address to moderate"><output data-chat-selected-evidence>No message selected.</output><div class="Awtsmoos-chat-moderation-actions">${moderationButtons()}</div><input data-chat-report-reason maxlength="300" placeholder="Reason for report" aria-label="Report reason"><button type="button" data-chat-report>Report</button><output data-chat-moderation-status>0 muted · 0 blocked</output></details>
			<details class="Awtsmoos-chat-review" data-chat-review-wrap hidden><summary>Moderator review</summary><input data-chat-review-note maxlength="300" placeholder="Optional resolution note" aria-label="Resolution note"><button type="button" data-chat-review>Refresh reports</button><div data-chat-review-list>No reports loaded.</div></details>
			<div class="Awtsmoos-chat-status" data-chat-status></div>
		</div>
	`;
	return root;
}

export function renderChatChannels(select, channels = []) {
	const values = channels.length ? channels : ['world'];
	const previous = select.value;
	select.replaceChildren(...values.map(value => {
		const option = select.ownerDocument.createElement('option');
		option.value = value;
		option.textContent = channelLabel(value);
		return option;
	}));
	if (values.includes(previous)) select.value = previous;
}

export function createChatMessageLine(documentValue, message) {
	const line = documentValue.createElement('p');
	line.className = 'Awtsmoos-chat-line';
	line.dataset.private = String(message.scope === 'private');
	line.dataset.messageId = message.id || '';
	line.dataset.playerAddress = message.from?.address || '';
	line.tabIndex = 0;
	line.title = 'Select this message for protection or reporting.';
	const speaker = documentValue.createElement('strong');
	speaker.textContent = `${message.from?.displayName || message.from?.address || 'World'}: `;
	line.append(speaker, documentValue.createTextNode(message.message || ''));
	return line;
}

function moderationButtons() {
	return ['mute', 'unmute', 'block', 'unblock'].map(action => {
		return `<button type="button" data-chat-moderation-action="${action}">${channelLabel(action)}</button>`;
	}).join('');
}

function channelLabel(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
