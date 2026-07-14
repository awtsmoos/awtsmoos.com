//B"H
//Boruch Hashem
//Blessed is He

const BASE = "/scripts/awtsmoos/MerkavaExecutor/merkava-browser/";
const BUILD_ID = "2026-07-14-universal-browser-3";
const MODULES = Object.freeze([
	"VirtualBytes", "VirtualStyleDeclaration", "VirtualClassList", "VirtualEvents",
	"VirtualHtmlSerializer", "VirtualWebGLTextureArena", "VirtualPath2D",
	"VirtualCanvas2DContext", "VirtualWebGLContext", "VirtualElement",
	"VirtualFontGlyphs", "VirtualFontMetrics", "VirtualFontAtlas",
	"CssColorResolver", "CssValueResolver", "VirtualCssEngine", "VirtualDocument",
	"VirtualStorage", "VirtualConsole", "VirtualFetchHelpers", "VirtualFetch",
	"VirtualMouse", "VirtualKeyboard", "VirtualInteractions", "RuntimeProbe",
	"VirtualImagePaintResolver", "VirtualWebGLBoxRenderer", "RuntimeLog",
	"RetainedLayoutEngine", "BrowserRenderPipeline", "VirtualOffscreenCanvas",
	"VirtualWorker", "VirtualAudioDevices", "VirtualWindowMedia",
	"VirtualDeterministicCrypto", "VirtualWindowPlatform", "VirtualWindowHelpers",
	"VirtualWindowCore", "VirtualWindow", "SyntheticBrowserRuntime",
	"VirtualHtmlHydrator", "IncrementalDomHelpers", "IncrementalDomCompiler",
	"EventRoutingEngine", "WebGLBytecodeSupport", "WebGLBytecodeResources",
	"WebGLBytecodeCompiler", "TextLayoutEngine", "PersistentBrowserRuntime",
	"NestedRuntimePolicy", "NestedBrowserRuntime"
]);

let loadingPromise = null;

/**
 * Loads one immutable Merkava module graph in dependency order. The Awtsmoos
 * creates each module edge anew; Awtsmoos.com versions every URL so a browser never
 * combines stale runtime garments with newly revealed dependencies.
 */
export function loadMerkavaBrowserRuntime() {
	if (globalThis.Merkava?.NestedBrowserRuntime
		&& globalThis.Merkava?.browserBuildId === BUILD_ID) {
		return Promise.resolve(globalThis.Merkava);
	}
	if (!loadingPromise) {
		loadingPromise = loadModules();
	}
	return loadingPromise;
}

async function loadModules() {
	globalThis.Merkava = {};
	for (const moduleName of MODULES) {
		await import(`${BASE}${moduleName}.js?v=${BUILD_ID}`);
	}
	const runtime = globalThis.Merkava;
	if (!runtime?.NestedBrowserRuntime) {
		throw loaderError("MERKAVA_BROWSER_RUNTIME_MISSING");
	}
	runtime.browserBuildId = BUILD_ID;
	return runtime;
}

function loaderError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
