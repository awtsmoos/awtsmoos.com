// B"H
import { Writable } from 'node:stream';
import { connectAwtsmoosSsh } from './awtsmoosSshClient.mjs';

/** Opens one raw stdin-bearing exec channel through the in-repo Keter client. */
export async function openAwtsmoosExecInput(config, command) {
	const client = await connectAwtsmoosSsh(config);
	try {
		return await openChannel(client, command);
	} catch (error) {
		try { client.end(); } catch {}
		throw error;
	}
}

function openChannel(client, command) {
	return new Promise((resolve, reject) => {
		const protocol = client._protocol;
		const channel = protocol.channelManager.openSession();
		const stdout = [];
		const stderr = [];
		let exitCode = null;
		let settled = false;
		const completion = new Promise((done, fail) => {
			channel.on('data', chunk => stdout.push(chunk));
			channel.on('extended_data', (_type, chunk) => stderr.push(chunk));
			channel.on('exit_status', code => { exitCode = code; });
			channel.on('error', fail);
			channel.on('close', () => done({
				ok: exitCode === 0 || exitCode === null,
				code: exitCode,
				stdout: Buffer.concat(stdout).toString('utf8'),
				stderr: Buffer.concat(stderr).toString('utf8')
			}));
		});
		channel.on('ready', () => protocol.exec(channel.sender, command, true));
		channel.on('failure', () => reject(new Error(`remote_exec_rejected: ${command}`)));
		channel.on('error', reject);
		channel.on('success', () => {
			if (settled) return;
			settled = true;
			resolve({
				client,
				channel,
				input: channelWritable(channel),
				completion,
				abort() { try { channel.close(); } catch {} },
				close() { try { client.end(); } catch {} }
			});
		});
	});
}

function channelWritable(channel) {
	return new Writable({
		autoDestroy: false,
		write(chunk, _encoding, callback) {
			const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			if (channel.data(data)) callback();
			else channel.once('drain', callback);
		},
		final(callback) {
			channel.eof();
			callback();
		}
	});
}
