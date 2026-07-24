// B"H
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { KeterClient } = require('../../ayzarim/ssh/Keter-Client.js');

/**
 * The custom SSH chariot exposes authenticated command and SFTP sessions without
 * invoking OpenSSH, scp, rsync, or a shell that can observe the stored password.
 */
export function connectAwtsmoosSsh(config = {}) {
	const client = new KeterClient();
	return new Promise((resolve, reject) => {
		let settled = false;
		const fail = error => {
			if (settled) return;
			settled = true;
			try { client.end(); } catch {}
			reject(error);
		};
		client.once('authenticated', () => {
			settled = true;
			resolve(client);
		});
		client.once('error', fail);
		client.connect({
			host: config.host || 'awtsmoos.com',
			port: Number(config.port || 22),
			username: config.username || 'root',
			password: config.password,
			privateKey: config.privateKey,
			debug: config.debug
		});
	});
}

export function execOnAwtsmoosClient(client, command, options = {}) {
	return new Promise((resolve, reject) => {
		client.exec(command, options, (error, result) => {
			if (error) reject(error);
			else resolve({ ok: result.code === 0 || result.code === null, ...result });
		});
	});
}

export async function openAwtsmoosSftp(config = {}) {
	const client = await connectAwtsmoosSsh(config);
	try {
		const sftp = await new Promise((resolve, reject) => {
			client.sftp((error, session) => error ? reject(error) : resolve(session));
		});
		return {
			client,
			sftp,
			close() {
				try { client.end(); } catch {}
			}
		};
	} catch (error) {
		try { client.end(); } catch {}
		throw error;
	}
}

export async function execAwtsmoosSsh(config = {}, command = './BH.sh') {
	const client = await connectAwtsmoosSsh(config);
	try {
		return await execOnAwtsmoosClient(client, command, { pty: config.pty === true });
	} finally {
		try { client.end(); } catch {}
	}
}
