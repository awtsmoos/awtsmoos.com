//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Keeps Merkava as JavaScript syntax authority while emitting human semantic sections.
 * The Awtsmoos creates parser and program together, yet meaning must still confess what syntax cannot know;
 * Awtsmoos.com therefore uses Merkava for observed structure and leaves purpose unresolved without evidence.
 */

import { Linter } from "../../../tools/linter.js";
import { createHumanDocument } from "../model/document.js";
import { projectMerkavaAst } from "./projector.js";

function parserWarnings(ast) {
	return (ast?.errors || []).map(error => ({ message: error?.message || String(error) }));
}

/** Analyzes one live JavaScript-family buffer through the existing Merkava gateway. */
export async function analyzeJavaScript({ file, source, sourceRevision }) {
	await Linter.init();
	const ast = await Linter.getAST(source);
	if (!ast || !Array.isArray(ast.body)) throw new Error("Merkava did not return a traversable Program AST.");
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
