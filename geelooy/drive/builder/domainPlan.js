//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public-domain and nameserver planning for Geelooy Sites.
 * @description The Awtsmoos distinguishes hostname, ownership, DNS, route, and TLS while Awtsmoos.com refuses to turn a browser plan into false authority.
 */

export const DOMAIN_MODES = Object.freeze([
	mode("external-dns", "Keep current DNS provider", true, "Verify ownership, then add the issued routing records at the current provider."),
	mode("custom-nameservers", "Use custom nameservers", true, "Delegate at the registrar, then add Awtsmoos records inside that external DNS zone."),
	mode("awtsmoos-nameservers", "Use Awtsmoos nameservers", false, "Unavailable: production has no authoritative Awtsmoos DNS service yet.")
]);

export function buildDomainPlan(input = {}) {
	const hostname = normalizeHostname(input.hostname);
	const modeId = String(input.mode || "external-dns");
	const selected = DOMAIN_MODES.find(item => item.id === modeId);
	if (!selected) throw domainError("INVALID_DOMAIN_MODE");
	const nameservers = modeId === "custom-nameservers" ? normalizeNameservers(input.nameservers) : [];
	const available = selected.available;
	return Object.freeze({
		hostname,
		mode: modeId,
		status: available ? "unclaimed" : "infrastructure-unavailable",
		ownership: ownershipPlan(hostname),
		nameservers,
		routing: routingPlan(hostname, selected, nameservers),
		stages: domainStages(available),
		infrastructure: selected.reason
	});
}

export function normalizeHostname(value) {
	const raw = String(value || "").trim();
	if (!raw || raw !== raw.replace(/\.$/, "") && raw.endsWith("..")) throw domainError("INVALID_HOSTNAME");
	if (/\s|[/?#@:]|^\.|\.\.$/.test(raw)) throw domainError("INVALID_HOSTNAME");
	let hostname;
	try {
		hostname = new URL(`http://${raw.replace(/\.$/, "")}`).hostname.toLowerCase();
	} catch {
		throw domainError("INVALID_HOSTNAME");
	}
	if (!validPublicHostname(hostname)) throw domainError("INVALID_HOSTNAME");
	if (hostname === "awtsmoos.com" || hostname.endsWith(".awtsmoos.com")) {
		throw domainError("RESERVED_AWTSMOOS_HOSTNAME");
	}
	return hostname;
}

export function normalizeNameservers(value) {
	const source = Array.isArray(value) ? value : String(value || "").split(/[\s,]+/);
	const unique = [...new Set(source.filter(Boolean).map(normalizeHostname))];
	if (unique.length < 2 || unique.length > 8) throw domainError("NAMESERVERS_REQUIRE_TWO_TO_EIGHT_HOSTS");
	return Object.freeze(unique);
}

function ownershipPlan(hostname) {
	return Object.freeze({
		type: "TXT",
		name: `_awtsmoos-site.${hostname}`,
		value: "Issued only by the server after an owned site claim is created.",
		status: "server-token-required"
	});
}

function routingPlan(hostname, selected, nameservers) {
	if (!selected.available) return Object.freeze({ available: false, records: [], instruction: selected.reason });
	if (selected.id === "custom-nameservers") return Object.freeze({
		available: true,
		instruction: `Delegate ${hostname} to these external nameservers, then add the server-issued ownership and routing records in that zone.`,
		nameservers
	});
	return Object.freeze({
		available: true,
		instruction: `Keep the current provider for ${hostname}; add only the ownership and routing records issued by the Awtsmoos server.`,
		recommendedTarget: "awtsmoos.com",
		targetStatus: "instruction-only"
	});
}

function domainStages(available) {
	return Object.freeze([
		stage("ownership", available ? "unclaimed" : "blocked", "Server claim and TXT proof"),
		stage("dns", available ? "dns-pending" : "blocked", "Public DNS verification"),
		stage("routing", available ? "route-pending" : "blocked", "Verified hostname mapping"),
		stage("tls", available ? "tls-pending" : "blocked", "Certificate and HTTPS health")
	]);
}

function validPublicHostname(hostname) {
	if (!hostname || hostname.length > 253 || !hostname.includes(".") || hostname.includes("_")) return false;
	if (/^\d+(?:\.\d+){3}$/.test(hostname) || hostname === "localhost") return false;
	return hostname.split(".").every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

function mode(id, label, available, reason) {
	return Object.freeze({ id, label, available, reason });
}

function stage(id, status, label) {
	return Object.freeze({ id, status, label });
}

function domainError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
