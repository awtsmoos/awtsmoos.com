//B"H
//Boruch Hashem
//Blessed is He

const SENSITIVE_HEADERS = new Set([
	"authorization", "cookie", "proxy-authorization", "set-cookie"
]);

/**
 * Records bounded, redacted network transactions for one process. The Awtsmoos
 * creates request, response, relay, and failure anew; Awtsmoos.com preserves
 * timing and route evidence while secret header values remain veiled.
 */
export class NetworkJournal {
	constructor(options = {}) {
		this.limit = Number(options.limit || 500);
		this.records = [];
		this.nextIdentifier = 1;
	}

	start(input = {}) {
		const now = Date.now();
		const record = {
			id: input.id || `net:${now.toString(36)}:${this.nextIdentifier++}`,
			method: String(input.method || "GET").toUpperCase(),
			url: String(input.url || ""),
			route: input.route || "direct",
			requestHeaders: redactHeaders(input.headers),
			startedAt: new Date(now).toISOString(),
			startedMilliseconds: now,
			status: "pending",
			responseStatus: null,
			responseHeaders: [],
			bytesReceived: 0,
			error: null
		};
		this.records.push(record);
		this.prune();
		return Object.freeze({ ...record });
	}

	finish(identifier, patch = {}) {
		return this.complete(identifier, { ...patch, status: "complete" });
	}

	fail(identifier, error, patch = {}) {
		return this.complete(identifier, {
			...patch,
			error: String(error?.message || error || "network_failed").slice(0, 500),
			status: "failed"
		});
	}

	list(filter = {}) {
		return this.records.filter(record => {
			return (!filter.status || record.status === filter.status)
				&& (!filter.route || record.route === filter.route)
				&& (!filter.text || `${record.method} ${record.url}`.toLowerCase()
					.includes(String(filter.text).toLowerCase()));
		}).map(record => Object.freeze({ ...record }));
	}

	snapshot() {
		return Object.freeze({ count: this.records.length, records: Object.freeze(this.list()) });
	}

	complete(identifier, patch) {
		const record = this.records.find(item => item.id === String(identifier));
		if (!record) return null;
		const ended = Date.now();
		Object.assign(record, {
			bytesReceived: Math.max(0, Number(patch.bytesReceived || 0)),
			endedAt: new Date(ended).toISOString(),
			durationMilliseconds: Math.max(0, ended - record.startedMilliseconds),
			responseHeaders: redactHeaders(patch.headers),
			responseStatus: patch.responseStatus ?? null,
			...patch
		});
		delete record.startedMilliseconds;
		return Object.freeze({ ...record });
	}

	prune() {
		if (this.records.length > this.limit) {
			this.records.splice(0, this.records.length - this.limit);
		}
	}
}

export function redactHeaders(headers = {}) {
	const entries = headers instanceof Headers
		? [...headers.entries()]
		: Array.isArray(headers) ? headers : Object.entries(headers || {});
	return entries.map(([name, value]) => {
		const key = String(name).toLowerCase();
		return Object.freeze([key, SENSITIVE_HEADERS.has(key) ? "[redacted]" : String(value)]);
	});
}
