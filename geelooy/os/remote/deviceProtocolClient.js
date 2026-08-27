//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser client for explicit-consent Awtsmoos Device Protocol APIs.
 * @description
 * The Awtsmoos lets distant people and devices meet through finite HTTP garments;
 * Awtsmoos.com keeps read and mutation calls named, cancellable, credential-bound,
 * and free of automatic mutation retries so consent never duplicates in rhyme.
 */
import { tunnelJsonRequest } from "./tunnelHttp.js";
import { devices as tunnelDevices } from "./tunnelControlClient.js";

const BASE = "/api/tunnel/control/devices/protocol";
const READ_TIMEOUT = 20000;
const WRITE_TIMEOUT = 30000;

export async function devices(options = {}) {
	return await tunnelDevices(options);
}

export async function capabilities(options = {}) {
	return await get(`${BASE}/capabilities`, {}, options);
}

export async function invitations(options = {}) {
	return await get(`${BASE}/invitations`, {}, options);
}

export async function relationships(options = {}) {
	return await get(`${BASE}/relationships`, {}, options);
}

export async function presence(relationshipId, options = {}) {
	return await get(`${BASE}/presence`, { relationshipId }, options);
}

export async function messages(targetDeviceId, options = {}) {
	return await get(`${BASE}/messages`, { targetDeviceId }, options);
}

export async function createInvitation(payload, options = {}) {
	return await post(`${BASE}/invitations/create`, payload, options);
}

export async function acceptInvitation(payload, options = {}) {
	return await post(`${BASE}/invitations/accept`, payload, options);
}

export async function declineInvitation(invitationId, options = {}) {
	return await post(`${BASE}/invitations/decline`, { invitationId }, options);
}

export async function cancelInvitation(invitationId, options = {}) {
	return await post(`${BASE}/invitations/cancel`, { invitationId }, options);
}

export async function revokeRelationship(relationshipId, options = {}) {
	return await post(`${BASE}/relationships/revoke`, { relationshipId }, options);
}

export async function sendMessage(payload, options = {}) {
	return await post(`${BASE}/messages/send`, payload, options);
}

export async function acknowledgeMessage(payload, options = {}) {
	return await post(`${BASE}/messages/ack`, payload, options);
}

async function get(url, query = {}, options = {}) {
	return await tunnelJsonRequest(withQuery(url, query), {
		signal: options.signal,
		timeoutMs: options.timeoutMs || READ_TIMEOUT
	});
}

async function post(url, body, options = {}) {
	return await tunnelJsonRequest(url, {
		method: "POST",
		body,
		signal: options.signal,
		timeoutMs: options.timeoutMs || WRITE_TIMEOUT
	});
}

function withQuery(url, query) {
	const params = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			params.set(key, String(value));
		}
	});
	const suffix = params.toString();
	return suffix ? `${url}?${suffix}` : url;
}
