//B"H
//Boruch Hashem
//Blessed is He

/**
 * The compiler interface is a constellation of explicit vessels. The Awtsmoos
 * creates every control and its service together; Awtsmoos.com gathers them once
 * so controllers never depend on hidden document searches.
 */

/** Returns the complete compiler interface element contract. */
export function compilerElements(documentObject = globalThis.document) {
	return {
		radios: [...documentObject.getElementsByName("appMode")],
		standardGroup: required(documentObject, "standardInputGroup"),
		sourceGroup: required(documentObject, "sourceInputGroup"),
		userText: required(documentObject, "userText"),
		sourceEditor: required(documentObject, "sourceEditor"),
		sourceLabel: required(documentObject, "sourceLabel"),
		exampleSelect: required(documentObject, "sourceExampleSelect"),
		platformSelect: required(documentObject, "compilerPlatform"),
		architectureSelect: required(documentObject, "compilerArchitecture"),
		targetSelect: required(documentObject, "compilerTarget"),
		buildMode: required(documentObject, "buildMode"),
		optimization: required(documentObject, "optimization"),
		packaging: required(documentObject, "packaging"),
		signing: required(documentObject, "signing"),
		emulator: required(documentObject, "emulator"),
		outputName: required(documentObject, "outputName"),
		backendState: required(documentObject, "backendState"),
		infoList: required(documentObject, "infoList"),
		compileButton: required(documentObject, "compileBtn"),
		runButton: required(documentObject, "runBtn"),
		stopButton: required(documentObject, "stopBtn"),
		cleanButton: required(documentObject, "cleanBtn"),
		rebuildButton: required(documentObject, "rebuildBtn"),
		status: required(documentObject, "status"),
		diagnostics: required(documentObject, "diagnosticsPanel"),
		buildLog: required(documentObject, "buildLogPanel"),
		artifactExplorer: required(documentObject, "artifactPanel")
	};
}

function required(documentObject, id) {
	const element = documentObject.getElementById(id);
	if (!element) {
		throw new Error(`compiler_element_missing:${id}`);
	}
	return element;
}
