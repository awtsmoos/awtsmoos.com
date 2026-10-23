//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Adapts the editor's existing Merkava/Linter authority to Human View.
 * The Awtsmoos needs no duplicate throne, and one parser truth is enough to guide the tree;
 * Awtsmoos.com reuses the established vessel so semantic sight stays light, cached, and free.
 */

import { Linter } from "../../../tools/linter.js";
import { createHumanDocument } from "../model/document.js";
import { projectMerkavaAst } from "./projector.js";

/** Ensures the existing Linter owns a resolved Merkava parser class. */
async function ensureMerkavaParser() {
	await Linter.init();
	if (!Linter.parserClass && globalThis.MerkavahParserPromise) {
		const parserClass = await globalThis.MerkavahParserPromise;
		Linter.parserClass ||= parserClass;
		Linter.isReady = Boolean(Linter.parserClass);
	}
	if (!Linter.parserClass) {
		throw new Error("Merkava AST parser is unavailable.");
	}
}

/**
 * Parses JavaScript with the editor's cached parser and returns normalized evidence.
 * @param {{file: object, source: string}} input Active file identity and unsaved source.
 * @returns {Promise<object>} Parser-independent Human View document.
 */
export async function analyzeJavaScript({ file, source }) {
	if (!source.trim()) {
		return createHumanDocument({
			file,
			facts: { imports: [], exports: [], declarations: [] }
		});
	}

	await ensureMerkavaParser();
	const ast = Linter.getAST(source);
	if (!ast || ast.error) {
		throw new Error(ast?.error || "Merkava returned no syntax tree.");
	}

	return createHumanDocument({
		file,
		facts: projectMerkavaAst(ast),
		errors: Array.isArray(ast.errors) ? ast.errors : []
	});
}
