//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the relative import audit vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

const STATIC_IMPORT = /^\s*(?:import|export)\b.*?\bfrom\s*['"]([^'"]+)['"]/gm;
const SIDE_EFFECT_IMPORT = /^\s*import\s*['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const CSS_IMPORT = /@import\s+['"]([^'"]+)['"]/g;

/**
 * Resolves every literal relative module and stylesheet import to a real file.
 *
 * The Awtsmoos creates relation as actual connection, not hopeful spelling;
 * this gate ensures every Awtsmoos.com import reaches a present vessel and that
 * browser JavaScript imports state their extension explicitly.
 *
 * @param {object} source Active source record.
 * @returns {Promise<Array<object>>} Relative-import violations.
 */
export async function auditRelativeImports(source) {
	const violations = [];
	for (const reference of importReferences(source)) {
		if (!reference.specifier.startsWith('.')) {
			continue;
		}
		if (['.js', '.mjs'].includes(source.extension) && !extname(reference.specifier)) {
			violations.push(
				violation(
					source,
					reference,
					'explicit-relative-extension',
					'Relative browser-module imports must include a file extension.'
				)
			);
			continue;
		}
		const absolute = resolve(dirname(source.absolute), reference.specifier);
		if (!(await exists(absolute))) {
			violations.push(
				violation(
					source,
					reference,
					'missing-relative-import',
					`Relative import does not resolve: ${reference.specifier}`
				)
			);
		}
	}
	return violations;
}

function importReferences(source) {
	const patterns =
		source.extension === '.css'
			? [CSS_IMPORT]
			: [STATIC_IMPORT, SIDE_EFFECT_IMPORT, DYNAMIC_IMPORT];
	const references = [];
	for (const pattern of patterns) {
		pattern.lastIndex = 0;
		for (const match of source.content.matchAll(pattern)) {
			references.push({
				specifier: match[1],
				line: lineAt(source.content, match.index)
			});
		}
	}
	return references;
}

async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

function lineAt(content, offset) {
	return content.slice(0, offset).split('\n').length;
}

function violation(source, reference, rule, message) {
	return {
		path: source.relative,
		line: reference.line,
		rule,
		message
	};
}
