//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals canonical public bytes only through bounded public authority;
 * Awtsmoos.com preserves actor identity while requiring both write and public scopes
 * before a source manifest can be handed to the bootstrap service.
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

test('bootstrap route requires write plus public scope and forwards files', async t => {
	const authorizationPath = require.resolve('../authorization.js');
	const bootstrapPath = require.resolve('../siteProjectBootstrap.js');
	const routesPath = require.resolve('../routes/actionRoutes.js');
	let requiredScope = null;
	let received = null;
	const restoreAuthorization = moduleStub(authorizationPath, {
		requireDriveActor: async options => {
			requiredScope = options.requiredScope;
			return { actorUserId: 'user-1', credentialId: 'cred-1' };
		}
	});
	const restoreBootstrap = moduleStub(bootstrapPath, {
		bootstrapSiteProject: async options => {
			received = options;
			return { receipt: { projectId: options.projectId } };
		}
	});
	delete require.cache[routesPath];
	t.after(() => {
		delete require.cache[routesPath];
		restoreBootstrap();
		restoreAuthorization();
	});
	const files = [{ path: 'index.html', content: '<h1>B H</h1>' }];
	const $i = {
		request: { method: 'POST', headers: { 'x-request-id': 'req-1' } },
		$_POST: {
			projectId: 'website-starter',
			rootPath: 'sites/website-starter',
			sourceVessel: 'awtsmoos-virtual-os',
			files
		}
	};
	const routes = require(routesPath)({ $i, userid: 'user-1' });
	const result = await routes['/drive/:aliasId/actions/bootstrap-site-project']({ aliasId: 'asdf' });
	assert.deepEqual(requiredScope, ['drive.write', 'drive.public']);
	assert.equal(received.aliasId, 'asdf');
	assert.equal(received.projectId, 'website-starter');
	assert.equal(received.files, files);
	assert.equal(received.actor.actorUserId, 'user-1');
	assert.equal(received.requestId, 'req-1');
	assert.equal(result.receipt.projectId, 'website-starter');
});
