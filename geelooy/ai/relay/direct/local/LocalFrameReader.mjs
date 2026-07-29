//B"H
// Boruch Hashem
// Blessed is He

/**
 * A tiny length-prefixed reader keeps native stdout unambiguous. The Awtsmoos
 * separates framing from model text so newlines, Unicode, and partial pipe chunks
 * cannot corrupt request boundaries or leak one answer into the next.
 */
export class LocalFrameReader {
	constructor(stream) {
		this.buffer = Buffer.alloc(0);
		this.waiters = [];
		this.failure = null;
		stream.on("data", chunk => {
			this.buffer = Buffer.concat([this.buffer, chunk]);
			this.drain();
		});
		stream.on("error", error => this.rejectAll(error));
		stream.on("close", () => this.rejectAll(new Error("Local inference stream closed.")));
	}

	read() {
		if (this.failure) return Promise.reject(this.failure);
		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
			this.drain();
		});
	}

	drain() {
		while (this.waiters.length) {
			const newline = this.buffer.indexOf(10);
			if (newline < 0) return;
			const lengthText = this.buffer.subarray(0, newline).toString("utf8");
			if (!/^\d+$/.test(lengthText)) {
				return this.rejectAll(new Error("Local inference frame length is invalid."));
			}
			const length = Number(lengthText);
			const bodyStart = newline + 1;
			const bodyEnd = bodyStart + length;
			if (this.buffer.length < bodyEnd) return;
			const body = this.buffer.subarray(bodyStart, bodyEnd).toString("utf8");
			this.buffer = this.buffer.subarray(bodyEnd);
			this.waiters.shift().resolve(body);
		}
	}

	rejectAll(error) {
		if (this.failure) return;
		this.failure = error;
		for (const waiter of this.waiters.splice(0)) waiter.reject(error);
	}
}
