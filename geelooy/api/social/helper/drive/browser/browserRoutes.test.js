//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos tests the public-web doorway without touching the public Internet.
 * Awtsmoos.com proves alias authority, jar surfaces, and rate testimony through
 * injected local witnesses before the route is mounted into the Drive router.
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

test('browser routes preserve Drive authority, jars, and proxy error status', async t => {
	const authorizationPath = require.resolve('../authorization.js');
	const routesPath = require.resolve('../routes/browserRoutes.js');
	let requiredScope = null;
	const restoreAuthorization = moduleStub(authorizationPath, {
		requireDriveActor: async options => {
			requiredScope = options.requiredScope;
			return { actorUserId: 'user-1', credentialId: 'cred-1' };
		}
	});
	delete require.cache[routesPath];
	const routeModule = require(routesPath);
	restoreAuthorization();
	const service = routeModule.browserService;
	const originalFetch = service.fetch;
	const originalList = service.cookies.listJars;
	const originalClear = service.cookies.clearJar;
	t.after(() => {
		service.fetch = originalFetch;
		service.cookies.listJars = originalList;
		service.cookies.clearJar = originalClear;
		delete require.cache[routesPath];
	});

	let received = null;
	service.fetch = async input => {
		received = input;
		return { status: 200, text: 'safe' };
	};
	const $i = {
		request: { method: 'POST', headers: { 'x-request-id': 'req-1' } },
		$_POST: {
			url: 'https://example.com/',
			jarId: 'main',
			projectId: 'site-1'
		}
	};
	const routes = routeModule({ $i, userid: 'user-1' });
	const fetched = await routes['/drive/:aliasId/browser/fetch']({ aliasId: 'asdf' });
	assert.equal(requiredScope, 'drive.read');
	assert.equal(received.userId, 'user-1');
	assert.equal(received.jarId, 'main');
	assert.equal(received.projectId, 'site-1');
	assert.equal(fetched.text, 'safe');

	service.cookies.listJars = () => [{ id: 'main', cookieCount: 2, domains: ['example.com'] }];
	$i.request.method = 'GET';
	const jars = await routes['/drive/:aliasId/browser/jars']({ aliasId: 'asdf' });
	assert.equal(jars.jars[0].cookieCount, 2);

	service.cookies.clearJar = (_userId, jarId) => jarId === 'main';
	$i.request.method = 'DELETE';
	const cleared = await routes['/drive/:aliasId/browser/jars/:jarId']({
		aliasId: 'asdf',
		jarId: 'main'
	});
	assert.equal(cleared.cleared, true);

	service.fetch = async () => {
		const error = new Error('PROXY_RATE_LIMITED');
		error.code = 'PROXY_RATE_LIMITED';
		error.status = 429;
		error.retryAfterSeconds = 7;
		throw error;
	};
	$i.request.method = 'POST';
	const limited = await routes['/drive/:aliasId/browser/fetch']({ aliasId: 'asdf' });
	assert.equal(limited.statusCode, 429);
	assert.equal(limited.headers['Retry-After'], '7');
});
