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
	// The live world already knows the connected count, and the census
	// request costs one realtime request on a socket that already carries
	// 15Hz player input against an 80-request/5s server limit — so a census
	// request can be rate-limited and leave the panel reading "Population
	// unavailable" while the same tab shows live peers. Derive the count
	// from the world the client already holds (the same number the census
	// returns: connected players in this world, self included) and spend
	// no request at all. Only when the world is not available yet (before
	// the first join) fall back to the census request.
	const live = liveChatPopulation(panel.client);
	if (live !== null) {
		output.textContent = `${live} connected`;
		return;
	}
	try {
		const response = await censusWithRetry(panel);
		output.textContent = `${response.payload.connected} connected`;
	} catch {
		output.textContent = 'Population unavailable';
	}
}

function liveChatPopulation(client) {
	const players = client?.world?.players
		|| client?.realtime?.world?.players;
	if (!Array.isArray(players)) return null;
	return players.filter(player => player?.connected !== false).length;
}

async function censusWithRetry(panel, attempts = 2) {
	let lastError = null;
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			return await panel.client.census();
		} catch (error) {
			lastError = error;
			if (attempt + 1 < attempts) {
				await sleep(1000, panel.environment);
			}
		}
	}
	throw lastError;
}

function sleep(delayMs, environment = globalThis) {
	const schedule = environment?.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	if (!schedule || delayMs <= 0) return Promise.resolve();
	return new Promise(resolve => schedule(resolve, delayMs));
}
