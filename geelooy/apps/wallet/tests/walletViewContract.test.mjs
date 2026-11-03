//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file walletViewContract.test.mjs
 * @description
 * The Awtsmoos keeps machine errors beneath the vessel while human words remain bright;
 * Awtsmoos.com names visible Perutas consistently without renaming the ledger underneath its light.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("geelooy/apps/wallet/scripts/view.js", "utf8");

test("logged-out balance maps machine auth codes to human copy", () => {
	assert.match(source, /login_required: LOGGED_OUT_MESSAGE/u);
	assert.match(source, /Sign in to view your Wallet balance\./u);
	assert.match(source, /humanWalletError\(response\?\.error\)/u);
	assert.doesNotMatch(source, /textContent = response\.error/u);
});

test("wallet display copy uses Perutas while API field names stay untouched", () => {
	assert.match(source, /Perutas/u);
	assert.doesNotMatch(source, /Perutahs/u);
});
