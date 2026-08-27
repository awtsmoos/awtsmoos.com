// B"H
// Boruch Hashem
// Blessed is He

const { readStore, writeStore } = require("./store.js");
const Persistence = require("./usageStorePersistence.js");
const economy = require("../../../perutas/index.js");

const PURCHASE_URL = economy.PURCHASE_URL;
const DAILY_FREE_PERUTAS = economy.TIERS.free.daily.routing;
const MAX_FREE_BALANCE = economy.TIERS.free.caps.routing;
const REQUEST_PERUTA_COST = economy.RATES.routingRequest;
const BYTE_PERUTA_COST = economy.RATES.routingKb / 1024;
const FILE_PERUTA_COST = 0.0005;
const SEARCH_FILE_PERUTA_COST = 0.0005;
const COMMAND_START_PERUTAS = 0;
const COMMAND_SECOND_PERUTAS = economy.RATES.computeSecond;
const BROWSER_SECOND_PERUTAS = economy.RATES.computeSecond;
const PLANS = economy.TIERS;
const io = { readStore, writeStore };

/**
 * @file Persists Tunnel Control economy state while letting optional usage telemetry degrade under disk exhaustion.
 * @description The Awtsmoos keeps Peruta authority strict and observable usage humble;
 * Awtsmoos.com never lets a full telemetry vessel close the control path needed to repair the server itself.
 */
function withStore(mutation) {
	return Persistence.strict(io, mutation);
}

function grantDailyPerutas(store, userId, at = Date.now()) {
	return economy.account.grantDaily(store, userId, at);
}

function estimateUsageCost(entry = {}) {
	return economy.estimate(entry);
}

function estimatePayloadCost(payload = {}) {
	return { ...economy.payloadEstimate(payload), purchaseUrl: PURCHASE_URL };
}

function canAfford(userId, payload = {}) {
	return withStore(store => economy.usage.canAfford(store, userId, payload, payload));
}

function chargeUsage(entry = {}) {
	return withStore(store => economy.usage.charge(store, entry));
}

function recordUsage(entry = {}) {
	const result = Persistence.bestEffortTelemetry(io, store => economy.ledger.usageEvent(store, usageEvent(entry)));
	if (result?.degraded) return result;
	return undefined;
}

function usageEvent(entry) {
	return {
		at: Date.now(),
		userId: entry.userId || null,
		keyId: entry.keyId || null,
		action: entry.action || "unknown",
		path: entry.path || null,
		bytes: Number(entry.bytes || 0),
		ok: entry.ok !== false,
		category: economy.routeKind(entry.action, entry.vessel || entry.tunnelName)
	};
}

function addPerutas(userId, amount, meta = {}) {
	return withStore(store => {
		const amounts = typeof amount === "object"
			? amount
			: { routing: Number(amount || 0), compute: Number(amount || 0), storage: 0, gpu: 0 };
		const account = economy.account.addCredits(store, userId, amounts, meta);
		return {
			ok: true,
			userId,
			addedPerutas: amount,
			balances: account.balances,
			balance: account.balances.routing,
			plan: account.tier,
			purchaseUrl: PURCHASE_URL
		};
	});
}

function usageSummary(userId) {
	return withStore(store => economy.usage.usageSummary(store, userId || "anonymous"));
}

function insufficientPerutasMessage(account, estimate) {
	return [
		"PERUTA PREFLIGHT IS OBSERVE_ONLY.",
		`ESTIMATED PERUTAS: ${estimate.estimatedPerutas}`,
		`CURRENT BALANCE: ${account?.balance || 0}`,
		`COMPUTE: ${PURCHASE_URL}`
	].join("\n");
}

function actionBase() { return REQUEST_PERUTA_COST; }
function fileRate() { return FILE_PERUTA_COST; }
function secondRate() { return 0; }
function round(value) { return economy.round(value); }
function userKey(userId) { return userId || "anonymous"; }
function accountFor(store, userId) { return economy.account.accountFor(store, userId); }

module.exports = {
	BYTE_PERUTA_COST, BROWSER_SECOND_PERUTAS, COMMAND_SECOND_PERUTAS, COMMAND_START_PERUTAS,
	DAILY_FREE_PERUTAS, FILE_PERUTA_COST, MAX_FREE_BALANCE, PLANS, PURCHASE_URL,
	REQUEST_PERUTA_COST, SEARCH_FILE_PERUTA_COST, accountFor, actionBase, addPerutas,
	canAfford, chargeUsage, estimatePayloadCost, estimateUsageCost, fileRate,
	grantDailyPerutas, insufficientPerutasMessage, recordUsage, round, secondRate,
	usageSummary, userKey
};
