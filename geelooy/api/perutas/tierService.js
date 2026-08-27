// B"H
const MASTER_USERS = new Set(["add", "asdf"]);
const PURCHASE_URL = "https://awtsmoos.com/compute";
const MASTER_BALANCE = 10 ** 21;
const TIERS = Object.freeze({
  free: tier("free", "F", "Free", 0, 100000, 250, 64, 0.25, 300000, 750, 256, 1),
  alef: tier("alef", "A", "Alef Supporter", 3, 1000000, 2500, 512, 2, 3000000, 7500, 2048, 8),
  beis: tier("beis", "B", "Beis Builder", 8, 5000000, 20000, 4096, 10, 15000000, 60000, 16384, 40),
  gimel: tier("gimel", "G", "Gimel Pro", 15, 20000000, 100000, 16384, 50, 60000000, 300000, 65536, 200),
  dalet: tier("dalet", "D", "Dalet Studio", 30, 100000000, 500000, 65536, 250, 300000000, 1500000, 262144, 1000),
  hei: tier("hei", "H", "Hei Federation", 75, 1000000000, 5000000, 262144, 2500, 3000000000, 15000000, 1048576, 10000),
  master: { code: "master", letter: "M", name: "Awtsmoos Master", priceUsd: 0, master: true, balances: masterBalances(), daily: masterBalances(), caps: masterBalances(), retentionDays: 36500 }
});
const LEGACY = Object.freeze({ supporter: "alef", builder: "beis", pro: "gimel", studio: "dalet" });

/** B"H: The treasury splits local routing from hosted compute. */
function tier(code, letter, name, priceUsd, routing, compute, storage, gpu, routingCap, computeCap, storageCap, gpuCap) {
  return { code, letter, name, priceUsd, monthlySubscription: priceUsd > 0, balances: zeros(), daily: { routing, compute, storage, gpu }, caps: { routing: routingCap, compute: computeCap, storage: storageCap, gpu: gpuCap }, retentionDays: priceUsd ? 90 : 7 };
}
function zeros() { return { routing: 0, compute: 0, storage: 0, gpu: 0 }; }
function masterBalances() { return { routing: MASTER_BALANCE, compute: MASTER_BALANCE, storage: MASTER_BALANCE, gpu: MASTER_BALANCE }; }
function normalizeTier(code, userId) {
  if (isMasterUser(userId)) return "master";
  const got = String(code || "free").toLowerCase();
  return TIERS[got] ? got : LEGACY[got] || "free";
}
function tierFor(code, userId) { return TIERS[normalizeTier(code, userId)] || TIERS.free; }
function isMasterUser(userId) { return MASTER_USERS.has(String(userId || "").trim().toLowerCase()); }
function publicTiers() { return TIERS; }
module.exports = { LEGACY, MASTER_BALANCE, MASTER_USERS, PURCHASE_URL, TIERS, isMasterUser, normalizeTier, publicTiers, tierFor };
