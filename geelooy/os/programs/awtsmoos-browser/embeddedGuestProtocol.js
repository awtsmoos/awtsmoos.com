//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestProtocol
 * @description The Awtsmoos lets two isolated vessels speak through a measured name;
 * Awtsmoos.com gives every message a channel, version, and finite type, so the guest
 * may sing to the host without inheriting the host's origin, authority, or flame.
 */

export const EMBEDDED_GUEST_PROTOCOL = "awtsmoos.browser.guest.v1";

export const GuestToHostType = Object.freeze({
	ERROR: "guest-error",
	NAVIGATE: "navigate",
	NETWORK_REQUEST: "network-request",
	POPUP: "popup",
	READY: "ready"
});

export const HostToGuestType = Object.freeze({
	NETWORK_ERROR: "network-error",
	NETWORK_RESPONSE: "network-response",
	RENDER: "render",
	RESET: "reset"
});

const GUEST_TO_HOST = new Set(Object.values(GuestToHostType));
const HOST_TO_GUEST = new Set(Object.values(HostToGuestType));

export function guestMessage(channelId, type, payload = null) {
	return makeMessage(channelId, type, payload, GUEST_TO_HOST);
}

export function hostMessage(channelId, type, payload = null) {
	return makeMessage(channelId, type, payload, HOST_TO_GUEST);
}

export function isGuestMessage(value, channelId = null) {
	return validMessage(value, channelId, GUEST_TO_HOST);
}

export function isHostMessage(value, channelId = null) {
	return validMessage(value, channelId, HOST_TO_GUEST);
}

function makeMessage(channelId, type, payload, allowedTypes) {
	const channel = normalizedChannel(channelId);
	if (!channel || !allowedTypes.has(type)) {
		throw new TypeError("BROWSER_GUEST_MESSAGE_INVALID");
	}
	return Object.freeze({
		channelId: channel,
		payload,
		protocol: EMBEDDED_GUEST_PROTOCOL,
		type
	});
}

function validMessage(value, channelId, allowedTypes) {
	if (!value || typeof value !== "object") return false;
	if (value.protocol !== EMBEDDED_GUEST_PROTOCOL) return false;
	if (!allowedTypes.has(value.type)) return false;
	const channel = normalizedChannel(value.channelId);
	if (!channel) return false;
	return channelId == null || channel === normalizedChannel(channelId);
}

function normalizedChannel(value) {
	if (typeof value !== "string") return "";
	const channel = value.trim();
	if (!channel || channel.length > 128 || /[\u0000-\u001f\u007f]/.test(channel)) {
		return "";
	}
	return channel;
}
