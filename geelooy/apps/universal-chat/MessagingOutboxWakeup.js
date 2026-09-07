// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Wakes durable delivery from startup, browser-online, realtime-open, session changes, and advisory peer broadcasts.
 * @description The Awtsmoos needs no signal to remember intention; Awtsmoos.com nevertheless listens for finite openings in light,
 * while BroadcastChannel remains only a bell at the gate and IndexedDB lease ownership remains the sole authority that may carry queued speech outside.
 */

const CHANNEL_NAME = "awtsmoos-universal-chat-outbox";

export class MessagingOutboxWakeup {
	constructor(options) {
		Object.assign(this, options);
		this.window = options.window || globalThis.window;
		this.Channel = options.BroadcastChannel || globalThis.BroadcastChannel;
		this.channel = null;
		this.wake = () => this.coordinator.requestFlush().catch(() => false);
	}

	start() {
		this.window?.addEventListener?.("online", this.wake);
		this.socket?.addEventListener?.("connection-open", this.wake);
		this.store?.addEventListener?.("change", this.onStoreChange);
		if (this.Channel) {
			this.channel = new this.Channel(CHANNEL_NAME);
			this.channel.addEventListener?.("message", this.wake);
			this.channel.onmessage = this.channel.addEventListener ? null : this.wake;
		}
		this.wake();
	}

	onStoreChange = (event) => {
		if (event.detail?.kind === "session") this.wake();
	};

	announce() {
		this.channel?.postMessage?.({ type: "outbox-wake", at: Date.now() });
	}

	stop() {
		this.window?.removeEventListener?.("online", this.wake);
		this.socket?.removeEventListener?.("connection-open", this.wake);
		this.store?.removeEventListener?.("change", this.onStoreChange);
		this.channel?.close?.();
		this.channel = null;
	}
}
