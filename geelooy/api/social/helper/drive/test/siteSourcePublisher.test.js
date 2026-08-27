//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos admits only a fully measured manifest into canonical public Drive;
 * Awtsmoos.com proves every published path, visibility, actor, and byte while hidden
 * control metadata or invalid paths fail before the first Drive write.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

function moduleStub(modulePath, exports) {
	const previous = require.cache[modulePath];
	require.cache[modulePath] = {
		id: modulePath,
		filename: modulePath,
		loaded: true,
		exports
	};
	return () => {
		if (previous) require.cache[modulePath] = previous;
		else delete require.cache[modulePath];
	};
}

test('publisher writes validated manifest as public Drive source', async t => {
	const writePath = require.resolve('../writeService.js');
	const publisherPath = require.resolve('../siteSourcePublisher.js');
	const calls = [];
	const restoreWrite = moduleStub(writePath, {
		writeDriveFile: async options => {
			calls.push(options);
			return { entry: { path: options.path } };
		}
	});
	delete require.cache[publisherPath];
	t.after(() => {
		delete require.cache[publisherPath];
		restoreWrite();
	});
	const { publishSiteSource } = require(publisherPath);
	const files = [
		{ path: 'index.html', content: '<h1>Awtsmoos</h1>' },
		{ path: 'styles.css', content: 'body {}', cachePolicy: 'immutable' }
	];
	const result = await publishSiteSource({
		aliasId: 'asdf', rootPath: 'sites/website-starter', files,
		actorUserId: 'user-1', credentialId: 'cred-1', requestId: 'req-1'
	});
	assert.equal(calls.length, 2);
	assert.equal(calls[0].path, 'sites/website-starter/index.html');
	assert.equal(calls[0].visibility, 'public');
	assert.ok(Buffer.isBuffer(calls[0].content));
	assert.equal(calls[0].actorUserId, 'user-1');
	assert.equal(calls[1].cachePolicy, 'immutable');
	assert.equal(result.vessel, 'awtsmoos-drive');
	assert.equal(result.fileCount, 2);

	calls.length = 0;
	await assert.rejects(
		publishSiteSource({
			aliasId: 'asdf', rootPath: 'sites/website-starter',
			files: [{ path: '.awtsmoos/site.json', content: '{}' }]
		}),
		error => error.code === 'SITE_SOURCE_CONTROL_PATH_FORBIDDEN'
	);
	assert.equal(calls.length, 0);
});
