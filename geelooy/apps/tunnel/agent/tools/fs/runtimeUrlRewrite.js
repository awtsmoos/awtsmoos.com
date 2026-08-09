// B"H

/** B"H — Applies explicit, same-origin network rewrites to collected modules. */
function collectNetworkRewriteRules(payload = {}) {
	const rules = [];
	if (truthy(payload.compactModules)) {
		rules.push({
			name: "compactModules",
			sameOrigin: true,
			kind: ["js"],
			match: ["**/*.js", "**/*.mjs"],
			appendQuery: { compact: "true" }
		});
	}
	const explicit = jsonMaybe(payload.networkRewrite, json64(payload.networkRewrite64, []));
	const list = Array.isArray(explicit) ? explicit : explicit ? [explicit] : [];
	for (const rule of list) {
		if (rule && rule.enabled !== false) rules.push({ sameOrigin: true, ...rule });
	}
	return rules;
}

function rewriteRequestUrl({ url, kind, pageUrl, rules, diagnostics }) {
	let current = url;
	for (const rule of rules || []) {
		const before = current;
		if (!ruleMatches({ rule, url: current, kind, pageUrl })) continue;
		current = applyRewriteRule(current, rule);
		if (current !== before) {
			diagnostics.push({
				kind: "network-rewrite",
				rule: rule.name || null,
				url: before,
				rewrittenUrl: current
			});
		}
	}
	return current;
}

function ruleMatches({ rule, url, kind, pageUrl }) {
	let parsed;
	try { parsed = new URL(url); } catch (_) { return false; }
	if (rule.sameOrigin !== false && parsed.origin !== pageUrl.origin) return false;
	if (rule.kind && !list(rule.kind).includes(kind)) return false;
	if (rule.extensions && !list(rule.extensions).some(extension => {
		return parsed.pathname.toLowerCase().endsWith(String(extension).toLowerCase());
	})) return false;
	if (rule.pathnamePrefix && !parsed.pathname.startsWith(rule.pathnamePrefix)) return false;
	if (rule.match && !list(rule.match).some(pattern => globMatch(pattern, parsed.pathname))) return false;
	if (rule.regex && !(new RegExp(String(rule.regex))).test(url)) return false;
	return true;
}

function applyRewriteRule(url, rule) {
	const parsed = new URL(url);
	if (rule.to || rule.rewriteTo) return templateUrl(rule.to || rule.rewriteTo, parsed);
	for (const [key, value] of Object.entries(rule.appendQuery || rule.query || {})) {
		if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, String(value));
	}
	for (const [key, value] of Object.entries(rule.setQuery || {})) {
		parsed.searchParams.set(key, String(value));
	}
	return parsed.href;
}

function templateUrl(template, parsed) {
	return String(template)
		.replaceAll("{href}", parsed.href)
		.replaceAll("{origin}", parsed.origin)
		.replaceAll("{pathname}", parsed.pathname)
		.replaceAll("{search}", parsed.search)
		.replaceAll("{hash}", parsed.hash);
}

function publicRule(rule) {
	const {
		name, match, kind, sameOrigin, appendQuery, query, setQuery,
		pathnamePrefix, regex, to, rewriteTo
	} = rule;
	return {
		name, match, kind, sameOrigin, appendQuery, query, setQuery,
		pathnamePrefix, regex, to, rewriteTo
	};
}

function globMatch(pattern, pathname) {
	const escaped = String(pattern || "**")
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "\u0000")
		.replace(/\*/g, "[^/]*")
		.replace(/\u0000/g, ".*");
	return new RegExp(`^${escaped}$`).test(pathname)
		|| new RegExp(`^/?${escaped}$`).test(pathname);
}

function json64(value, fallback) {
	if (!value) return fallback;
	try { return JSON.parse(Buffer.from(String(value), "base64").toString("utf8")); }
	catch (_) { return fallback; }
}

function jsonMaybe(value, fallback) {
	if (value == null || value === "") return fallback;
	if (typeof value === "object") return value;
	try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function truthy(value) {
	return value === true || value === 1 || /^(true|1|yes)$/i.test(String(value || ""));
}

function list(value) { return Array.isArray(value) ? value : [value]; }

module.exports = { collectNetworkRewriteRules, rewriteRequestUrl, publicRule };
