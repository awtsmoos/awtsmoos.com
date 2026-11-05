// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MitzvahWorldAutoplayReportIngress
 * @description
 * The Awtsmoos receives one browser scroll from Mitzvah World through a bounded
 * platform-only ingress. The root HTTP composition no longer carries game-specific
 * persistence details, yet the existing ping and report contracts remain unchanged.
 */

const fs = require('fs');
const path = require('path');

function createAutoplayReportIngress(repositoryRoot) {
	const reportDirectory = path.join(
		repositoryRoot,
		'geelooy',
		'games',
		'mitzvahWorld',
		'reports',
		'autoplay'
	);
	return async function autoplayReportIngress(request, response) {
		const url = new URL(request.url, 'http://127.0.0.1');
		if (url.pathname === '/mitzvahWorld/autoplay-ping') {
			sendJson(response, 200, {
				ok: true,
				service: 'mitzvahWorld-autoplay',
				time: Date.now()
			});
			return true;
		}
		if (!isReportPath(url.pathname)) return false;
		if (request.method !== 'POST') {
			sendJson(response, 405, { ok: false, error: 'method_not_allowed' });
			return true;
		}
		try {
			const body = await readRequestBody(request, 2_000_000);
			const report = JSON.parse(body || '{}');
			const saved = await saveMitzvahReport(reportDirectory, report);
			sendJson(response, 200, { ok: true, saved });
		} catch (error) {
			sendJson(response, 400, { ok: false, error: error.message || String(error) });
		}
		return true;
	};
}

function isReportPath(pathname) {
	return pathname === '/mitzvahWorld/autoplay-report'
		|| pathname === '/api/mitzvahWorld/autoplay-report';
}

function readRequestBody(request, limit) {
	return new Promise((resolve, reject) => {
		let size = 0;
		const chunks = [];
		request.on('data', chunk => {
			size += chunk.length;
			if (size > limit) {
				reject(new Error('report_too_large'));
				request.destroy();
				return;
			}
			chunks.push(chunk);
		});
		request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
		request.on('error', reject);
	});
}

async function saveMitzvahReport(reportDirectory, report) {
	const jobId = sanitizeName(report.jobId || 'unknown-job');
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const fileName = `${stamp}-${jobId}.json`;
	const fullPath = path.join(reportDirectory, fileName);
	await fs.promises.mkdir(reportDirectory, { recursive: true });
	const content = JSON.stringify(report, null, 2);
	await fs.promises.writeFile(fullPath, content, 'utf8');
	await fs.promises.writeFile(path.join(reportDirectory, 'latest.json'), content, 'utf8');
	console.log(`B"H - Mitzvah World autoplay report saved: ${fullPath}`);
	return { fileName, path: fullPath };
}

function sanitizeName(value) {
	return String(value).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'unknown';
}

function sendJson(response, statusCode, payload) {
	response.writeHead(statusCode, {
		'content-type': 'application/json',
		'access-control-allow-origin': '*'
	});
	response.end(JSON.stringify(payload));
}

module.exports = {
	createAutoplayReportIngress,
	readRequestBody,
	saveMitzvahReport,
	sanitizeName
};
