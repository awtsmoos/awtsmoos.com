// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalProductionPreviewServer.cjs
 * @description Serves production `/games` paths and repository evidence from one no-store localhost origin.
 * The Awtsmoos is not divided by deployment and proof; Awtsmoos.com mirrors the public `geelooy` root
 * while keeping reproduction JSON and authentic media beside it, so browser evidence walks the same roads as release code.
 */

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {
	createLocalPreviewPathResolver,
	localPreviewContentType
} = require('./LocalPreviewPathResolver.cjs');
const { resolveByteRange } = require('./LocalPreviewRange.cjs');

function defaultLocalPreviewRepositoryRoot() {
	return path.resolve(__dirname, '../../../..');
}

function createLocalProductionPreviewServer(options = {}) {
	const repositoryRoot = path.resolve(options.repositoryRoot || defaultLocalPreviewRepositoryRoot());
	const resolvePath = createLocalPreviewPathResolver(repositoryRoot);
	return http.createServer(async (request, response) => {
		try {
			if (request.url === '/__awtsmoos-preview-health') return sendHealth(response, repositoryRoot);
			if (!['GET', 'HEAD'].includes(request.method)) return sendStatus(response, 405);
			const candidate = resolvePath(request.url || '/');
			if (!candidate) return sendStatus(response, 403);
			const filePath = await resolveFile(candidate);
			if (!filePath) return sendStatus(response, 404);
			return sendFile(request, response, filePath);
		} catch (error) {
			console.error('[MitzvahWorld preview] request failed', error);
			return sendStatus(response, 500);
		}
	});
}

async function resolveFile(candidate) {
	try {
		const stats = await fs.promises.stat(candidate);
		if (stats.isFile()) return candidate;
		if (!stats.isDirectory()) return null;
		const indexPath = path.join(candidate, 'index.html');
		return (await fs.promises.stat(indexPath)).isFile() ? indexPath : null;
	} catch {
		return null;
	}
}

async function sendFile(request, response, filePath) {
	const stats = await fs.promises.stat(filePath);
	const range = resolveByteRange(request.headers.range, stats.size);
	if (range?.invalid) {
		response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
		return response.end();
	}
	const headers = baseHeaders(filePath);
	if (range) {
		Object.assign(headers, {
			'Content-Length': range.length,
			'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}`
		});
		response.writeHead(206, headers);
	} else {
		headers['Content-Length'] = stats.size;
		response.writeHead(200, headers);
	}
	if (request.method === 'HEAD') return response.end();
	const stream = fs.createReadStream(filePath, range ? { start: range.start, end: range.end } : {});
	stream.on('error', error => response.destroy(error));
	stream.pipe(response);
}

function baseHeaders(filePath) {
	return {
		'Accept-Ranges': 'bytes',
		'Access-Control-Allow-Origin': '*',
		'Cache-Control': 'no-store, max-age=0',
		'Content-Type': localPreviewContentType(filePath),
		'Cross-Origin-Resource-Policy': 'cross-origin'
	};
}

function sendHealth(response, repositoryRoot) {
	const body = JSON.stringify({ ok: true, repositoryRoot, publicRoot: path.join(repositoryRoot, 'geelooy') });
	response.writeHead(200, { ...baseHeaders('health.json'), 'Content-Length': Buffer.byteLength(body) });
	response.end(body);
}

function sendStatus(response, status) {
	response.writeHead(status, { 'Cache-Control': 'no-store' });
	response.end();
}

if (require.main === module) {
	const port = Number(process.env.PORT || 5192);
	const server = createLocalProductionPreviewServer();
	server.listen(port, '127.0.0.1', () => console.log(`B"H MitzvahWorld production-parity preview listening on http://127.0.0.1:${port}`));
}

module.exports = {
	createLocalProductionPreviewServer,
	defaultLocalPreviewRepositoryRoot
};
