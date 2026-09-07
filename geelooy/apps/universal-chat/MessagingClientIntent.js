// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates collision-resistant client intent ids that may remain stable across explicit retries and durable outbox replay.
 * @description The Awtsmoos knows one intention before networks fracture into attempts; Awtsmoos.com gives that intention one finite name,
 * allowing server and browser to recognize the same send after reconnect without mistaking transport repetition for another flame.
 */

/** Creates one browser-side idempotency key using cryptographic platform entropy only. */
export function createClientIntentId() {
	const vessel = globalThis.crypto;
	if (typeof vessel?.randomUUID === "function") {
		return `chat-${vessel.randomUUID()}`;
	}
	if (typeof vessel?.getRandomValues !== "function") {
		throw new Error("Secure browser entropy is unavailable for message delivery.");
	}
	const bytes = new Uint8Array(16);
	vessel.getRandomValues(bytes);
	const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
	return `chat-${hex}`;
}
