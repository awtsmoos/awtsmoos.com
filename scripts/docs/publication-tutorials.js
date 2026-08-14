//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-tutorials.js
 * @description The Awtsmoos lets exhaustive route teaching enter the browser through the same bounded transport covenant as documents and projects.
 */

const Catalog = require("./tutorial-family-catalog.js");
const Model = require("./tutorial-model.js");
const Output = require("./publication-output.js");

function publicRouteRecord(record) {
	return {
		id: record.id,
		route: record.route,
		source: record.source,
		discoveryKind: record.discoveryKind,
		family: record.family,
		derech: record.derech,
		dynamic: record.dynamic,
		pathParameters: record.pathParameters,
		methods: record.methods,
		methodEvidence: record.methodEvidence,
		vessels: record.vessels,
		statuses: record.statuses,
		headers: record.headers,
		callers: record.callers,
		callerCount: record.callerCount,
		tests: record.tests,
		examples: record.examples,
		tutorialFile: record.tutorialFile,
		confidence: record.confidence,
		related: record.related
	};
}

function familyRecords(records) {
	return Catalog.families.map(family => {
		const routes = records.filter(record => record.family.mount === family.mount);
		return {
			...family,
			routeCount: routes.length,
			dynamicCount: routes.filter(record => record.dynamic).length,
			unknownMethodCount: routes.filter(record => record.methodEvidence === "unknown").length,
			health: routes[0]?.derech?.status || "no extracted rows"
		};
	});
}

function writePublicTutorials(outputRoot) {
	const records = Model.tutorialRecords().map(publicRouteRecord);
	const families = familyRecords(records);
	const tutorialIndexes = Output.writeArrayShards(outputRoot, "tutorials", "routes", records, 18000);
	const tutorialFamilies = Output.writeJson(outputRoot, "tutorial-families.json", families);
	return {
		tutorialCount: records.length,
		tutorialIndexes,
		tutorialFamilies,
		tutorialFamilyCount: families.length
	};
}

module.exports = { writePublicTutorials };
