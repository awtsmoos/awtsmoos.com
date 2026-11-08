// B"H — Bulk upload + bulk update client for awtsmoos.com (Node only, no Python).
// Replaces import-client.cjs and sim-publish-driver.sh.
// Auth: Ed25519 signature over canonical {v,ts,op,heichelId,payloadHash}
// (private key ONLY at ~/.awtsmoos/secure/import-signing-key, chmod 600),
// or an account bearer via AWTSMOOS_BEARER (session/bearer, no keys).
// Every failure prints the server's error body (E3's lesson: never a bare "failed").
//
// Usage:
//   node bulk-upload.cjs stage <dir> [--heichel <id>] [--dry-run]
//     dir holds one *.json post file per post (+ optional series.json),
//     or updates.jsonl for an update set. Builds manifest.json,
//     tarballs, chunks (4 MB), uploads with per-chunk sha256, resumes
//     from the server's receivedChunks on any failure.
//   node bulk-upload.cjs start <uploadId> [--heichel <id>] [--dry-run]
//   node bulk-upload.cjs status <jobId> [--wait [ms]]
//   node bulk-upload.cjs receipts <jobId> [--page N]
//   node bulk-upload.cjs resume <jobId>
//   node bulk-upload.cjs retry-failed <jobId>
//   node bulk-upload.cjs update-job <file-or-uploadId> [--heichel <id>] [--dry-run] [--verify]
//   node bulk-upload.cjs series-upsert <file> [--heichel <id>]
//   node bulk-upload.cjs series-rebuild <seriesId> [--heichel <id>]
//   node bulk-upload.cjs verify <jobId|uploadId>
//   node bulk-upload.cjs cancel <jobId>
//   node bulk-upload.cjs jobs
// Env: AWTSMOOS_BASE (default https://awtsmoos.com/api/social/packed/import),
//      AWTSMOOS_BEARER (account bearer; when set, signing is skipped).

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = (process.env.AWTSMOOS_BASE || 'https://awtsmoos.com/api/social/packed/import').replace(/\/$/, '');
const KEY_PATH = path.join(os.homedir(), '.awtsmoos/secure/import-signing-key');
const CHUNK_BYTES = 4 * 1024 * 1024;

function sha256hex(s) {
	return crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');
}
function sha256buf(buf) {
	return crypto.createHash('sha256').update(buf).digest('hex');
}
function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object') {
		const out = {};
		for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
		return out;
	}
	return value;
}
function canonicalBytes({ ts, op, heichelId, payloadHash }) {
	return Buffer.from(JSON.stringify(sortKeys({
		v: 1, ts: Number(ts), op: String(op || ''), heichelId: String(heichelId || ''), payloadHash: String(payloadHash || ''),
	})), 'utf8');
}
function sign(op, heichelId, payloadHash) {
	const ts = Math.floor(Date.now() / 1000);
	const priv = crypto.createPrivateKey(fs.readFileSync(KEY_PATH, 'utf8'));
	const sig = crypto.sign(null, canonicalBytes({ ts, op, heichelId, payloadHash }), priv);
	return { ts, sig: sig.toString('base64') };
}
function bearerHeaders() {
	const headers = { 'content-type': 'application/json', 'x-agent-identity': 'bulk-upload-cli', 'x-agent-kind': 'bulk-upload', 'x-agent-source': 'bulk-upload.cjs' };
	if (process.env.AWTSMOOS_BEARER) headers.authorization = 'Bearer ' + process.env.AWTSMOOS_BEARER;
	return headers;
}
function signedBody(op, heichelId, payloadHash, fields) {
	if (process.env.AWTSMOOS_BEARER) return { op, heichelId, payloadHash, ...fields };
	const { ts, sig } = sign(op, heichelId, payloadHash);
	return { ts, sig, op, heichelId, payloadHash, ...fields };
}
async function request(method, url, body) {
	const res = await fetch(url, { method, headers: bearerHeaders(), body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await res.text();
	let json = null;
	try { json = JSON.parse(text); } catch (_) { /* raw text */ }
	return { http: res.status, json, text: json ? undefined : text.slice(0, 2000) };
}
function printResult(label, r) {
	const body = r.json ?? r.text;
	console.log(JSON.stringify({ label, http: r.http, body }, null, 2));
	if (r.http >= 400) process.exitCode = 1;
	return r;
}
function fail(message, detail) {
	console.error('ERROR: ' + message);
	if (detail !== undefined) console.error(JSON.stringify(detail, null, 2));
	process.exit(1);
}
function opt(name, def) {
	const idx = process.argv.indexOf('--' + name);
	if (idx < 0) return def;
	const value = process.argv[idx + 1];
	return value !== undefined && !value.startsWith('--') ? value : true;
}
function hasFlag(name) {
	return process.argv.includes('--' + name);
}
function contentHashOf(post) {
	const canon = JSON.stringify(sortKeys(post));
	return sha256hex(canon);
}

async function stageDir(dir, heichelId, dryRun) {
	const stat = fs.statSync(dir);
	if (!stat.isDirectory()) fail('stage dir must be a directory: ' + dir);
	const updatesFile = path.join(dir, 'updates.jsonl');
	const isUpdates = fs.existsSync(updatesFile);
	let manifest;
	let files = [];
	if (isUpdates) {
		const lines = fs.readFileSync(updatesFile, 'utf8').split('\n').filter(l => l.trim());
		let totalBytes = 0;
		for (const line of lines) totalBytes += Buffer.byteLength(line);
		manifest = { kind: 'updates', files: [{ file: 'updates.jsonl' }], totalUpdates: lines.length, totalBytes };
		files = ['updates.jsonl'];
	} else {
		const names = fs.readdirSync(dir).filter(n => n.endsWith('.json') && n !== 'manifest.json' && n !== 'series.json').sort();
		if (!names.length) fail('no post *.json files in ' + dir);
		const entries = [];
		let totalBytes = 0;
		for (const name of names) {
			const full = path.join(dir, name);
			const size = fs.statSync(full).size;
			if (size > 5 * 1024 * 1024) fail('post over the 5 MB per-post cap: ' + name + ' (' + size + ' bytes)');
			const post = JSON.parse(fs.readFileSync(full, 'utf8'));
			const postId = String(post.postId || post.id || name.replace(/\.json$/, ''));
			entries.push({ file: name, postId, heichelId: post.heichelId || heichelId, contentHash: contentHashOf(post) });
			totalBytes += size;
		}
		manifest = { files: entries, totalPosts: entries.length, totalBytes };
		files = names;
		if (fs.existsSync(path.join(dir, 'series.json'))) files.push('series.json');
	}
	const manifestPath = path.join(dir, 'manifest.json');
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
	if (dryRun) {
		console.log(JSON.stringify({ dryRun: true, dir, kind: isUpdates ? 'updates' : 'posts', manifest }, null, 2));
		return;
	}
	const uploadId = crypto.randomBytes(16).toString('hex');
	const tarPath = path.join(os.tmpdir(), 'bulk-upload-' + uploadId + '.tar.gz');
	const tarFiles = ['manifest.json', ...files];
	execFileSync('tar', ['-czf', tarPath, '-C', dir, ...tarFiles], { stdio: 'inherit' });
	const tar = fs.readFileSync(tarPath);
	const totalChunks = Math.ceil(tar.length / CHUNK_BYTES);
	console.log(JSON.stringify({ uploadId, kind: isUpdates ? 'updates' : 'posts', totalPosts: manifest.totalPosts || manifest.totalUpdates, totalBytes: tar.length, totalChunks }));
	// Resume: ask the server which chunk indexes it already has (a
	// re-run after a drop). The server reports the exact received
	// indexes — a bare count is not enough, because chunks can arrive
	// out of order and a count-only resume would skip a hole, then
	// print "staged: true" for an upload the server never assembled.
	let received = new Set();
	try {
		const probe = await request('GET', BASE + '/bulk/stage?uploadId=' + encodeURIComponent(uploadId));
		if (probe.json && probe.json.success) {
			const indexes = probe.json.success.receivedIndexes;
			if (Array.isArray(indexes)) {
				for (const i of indexes) received.add(Number(i));
			} else {
				for (let i = 0; i < (probe.json.success.receivedChunks || 0); i++) received.add(i);
			}
		}
	} catch (_) { /* fresh upload */ }
	let lastComplete = false;
	for (let i = 0; i < totalChunks; i++) {
		if (received.has(i)) continue;
		const chunk = tar.subarray(i * CHUNK_BYTES, Math.min(tar.length, (i + 1) * CHUNK_BYTES));
		const dataB64 = chunk.toString('base64');
		const chunkSha256 = sha256buf(chunk);
		const payloadHash = sha256hex(uploadId + ':' + i + ':' + dataB64);
		const body = signedBody('bulk/stage', heichelId, payloadHash, { uploadId, chunkIndex: i, totalChunks, data: dataB64, chunkSha256 });
		const r = await request('POST', BASE + '/bulk/stage', body);
		if (r.http >= 400 || !r.json || !r.json.success) {
			printResult('stage chunk ' + i, r);
			fail('stage failed at chunk ' + i + ' of ' + totalChunks + ' — re-run stage with the same dir to resume (uploadId ' + uploadId + ' is printed above only after the first chunk; re-run to get a fresh uploadId if this was chunk 0).');
		}
		lastComplete = !!r.json.success.complete;
		if (i % 25 === 24 || i === totalChunks - 1) console.log(JSON.stringify({ uploadId, chunk: i + 1, totalChunks, complete: lastComplete }));
	}
	// Never print "staged: true" for an upload the server did not
	// assemble. A re-run whose chunks were all already received uploads
	// nothing, so re-probe before declaring success.
	if (!lastComplete && totalChunks > 0) {
		const probe = await request('GET', BASE + '/bulk/stage?uploadId=' + encodeURIComponent(uploadId)).catch(() => null);
		lastComplete = !!(probe && probe.json && probe.json.success && probe.json.success.complete);
	}
	if (!lastComplete) fail('stage incomplete for uploadId ' + uploadId + ' — the server did not assemble the tarball; re-run stage with the same dir to resume.');
	try { fs.unlinkSync(tarPath); } catch (_) {}
	console.log(JSON.stringify({ uploadId, staged: true, next: 'node bulk-upload.cjs start ' + uploadId + ' --heichel ' + heichelId }, null, 2));
}

async function main() {
	const cmd = process.argv[2];
	const arg = process.argv[3];
	const heichelId = String(opt('heichel', 'ikar'));
	const dryRun = hasFlag('dry-run');
	if (!cmd) {
		console.error('Usage: node bulk-upload.cjs <stage|start|status|receipts|resume|retry-failed|update-job|series-upsert|series-rebuild|verify|cancel|jobs> [...]');
		process.exit(1);
	}
	if (cmd === 'stage') {
		if (!arg) fail('stage needs a directory');
		await stageDir(arg, heichelId, dryRun);
		return;
	}
	if (cmd === 'start') {
		if (!arg) fail('start needs an uploadId');
		const r = await request('POST', BASE + '/posts/start', signedBody('posts/start', heichelId, sha256hex(arg), { uploadId: arg, heichelId, dryRun }));
		printResult('start', r);
		return;
	}
	if (cmd === 'status') {
		if (!arg) fail('status needs a jobId');
		const wait = opt('wait', null);
		let url = BASE + '/posts/status?jobId=' + encodeURIComponent(arg);
		if (wait !== null && wait !== true) url += '&wait=1&waitMs=' + encodeURIComponent(String(wait));
		else if (wait === true) url += '&wait=1&waitMs=5000';
		const r = await request('GET', url);
		printResult('status', r);
		return;
	}
	if (cmd === 'receipts') {
		if (!arg) fail('receipts needs a jobId');
		const page = opt('page', '1');
		const r = await request('GET', BASE + '/posts/receipts?jobId=' + encodeURIComponent(arg) + '&page=' + encodeURIComponent(String(page)));
		printResult('receipts', r);
		return;
	}
	if (cmd === 'resume' || cmd === 'retry-failed') {
		if (!arg) fail(cmd + ' needs a jobId');
		const op = cmd === 'resume' ? 'posts/resume' : 'posts/retry-failed';
		const hash = sha256hex((cmd === 'resume' ? 'resume:' : 'retry-failed:') + arg);
		const r = await request('POST', BASE + '/posts/' + cmd, signedBody(op, heichelId, hash, { jobId: arg }));
		printResult(cmd, r);
		return;
	}
	if (cmd === 'update-job') {
		if (!arg) fail('update-job needs a file (updates array JSON) or an uploadId');
		const verify = hasFlag('verify');
		if (/^[A-Za-z0-9_-]{8,64}$/.test(arg) && !fs.existsSync(arg)) {
			const r = await request('POST', BASE + '/posts/update-job', signedBody('posts/update-job', heichelId, sha256hex('update-job:' + arg), { uploadId: arg, heichelId, dryRun, verify }));
			printResult('update-job', r);
			return;
		}
		const updates = JSON.parse(fs.readFileSync(arg, 'utf8'));
		if (!Array.isArray(updates) || !updates.length) fail('updates file must be a non-empty array');
		if (updates.length > 100) fail('inline updates cap is 100 — stage an updates.jsonl dir instead (node bulk-upload.cjs stage <dir-with-updates.jsonl>)');
		const r = await request('POST', BASE + '/posts/update-job', signedBody('posts/update-job', heichelId, sha256hex(JSON.stringify(updates)), { updates, heichelId, dryRun, verify }));
		printResult('update-job', r);
		return;
	}
	if (cmd === 'series-upsert') {
		if (!arg) fail('series-upsert needs a JSON file {seriesId, set:{...}}');
		const input = JSON.parse(fs.readFileSync(arg, 'utf8'));
		const seriesId = String(input.seriesId || input.id || '');
		if (!seriesId) fail('series-upsert file needs seriesId');
		const r = await request('POST', BASE + '/series/upsert', signedBody('posts/series-upsert', heichelId, sha256hex('series-upsert:' + heichelId + ':' + seriesId), { heichelId, ...input }));
		printResult('series-upsert', r);
		return;
	}
	if (cmd === 'series-rebuild') {
		if (!arg) fail('series-rebuild needs a seriesId');
		const r = await request('POST', BASE + '/series/rebuild', signedBody('posts/series-rebuild', heichelId, sha256hex('series-rebuild:' + heichelId + ':' + arg), { heichelId, seriesId: arg }));
		printResult('series-rebuild', r);
		return;
	}
	if (cmd === 'verify') {
		if (!arg) fail('verify needs a jobId or uploadId');
		const isJob = arg.startsWith('postimport_') || arg.startsWith('verify_');
		const body = isJob ? { jobId: arg } : { uploadId: arg };
		const op = 'posts/verify';
		const hash = sha256hex('verify:' + arg);
		const r = await request('POST', BASE + '/posts/verify', signedBody(op, heichelId, hash, body));
		printResult('verify', r);
		return;
	}
	if (cmd === 'cancel') {
		if (!arg) fail('cancel needs a jobId');
		const r = await request('POST', BASE + '/posts/cancel', signedBody('posts/cancel', heichelId, sha256hex('job:' + arg), { job: arg }));
		printResult('cancel', r);
		return;
	}
	if (cmd === 'jobs') {
		const r = await request('GET', BASE + '/posts/jobs');
		printResult('jobs', r);
		return;
	}
	fail('unknown command: ' + cmd);
}

main().catch(error => fail(String((error && error.stack) || error)));
