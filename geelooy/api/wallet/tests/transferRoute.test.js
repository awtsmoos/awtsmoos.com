// B"H
// Boruch Hashem
// Blessed is He

const path = require("path");
const os = require("os");
const fsp = require("fs/promises");
const test = require("node:test");
const assert = require("node:assert/strict");

const dataDir = path.join(os.tmpdir(), `awtsmoos-wallet-transfer-route-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;

const { transfer } = require("../routes/transfer.js");

/**
 * B"H
 * Proves the person-to-person Wallet HTTP boundary without production accounts.
 * The Awtsmoos renews method, intent header, alias, and hidden owner beyond every
 * request; Awtsmoos.com keeps internal recipient identity absent from public JSON.
 */

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("transfer rejects GET before any alias lookup", async () => {
	const context = routeContext({ userId: "sender-user", walletAction: true });
	const result = payload(await transfer(context));
	assert.equal(context.response.statusCode, 405);
	assert.equal(result.error, "method_not_allowed");
	assert.equal(context.db.calls.length, 0);
});

test("transfer rejects POST without Wallet action header", async () => {
	const context = routeContext({ method: "POST", userId: "sender-user" });
	const result = payload(await transfer(context));
	assert.equal(context.response.statusCode, 403);
	assert.equal(result.error, "wallet_action_header_required");
});

test("transfer requires an authenticated sender", async () => {
	const context = routeContext({ method: "POST", walletAction: true });
	const result = payload(await transfer(context));
	assert.equal(context.response.statusCode, 401);
	assert.equal(result.error, "login_required");
});

test("unknown recipient alias fails without treasury mutation", async () => {
	const context = routeContext({
		method: "POST",
		userId: "sender-user",
		walletAction: true,
		body: transferBody(),
		aliasOwner: null
	});
	const result = payload(await transfer(context));
	assert.equal(context.response.statusCode, 404);
	assert.equal(result.error, "recipient_alias_not_found");
});

test("valid alias transfer returns a safe public receipt", async () => {
	const context = routeContext({
		method: "POST",
		userId: "sender-user",
		walletAction: true,
		body: transferBody(),
		aliasOwner: "recipient-internal-user-id"
	});
	const raw = await transfer(context);
	const result = payload(raw);
	assert.equal(context.response.statusCode, 200);
	assert.equal(result.ok, true);
	assert.equal(result.transfer.recipientAlias, "friend");
	assert.equal(result.transfer.amount, 25);
	assert.equal(raw.includes("recipient-internal-user-id"), false);
});

function routeContext(options = {}) {
	const calls = [];
	return {
		request: {
			method: options.method || "GET",
			user: options.userId ? { userId: options.userId } : null,
			headers: options.walletAction ? { "x-awtsmoos-wallet-action": "1" } : {}
		},
		paramKinds: { POST: options.body || {} },
		db: {
			calls,
			async get(dbPath) {
				calls.push(dbPath);
				return options.aliasOwner ? { user: options.aliasOwner } : null;
			}
		},
		response: responseStub()
	};
}

function responseStub() {
	return {
		statusCode: 0,
		headers: {},
		setHeader(name, value) { this.headers[name] = value; }
	};
}

function transferBody() {
	return { recipientAlias: "friend", amount: 25, note: "Gift", idempotencyKey: "route-send" };
}

function payload(body) {
	return JSON.parse(body);
}
