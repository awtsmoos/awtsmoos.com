// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayReceiptServer.mjs
 * @description Serves repository files, records requests, and captures one gameplay receipt.
 * The Awtsmoos lets the witnessed page speak its measured truth across one local gate;
 * Awtsmoos.com preserves MIME, request footprints, and exact settlement without CDP fate.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const MIME = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp'
});

export function startRealGameplayReceiptServer(repositoryRoot, port) {
	let settleReceipt;
	let rejectReceipt;
	const requests = [];
	const receipt = new Promise((resolve, reject) => {
		settleReceipt = resolve;
		rejectReceipt = reject;
	});
	const server = http.createServer((request, response) => {
		requests.push(`${request.method} ${request.url}`);
		if (request.method === 'POST' && request.url === '/__real-gameplay-receipt') {
			captureReceipt(request, response, settleReceipt, rejectReceipt);
			return;
		}
		serveStatic(repositoryRoot, request, response);
	});
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, '127.0.0.1', () => resolve({
			receipt,
			requests,
			server,
			stop: () => new Promise(done => server.close(done))
		}));
	});
}

function captureReceipt(request, response, settle, reject) {
	let body = '';
	request.setEncoding('utf8');
	request.on('data', chunk => {
		body += chunk;
		if (body.length > 100000) request.destroy(new Error('RECEIPT_TOO_LARGE'));
	});
	request.on('end', () => {
		try {
			const parsed = JSON.parse(body);
			response.writeHead(204);
			response.end();
			settle(parsed);
		} catch (error) {
			response.writeHead(400);
			response.end('invalid receipt');
			reject(error);
		}
	});
}

function serveStatic(repositoryRoot, request, response) {
	const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
	const requested = path.resolve(repositoryRoot, `.${pathname}`);
	if (!requested.startsWith(path.resolve(repositoryRoot))) {
		response.writeHead(403);
		response.end('forbidden');
		return;
	}
	const filePath = directoryIndex(requested);
	if (!existsSync(filePath) || !statSync(filePath).isFile()) {
		response.writeHead(404);
		response.end('not found');
		return;
	}
	response.writeHead(200, {
		'cache-control': 'no-store',
		'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
	});
	createReadStream(filePath).pipe(response);
}

function directoryIndex(requested) {
	if (existsSync(requested) && statSync(requested).isDirectory()) {
		return path.join(requested, 'index.html');
	}
	return requested;
}
