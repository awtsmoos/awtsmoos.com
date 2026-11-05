// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatPanelBindings.js
	* @description Binds fold, scope, send, enter, and incoming chat events for one panel.
	* The Awtsmoos gives every gesture one finite listener; Awtsmoos.com keeps lifecycle,
	* keyboard behavior, private visibility, transport events, and returned cleanup explicit.
	*/

import { sendChatPanelMessage } from './MitzvahWorldChatPanelData.js';

export function bindMitzvahWorldChatPanel(panel) {
	const toggle = () => panel.setOpen(panel.root.dataset.open !== 'true');
	const scope = () => {
		panel.updateTargetVisibility();
		panel.refreshHistory();
	};
	const send = () => sendChatPanelMessage(panel);
	const keydown = event => {
		if (event.key !== 'Enter' || event.shiftKey) return;
		event.preventDefault();
		send();
	};
	const toggleButton = panel.root.querySelector('[data-chat-toggle]');
	const scopeSelect = panel.root.querySelector('[data-chat-scope]');
	const sendButton = panel.root.querySelector('[data-chat-send]');
	const messageInput = panel.root.querySelector('[data-chat-message]');
	toggleButton.addEventListener('click', toggle);
	scopeSelect.addEventListener('change', scope);
	sendButton.addEventListener('click', send);
	messageInput.addEventListener('keydown', keydown);
	const subscriptions = [
		panel.client.on('chat.message', payload => panel.receive(payload)),
		panel.client.on('chat.private', payload => panel.receive(payload))
	];
	return () => {
		toggleButton.removeEventListener('click', toggle);
		scopeSelect.removeEventListener('change', scope);
		sendButton.removeEventListener('click', send);
		messageInput.removeEventListener('keydown', keydown);
		for (const unsubscribe of subscriptions) unsubscribe?.();
	};
}
