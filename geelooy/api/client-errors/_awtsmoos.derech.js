// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file _awtsmoos.derech.js
 * @description
 * Client error intake for the Awtsmoos reader. Post pages report window.onerror /
 * unhandledrejection payloads here so client-side failures can be READ from the
 * server side (our browser automation has no DevTools access). Errors append as
 * JSONL to geelooy/.data/client-errors.log; GET /recent returns the newest
 * entries for querying. Standing law: no single JS failure may blank the reader,
 * and no failure may stay invisible.
 */

const fs = require('fs');
const path = require('path');

const MAX_MESSAGE = 2000;
const MAX_STACK = 4000;
const MAX_FILE = 500;
const MAX_URL = 500;
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const MAX_RECENT = 200;

// B"H — simple per-IP rate limit so a client error loop cannot flood the log.
const rateBuckets = new Map();
function rateLimited(ip) {
	const now = Date.now();
	let bucket = rateBuckets.get(ip);
	if (!bucket || now > bucket.resetAt) {
		bucket = { count: 0, resetAt: now + 60000 };
		rateBuckets.set(ip, bucket);
	}
	bucket.count += 1;
	if (rateBuckets.size > 5000) {
		rateBuckets.clear();
	}
	return bucket.count > 60;
}

function dataDir() {
	return path.join(process.env.__awtsdir || process.cwd(), 'geelooy', '.data');
}

function logPath() {
	return path.join(dataDir(), 'client-errors.log');
}

function cleanText(value, limit) {
	return String(value == null ? '' : value)
		.replace(/[\u0000-\u001f\u007f]/g, ' ')
		.trim()
		.slice(0, limit);
}

function parseBody(post) {
	if (!post) {
		return {};
	}
	if (post.__raw_body__) {
		try {
			return JSON.parse(String(post.__raw_body__));
		} catch (e) {
			return {};
		}
	}
	return post;
}

function rotateIfNeeded(target) {
	try {
		const stat = fs.statSync(target);
		if (stat.size > MAX_LOG_BYTES) {
			fs.renameSync(target, target + '.1');
		}
	} catch (e) {
		// Missing file or rotation failure: appending below will create/retry.
	}
}

function appendError(entry) {
	const dir = dataDir();
	fs.mkdirSync(dir, { recursive: true });
	const target = logPath();
	rotateIfNeeded(target);
	fs.appendFileSync(target, JSON.stringify(entry) + '\n', 'utf8');
}

function readRecent(limit) {
	const target = logPath();
	let text = '';
	try {
		text = fs.readFileSync(target, 'utf8');
	} catch (e) {
		return [];
	}
	const lines = text.split('\n').filter(Boolean);
	const out = [];
	for (let i = lines.length - 1; i >= 0 && out.length < limit; i--) {
		try {
			out.push(JSON.parse(lines[i]));
		} catch (e) {
			// Skip corrupt lines; never fail the query.
		}
	}
	return out;
}

async function crownClientErrorRoutes($i) {
	await $i.use({
		'/': async () => {
			if ($i.request.method === 'POST') {
				const ip = ($i.request.headers && ($i.request.headers['x-forwarded-for'] || '')) ||
					($i.request.socket && $i.request.socket.remoteAddress) || 'unknown';
				if (rateLimited(String(ip).split(',')[0].trim())) {
					return { ok: false, error: 'rate_limited', status: 429 };
				}
				const body = parseBody($i.$_POST);
				const entry = {
					at: new Date().toISOString(),
					message: cleanText(body.message, MAX_MESSAGE),
					file: cleanText(body.file, MAX_FILE),
					line: Number(body.line) || 0,
					col: Number(body.col) || 0,
					stack: cleanText(body.stack, MAX_STACK),
					url: cleanText(body.url, MAX_URL),
					userAgent: cleanText(body.userAgent, 300),
					kind: cleanText(body.kind, 40) || 'error'
				};
				if (!entry.message && !entry.stack) {
					return { ok: false, error: 'empty_report', status: 400 };
				}
				try {
					appendError(entry);
				} catch (e) {
					return { ok: false, error: 'persist_failed', status: 500 };
				}
				return { ok: true };
			}
			return { ok: true, service: 'Awtsmoos Client Error Intake', BH: 'B"H' };
		},
		'/recent': async () => {
			let limit = 50;
			try {
				const q = ($i.request.query || {});
				if (q.limit != null) {
					limit = Math.max(1, Math.min(MAX_RECENT, parseInt(q.limit, 10) || 50));
				}
			} catch (e) {
				// Keep default limit.
			}
			const errors = readRecent(limit);
			return { ok: true, count: errors.length, errors };
		}
	});
}

module.exports = {
	dynamicRoutes: crownClientErrorRoutes
};
