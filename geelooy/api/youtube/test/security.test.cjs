// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const secretRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-youtube-'));
process.env.YOUTUBE_SECRET_ROOT = secretRoot;
fs.writeFileSync(path.join(secretRoot, 'google-oauth.json'), JSON.stringify({
	web: {
		client_id: 'test-client',
		client_secret: 'test-secret',
		redirect_uris: ['https://awtsmoos.com/api/youtube/oauth/callback']
	}
}));
fs.writeFileSync(path.join(secretRoot, 'session.key'), 'session-secret');
fs.writeFileSync(path.join(secretRoot, 'tokens.key'), 'token-secret');

const { missingConfig } = require('../core/config.js');
const signedToken = require('../core/signedToken.js');
const vault = require('../core/vault.js');
const tokenStore = require('../core/tokenStore.js');
const { uploadMetadata } = require('../routes/uploads.js');
const { writableSnippet, writableStatus } = require('../routes/videos.js');

test.after(() => fs.rmSync(secretRoot, { recursive: true, force: true }));

test('configuration loads only from the private secret root', () => {
	assert.deepEqual(missingConfig(), []);
});

test('signed tokens reject tampering and expiration', () => {
	const valid = signedToken.encode({ sub: 'abc', exp: Date.now() + 1000 }, 'secret');
	assert.equal(signedToken.decode(valid, 'secret').sub, 'abc');
	assert.equal(signedToken.decode(`${valid}x`, 'secret'), null);
	const expired = signedToken.encode({ exp: Date.now() - 1 }, 'secret');
	assert.equal(signedToken.decode(expired, 'secret'), null);
});

test('vault encryption round-trips without plaintext fields', () => {
	const encrypted = vault.encrypt({ refresh_token: 'private-value' }, 'secret');
	assert.equal(JSON.stringify(encrypted).includes('private-value'), false);
	assert.equal(vault.decrypt(encrypted, 'secret').refresh_token, 'private-value');
});

test('per-user token store encrypts records and preserves refresh tokens', async () => {
	await tokenStore.saveConnection({
		profile: { sub: 'google-user', email: 'user@example.com' },
		token: { access_token: 'access', refresh_token: 'refresh', expires_in: 3600 }
	});
	await tokenStore.updateToken('google-user', { access_token: 'renewed', expires_in: 3600 });
	const record = await tokenStore.loadConnection('google-user');
	assert.equal(record.token.access_token, 'renewed');
	assert.equal(record.token.refresh_token, 'refresh');
	const stored = fs.readFileSync(path.join(secretRoot, 'users', `${require('node:crypto').createHash('sha256').update('google-user').digest('hex')}.json`), 'utf8');
	assert.equal(stored.includes('refresh'), false);
});

test('upload and update metadata are validated and sanitized', () => {
	const upload = uploadMetadata({ title: 'A video', privacyStatus: 'private' });
	assert.equal(upload.snippet.categoryId, '22');
	assert.throws(() => uploadMetadata({ title: '<bad>' }));
	const snippet = writableSnippet({ title: 'Old', categoryId: '22', thumbnails: { secret: true } }, { title: 'New' });
	assert.equal(snippet.title, 'New');
	assert.equal(snippet.thumbnails, undefined);
	assert.equal(writableStatus({ privacyStatus: 'private', uploadStatus: 'processed' }, { privacyStatus: 'unlisted' }).uploadStatus, undefined);
});
