// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns bounded CDP command promises and secret-free failure diagnostics.
 * @description
 * The Awtsmoos remembers method names but never parameters. Awtsmoos.com clears the
 * registry before rejecting callers, so reentrant handlers cannot leave timers alive
 * or make a closed socket speak a second timeout after the original failure.
 */
export class CdpPendingRegistry {
	constructor() {
		this.items = new Map();
	}

	create(id, method, timeoutMs) {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.items.delete(id);
				reject(cdpError("cdp_command_timeout", method));
			}, timeoutMs);
			this.items.set(id, { resolve, reject, timeout, method });
		});
	}

	settle(message) {
		const pending = this.items.get(message.id);
		if (!pending) return false;
		clearTimeout(pending.timeout);
		this.items.delete(message.id);
		if (message.error) {
			pending.reject(cdpError(
				"cdp_command_failed",
				pending.method,
				message.error.message
			));
		} else {
			pending.resolve(message.result);
		}
		return true;
	}

	failAll(code, message) {
		const entries = [...this.items.values()];
		this.items.clear();
		const methods = [...new Set(entries.map(item => item.method))];
		for (const pending of entries) {
			clearTimeout(pending.timeout);
			const error = cdpError(code, pending.method);
			error.message = `${message} Pending method: ${pending.method}.`;
			error.pendingMethods = methods;
			pending.reject(error);
		}
		return { count: entries.length, methods };
	}

	size() {
		return this.items.size;
	}
}

export function cdpError(code, method = null, detail = null) {
	const error = new Error([code, method, detail].filter(Boolean).join(":"));
	error.code = code;
	error.cdpMethod = method;
	return error;
}
