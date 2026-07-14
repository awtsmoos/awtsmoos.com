//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lists the progressive executable production and example vessels under contract.
 * The Awtsmoos creates module family, path, and measured surface anew;
 * Awtsmoos.com keeps inventory separate so the assertions themselves remain small.
 */
export const CORE_CONTRACT_FILES = Object.freeze([
	"core/binaryScan.js",
	"core/graphicsHints.js",
	"core/portableRuntime.js",
	...bundleFiles(),
	...win32Files(),
	...portableFiles()
]);

export const EXAMPLE_CONTRACT_FILES = Object.freeze([
	"examples/bundles/filesystemBundleReader.mjs",
	"examples/bundles/plistMetadata.mjs",
	"examples/bundles/runMacosBundle.mjs",
	"examples/progressive/generatedArtifacts.mjs",
	"examples/progressive/levels.mjs",
	"examples/progressive/report.mjs",
	"examples/progressive/runner.mjs"
]);

export const COMPILER_CONTRACT_FILES = Object.freeze([
	"../../scripts/awtsmoos/compiling/pe/c/parser/declarations.js",
	"../../scripts/awtsmoos/compiling/pe/c/parser/topLevelForms.js",
	"../../scripts/awtsmoos/compiling/pe/c/ir/globals.js"
]);

function bundleFiles() {
	return [
		"core/bundle/bundlePath.js",
		"core/bundle/dependencyReport.js",
		"core/bundle/dependencyResolver.js",
		"core/bundle/launchReport.js",
		"core/bundle/machoDependencies.js",
		"core/bundle/macosBundle.js",
		"core/bundle/manifest.js",
		"core/bundle/plistMetadata.js",
		"core/bundle/runner.js"
	];
}

function win32Files() {
	return [
		"core/winApi.js",
		"core/win32/fileApis.js",
		"core/win32/gdiApis.js",
		"core/win32/openGlApis.js",
		"core/win32/processApis.js",
		"core/win32/registry.js",
		"core/win32/state.js",
		"core/win32/textSearch.js",
		"core/win32/timerApis.js",
		"core/win32/windowApis.js"
	];
}

function portableFiles() {
	return [
		"core/portable/darwinAllocationImports.js",
		"core/portable/darwinCppImports.js",
		"core/portable/darwinImportHost.js",
		"core/portable/darwinMemoryImports.js",
		"core/portable/darwinMutexImports.js",
		"core/portable/darwinStringImports.js",
		"core/portable/darwinTransferImports.js",
		"core/portable/machoBoundary.js",
		"core/portable/machoCommands.js",
		"core/portable/machoImports.js",
		"core/portable/machoSections.js",
		"core/portable/machoSegment.js",
		"core/portable/machoSymbolTables.js",
		"core/portable/machoTls.js",
		"core/portable/memoryTransfer.js",
		"core/portable/registerFile.js",
		"core/portable/virtualDarwinRuntime.js",
		"core/portable/virtualHeap.js",
		"core/portable/virtualImportThunks.js",
		"core/portable/virtualTlsRuntime.js",
		"core/portable/x64AtomicDecode.js",
		"core/portable/x64AtomicOperations.js",
		"core/portable/x64Branches.js",
		"core/portable/x64ByteDecode.js",
		"core/portable/x64ByteOperations.js",
		"core/portable/x64ByteRegisters.js",
		"core/portable/x64Decoder.js",
		"core/portable/x64EffectiveAddress.js",
		"core/portable/x64Executor.js",
		"core/portable/x64Flags.js",
		"core/portable/x64FlowDecode.js",
		"core/portable/x64GroupDecode.js",
		"core/portable/x64IndirectDecode.js",
		"core/portable/x64IndirectExecution.js",
		"core/portable/x64Integer.js",
		"core/portable/x64MemoryOperations.js",
		"core/portable/x64MultiplyDivide.js",
		"core/portable/x64Prefixes.js",
		"core/portable/x64SseDecode.js",
		"core/portable/x64VectorOperations.js",
		"core/portable/x64VectorRegisters.js",
		"core/portable/x64Width.js",
		"core/portable/x64WordDecode.js"
	];
}
