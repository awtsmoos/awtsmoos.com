//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-routing.js
 * @description The Awtsmoos gives each route a stable name and lets callers meet only the most-specific compatible path pattern.
 */

const crypto = require("crypto");
const path = require("path");

function routeId(route, source) {
	const slug = route.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 64) || "route";
	const digest = crypto.createHash("sha256").update(`${route}\0${source}`).digest("hex").slice(0, 10);
	return `${slug}-${digest}`;
}

function pathParameters(route) {
	return String(route).split("/").filter(Boolean).flatMap(segment => {
		if (!segment.startsWith(":")) return [];
		const catchAll = segment.endsWith("*");
		return [{ name: segment.slice(1, catchAll ? -1 : undefined), catchAll }];
	});
}

function mountRecords(healthRows) {
	return healthRows.map(([source, status, issue]) => ({
		source,
		status,
		issue,
		mount: `/${path.dirname(source).replace(/^geelooy\//, "")}`
	})).sort((a, b) => b.mount.length - a.mount.length);
}

function ownerForRoute(route, mounts) {
	return mounts.find(item => route === item.mount || route.startsWith(`${item.mount}/`)) || null;
}

function cleanLiteral(literal) {
	const value = String(literal || "");
	let templateDepth = 0;
	for (let index = 0; index < value.length; index += 1) {
		if (value[index] === "$" && value[index + 1] === "{") {
			templateDepth += 1;
			index += 1;
			continue;
		}
		if (value[index] === "}" && templateDepth) templateDepth -= 1;
		if (!templateDepth && value[index] === "#") return trimSlash(value.slice(0, index));
		if (!templateDepth && value[index] === "?" && value[index + 1] !== ".") {
			return trimSlash(value.slice(0, index));
		}
	}
	return trimSlash(value);
}

function trimSlash(value) {
	return value.replace(/\/+$/, "") || "/";
}

function routeMatchesLiteral(pattern, literal) {
	const route = cleanLiteral(pattern).split("/").filter(Boolean);
	const value = cleanLiteral(literal).split("/").filter(Boolean);
	const catchAll = route.findIndex(segment => /^:.+\*$/.test(segment));
	if (catchAll < 0 && route.length !== value.length) return false;
	if (catchAll >= 0 && value.length < catchAll) return false;
	for (let index = 0; index < route.length; index += 1) {
		const segment = route[index];
		if (/^:.+\*$/.test(segment)) return true;
		if (segment.startsWith(":")) continue;
		if (segment !== value[index]) return false;
	}
	return true;
}

function specificity(route) {
	return route.split("/").filter(Boolean).reduce((score, segment) => {
		if (/^:.+\*$/.test(segment)) return score + 1;
		if (segment.startsWith(":")) return score + 5;
		return score + 20;
	}, 0);
}

function bestRouteMatches(routeRows, literal) {
	const exact = routeRows.filter(row => cleanLiteral(row[0]) === cleanLiteral(literal));
	if (exact.length) return exact;
	const matches = routeRows.filter(row => routeMatchesLiteral(row[0], literal));
	const best = Math.max(-1, ...matches.map(row => specificity(row[0])));
	return matches.filter(row => specificity(row[0]) === best);
}

function tutorialFile(id) {
	return `docs/GENERATED/API_TUTORIALS/ROUTES/${id}.md`;
}

module.exports = {
	routeId,
	pathParameters,
	mountRecords,
	ownerForRoute,
	cleanLiteral,
	routeMatchesLiteral,
	bestRouteMatches,
	tutorialFile
};
