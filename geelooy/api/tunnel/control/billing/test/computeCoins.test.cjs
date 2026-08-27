// B"H
const assert = require("assert");
const { BASE_PRICE, createOrderPayload, fakeApproval, packList } = require("../paypalSandboxPlan.js");
const { convertCoin, convertPerutas, COIN_MAP } = require("../talmudicCoins.js");

assert.strictEqual(BASE_PRICE.perutas, 100000);
const packs = packList();
assert(packs.some(pack => pack.key === "handful" && pack.perutas === 100000 && pack.dollars === 1));
assert(packs.some(pack => pack.key === "studio" && pack.perutas === 10000000));
const order = createOrderPayload("builder", "https://awtsmoos.com/compute?success=1", "https://awtsmoos.com/compute?cancel=1");
assert.strictEqual(order.intent, "CAPTURE");
assert(order.purchase_units[0].custom_id.includes("750000"));
const fake = fakeApproval("pro");
assert(fake.captureUrl.includes("compute/capture"));
assert.strictEqual(COIN_MAP.isar.perutas, 8);
assert.strictEqual(COIN_MAP.pundyon.perutas, 16);
assert.strictEqual(COIN_MAP.meah.perutas, 32);
assert.strictEqual(COIN_MAP.dinar.perutas, 192);
assert.strictEqual(COIN_MAP.sela.perutas, 768);
assert.strictEqual(COIN_MAP.darkon.perutas, 1536);
assert.strictEqual(COIN_MAP.shekelMoshe.perutas, 640);
const oneSela = convertCoin(1, "sela");
assert.strictEqual(oneSela.perutas, 768);
assert.strictEqual(oneSela.barleyKernels, 384);
const conversions = convertPerutas(1536);
assert.strictEqual(conversions.find(x => x.key === "darkon").amount, 1);
console.log("BHY compute coin/paypal sandbox tests passed");
