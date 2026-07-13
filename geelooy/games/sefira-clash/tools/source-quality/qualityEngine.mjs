//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the quality engine vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { auditComplexity } from './complexityAudit.mjs';
import { auditCompressedBodies } from './compressedBodyAudit.mjs';
import { auditExportDocumentation } from './exportDocumentationAudit.mjs';
import { auditHeader } from './headerAudit.mjs';
import { auditIndentation } from './indentationAudit.mjs';
import { auditPlaceholders } from './placeholderAudit.mjs';
import { auditRelativeImports } from './relativeImportAudit.mjs';

/**
 * Applies every source-quality law to one complete active file.
 *
 * The Awtsmoos creates many dimensions of truth at once—origin, order, clarity,
 * purpose, connection, and bounded complexity. This engine lets Awtsmoos.com
 * inspect those dimensions through focused rules without collapsing them into
 * one unmaintainable audit monolith.
 *
 * @param {object} source Active or virtual source record.
 * @returns {Promise<Array<object>>} All violations found in the source.
 */
export async function auditSourceQuality(source) {
	const violations = [
		...auditHeader(source),
		...auditIndentation(source),
		...auditCompressedBodies(source),
		...auditExportDocumentation(source),
		...auditComplexity(source),
		...auditPlaceholders(source),
		...(await auditRelativeImports(source))
	];
	return violations;
}

/**
 * Audits a complete active-source catalog in deterministic catalog order.
 *
 * @param {Array<object>} sources Complete active-source records.
 * @returns {Promise<Array<object>>} Combined quality violations.
 */
export async function auditSourceCatalog(sources) {
	const violations = [];
	for (const source of sources) {
		violations.push(...(await auditSourceQuality(source)));
	}
	return violations;
}
