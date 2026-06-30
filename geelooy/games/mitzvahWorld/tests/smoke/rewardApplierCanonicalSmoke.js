import assert from "node:assert/strict";
import { applyRewards } from "../../ckidsAwtsmoos/tochen/shlichus/RewardApplier.js";
import { MarketplaceRuntime } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/economy/MarketplaceRuntime.js";

const events = [];
const storage = new Map();
globalThis.localStorage = {
  getItem:k => storage.get(k) || null,
  setItem:(k, v) => storage.set(k, String(v)),
  removeItem:k => storage.delete(k),
  clear:() => storage.clear()
};

const player = { perutah:2, inventory:{ slots:[], equipment:{} } };
const olam = { player, ayshPeula(type, name, payload) { events.push({ type, name, payload }); } };
player.olam = olam;

applyRewards(player, {
  exp:25,
  coins:7,
  items:["challah_small", { itemId:"simple_lamp", amount:2 }],
  unlockSkill:"tehillim_pulse",
  title:"Bearer of Sparks",
  sparks:3
}, { olam, reason:"smoke reward" });

assert.equal(player.xp, 25);
assert.equal(player.shlichusXp, 25);
assert.equal(player.perutah, 9);
assert.equal(player.personalPerutas, 9);
assert.equal(player.sparks, 3);
assert.equal(player.unlockedSkills.includes("tehillim_pulse"), true);
assert.equal(player.titles.includes("Bearer of Sparks"), true);
assert.equal(player.inventory.slots.some(i => i.id === "challah_small"), true);
assert.equal(player.inventory.slots.some(i => i.id === "simple_lamp" && i.qty === 2), true);
assert.equal(events.some(e => e.name === "playerProgress"), true);
assert.equal(events.some(e => e.name === "gameHUD" && e.payload?.xpBar), true);
assert.equal(events.some(e => e.name === "personalPerutas" && e.payload.personalPerutas === 9), true);
assert.equal(events.some(e => e.name === "bagState"), true);

const legacy = { exp:0, coins:1, inventory:[] };
applyRewards(legacy, { xp:12, perutas:4, items:["legacy_item"] });
assert.equal(legacy.exp, 12);
assert.equal(legacy.coins, 5);
assert.deepEqual(legacy.inventory, [{ id:"legacy_item", amount:1 }]);

const market = new MarketplaceRuntime({ siddur:3 });
assert.equal(market.buy({ buyer:legacy, itemId:"siddur", qty:1 }).ok, true);
assert.equal(legacy.coins, 2);
assert.equal(legacy.inventory.siddur, 1);

const marketPlayer = { perutah:10, inventory:{ slots:[], equipment:{} }, olam:null };
const marketOlam = { player:marketPlayer, ayshPeula(type, name, payload) { events.push({ type, name, payload }); } };
marketPlayer.olam = marketOlam;
const purchase = market.buy({ buyer:marketPlayer, itemId:"bread", qty:2, demand:1, olam:marketOlam });
assert.equal(purchase.ok, true);
assert.equal(marketPlayer.perutah, 8);
assert.equal(marketPlayer.inventory.slots.some(i => i.id === "bread" && i.qty === 2), true);

console.log("rewardApplierCanonicalSmoke passed");
