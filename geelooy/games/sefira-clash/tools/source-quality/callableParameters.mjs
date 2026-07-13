//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the callable parameters vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Extracts stable documentation names from one exported callable declaration.
 *
 * The Awtsmoos creates each incoming value as a distinct vessel; Awtsmoos.com
 * names those vessels in JSDoc without pretending that destructured syntax is a
 * simple identifier.
 *
 * @param {string} content Complete source text.
 * @param {object} callable Exported callable declaration record.
 * @returns {Array<string>} Stable parameter names for generated documentation.
 */
export function callableParameters(content, callable) {
	if (callable.kind === 'class') {
		return [];
	}
	const declaration = content.slice(callable.start, declarationEnd(content, callable.start));
	const arrow = declaration.indexOf('=>');
	const opening = declaration.indexOf('(');
	if (opening >= 0 && (arrow < 0 || opening < arrow)) {
		const closing = matchingDelimiter(declaration, opening, '(', ')');
		return parameterNames(declaration.slice(opening + 1, closing));
	}
	if (arrow >= 0) {
		const prefix = declaration.slice(0, arrow);
		const raw = prefix
			.slice(prefix.lastIndexOf('=') + 1)
			.replace(/\basync\b/, '')
			.trim();
		return raw ? [stableParameterName(raw, 0)] : [];
	}
	return [];
}

function declarationEnd(content, start) {
	const brace = content.indexOf('{', start);
	const arrow = content.indexOf('=>', start);
	const semicolon = content.indexOf(';', start);
	const candidates = [brace, arrow, semicolon].filter(index => index >= 0);
	return candidates.length ? Math.min(...candidates) + 2 : content.length;
}

function parameterNames(rawParameters) {
	return splitTopLevel(rawParameters)
		.map((parameter, index) => stableParameterName(parameter, index))
		.filter(Boolean);
}

function splitTopLevel(value) {
	const parts = [];
	let start = 0;
	let depth = 0;
	for (let index = 0; index < value.length; index += 1) {
		const character = value[index];
		if ('([{'.includes(character)) {
			depth += 1;
		}
		if (')]}'.includes(character)) {
			depth -= 1;
		}
		if (character === ',' && depth === 0) {
			parts.push(value.slice(start, index));
			start = index + 1;
		}
	}
	parts.push(value.slice(start));
	return parts;
}

function stableParameterName(parameter, index) {
	const withoutDefault = parameter
		.split('=')[0]
		.trim()
		.replace(/^\.\.\./, '');
	if (/^[A-Za-z_$][\w$]*$/.test(withoutDefault)) {
		return withoutDefault;
	}
	return withoutDefault ? `parameter${index + 1}` : '';
}

function matchingDelimiter(source, opening, open, close) {
	let depth = 0;
	for (let index = opening; index < source.length; index += 1) {
		if (source[index] === open) {
			depth += 1;
		}
		if (source[index] === close) {
			depth -= 1;
			if (depth === 0) {
				return index;
			}
		}
	}
	return source.length;
}
