// B"H
// VM-side Drive service upload: signs the request with the VM's Ed25519 key
// and PUTs a file to the Drive streaming endpoint using serviceAuth headers.
// No user session needed — the tunnel's own key is the authentication.
//
// Usage:
//   node scripts/driveServiceUpload.mjs \
//     --alias <aliasId> --path <drive/path/file.png> --file <local.png> \
//     [--visibility public|private] [--mime image/png] [--key deploy|import]
//
// Prints the public URL on success.
import { readFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API_BASE = process.env.AWTSMOOS_API_BASE || 'https://awtsmoos.com';

function arg(name, def = null) {
	const i = process.argv.indexOf('--' + name);
	if (i === -1) return def;
	return process.argv[i + 1] ?? def;
}

function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object' && !(value instanceof Buffer)) {
		const out = {};
		for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
		return out;
	}
	return value;
}

function b64urlEncode(buf) {
	return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function main() {
	const alias = arg('alias');
	const drivePath = arg('path');
	const localFile = arg('file');
	const visibility = arg('visibility', 'public');
	const mime = arg('mime', 'image/png');
	const keyName = arg('key', 'deploy');

	if (!alias || !drivePath || !localFile) {
		console.error('Missing --alias, --path, or --file');
		process.exit(1);
	}

	const keyPath = join(homedir(), '.awtsmoos', 'secure', keyName === 'import' ? 'import-signing-key' : 'deploy-signing-key');
	const privPem = readFileSync(keyPath, 'utf8');
	const bytes = readFileSync(localFile);

	// Sign the service envelope: op + claims bind this signature to Drive + this alias.
	const ts = Math.floor(Date.now() / 1000);
	const op = 'drive';
	const claims = { aliasId: alias };
	const canonical = Buffer.from(JSON.stringify(sortKeys({ v: 1, ts, op, claims })), 'utf8');
	const sig = sign(null, canonical, createPrivateKey(privPem)).toString('base64');

	const url = `${API_BASE}/api/social/drive/${encodeURIComponent(alias)}/stream/${drivePath.split('/').map(encodeURIComponent).join('/')}`;
	const idempotencyKey = `vm-service-upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

	console.log(`Uploading ${bytes.length} bytes -> ${url}`);
	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			'content-type': mime,
			'idempotency-key': idempotencyKey,
			'x-drive-visibility': visibility,
			'x-drive-cache-policy': 'immutable',
			'x-awtsmoos-service-ts': String(ts),
			'x-awtsmoos-service-op': op,
			'x-awtsmoos-service-claims': b64urlEncode(Buffer.from(JSON.stringify(claims), 'utf8')),
			'x-awtsmoos-service-sig': sig,
		},
		body: bytes,
	});

	const text = await res.text();
	console.log(`HTTP ${res.status}`);
	console.log(text.slice(0, 500));

	if (res.status === 200 || res.status === 201) {
		// B"H (2026-10-13, Yaakov's law): output content hash so callers can
		// append ?v=hash for automatic cache busting when files change.
		const { createHash } = await import('node:crypto');
		const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
		const publicUrl = `${API_BASE}/api/social/drive/public/${encodeURIComponent(alias)}/${drivePath.split('/').map(encodeURIComponent).join('/')}`;
		console.log(`\nPUBLIC URL: ${publicUrl}`);
		console.log(`CONTENT HASH: ${hash}`);
		console.log(`VERSIONED URL: ${publicUrl}?v=${hash}`);
	} else {
		process.exit(2);
	}
}

main().catch(e => { console.error('FATAL', e); process.exit(3); });
