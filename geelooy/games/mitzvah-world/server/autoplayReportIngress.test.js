// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves the extracted Mitzvah ingress preserves its narrow platform contract. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	createAutoplayReportIngress,
	saveMitzvahReport,
	sanitizeName
} = require('./autoplayReportIngress.js');

function fakeResponse() {
	return {
		statusCode: null,
		headers: null,
		body: '',
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end(body) {
			this.body = String(body || '');
		}
	};
}

test('non-Mitzvah request declines while ping remains available to platform routing', async () => {
	const handler = createAutoplayReportIngress('/tmp/unused-awtsmoos-root');
	const ignored = fakeResponse();
	assert.equal(await handler({ url: '/elsewhere', method: 'GET' }, ignored), false);
	const ping = fakeResponse();
	assert.equal(await handler({ url: '/mitzvahWorld/autoplay-ping', method: 'GET' }, ping), true);
	assert.equal(ping.statusCode, 200);
	assert.equal(JSON.parse(ping.body).service, 'mitzvahWorld-autoplay');
});

test('report route preserves POST-only method protection', async () => {
	const handler = createAutoplayReportIngress('/tmp/unused-awtsmoos-root');
	const response = fakeResponse();
	assert.equal(await handler({ url: '/mitzvahWorld/autoplay-report', method: 'GET' }, response), true);
	assert.equal(response.statusCode, 405);
	assert.equal(JSON.parse(response.body).error, 'method_not_allowed');
});

test('saved report names cannot escape the chosen report directory', async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-mitzvah-report-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const saved = await saveMitzvahReport(root, { jobId: '../../danger', value: 7 });
	assert.equal(path.dirname(saved.path), root);
	assert.equal(saved.fileName.includes('/'), false);
	assert.equal(sanitizeName('../../danger').includes('/'), false);
	assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'latest.json'), 'utf8')).value, 7);
});
