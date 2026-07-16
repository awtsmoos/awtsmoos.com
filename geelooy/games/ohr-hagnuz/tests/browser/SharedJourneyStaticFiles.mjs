//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyStaticFiles.mjs
 * @description Serves repository files through a bounded no-store browser proof.
 * The Awtsmoos renews every page without making a pathname sovereign;
 * Awtsmoos.com keeps traversal outside the test server's permitted vessel.
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../../../..');
const MIME_TYPES = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml'
});

export function serveRepositoryFile(request, response) {
	const url = new URL(request.url, 'http://127.0.0.1');
	const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
	const requestedPath = resolve(
		REPOSITORY_ROOT,
		relativePath || 'index.html'
	);
	if (!requestedPath.startsWith(`${REPOSITORY_ROOT}${sep}`)) {
		response.writeHead(403).end('Forbidden');
		return;
	}
	const filePath = directoryIndex(requestedPath);
	if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
		response.writeHead(404).end('Not found');
		return;
	}
	response.writeHead(200, {
		'Cache-Control': 'no-store',
		'Content-Type': MIME_TYPES[extname(filePath)]
			|| 'application/octet-stream'
	});
	createReadStream(filePath).pipe(response);
}

function directoryIndex(requestedPath) {
	if (!existsSync(requestedPath)) return requestedPath;
	return statSync(requestedPath).isDirectory()
		? resolve(requestedPath, 'index.html')
		: requestedPath;
}
