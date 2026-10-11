// B"H
// Boruch Hashem
// Blessed be He

/**
 * Native Merkava app runner.
 *
 * Executes a compiled .mapp binary DIRECTLY on the Merkava VM:
 *  1. MAPP container is decoded (binary parse, no text parsing).
 *  2. MWEB opcodes (CREATE_NODE/SET_STYLE_BLOCK/BIND_EVENT/...) build the
 *     in-memory DOM — the HTML was already compiled away at build time.
 *  3. Scripts run as Sang VM bytecode via the Merkava VM (runSang).
 *
 * There is no browser, no WebView, no HTML parser, no CSS parser at runtime.
 * This is the same execution path the native C launchers (APK/ELF/EXE/APP)
 * drive through the C bytecode decoder.
 */

const { runUnifiedApp } = require('./UnifiedAppBinary.js');

/**
 * Runs a native app binary on the Merkava VM.
 * @param {Buffer|Uint8Array} binary Compiled .mapp bytes from compileNativeApp.
 * @param {object} options Runner options (globals, document override).
 * @returns {object} { ok, document, trigger(id,event), scripts, startupMs }
 */
function runNativeApp(binary, options = {}) {
	const started = Date.now();
	const result = runUnifiedApp(Buffer.from(binary), options);
	return {
		ok: result.ok,
		document: result.web.document,
		trigger: result.trigger,
		scripts: result.scripts,
		startupMs: Date.now() - started
	};
}

/**
 * Collects visible text of a native document (depth-first).
 * @param {object} document Document stub from runNativeApp.
 * @returns {string[]} Visible text strings.
 */
function visibleText(document) {
	const out = [];
	const walk = (node) => {
		if (!node) return;
		if (node.textContent && (!node.children || node.children.length === 0)) {
			const t = String(node.textContent).trim();
			if (t) out.push(t);
		} else if (node.textContent && node.children && node.children.length) {
			// Element with both direct text and children: record direct text.
			const t = String(node.textContent).trim();
			if (t) out.push(t);
		}
		for (const child of node.children || []) walk(child);
	};
	walk(document.body);
	return out;
}

/**
 * Finds an element by id in a native document.
 */
function getById(document, id) {
	return document.getElementById(id);
}

module.exports = { runNativeApp, visibleText, getById };
