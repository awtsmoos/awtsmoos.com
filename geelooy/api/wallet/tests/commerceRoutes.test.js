// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { commerceCatalog } = require("../routes/commerceCatalog.js");
const { commerceEntitlements } = require("../routes/commerceEntitlements.js");
const { commercePurchase } = require("../routes/commercePurchase.js");
const {
	payload,
	routeContext
} = require("./commerceRouteFixture.js");

/**
 * B"H
 * Witnesses the HTTP commerce boundary after the tiny-Perutah migration. The
 * Awtsmoos renews request, price, account, and ownership beyond every finite route;
 * Awtsmoos.com proves browser payloads cannot shrink server prices or bypass the
 * purchased-only rule while planned products remain outside checkout.
 */

test("catalog exposes four live goods and nineteen planned goods", () => {
	const result = payload(commerceCatalog(routeContext()));
	const live = result.skus.filter((sku) => sku.available);
	const planned = result.skus.filter((sku) => !sku.available);
	assert.equal(result.skus.length, 23);
	assert.equal(live.length, 4);
	assert.equal(planned.length, 19);
	assert.equal(live.filter((sku) => sku.productId === "wallet").length, 3);
	assert.equal(live.filter((sku) => sku.productId === "merkava").length, 1);
	assert.equal(live.every((sku) => sku.spendPolicy === "purchased_only"), true);
});

test("commerce purchase rejects GET", async () => {
	const context = routeContext({ userId: "route-user", walletAction: true });
	const result = payload(await commercePurchase(context));
	assert.equal(context.response.statusCode, 405);
	assert.equal(result.error, "method_not_allowed");
});

test("commerce purchase rejects POST without Wallet action header", async () => {
	const context = routeContext({ method: "POST", userId: "route-user" });
	const result = payload(await commercePurchase(context));
	assert.equal(context.response.statusCode, 403);
	assert.equal(result.error, "wallet_action_header_required");
});

test("live Merkava ignores client price and requires purchased Perutahs", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-merkava-user",
		walletAction: true,
		body: {
			skuId: "merkava.commander.sigil.001",
			idempotencyKey: "route-merkava-001",
			pricePerutahs: 1
		}
	});
	const result = payload(await commercePurchase(context));
	assert.equal(context.response.statusCode, 409);
	assert.equal(result.error, "insufficient_purchased_perutahs");
	assert.equal(result.needed, 38400);
});

test("client price cannot activate a planned game SKU", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-user",
		walletAction: true,
		body: {
			skuId: "sefira-clash.arena.theme.001",
			idempotencyKey: "route-purchase-001",
			pricePerutahs: 1,
			available: true
		}
	});
	const result = payload(await commercePurchase(context));
	assert.equal(context.response.statusCode, 409);
	assert.equal(result.error, "sku_unavailable");
});

test("client price cannot activate a planned app service SKU", async () => {
	const context = routeContext({
		method: "POST",
		userId: "route-user",
		walletAction: true,
		body: {
			skuId: "transcribe.10m",
			idempotencyKey: "route-purchase-002",
			pricePerutahs: 1
		}
	});
	const result = payload(await commercePurchase(context));
	assert.equal(context.response.statusCode, 409);
	assert.equal(result.error, "sku_unavailable");
});

test("entitlements require authentication", async () => {
	const context = routeContext();
	const result = payload(await commerceEntitlements(context));
	assert.equal(context.response.statusCode, 401);
	assert.equal(result.error, "login_required");
});
