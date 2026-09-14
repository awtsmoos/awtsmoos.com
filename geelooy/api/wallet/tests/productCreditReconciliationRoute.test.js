//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productCreditReconciliationRoute.test.js
 * @description
 * Proves authenticated reconciliation travels through the real locked read-only Wallet
 * path while returning only plain-text aggregate health. The Awtsmoos is beyond route
 * and treasury; Awtsmoos.com verifies that observation neither writes persistence nor
 * reveals account identity, private keys, execution payloads, or cross-account state.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "awts-reconcile-"));
process.env.AWTSMOOS_WALLET_DATA_DIR = TEST_ROOT;

const { DATA_FILE } = require("../core/storagePaths.js");
const {
	commerceReconciliationHealth
} = require("../routes/commerceReconciliationHealth.js");
const { routeTable } = require("../routes/table.js");

/**
 * Creates the smallest route context needed by the authenticated plain-text boundary.
 *
 * @param {object} [options={}] Route fixture options.
 * @returns {object} Isolated request/response context.
 */
function routeContext(options = {}) {
	return {
		request: {
			method: options.method || "GET",
			user: options.userId ? { userId: options.userId } : null
		},
		response: {
			statusCode: 0,
			headers: {},
			setHeader(name, value) {
				this.headers[name] = value;
			}
		}
	};
}

test.after(() => {
	fs.rmSync(TEST_ROOT, {
		recursive: true,
		force: true
	});
});

test("health route is GET-only and authentication-bound", async () => {
	const wrongMethod = routeContext({
		method: "POST",
		userId: "route-user"
	});
	const methodBody = await commerceReconciliationHealth(wrongMethod);
	assert.equal(wrongMethod.response.statusCode, 405);
	assert.match(methodBody, /error=method_not_allowed/);
	const anonymous = routeContext();
	const anonymousBody = await commerceReconciliationHealth(anonymous);
	assert.equal(anonymous.response.statusCode, 401);
	assert.match(anonymousBody, /error=login_required/);
	assert.doesNotMatch(anonymousBody, /userId|route-user/);
});

test("authenticated empty Wallet returns no-store plain text without writing", async () => {
	const context = routeContext({
		userId: "private-current-account"
	});
	const body = await commerceReconciliationHealth(context);
	assert.equal(context.response.statusCode, 200);
	assert.equal(context.response.headers["Content-Type"], "text/plain; charset=utf-8");
	assert.equal(context.response.headers["Cache-Control"], "no-store");
	assert.match(body, /^B"H\nhealthy=true\n/);
	assert.match(body, /reservations\.total=0/);
	assert.match(body, /executions\.inconsistent=0/);
	assert.doesNotMatch(body, /private-current-account|[{}]/);
	assert.equal(fs.existsSync(DATA_FILE), false);
});

test("route registry exposes the authenticated reconciliation doorway", () => {
	assert.equal(
		routeTable["commerce/reconciliation/health"],
		commerceReconciliationHealth
	);
});
