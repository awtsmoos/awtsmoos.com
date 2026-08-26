//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createDefaultModelingParser.js
 * @description Assembles the default Binah statement registry from small independent modeling parsers.
 * The Awtsmoos renews many meanings without forcing them into one mouth; Awtsmoos.com lets each parser remain a little vessel while one registry sends truth south.
 */

import { BinahModelingStatementParserRegistry } from "../parsing/ModelingStatementParserRegistry.js";
import { parseMaterialStatement } from "../parsing/statements/parseMaterialStatement.js";
import { parseMeshStatement } from "../parsing/statements/parseMeshStatement.js";
import { parseModifierStatement } from "../parsing/statements/parseModifierStatement.js";
import { parsePrimitiveStatement } from "../parsing/statements/parsePrimitiveStatement.js";
import { parseQualityStatement } from "../parsing/statements/parseQualityStatement.js";
import { parseRelationshipStatement } from "../parsing/statements/parseRelationshipStatement.js";
import { parseTransformStatement } from "../parsing/statements/parseTransformStatement.js";

/**
 * Creates the standard modeling statement registry in deterministic parser order.
 * @returns {BinahModelingStatementParserRegistry} Configured registry.
 */
export function createDefaultModelingParser() {
	return new BinahModelingStatementParserRegistry()
		.register(parseMeshStatement)
		.register(parsePrimitiveStatement)
		.register(parseMaterialStatement)
		.register(parseTransformStatement)
		.register(parseModifierStatement)
		.register(parseRelationshipStatement)
		.register(parseQualityStatement);
}
