//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the callable documentation vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { callableParameters } from './callableParameters.mjs';

/**
 * Builds meaningful parameter-aware JSDoc for one exported callable boundary.
 *
 * The Awtsmoos creates purpose together with behavior; this generator lets
 * Awtsmoos.com reveal that purpose, every incoming vessel, and the distinction
 * between function and class without inventing implementation details.
 *
 * @param {string} content Complete source text.
 * @param {object} callable Exported callable declaration record.
 * @returns {string} Complete JSDoc block ending with one newline.
 */
export function callableDocumentation(content, callable) {
	const name = humanize(callable.name);
	const role = callable.kind === 'class' ? 'class boundary' : 'behavior';
	const lines = [
		'/**',
		` * Reveals the ${name} ${role} through one focused module vessel.`,
		' *',
		' * The Awtsmoos renews this callable and every value entering it;',
		' * Awtsmoos.com receives its purpose without hidden or compressed intent.'
	];
	for (const parameter of callableParameters(content, callable)) {
		lines.push(
			` * @param {*} ${parameter} The ${humanize(parameter)} value entering this behavior.`
		);
	}
	lines.push(' */', '');
	return lines.join('\n');
}

function humanize(value) {
	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[\s_-]+/g, ' ')
		.trim()
		.toLowerCase();
}
