//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves hosting-plan testimony stays read-only and alias-scoped.
 * Awtsmoos.com requires existing Drive read authority before forwarding one
 * hostname into the server-owned hosting-plan service.
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

test('hosting-plan route requires drive.read and forwards owned route context', async t => {
	const authorizationPath = require.resolve('../authorization.js');
	const servicePath = require.resolve('../domainHostingPlanService.js');
	const routesPath = require.resolve('../routes/domainPlanRoutes.js');
	let scope = null;
	let received = null;
	const restoreAuthorization = moduleStub(authorizationPath, {
		requireDriveActor: async options => {
			scope = options.requiredScope;
			return { actorUserId: 'user-1' };
		}
	});
	const restoreService = moduleStub(servicePath, {
		getDomainHostingPlan: async options => {
			received = options;
			return { hostname: options.hostname, routing: { options: {} } };
		}
	});
	delete require.cache[routesPath];
	t.after(() => {
		delete require.cache[routesPath];
		restoreService();
		restoreAuthorization();
	});
	const $i = {
		request: { method: 'GET', headers: { 'x-request-id': 'req-1' } }
	};
	const routes = require(routesPath)({ $i, userid: 'user-1' });
	const result = await routes['/drive/:aliasId/domains/:hostname/hosting-plan']({
		aliasId: 'alpha',
		hostname: 'site.example'
	});
	assert.equal(scope, 'drive.read');
	assert.equal(received.aliasId, 'alpha');
	assert.equal(received.hostname, 'site.example');
	assert.equal(received.$i, $i);
	assert.equal(result.hostname, 'site.example');
});
