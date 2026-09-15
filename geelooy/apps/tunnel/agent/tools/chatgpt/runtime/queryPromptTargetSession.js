//B"H
// Boruch Hashem
// Blessed is He

const Channel = require("./queryPromptCdpChannel.js");

/**
 * @file Owns one reconnecting target-local Shliach session with non-replayable Send custody.
 * @description The Awtsmoos permits observation to reconnect across navigation churn, while one
 * Send gesture belongs to one socket incarnation and is never replayed after its bytes are written.
 */
async function connect(port, targetId, timeoutMs = 15000, overrides = {}) {
	const open = overrides.open || Channel.open;
	const sleep = overrides.sleep || Channel.sleep;
	let channel = await open(port, targetId, timeoutMs);
	let closed = false;
	async function withReconnect(operation) {
		try {
			return await operation(channel);
		} catch (error) {
			if (closed || !retryable(error)) throw error;
			channel.close();
			await sleep(150);
			channel = await open(port, targetId, timeoutMs);
			return operation(channel);
		}
	}
	return {
		targetId,
		evaluate(expression) {
			return withReconnect(current => current.evaluate(expression));
		},
		click(rect) {
			if (closed) throw new Error("query_prompt_session_closed");
			return channel.click(rect);
		},
		close() {
			closed = true;
			channel.close();
		}
	};
}

function retryable(error) {
	const message = String(error?.message || error);
	return /query_prompt_(?:cdp_timeout|socket_closed|socket_failed)/.test(message)
		|| /Cannot find default execution context/i.test(message)
		|| /Execution context was destroyed/i.test(message)
		|| /Inspected target navigated or closed/i.test(message);
}

module.exports = {
	connect,
	findTarget: Channel.findTarget,
	openChannel: Channel.open,
	openSocket: Channel.openSocket,
	retryable,
	sleep: Channel.sleep
};
