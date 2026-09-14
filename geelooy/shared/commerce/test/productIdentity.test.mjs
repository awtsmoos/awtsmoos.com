// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { inferProductIdentity, productIdFromPathname } from "../identity.js";
import { isProductCommerceRoute, isCommerceCatalogRoute } from "../../../scripts/awtsmoos/ui/productCommerce.js";
import { isSupporterSku } from "../model.js";

const fakeDocument = title => ({
	title,
	querySelector(selector) {
		return selector === "h1" ? { textContent: title } : null;
	}
});

test("commerce route gate accepts product routes but not hubs", () => {
	assert.equal(isProductCommerceRoute("/apps/docs/"), true);
	assert.equal(isProductCommerceRoute("/games/Merkava/"), true);
	assert.equal(isProductCommerceRoute("/apps/"), false);
	assert.equal(isProductCommerceRoute("/games/"), false);
	assert.equal(isProductCommerceRoute("/profile/"), false);
	assert.equal(isCommerceCatalogRoute("/apps/"), true);
	assert.equal(isCommerceCatalogRoute("/games/"), true);
});

test("legacy game directories resolve canonical supporter ids", () => {
	assert.equal(inferProductIdentity(new URL("https://x/games/connect4/"), fakeDocument("Connect 4")).id, "connect-4");
	assert.equal(inferProductIdentity(new URL("https://x/games/dove/"), fakeDocument("Dove")).id, "noahs-dove");
	assert.equal(inferProductIdentity(new URL("https://x/games/mitzvahWorld/"), fakeDocument("Mitzvah World")).id, "mitzvah-world");
	assert.equal(productIdFromPathname("/apps/bookCoverMaker/"), "bookcovermaker");
});

test("universal merchandising excludes native premium SKUs", () => {
	assert.equal(isSupporterSku({ id: "wallet.treasury.gold.001" }), false);
	assert.equal(isSupporterSku({ id: "wallet.supporter.spark.001" }), true);
});
