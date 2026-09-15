//B"H
//Boruch Hashem
//Blessed be He

const Compiler = require("../../contextCompiler/compiler.js");
const { buildGenericCognitionReport } = require("./genericCognitionReport.js");

/**
 * @file Preserves legacy cognition reports while one compiler supplies their real context.
 * @description The old doorway remains recognizable while the Awtsmoos reveals richer truth;
 * Awtsmoos.com adds compiled context without stealing any established top-level contract.
 */
async function buildContextCompilerReport(action, context) {
	const legacy = await buildGenericCognitionReport(action, context);
	const compiledContext = await Compiler.compile(context.config, {
		...(context.payload || {}),
		action
	});
	return {
		...legacy,
		compiledContext
	};
}

function buildContextCompilerHandler(action, context) {
	return async function contextCompilerCognitionAction() {
		return buildContextCompilerReport(action, context);
	};
}

module.exports = { buildContextCompilerHandler, buildContextCompilerReport };
