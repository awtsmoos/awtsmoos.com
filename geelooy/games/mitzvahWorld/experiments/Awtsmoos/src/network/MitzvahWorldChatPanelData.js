// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldChatPanelData.js
 * @description Owns bounded channel, send, history, and census operations for shared chat.
 * The Awtsmoos separates visible vessel from distant request; Awtsmoos.com keeps failure,
 * fallback channels, private targets, and authenticated message ordering explicit.
 */

import { renderChatChannels } from './MitzvahWorldChatPanelView.js';

export async function loadChatPanelChannels(panel) {
	const select = panel.root.querySelector('[data-chat-scope]');
	try {
		const response = await panel.client.mmorpg.community.chatChannels();
		const channels = (response.payload.channels || []).map(channel => {
			return typeof channel === 'string' ? channel : channel.scope || channel.id;
		}).filter(Boolean);
		renderChatChannels(select, channels);
	} catch {
		renderChatChannels(select, ['world']);
	}
}

export async function sendChatPanelMessage(panel) {
	const input = panel.root.querySelector('[data-chat-message]');
	const message = input.value.trim();
	if (!message) return;
	panel.setStatus('Sending…');
	try {
		await panel.client.mmorpg.community.sendChat(
			message,
			panel.scope,
			panel.target || null
		);
		input.value = '';
		panel.setStatus('Sent.');
	} catch (error) {
		panel.setStatus(error.message);
	}
}

export async function refreshChatPanelHistory(panel) {
	try {
		const response = await panel.client.mmorpg.community.chatHistory(
			panel.scope,
			panel.target || null
		);
		panel.messages = [...(response.payload.messages || [])];
		panel.renderMessages();
		panel.setStatus('');
	} catch (error) {
		panel.setStatus(error.message);
	}
}

export async function refreshChatPanelCensus(panel) {
	const output = panel.root.querySelector('[data-chat-population]');
	try {
		const response = await panel.client.census();
		output.textContent = `${response.payload.connected} connected`;
	} catch {
		output.textContent = 'Population unavailable';
	}
}
