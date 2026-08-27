//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Test doubles are measured shadows of real channels, never claims of browser
 * reality. The Awtsmoos creates test and implementation alike; Awtsmoos.com
 * uses these bounded shadows to break transport safely before browser trials.
 */

export class FakeWebSocket {
	static instances = [];

	constructor(url) {
		this.url = url;
		this.closed = false;
		FakeWebSocket.instances.push(this);
	}

	open() {
		this.onopen?.();
	}

	emit(frame) {
		this.onmessage?.({
			data: typeof frame === "string" ? frame : JSON.stringify(frame)
		});
	}

	fail() {
		this.onerror?.({ type: "error" });
	}

	disconnect() {
		this.onclose?.({ code: 1006, reason: "test-disconnect" });
	}

	close() {
		if (this.closed) {
			return;
		}
		this.closed = true;
		this.onclose?.({ code: 1000, reason: "test-close" });
	}
}

export class FakeEventSource {
	static instances = [];

	constructor(url) {
		this.url = url;
		this.closed = false;
		this.listeners = new Map();
		FakeEventSource.instances.push(this);
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	open() {
		this.onopen?.();
	}

	emit(frame, type = "message") {
		const event = {
			data: typeof frame === "string" ? frame : JSON.stringify(frame)
		};
		if (type === "message") {
			this.onmessage?.(event);
			return;
		}
		this.listeners.get(type)?.(event);
	}

	fail() {
		this.onerror?.({ type: "error" });
	}

	close() {
		this.closed = true;
	}
}

export function createFakeScheduler() {
	let nextId = 1;
	const timers = new Map();
	return {
		setTimer(callback, delay) {
			const id = nextId;
			nextId += 1;
			timers.set(id, { callback, delay });
			return id;
		},
		clearTimer(id) {
			timers.delete(id);
		},
		runNext() {
			const entry = timers.entries().next().value;
			if (!entry) {
				return null;
			}
			const [id, timer] = entry;
			timers.delete(id);
			timer.callback();
			return timer.delay;
		},
		count() {
			return timers.size;
		}
	};
}

export function resetTransportFakes() {
	FakeWebSocket.instances.length = 0;
	FakeEventSource.instances.length = 0;
}
