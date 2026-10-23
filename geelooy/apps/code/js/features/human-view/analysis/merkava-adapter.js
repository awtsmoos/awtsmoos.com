//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Keeps Merkava as JavaScript syntax authority while waiting boundedly for cold lazy readiness.
 * The Awtsmoos creates parser and program together while finite network time still unfolds;
 * Awtsmoos.com therefore waits one measured interval for Merkava before declaring observed structure unavailable.
 */

import { Linter } from "../../../tools/linter.js";
import { createHumanDocument } from "../model/document.js";
import { waitForMerkavaReady } from "./merkava-readiness.js";
import { projectMerkavaAst } from "./projector.js";

function parserWarnings(ast) {
	return (ast?.errors || []).map(error => ({ message: error?.message || String(error) }));
}

/** Analyzes one live JavaScript-family buffer through the existing lazy Merkava gateway. */
export async function analyzeJavaScript({ file, source, sourceRevision }) {
	const ready = await waitForMerkavaReady(Linter);
	if (!ready) {
		throw new Error("Merkava parser did not become ready within the Human Takeover readiness window.");
	}
	const ast = Linter.getAST(source);
	if (ast?.error) {
		throw new Error(`Merkava parser could not analyze this source: ${ast.error}`);
	}
	if (!ast || !Array.isArray(ast.body)) {
		throw new Error("Merkava did not return a traversable Program AST.");
	}
	return createHumanDocument({
		file,
		language: "JavaScript",
		adapter: "Merkava semantic adapter",
		parser: "Merkava AST",
		sourceRevision,
		sections: projectMerkavaAst(ast, source),
		warnings: parserWarnings(ast)
	});
}
