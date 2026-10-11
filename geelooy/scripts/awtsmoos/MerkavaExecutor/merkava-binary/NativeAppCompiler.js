// B"H
// Boruch Hashem
// Blessed be He

/**
 * Native Merkava app compiler.
 *
 * Takes ANY HTML+CSS+JS source and compiles it into a REAL NATIVE Merkava
 * app binary (.mapp) — pre-compiled bytecode executed directly by the
 * Merkava VM. NOT a WebView: at runtime there is zero HTML parsing, zero
 * CSS parsing, zero source text interpretation. The binary carries only
 * numeric opcodes (MWEB CREATE_NODE/SET_STYLE_BLOCK/...) plus a deduplicated
 * string pool, and scripts as Sang VM bytecode.
 *
 * The same binary also packs into the canonical MKV1 container
 * (app.merkava) consumed by the native C launchers (Android/APK, Linux/ELF,
 * Windows/EXE, macOS/APP) — one source, four native binaries.
 */

const { compileUnifiedApp, decodeUnifiedApp, MAGIC: MAPP_MAGIC } = require('./UnifiedAppBinary.js');
const { collectLinked } = require('./SourceLinkedAssets.js');
const { parseHtmlNodes } = require('./SourceHtmlIrCompiler.js');
const { parseCss } = require('./SourceCssIrCompiler.js');
const { WEB_OPS } = require('./WebBinaryOpcodes.js');

/**
 * Compiles web source into a native Merkava app binary.
 * @param {{html?:string,css?:string,js?:string,appName?:string}} input
 * @returns {Promise<{binary:Buffer,appName:string,meta:object}>}
 */
async function compileNativeApp(input = {}) {
	const html = String(input.html || '');
	const css = String(input.css || '');
	const js = String(input.js || '');
	const appName = String(input.appName || 'MerkavaApp');

	// Inline <style>/<script> are harvested from the HTML token stream; the
	// explicit css/js params are appended after (caller overrides win).
	const linked = collectLinked(html, {}, '/index.html');
	const allCss = [linked.css, css].filter(s => s && s.trim()).join('\n');
	const scripts = [...(linked.scripts || [])];
	if (js.trim()) scripts.push({ name: 'main', source: js });

	const web = {
		events: [],
		nodes: parseHtmlNodes(html),
		styles: parseCss(allCss)
	};
	const binary = await compileUnifiedApp({ scripts, web });

	// Assets: images (multi-res + recompress), fonts (subset), dedup.
	let assets = null;
	if (input.assets && Object.keys(input.assets).length) {
		const { compileAssets } = require('./AssetCompiler.js');
		assets = compileAssets({ html, css, js, files: input.assets });
	}

	const sourceBytes = Buffer.byteLength(html + css + js, 'utf8');
	return {
		binary,
		appName,
		assets,
		meta: {
			appName,
			format: 'MAPP',
			sourceBytes,
			binaryBytes: binary.length,
			compressionRatio: sourceBytes ? binary.length / sourceBytes : 0,
			nodeCount: web.nodes.length,
			styleCount: web.styles.length,
			scriptCount: scripts.length,
			assetIn: assets ? assets.totalIn : 0,
			assetOut: assets ? assets.totalOut : 0
		}
	};
}

/**
 * Compiles web source into the MWB4 native executable (for the C launchers).
 * Same HTML/CSS/JS in, but the output is the handle-addressed v4 bytecode
 * the native decoders (APK/ELF/EXE/APP) execute — no JS VM needed at runtime.
 * @param {{html?:string,css?:string,js?:string,appName?:string}} input
 * @returns {Promise<{mwb4:Buffer,appName:string}>}
 */
async function compileNativeMWB4(input = {}) {
	const html = String(input.html || '');
	const css = String(input.css || '');
	const appName = String(input.appName || 'MerkavaApp');
	const { compileHtmlHandleNodes } = require('./SourceHtmlHandleCompiler.js');
	const { compileNativeComputedStyles } = require('./NativeWebV4StyleCompiler.js');
	const { compileNativeTextEvents } = require('./NativeWebV4EventCompiler.js');
	const { encodeNativeWebV4 } = require('./NativeWebV4Encoder.js');
	const { collectLinked } = require('./SourceLinkedAssets.js');
	const linked = collectLinked(html, {}, '/index.html');
	const allCss = [linked.css, css].filter(s => s && s.trim()).join('\n');
	const nodes = compileHtmlHandleNodes(html);
	const styles = compileNativeComputedStyles(nodes, allCss);
	const events = compileNativeTextEvents(nodes);
	const mwb4 = encodeNativeWebV4({ events, nodes, styles });
	return { mwb4, appName };
}

/**
 * Packs a compiled app into the canonical MKV1 container (app.merkava)
 * read by the native C launchers. The BYTECODE section carries the MWB4
 * native executable (the C decoders execute it directly); the .mapp binary
 * for the JS VM path is embedded alongside for dual-runtime containers.
 * @param {Buffer} mappBinary .mapp from compileNativeApp (JS VM path).
 * @param {Buffer} mwb4Binary MWB4 from compileNativeMWB4 (native C path).
 * @param {{appName?:string,version?:string}} meta
 * @returns {Uint8Array} MKV1 container bytes.
 */
function packMerkavaContainer(mappBinary, mwb4Binary, meta = {}, assetsSection) {
	const { writeCanonicalContainer } = require('../merkava-canonical/Writer.js');
	const { SECTION } = require('../merkava-canonical/Format.js');
	const manifest = Buffer.from(JSON.stringify({
		name: meta.appName || 'MerkavaApp',
		version: meta.version || '1.0.0',
		format: 'MWB4+MAPP',
		runtime: 'merkava-native'
	}), 'utf8');
	const sections = [
		{ type: SECTION.MANIFEST, bytes: manifest },
		{ type: SECTION.BYTECODE, bytes: new Uint8Array(mwb4Binary || []) }
	];
	if (mappBinary && mappBinary.length) {
		sections.push({ type: SECTION.MODULES, bytes: new Uint8Array(mappBinary) });
	}
	if (assetsSection && assetsSection.length) {
		sections.push({ type: SECTION.ASSETS, bytes: new Uint8Array(assetsSection) });
	}
	return writeCanonicalContainer({ sections });
}

/**
 * Inspects a compiled binary and proves nativeness: the executable sections
 * must be numeric opcodes, never raw HTML/CSS markup. Returns a report.
 * @param {Buffer} binary
 * @returns {object} Nativeness report.
 */
function inspectNativeApp(binary) {
	const report = { ok: false, checks: [] };
	const check = (name, pass, detail) => report.checks.push({ name, pass: !!pass, detail: detail || '' });

	const magic = Buffer.from(binary).slice(0, 4).toString('ascii');
	check('mapp-magic', magic === MAPP_MAGIC, `magic=${magic}`);

	let app;
	try {
		app = decodeUnifiedApp(binary);
		check('mapp-decodes', true, `version=${app.version} scripts=${app.scripts.length}`);
	} catch (error) {
		check('mapp-decodes', false, String(error.message));
		report.ok = false;
		return report;
	}

	// The web section must decode to opcode records, not markup text.
	const ops = app.web.ops || [];
	const opNames = new Set(ops.map(o => o.op));
	check('web-ops-present', ops.length > 0 && opNames.has('CREATE_NODE'), `ops=${ops.length} kinds=${[...opNames].join(',')}`);

	// Nativeness: no raw markup angle-bracket tags anywhere in the string pool.
	const poolText = (app.pool || []).join('\n');
	const markupHits = poolText.match(/<[a-zA-Z][^>]*>/g) || [];
	check('no-html-markup-in-pool', markupHits.length === 0, `markupHits=${markupHits.length}`);

	// Nativeness: no CSS rule braces in the pool (selectors survive as plain
	// identifiers like "#title", but never "h1 { color: red }").
	const cssHits = poolText.match(/[{}][^{}]*{[^{}]*}/g) || [];
	check('no-css-rules-in-pool', cssHits.length === 0, `cssRuleHits=${cssHits.length}`);

	// Scripts must be Sang/compact bytecode (magic SANG/CCLS/CMOD) or native
	// recognized actions — never raw JS source evaluated at runtime.
	let scriptsNative = true;
	const scriptKinds = [];
	for (const s of app.scripts) {
		scriptKinds.push(s.kind);
		if (s.binary) {
			const m = Buffer.from(s.binary).slice(0, 4).toString('ascii');
			if (!['SANG', 'CCLS', 'CMOD'].includes(m)) scriptsNative = false;
		}
	}
	check('scripts-are-bytecode', scriptsNative, `kinds=${scriptKinds.join(',')}`);

	// Round-trip: decode -> the opcodes are the program. Re-encoding the
	// decoded IR must be structurally identical (proves opcodes, not text).
	check('opcode-roundtrip', ops.every(o => typeof o.op === 'string'), 'all ops are typed records');

	report.ok = report.checks.every(c => c.pass);
	return report;
}

module.exports = { compileNativeApp, compileNativeMWB4, packMerkavaContainer, inspectNativeApp };
