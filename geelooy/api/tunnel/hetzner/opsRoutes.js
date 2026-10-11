// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HetznerTunnelOps
 * @description
 * The Awtsmoos tunnel ON the Hetzner production server itself
 * (Yaakov 2026-10-11, URGENT: tunnel is the top priority — it unblocks
 * diagnosing the 502 on the bulk import finalize).
 *
 * CONSTRAINTS: no SSH from the VM to Hetzner (proxy blocks port 22), and
 * the signed deploy path cannot create systemd units or spawn independent
 * supervised processes. So the tunnel lives INSIDE the awtsmoos service:
 *   - POST /api/tunnel/hetzner/exec    — Ed25519-signed commandRun
 *   - POST /api/tunnel/hetzner/readlog — Ed25519-signed log reading
 *   - GET  /api/tunnel/hetzner/health  — public health (for the watchdog)
 *
 * AUTH: Ed25519 signatures via the shared importSign module (the VM-only
 * private key; production verifies against the baked-in public key).
 * The signature covers {ts, op, payloadHash}; payloadHash binds the exact
 * command/log request. Replay-guarded, timestamp-windowed, fail-closed —
 * the same trust level as the signed deploy push (which already permits
 * arbitrary file writes + service restarts).
 *
 * AUTO-HEAL:
 * - In-process: if the awtsmoos service is up, the tunnel is up.
 * - systemd Restart=always restarts the service (and the tunnel with it).
 * - VM-side watchdog (cron): polls /hetzner/health every 2 min; on
 *   repeated failure triggers a signed restart and alerts.
 *
 * Every exec is audit-logged (command, exit code, duration, timestamp) —
 * never the output (which may contain sensitive data).
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const importSign = require('../../social/helper/routes/packed/importSign.js');

const EXEC_TIMEOUT_MS = 120000;
const EXEC_OUTPUT_MAX = 1024 * 1024; // 1 MB
const ALLOWED_LOGS = {
	'nginx-error': '/var/log/nginx/error.log',
	'nginx-access': '/var/log/nginx/access.log',
};

function dbRoot() {
	return process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
}

function tunnelIdentity() {
	let host = 'unknown';
	try { host = require('os').hostname(); } catch (_) { /* ignore */ }
	return { id: `hetzner-tunnel@${host}`, host };
}

function audit(entry) {
	try {
		const p = path.join(dbRoot(), 'socialPacked', 'hetzner-tunnel-audit.log');
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.appendFileSync(p, JSON.stringify({ at: Date.now(), ...entry }) + '\n');
	} catch (_) { /* best effort */ }
}

function json(obj) {
	return { mimeType: 'application/json', response: Buffer.from(JSON.stringify({ BH: 'B"H', ...obj })) };
}

// POST bodies arrive via info.paramKinds.POST or info.$_POST (framework).
function postBody(info) {
	return (info && (info.paramKinds?.POST || info.$_POST)) || {};
}

function checkSignature(info, op, payloadHash) {
	const body = postBody(info);
	const sig = String(body.sig || '');
	if (!sig) return { ok: false, error: 'FORBIDDEN', message: 'Hetzner tunnel auth required: Ed25519 sig.' };
	const ts = body.ts;
	const tchk = importSign.checkTimestamp(ts);
	if (!tchk.ok) return { ok: false, error: 'FORBIDDEN', message: 'Signature timestamp invalid or stale.' };
	const rchk = importSign.checkReplay(String(sig), ts);
	if (!rchk.ok) return { ok: false, error: 'FORBIDDEN', message: 'Signature replay detected.' };
	const vchk = importSign.verifySignature({ ts, op, heichelId: '', payloadHash }, String(sig));
	if (!vchk.ok) return { ok: false, error: 'FORBIDDEN', message: 'Invalid tunnel signature.' };
	return { ok: true };
}

function runCommand(command, cwd, timeoutMs) {
	return new Promise((resolve) => {
		const timeout = Math.min(Math.max(Number(timeoutMs) || 30000, 1000), EXEC_TIMEOUT_MS);
		const t0 = Date.now();
		execFile('bash', ['-c', String(command)], {
			timeout,
			cwd: cwd || '/mnt/HC_Volume_102267213/git/awtsmoos.com',
			maxBuffer: EXEC_OUTPUT_MAX,
		}, (error, stdout, stderr) => {
			resolve({
				stdout: String(stdout || '').slice(0, EXEC_OUTPUT_MAX),
				stderr: String(stderr || '').slice(0, EXEC_OUTPUT_MAX),
				exitCode: error && typeof error.code === 'number' ? error.code : (error ? 1 : 0),
				timedOut: !!(error && error.killed),
				durationMs: Date.now() - t0,
			});
		});
	});
}

async function registerHetznerTunnel(info) {
	// -- health (public; the watchdog polls this) --------------------------------
	await info.use('hetzner/health', async () => {
		let serviceInfo = {};
		try {
			serviceInfo = {
				tunnelId: tunnelIdentity().id,
				uptimeSec: Math.round(process.uptime()),
				memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
				node: process.version,
			};
		} catch (_) { /* ignore */ }
		return json({ ok: true, tunnel: 'hetzner', ...serviceInfo });
	});

	// -- exec (signed commandRun) --------------------------------------------------
	await info.use('hetzner/exec', async () => {
		const body = postBody(info);
		const command = String(body.command || '');
		const cwd = String(body.cwd || '');
		const payloadHash = String(body.payloadHash || '');
		if (payloadHash !== importSign.sha256hex(command + ':' + cwd)) {
			return json({ ok: false, error: 'SIG_PAYLOAD_MISMATCH' });
		}
		const auth = checkSignature(info, 'hetzner/exec', payloadHash);
		if (!auth.ok) return json(auth);
		if (!command.trim()) return json({ ok: false, error: 'NO_COMMAND' });
		const result = await runCommand(command, cwd, body.timeoutMs);
		audit({ op: 'exec', command: command.slice(0, 300), cwd: cwd.slice(0, 200), exitCode: result.exitCode, durationMs: result.durationMs });
		return json({ ok: true, ...result });
	});

	// -- readlog (signed) ------------------------------------------------------------
	await info.use('hetzner/readlog', async () => {
		const body = postBody(info);
		const name = String(body.name || '');
		const lines = Math.min(Math.max(Number(body.lines) || 100, 1), 2000);
		const payloadHash = String(body.payloadHash || '');
		if (payloadHash !== importSign.sha256hex(name + ':' + lines)) {
			return json({ ok: false, error: 'SIG_PAYLOAD_MISMATCH' });
		}
		const auth = checkSignature(info, 'hetzner/readlog', payloadHash);
		if (!auth.ok) return json(auth);
		const runTail = (file) => new Promise((resolve) => {
			execFile('tail', ['-n', String(lines), file], { timeout: 10000, maxBuffer: EXEC_OUTPUT_MAX }, (error, stdout, stderr) => {
				resolve({ ok: !error, output: String(stdout || ''), error: error ? String(stderr || error.message).slice(0, 500) : null });
			});
		});
		let out;
		if (name === 'awtsmoos-journal') {
			out = await new Promise((resolve) => {
				execFile('journalctl', ['--user', '-u', 'awtsmoos', '-n', String(lines), '--no-pager'], { timeout: 15000, maxBuffer: EXEC_OUTPUT_MAX }, (error, stdout, stderr) => {
					resolve({ ok: !error, output: String(stdout || ''), error: error ? String(stderr || error.message).slice(0, 500) : null });
				});
			});
		} else if (name === 'deploy-api') {
			out = await runTail(path.join(dbRoot(), 'socialPacked', 'deploy-api.log'));
		} else if (name === 'tunnel-audit') {
			out = await runTail(path.join(dbRoot(), 'socialPacked', 'hetzner-tunnel-audit.log'));
		} else if (ALLOWED_LOGS[name]) {
			out = await runTail(ALLOWED_LOGS[name]);
		} else {
			return json({ ok: false, error: 'UNKNOWN_LOG', allowed: Object.keys(ALLOWED_LOGS).concat(['awtsmoos-journal', 'deploy-api', 'tunnel-audit']) });
		}
		audit({ op: 'readlog', name, lines });
		return json({ ok: true, name, ...out });
	});
}

module.exports = { registerHetznerTunnel };
