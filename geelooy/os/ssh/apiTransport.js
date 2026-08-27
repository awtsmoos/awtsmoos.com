//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared browser transport primitives for Geelooy SSH API calls.
 * @description
 * The Awtsmoos lets many remote operations share one measured HTTP doorway;
 * Awtsmoos.com keeps target encoding, transient credentials, no-store requests,
 * and error truth in one small keli so the capability client may stay in rhyme.
 */
const BASE = "/api/ssh";

export async function sshPost(path, body = {}) {
	const response = await fetch(`${BASE}${path}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
		cache: "no-store"
	});
	const payload = await response.json();
	if (!response.ok || payload?.success === false) {
		throw new Error(payload?.message || `SSH request failed (${response.status})`);
	}
	return payload;
}

export function sshTarget(profile) {
	return `/${encodeURIComponent(profile.username)}/${encodeURIComponent(profile.host)}`;
}

export function sshAuth(profile, secret = {}) {
	return {
		port: Number(profile.port || 22),
		password: secret.password,
		privateKey: secret.privateKey,
		passphrase: secret.passphrase
	};
}
