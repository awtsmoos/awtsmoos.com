//B"H
// Boruch Hashem
// Blessed is He

const Channel = require("./queryPromptCdpChannel.js");

/**
 * @file Owns one reconnecting target-local Shliach session.
 * @description The Awtsmoos binds every successor to one exact browser vessel; navigation may
 * renew its socket or execution context, but never its target identity, so agents cannot cross-wire.
 */
async function connect(port, targetId, timeoutMs = 15000) {
	let channel = await Channel.open(port, targetId, timeoutMs);
	let closed = false;
	async function withReconnect(operation) {
		try {
			return await operation(channel);
		} catch (error) {
			if (closed || !retryable(error)) throw error;
			channel.close();
			await Channel.sleep(150);
			channel = await Channel.open(port, targetId, timeoutMs);
			return operation(channel);
		}
	}
	return {
		targetId,
		evaluate(expression) {
			return withReconnect(current => current.evaluate(expression));
		},
		click(rect) {
			return withReconnect(current => current.click(rect));
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
