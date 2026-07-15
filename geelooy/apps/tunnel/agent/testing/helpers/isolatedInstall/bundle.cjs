// B"H
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const Paths = require('./paths.cjs');

/** B"H — The disposable bundle copies every manifest vessel from its true root. */
function createBundleZip(zipPath) {
	const stagingRoot = path.join(Paths.TEMP_ROOT, 'bundle-staging');
	Paths.removeTree(stagingRoot);
	Paths.makeDirectory(stagingRoot);
	const [_version, entryFile, ...files] = Paths.manifestLines();
	for (const filePath of [entryFile, ...files]) copyManifestFile(stagingRoot, filePath);
	Paths.removeTree(zipPath);
	if (compressWithPowerShell(stagingRoot, zipPath)) return zipPath;
	if (compressWithZip(stagingRoot, zipPath)) return zipPath;
	compressWithPython(stagingRoot, zipPath);
	return zipPath;
}

function copyManifestFile(stagingRoot, filePath) {
	const sourcePath = Paths.sourcePathFor(filePath);
	assert.equal(fs.existsSync(sourcePath), true, `manifest source missing: ${filePath}`);
	const destinationPath = path.join(stagingRoot, filePath);
	Paths.makeDirectory(path.dirname(destinationPath));
	fs.copyFileSync(sourcePath, destinationPath);
}

function compressWithPowerShell(stagingRoot, zipPath) {
	const result = spawnSync('powershell', [
		'-NoProfile',
		'-Command',
		`Compress-Archive -Force -Path '${stagingRoot}\\*' -DestinationPath '${zipPath}'`
	], { encoding: 'utf8' });
	return !result.error && result.status === 0;
}

function compressWithZip(stagingRoot, zipPath) {
	const result = spawnSync('zip', ['-qr', zipPath, '.'], {
		cwd: stagingRoot,
		encoding: 'utf8'
	});
	return !result.error && result.status === 0;
}

function compressWithPython(stagingRoot, zipPath) {
	const result = spawnSync('python3', ['-m', 'zipfile', '-c', zipPath, '.'], {
		cwd: stagingRoot,
		encoding: 'utf8'
	});
	assert.equal(result.status, 0, `${result.stdout || ''}${result.stderr || ''}`);
}

function startStaticServer(root) {
	const zipPath = createBundleZip(path.join(Paths.TEMP_ROOT, 'awtsmoos-agent.zip'));
	const [version] = Paths.manifestLines();
	const manifestPath = path.join(Paths.AGENT_ROOT, 'manifest.txt');
	const descriptor = {
		ok: true,
		version,
		manifestSha256: sha256(manifestPath),
		bundles: [{
			name: 'agent',
			url: '/awtsmoos-agent.zip',
			sha256: sha256(zipPath),
			bytes: fs.statSync(zipPath).size
		}]
	};
	const server = http.createServer((request, response) => {
		const url = new URL(request.url, 'http://127.0.0.1');
		if (url.searchParams.has('bundle') || url.pathname === '/api/tunnel/install/bundle-manifest') {
			return sendJson(response, descriptor);
		}
		if (url.pathname === '/awtsmoos-agent.zip' || url.pathname === '/api/tunnel/install/agent.zip') {
			response.writeHead(200, { 'content-type': 'application/zip' });
			return fs.createReadStream(zipPath).pipe(response);
		}
		return sendStatic(root, url.pathname, response);
	});
	return new Promise(resolve => {
		server.listen(0, '127.0.0.1', () => {
			resolve({ server, origin: `http://127.0.0.1:${server.address().port}` });
		});
	});
}

function sha256(filePath) {
	return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sendJson(response, value) {
	response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
	response.end(JSON.stringify(value));
}

function sendStatic(root, pathname, response) {
	const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
	const fullPath = path.resolve(root, relativePath);
	if (!fullPath.startsWith(root) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
		response.writeHead(404);
		return response.end('missing');
	}
	response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
	return fs.createReadStream(fullPath).pipe(response);
}

module.exports = { createBundleZip, startStaticServer };
