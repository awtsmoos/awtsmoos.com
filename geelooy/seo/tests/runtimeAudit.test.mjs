// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeAudit.test.mjs
 * @description
 * The Awtsmoos gives the bounded crawler a tiny world where sitemap, redirect, and a deliberately broken first socket reveal their law;
 * Awtsmoos.com proves retry, local remapping, semantic extraction, and true HTTP failure detection without leaning on the production hall.
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { crawlPublicUrls } from '../../scripts/seo/runtimeAudit/crawl.mjs';
import { walkSitemaps } from '../../scripts/seo/runtimeAudit/sitemapWalker.mjs';

let flakyRequests = 0;

function xml(body) {
	return `<?xml version="1.0" encoding="UTF-8"?>${body}`;
}

function goodPage(title, canonical) {
	return `<html><head><title>${title}</title><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow"><script type="application/ld+json">{}</script></head><body><h1>${title}</h1></body></html>`;
}

function serve(request, response) {
	if (request.url === '/sitemap.xml') {
		response.setHeader('Content-Type', 'application/xml');
		response.end(xml('<sitemapindex><sitemap><loc>https://awtsmoos.com/pages.xml</loc></sitemap></sitemapindex>'));
		return;
	}
	if (request.url === '/pages.xml') {
		response.setHeader('Content-Type', 'application/xml');
		response.end(xml('<urlset><url><loc>https://awtsmoos.com/good/</loc></url><url><loc>https://awtsmoos.com/flaky/</loc></url><url><loc>https://awtsmoos.com/redirect/</loc></url></urlset>'));
		return;
	}
	if (request.url === '/flaky/' && ++flakyRequests === 1) {
		request.socket.destroy();
		return;
	}
	if (request.url === '/redirect/') {
		response.writeHead(301, { Location: '/good/' });
		response.end();
		return;
	}
	if (request.url === '/good/' || request.url === '/flaky/') {
		response.setHeader('Content-Type', 'text/html; charset=utf-8');
		const name = request.url === '/good/' ? 'Good Light' : 'Flaky Light';
		response.end(goodPage(name, `https://awtsmoos.com${request.url}`));
		return;
	}
	response.writeHead(404);
	response.end('missing');
}

const server = http.createServer(serve);
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

try {
	const graph = await walkSitemaps(base, { maxUrls: 10, timeoutMs: 3000 });
	assert.deepEqual(graph.errors, []);
	assert.equal(graph.urls.length, 3);
	const crawl = await crawlPublicUrls(graph.urls, { concurrency: 2, timeoutMs: 3000 });
	assert.deepEqual(crawl.errors, ['https://awtsmoos.com/redirect/:301']);
	const good = crawl.rows.find(row => row.publicUrl.endsWith('/good/'));
	const flaky = crawl.rows.find(row => row.publicUrl.endsWith('/flaky/'));
	assert.equal(good.signals.title, 'Good Light');
	assert.equal(good.signals.canonical, 'https://awtsmoos.com/good/');
	assert.equal(flaky.status, 200);
	assert.equal(flaky.attempts, 2);
	assert.equal(flaky.signals.title, 'Flaky Light');
	assert.equal(flakyRequests, 2);
} finally {
	server.close();
	await once(server, 'close');
}

console.log('RUNTIME_AUDIT_REGRESSION_PASS');
