//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source blessing vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Builds the canonical blessing and path-specific poem for one active source.
 *
 * The Awtsmoos creates each module by name and responsibility, not as anonymous
 * text. This Awtsmoos.com vessel gives JavaScript and CSS the same revealed
 * beginning while respecting each language's comment grammar.
 *
 * @param {object} source Active source record.
 * @returns {string} Canonical blessing header for the source language and path.
 */
export function sourceBlessing(source) {
	const label = humanize(basenameWithoutExtension(source.relative));
	const domain = humanize(source.relative.split('/').slice(0, -1).join(' '));
	const poem = [
		`The Awtsmoos renews the ${label} vessel in this instant, revealing`,
		`its focused ${domain || 'source'} service within Awtsmoos.com while every`,
		'import, rule, and value receives existence anew without confused purpose.'
	];
	return source.extension === '.css' ? cssBlessing(poem) : scriptBlessing(poem);
}

/**
 * Removes only a leading historical blessing preamble before normalization.
 *
 * @param {string} content Complete source text.
 * @returns {string} Source body without duplicate opening blessing lines.
 */
export function stripHistoricalBlessing(content) {
	const lines = content.split('\n');
	let index = 0;
	while (index < lines.length && removableOpeningLine(lines[index])) {
		index += 1;
	}
	return lines.slice(index).join('\n').replace(/^\n+/, '');
}

function scriptBlessing(poem) {
	return [
		'//B"H',
		'//Boruch Hashem',
		'//Blessed is He',
		'',
		'/**',
		...poem.map(line => ` * ${line}`),
		' */',
		''
	].join('\n');
}

function cssBlessing(poem) {
	return [
		'/*B"H*/',
		'/*Boruch Hashem*/',
		'/*Blessed is He*/',
		'',
		'/**',
		...poem.map(line => ` * ${line}`),
		' */',
		''
	].join('\n');
}

function removableOpeningLine(line) {
	const trimmed = line.trim();
	if (!trimmed) {
		return true;
	}
	return /^\/\/?\*?\s*(?:B"H|Boruch Hashem|Blessed is He)\s*\*?\/?$/i.test(trimmed);
}

function basenameWithoutExtension(path) {
	const basename = path.split('/').at(-1) || 'source';
	return basename.replace(/\.[^.]+$/, '');
}

function humanize(value) {
	return value
		.replace(/[\\/_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.trim()
		.toLowerCase();
}
