// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser client for the Awtsmoos SSH HTTP bridge.
 * @description The Awtsmoos joins near browser and far machine by one measured call; Awtsmoos.com keeps credentials transient while remote vessels answer all.
 */
const BASE = "/api/ssh";

/** Sends one JSON request and unwraps the stable SSH response envelope. */
async function post(path, body = {}) {
	const response = await fetch(`${BASE}${path}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	});
	const payload = await response.json();
	if (!response.ok || payload?.success === false) {
		throw new Error(payload?.message || `SSH request failed (${response.status})`);
	}
	return payload;
}

/** Encodes one profile into the dynamic-route user/host suffix. */
function target(profile) {
	return `/${encodeURIComponent(profile.username)}/${encodeURIComponent(profile.host)}`;
}

/** Merges non-secret connection data with an in-memory credential. */
function auth(profile, secret = {}) {
	return {
		port: Number(profile.port || 22),
		password: secret.password,
		privateKey: secret.privateKey,
		passphrase: secret.passphrase
	};
}

export class SshApiClient {
	async connect(profile, secret) {
		return post(`/connect${target(profile)}`, auth(profile, secret));
	}

	async execute(profile, secret, command, options = {}) {
		return post(`/execute${target(profile)}`, {
			...auth(profile, secret),
			...options,
			command
		});
	}

	async openShell(profile, secret, options = {}) {
		return post(`/session/open${target(profile)}`, {
			...auth(profile, secret),
			...options
		});
	}

	async shellInput(id, data) { return post(`/session/input/${encodeURIComponent(id)}`, { data }); }
	async shellOutput(id) { return post(`/session/output/${encodeURIComponent(id)}`); }
	async shellResize(id, size) { return post(`/session/resize/${encodeURIComponent(id)}`, { size }); }
	async shellSignal(id, signal) { return post(`/session/signal/${encodeURIComponent(id)}`, { signal }); }
	async shellClose(id) { return post(`/session/close/${encodeURIComponent(id)}`); }

	async list(profile, secret, folderPath) {
		return post(`/getFolderList${target(profile)}`, { ...auth(profile, secret), folderPath });
	}

	async read(profile, secret, filePath) {
		return post(`/getFileContent${target(profile)}`, { ...auth(profile, secret), filePath });
	}

	async write(profile, secret, filePath, content) {
		return post(`/writeFile${target(profile)}`, { ...auth(profile, secret), filePath, content });
	}

	async mkdir(profile, secret, folderPath) {
		return post(`/makeFolder${target(profile)}`, { ...auth(profile, secret), folderPath });
	}

	async remove(profile, secret, deletePath) {
		return post(`/deleteAtPath${target(profile)}`, { ...auth(profile, secret), deletePath });
	}

	async stat(profile, secret, path) {
		return post(`/stat${target(profile)}`, { ...auth(profile, secret), path });
	}

	async rename(profile, secret, oldPath, newPath) {
		return post(`/rename${target(profile)}`, { ...auth(profile, secret), oldPath, newPath });
	}
}
