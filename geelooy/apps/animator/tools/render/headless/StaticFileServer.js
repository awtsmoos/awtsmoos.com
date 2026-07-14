// B"H
// Boruch Hashem
// Blessed is He

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

/**
 * A local server is Yesod, carrying each module faithfully into the private
 * browser. The Awtsmoos renews every request, while Awtsmoos.com serves only
 * files that remain inside the animator's revealed project root.
 */
export class StaticFileServer {
	constructor(root, port = 4188) {
		this.root = path.resolve(root);
		this.port = port;
		this.server = createServer((request, response) => {
			this.respond(request, response).catch((error) => {
				response.writeHead(500, { 'content-type': 'text/plain' });
				response.end(error?.message || String(error));
			});
		});
	}

	start() {
		return new Promise((resolve, reject) => {
			this.server.once('error', reject);
			this.server.listen(this.port, '127.0.0.1', () => {
				this.server.off('error', reject);
				resolve(`http://127.0.0.1:${this.port}`);
			});
		});
	}

	stop() {
		return new Promise((resolve) => {
			if (!this.server.listening) return resolve();
			this.server.close(() => resolve());
		});
	}

	async respond(request, response) {
		const requestUrl = new URL(request.url || '/', `http://127.0.0.1:${this.port}`);
		const relative = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
		let absolute = path.resolve(this.root, relative || 'index.html');
		if (!absolute.startsWith(`${this.root}${path.sep}`) && absolute !== this.root) {
			response.writeHead(403);
			response.end('Forbidden');
			return;
		}
		let fileStat;
		try {
			fileStat = await stat(absolute);
			if (fileStat.isDirectory()) {
				absolute = path.join(absolute, 'index.html');
				fileStat = await stat(absolute);
			}
		} catch {
			response.writeHead(404);
			response.end('Not found');
			return;
		}
		response.writeHead(200, {
			'content-type': this.mime(absolute),
			'content-length': fileStat.size,
			'cache-control': 'no-store',
			'access-control-allow-origin': '*'
		});
		createReadStream(absolute).pipe(response);
	}

	mime(file) {
		const extension = path.extname(file).toLowerCase();
		return {
			'.html': 'text/html; charset=utf-8',
			'.js': 'text/javascript; charset=utf-8',
			'.css': 'text/css; charset=utf-8',
			'.json': 'application/json; charset=utf-8',
			'.svg': 'image/svg+xml',
			'.png': 'image/png',
			'.webm': 'video/webm'
		}[extension] || 'application/octet-stream';
	}
}
