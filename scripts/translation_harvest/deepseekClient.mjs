// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deepseekClient.mjs
 * @description The Awtsmoos lets one stable cached prefix meet many changing missing passages; Awtsmoos.com keeps the API key only in process memory,
 * disables unnecessary reasoning, requests strict JSON with bounded output, and returns usage evidence so every paid call can be measured in history.
 */

import { SYSTEM_PROMPT } from './prompt.mjs';

const ENDPOINT = 'https://api.deepseek.com/chat/completions';

/**
 * @description Calls DeepSeek V4 in non-thinking JSON mode with one stable system prefix.
 * @param {object} options Request options.
 * @param {string} options.message Compact user JSON payload.
 * @param {string} options.model DeepSeek model.
 * @param {number} options.maxOutputTokens Output token cap.
 * @param {number} options.timeoutMs Hard request timeout.
 * @param {Function} [options.fetchImpl] Injectable fetch implementation for tests.
 * @returns {Promise<{json:object,usage:object|null,model:string}>} Parsed result and usage.
 */
export async function callDeepSeek({
	message,
	model,
	maxOutputTokens,
	timeoutMs,
	fetchImpl = fetch
}) {
	const apiKey = process.env.DEEPSEEK_API_KEY;
	if (!apiKey) {
		throw new Error('DEEPSEEK_API_KEY is not set');
	}
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	let response;
	try {
		response = await fetchImpl(ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model,
				thinking: { type: 'disabled' },
				temperature: 0,
				max_tokens: maxOutputTokens,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: message }
				]
			}),
			signal: controller.signal
		});
	} finally {
		clearTimeout(timeout);
	}
	const text = await response.text();
	if (!response.ok) {
		throw new Error(`DeepSeek HTTP ${response.status}: ${text.slice(0, 1000)}`);
	}
	const envelope = JSON.parse(text);
	const content = envelope?.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('DeepSeek returned no message content');
	}
	return {
		json: JSON.parse(content),
		usage: envelope.usage || null,
		model: envelope.model || model
	};
}
