//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-evidence.js
 * @description The Awtsmoos joins route, caller, contract, health, and test traces while Awtsmoos.com keeps heuristic evidence labeled as heuristic.
 */

const Discovery = require("./discovery.js");
const Contracts = require("./api-contract-discovery.js");
const Callers = require("./caller-discovery.js");
const Runtime = require("./runtime-discovery.js");
const Routing = require("./tutorial-routing.js");

function splitEvidence(value, empty = []) {
	if (!value || value === "—" || value === "unknown") return empty;
	return value.split(",").map(item => item.trim()).filter(Boolean);
}

function contractMap() {
	return new Map(Contracts.contractRows().map(row => [row[0], {
		methods: row[1] === "unknown" ? [] : splitEvidence(row[1]),
		methodLabel: row[1],
		vessels: splitEvidence(row[2]),
		statuses: splitEvidence(row[3]),
		headers: splitEvidence(row[4])
	}]));
}

function routeKey(route, source) {
	return `${route}\0${source}`;
}

function callerMap(routeRows, callerRows) {
	const mapped = new Map();
	for (const row of callerRows) {
		for (const match of Routing.bestRouteMatches(routeRows, row[0])) {
			const key = routeKey(match[0], match[1]);
			const values = mapped.get(key) || [];
			values.push({ literal: row[0], source: row[1], kind: row[2] });
			mapped.set(key, values);
		}
	}
	return mapped;
}

function callersFor(route, source, mapped) {
	return mapped.get(routeKey(route, source)) || [];
}

function testsFor(mount, scripts) {
	const token = mount.replace(/^\/api\/?/, "").replace(/\//g, "-") || "routes";
	const parts = token === "routes" ? ["route"] : token.toLowerCase().split("-");
	return scripts.filter(([name, command]) => {
		const text = `${name} ${command}`.toLowerCase();
		return parts.some(part => part.length > 2 && text.includes(part));
	}).map(([name, command]) => ({ name, command })).slice(0, 8);
}

function evidenceSnapshot() {
	const routes = Discovery.apiRows();
	const callers = Callers.callerRows();
	return {
		routes,
		contracts: contractMap(),
		health: Contracts.derechHealthRows(),
		callers: callerMap(routes, callers),
		tests: Runtime.testScriptRows()
	};
}

module.exports = {
	evidenceSnapshot,
	callersFor,
	testsFor
};
