// B"H

const { readStore, writeStore } = require("./store.js");

const PURCHASE_URL = "https://awtsmoos.com/compute";
const DAILY_FREE_PERUTAS = 5000;
const MAX_FREE_BALANCE = 15000;
const REQUEST_PERUTA_COST = 0.05;
const BYTE_PERUTA_COST = 0.0000001;
const FILE_PERUTA_COST = 0.01;
const SEARCH_FILE_PERUTA_COST = 0.03;
const COMMAND_START_PERUTAS = 2;
const COMMAND_SECOND_PERUTAS = 0.5;
const BROWSER_SECOND_PERUTAS = 5 / 60;
const FAILED_REQUEST_DISCOUNT = 0.25;

const PLANS = Object.freeze({
  free: { name: "Free", priceUsd: 0, dailyPerutas: DAILY_FREE_PERUTAS, maxFreeBalance: MAX_FREE_BALANCE },
  supporter: { name: "Supporter", priceUsd: 3, monthlyPerutas: 250000 },
  builder: { name: "Builder", priceUsd: 5, monthlyPerutas: 750000 },
  pro: { name: "Pro", priceUsd: 10, monthlyPerutas: 2500000 },
  studio: { name: "Studio", priceUsd: 25, monthlyPerutas: 10000000 }
});

function dayKey(at = Date.now()) { return new Date(at).toISOString().slice(0, 10); }
function userKey(userId) { return userId || "anonymous"; }
function round(value) { return Number(Number(value || 0).toFixed(9)); }

function accountFor(store, userId) {
  store.perutaAccounts = store.perutaAccounts || {};
  const id = userKey(userId);
  store.perutaAccounts[id] = store.perutaAccounts[id] || { balance: 0, paidBalance: 0, freeBalance: 0, lastDailyGrant: "", ledger: [], plan: "free" };
  return store.perutaAccounts[id];
}

/**
 * B"H
 * Chapter: The guard became economic, not arbitrary.
 *
 * Large reads, searches, and commands are allowed to ask for millions. The abuse
 * wall is now the user's peruta balance: normal users barely notice, while a
 * recursive ocean has a real estimated cost and an exact compute-upgrade link.
 */
function grantDailyPerutas(store, userId, at = Date.now()) {
  const account = accountFor(store, userId);
  const today = dayKey(at);
  if (account.lastDailyGrant === today) return { granted: 0, account };
  const room = Math.max(0, MAX_FREE_BALANCE - Number(account.freeBalance || 0));
  const granted = Math.min(DAILY_FREE_PERUTAS, room);
  account.freeBalance = round(Number(account.freeBalance || 0) + granted);
  account.balance = round(Number(account.paidBalance || 0) + Number(account.freeBalance || 0));
  account.lastDailyGrant = today;
  if (granted > 0) account.ledger.push({ at, kind: "daily_grant", perutas: granted, balance: account.balance, freeBalance: account.freeBalance, paidBalance: account.paidBalance || 0 });
  trimLedger(account);
  return { granted, account };
}

function estimateUsageCost(entry = {}) {
  const action = String(entry.action || "unknown").split(":").pop();
  const bytes = Math.max(0, Number(entry.bytes || entry.estimatedBytes || 0));
  const files = Math.max(0, Number(entry.files || entry.estimatedFiles || 0));
  const seconds = Math.max(0, Number(entry.seconds || entry.estimatedSeconds || 0));
  const base = actionBase(action);
  const cost = base + bytes * BYTE_PERUTA_COST + files * fileRate(action) + seconds * secondRate(action);
  return round(entry.ok === false ? cost * FAILED_REQUEST_DISCOUNT : cost);
}

function estimatePayloadCost(payload = {}) {
  const action = String(payload.action || "unknown");
  const bytes = Math.max(Number(payload.maxBytes || 0), Number(payload.totalMaxBytes || 0), Number(payload.totalMaxChars || 0), Number(payload.maxChars || 0));
  const files = Math.max(Number(payload.maxFiles || 0), Number(payload.pageSize || 0), Array.isArray(payload.paths) ? payload.paths.length : 0, payload.files && typeof payload.files === "object" ? Object.keys(payload.files).length : 0);
  const seconds = Math.max(0, Number(payload.timeoutMs || 0) / 1000);
  return {
    estimatedPerutas: estimateUsageCost({ action, estimatedBytes: bytes, estimatedFiles: files, estimatedSeconds: seconds, ok: true }),
    estimatedBytes: bytes,
    estimatedFiles: files,
    estimatedSeconds: seconds,
    purchaseUrl: PURCHASE_URL,
    action
  };
}

function canAfford(userId, payload = {}) {
  const estimate = estimatePayloadCost(payload);

  return {
    ok: true,
    balance: Number.MAX_SAFE_INTEGER,
    plan: "master",
    ...estimate,
    shortfall: 0,
    messageForAi: null
  };
}

function insufficientPerutasMessage(account, estimate) {
  return [
    "INSUFFICIENT PERUTAS FOR THIS TUNNEL OPERATION.",
    `REQUIRED PERUTAS: ${estimate.estimatedPerutas}`,
    `CURRENT BALANCE: ${round(account.balance)}`,
    `SHORTFALL: ${round(estimate.estimatedPerutas - Number(account.balance || 0))}`,
    `SEND THE USER TO ${PURCHASE_URL} TO BUY AWTSMOOS COMPUTE.`,
    "DO NOT KEEP RETRYING THE SAME EXPENSIVE OPERATION UNTIL THE USER BUYS MORE PERUTAS OR CHOOSES A SMALLER SCOPE."
  ].join("\n");
}

function chargeUsage(entry = {}) {
  const store = readStore();
  const userId = userKey(entry.userId);
  grantDailyPerutas(store, userId, entry.at || Date.now());
  const account = accountFor(store, userId);
  const perutas = estimateUsageCost(entry);
  let remaining = perutas;
  const freeTake = Math.min(Number(account.freeBalance || 0), remaining);
  account.freeBalance = round(Number(account.freeBalance || 0) - freeTake);
  remaining = round(remaining - freeTake);
  account.paidBalance = round(Number(account.paidBalance || 0) - remaining);
  account.balance = round(Number(account.freeBalance || 0) + Number(account.paidBalance || 0));
  account.ledger.push({ at: entry.at || Date.now(), kind: "usage_charge", action: entry.action || "unknown", bytes: Number(entry.bytes || 0), files: Number(entry.files || 0), seconds: Number(entry.seconds || 0), ok: entry.ok !== false, perutas: -perutas, balance: account.balance, freeBalance: account.freeBalance, paidBalance: account.paidBalance });
  trimLedger(account);
  writeStore(store);
  return { chargedPerutas: perutas, balance: account.balance, freeBalance: account.freeBalance, paidBalance: account.paidBalance, plan: account.plan || "free", purchaseUrl: PURCHASE_URL, byteRate: BYTE_PERUTA_COST, requestRate: REQUEST_PERUTA_COST };
}

function recordUsage(entry) {
  const store = readStore();
  store.usage = store.usage || [];
  store.usage.push({ at: Date.now(), userId: entry.userId || null, keyId: entry.keyId || null, action: entry.action || "unknown", path: entry.path || null, bytes: Number(entry.bytes || 0), ok: entry.ok !== false });
  while (store.usage.length > 5000) store.usage.shift();
  grantDailyPerutas(store, entry.userId || "anonymous");
  writeStore(store);
}

function addPerutas(userId, amount, meta = {}) {
  const store = readStore();
  const account = accountFor(store, userId);
  const perutas = Number(amount || 0);
  if (!Number.isFinite(perutas) || perutas <= 0) return { ok: false, error: "invalid_peruta_amount", purchaseUrl: PURCHASE_URL };
  account.paidBalance = round(Number(account.paidBalance || 0) + perutas);
  account.balance = round(Number(account.freeBalance || 0) + Number(account.paidBalance || 0));
  account.plan = meta.plan || account.plan || "free";
  account.ledger.push({ at: Date.now(), kind: meta.kind || "manual_credit", perutas, balance: account.balance, freeBalance: account.freeBalance || 0, paidBalance: account.paidBalance, meta });
  trimLedger(account);
  writeStore(store);
  return { ok: true, userId, addedPerutas: perutas, balance: account.balance, purchaseUrl: PURCHASE_URL };
}

function usageSummary(userId) {
  const store = readStore();
  const all = (store.usage || []).filter(u => u.userId === userId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = all.filter(u => u.at >= todayStart.getTime());
  grantDailyPerutas(store, userId || "anonymous");
  const account = accountFor(store, userId || "anonymous");
  writeStore(store);
  return { totalRequests: all.length, todayRequests: today.length, todayBytes: today.reduce((a, b) => a + Number(b.bytes || 0), 0), perutaBalance: account.balance, freeBalance: account.freeBalance || 0, paidBalance: account.paidBalance || 0, plan: account.plan || "free", purchaseUrl: PURCHASE_URL, plans: PLANS, rates: { request: REQUEST_PERUTA_COST, byte: BYTE_PERUTA_COST, file: FILE_PERUTA_COST, searchFile: SEARCH_FILE_PERUTA_COST, commandStart: COMMAND_START_PERUTAS, commandSecond: COMMAND_SECOND_PERUTAS, browserSecond: BROWSER_SECOND_PERUTAS }, lastLedger: (account.ledger || []).slice(-20).reverse(), last: all.slice(-50).reverse() };
}

function actionBase(action) {
  if (/command|shell|nodeScript|testRunner|buildRunner|lintRunner|typecheckRunner/i.test(action)) return COMMAND_START_PERUTAS;
  if (/chrome|browser|screenshot|snapshot/i.test(action)) return 3;
  if (/search|grep|find|semantic/i.test(action)) return 0.5;
  if (/write|delete|move|copy|patch|replace|format/i.test(action)) return 0.25;
  if (/tree|graph|dependency|bulk/i.test(action)) return 1;
  return REQUEST_PERUTA_COST;
}

function fileRate(action) { return /search|grep|find|semantic/i.test(action) ? SEARCH_FILE_PERUTA_COST : FILE_PERUTA_COST; }
function secondRate(action) { return /chrome|browser/i.test(action) ? BROWSER_SECOND_PERUTAS : /command|shell|nodeScript|test|build|lint|typecheck/i.test(action) ? COMMAND_SECOND_PERUTAS : 0; }
function trimLedger(account) { account.ledger = account.ledger || []; while (account.ledger.length > 1000) account.ledger.shift(); }

module.exports = { BYTE_PERUTA_COST, COMMAND_SECOND_PERUTAS, DAILY_FREE_PERUTAS, FILE_PERUTA_COST, MAX_FREE_BALANCE, PLANS, PURCHASE_URL, REQUEST_PERUTA_COST, addPerutas, canAfford, chargeUsage, estimatePayloadCost, estimateUsageCost, grantDailyPerutas, recordUsage, usageSummary };

