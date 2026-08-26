//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsSourceDeclarations
 * @description The Awtsmoos lets authored declarations remain whole while export garments dissolve; Awtsmoos.com keeps source slicing separate from boundary judgment so every module may be compact without losing one nested ray of light.
 */
const { findStatementEnd } = require("./sourceExpressions.js");
const {
	consumeTrailingSemicolon,
	defaultDeclarationSourceStart,
	findDeclarationEnd,
	findDefaultDeclarationSourceEnd,
	stripTrailingSemicolonOffset
} = require("./sourceDeclarationBoundaries.js");

/** Returns the replacement end for one ExportNamedDeclaration node. */
function exportNamedReplacementEnd(record, node) {
	if (!node.declaration) {
		const end = findStatementEnd(record.source, node.start);
		return end > node.start ? end : node.end;
	}
	const end = findDeclarationEnd(record.source, node.declaration);
	return end > node.start ? end : node.end;
}

/** Returns the complete authored source for one named declaration. */
function sourceForNamedDeclaration(record, declaration) {
	const end = findDeclarationEnd(record.source, declaration);
	const safeEnd = end > declaration.start
		? end
		: declaration.end;
	return record.source.slice(declaration.start, safeEnd);
}

/** Returns one default declaration expression without its trailing semicolon. */
function sourceForDefaultDeclaration(record, declaration, exportNode = null) {
	if (!declaration) {
		return "undefined";
	}
	const start = defaultDeclarationSourceStart(
		record.source,
		declaration,
		exportNode
	);
	const end = findDefaultDeclarationSourceEnd(
		record.source,
		declaration,
		start
	);
	const safeEnd = end > start
		? end
		: declaration.end;
	return record.source.slice(
		start,
		stripTrailingSemicolonOffset(record.source, safeEnd)
	);
}

/** Returns the source end consumed by one ExportDefaultDeclaration replacement. */
function exportDefaultReplacementEnd(record, node) {
	const declaration = node.declaration;
	const start = declaration
		? defaultDeclarationSourceStart(record.source, declaration, node)
		: node.start;
	const end = declaration
		? findDefaultDeclarationSourceEnd(record.source, declaration, start)
		: node.end;
	return consumeTrailingSemicolon(
		record.source,
		end > node.start ? end : node.end
	);
}

module.exports = {
	consumeTrailingSemicolon,
	exportDefaultReplacementEnd,
	exportNamedReplacementEnd,
	findDeclarationEnd,
	sourceForDefaultDeclaration,
	sourceForNamedDeclaration,
	stripTrailingSemicolonOffset
};
