//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-model.js
 * @description The Awtsmoos gathers every discovered API row into a teaching record whose confidence and provenance remain visible beside each fact.
 */

const Catalog = require("./tutorial-family-catalog.js");
const Evidence = require("./tutorial-evidence.js");
const Examples = require("./tutorial-examples.js");
const Routing = require("./tutorial-routing.js");

function baseRecord(row, snapshot, mounts) {
	const [route, source, discoveryKind] = row;
	const owner = Routing.ownerForRoute(route, mounts);
	const family = Catalog.familyByMount(owner?.mount) || {
		mount: owner?.mount || "/api",
		title: owner?.mount || "API",
		manual: "docs/API/README.md"
	};
	const contract = snapshot.contracts.get(source) || {
		methods: [], methodLabel: "unknown", vessels: [], statuses: [], headers: []
	};
	const callers = Evidence.callersFor(route, source, snapshot.callers);
	const id = Routing.routeId(route, source);
	return {
		schema: "awtsmoos-api-tutorial-v1",
		id,
		route,
		source,
		discoveryKind,
		family: { mount: family.mount, title: family.title, manual: family.manual },
		derech: owner || null,
		dynamic: route.includes(":"),
		pathParameters: Routing.pathParameters(route),
		methods: contract.methods,
		methodEvidence: contract.methodLabel,
		vessels: contract.vessels,
		statuses: contract.statuses,
		headers: contract.headers,
		callers: callers.slice(0, 12),
		callerCount: callers.length,
		tests: Evidence.testsFor(family.mount, snapshot.tests),
		examples: Examples.examplesFor(route, contract.methods),
		tutorialFile: Routing.tutorialFile(id),
		confidence: contract.methods.length ? "source-lexical" : "unknown-method"
	};
}

function related(records, record) {
	return records.filter(other => {
		return other.id !== record.id && (
			other.source === record.source
			|| other.family.mount === record.family.mount
		);
	}).slice(0, 8).map(other => ({ id: other.id, route: other.route }));
}

function tutorialRecords() {
	const snapshot = Evidence.evidenceSnapshot();
	const mounts = Routing.mountRecords(snapshot.health);
	const records = snapshot.routes.map(row => baseRecord(row, snapshot, mounts));
	return records.map(record => ({ ...record, related: related(records, record) }));
}

module.exports = { tutorialRecords };
