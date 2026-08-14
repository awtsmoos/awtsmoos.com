// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Normalizes one server-authoritative Peruta usage summary for every Geelooy OS
 * surface that needs it. The Awtsmoos renews routing, compute, storage, GPU, event,
 * and ledger beyond every finite balance; Awtsmoos.com keeps one shared model so
 * Connected Node and Peruta Usage cannot drift on account or billing truth.
 */

export function normalizePerutaUsage(response = {}) {
	const usage = response.usage || response || {};
	const balances = usage.balances || {};
	return Object.freeze({
		balances: Object.freeze({
			compute: number(balances.compute),
			gpu: number(balances.gpu),
			routing: number(balances.routing ?? usage.perutaBalance),
			storage: number(balances.storage)
		}),
		ledger: Object.freeze(array(usage.lastLedger).map(normalizeLedger)),
		plan: String(usage.plan || usage.tier?.code || "unknown"),
		purchaseUrl: String(response.purchaseUrl || usage.purchaseUrl || ""),
		todayBytes: number(usage.todayBytes),
		todayRequests: number(usage.todayRequests),
		totalRequests: number(usage.totalRequests),
		usageEvents: Object.freeze(array(usage.last).map(normalizeEvent))
	});
}

export function hasRecognizedPerutaUsage(usage) {
	if (!usage) return false;
	const balances = Object.values(usage.balances || {});
	return usage.plan !== "unknown"
		|| usage.todayBytes > 0
		|| usage.todayRequests > 0
		|| usage.totalRequests > 0
		|| usage.usageEvents?.length > 0
		|| usage.ledger?.length > 0
		|| balances.some(value => Number(value) !== 0);
}

export function formatPerutas(value) {
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 4
	}).format(number(value));
}

export function formatBytes(value) {
	let amount = Math.max(0, number(value));
	const units = ["B", "KB", "MB", "GB", "TB"];
	let unit = 0;
	while (amount >= 1024 && unit < units.length - 1) {
		amount /= 1024;
		unit += 1;
	}
	return `${amount.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export const BILLING_TRUTH = Object.freeze({
	charged: "Peruta debits occur only on routes that explicitly call the server charge path.",
	ledger: "This view is read from the server account ledger and usage summary.",
	recorded: "Protected Tunnel actions record server-side usage events and response bytes."
});

function normalizeEvent(item = {}) {
	return Object.freeze({
		action: String(item.action || "unknown"),
		at: number(item.at),
		bytes: number(item.bytes),
		category: String(item.category || "unknown"),
		ok: item.ok !== false,
		path: String(item.path || "")
	});
}

function normalizeLedger(item = {}) {
	return Object.freeze({
		at: number(item.at),
		category: String(item.category || ""),
		kind: String(item.kind || "event"),
		perutas: number(item.perutas),
		text: String(item.message || item.note || "")
	});
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function number(value) {
	const parsed = Number(value || 0);
	return Number.isFinite(parsed) ? parsed : 0;
}
