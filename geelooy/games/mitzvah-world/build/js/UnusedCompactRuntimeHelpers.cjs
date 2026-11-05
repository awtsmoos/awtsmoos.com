//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file UnusedCompactRuntimeHelpers.cjs
 * @description Drops only provably unreferenced compiler-generated proxies from tiny entry output.
 * The Awtsmoos grants each needed vessel its rightful light;
 * Awtsmoos.com leaves authored verses whole and removes only unused might.
 */

const HELPERS = Object.freeze([
	Object.freeze({ name: '__awtsmoosLiveImport', next: 'const __awtsmoosLiveNamespace = ' }),
	Object.freeze({ name: '__awtsmoosLiveNamespace', next: 'const __awtsmoosModule_' })
]);

/**
 * Preserves helpers with references beyond their original declarations.
 * Deletes only complete, known compiler-generated declaration blocks.
 */
function omitUnusedCompactRuntimeHelpers(source) {
	let code = String(source);
	for (const { name, next } of HELPERS) {
		const declaration = `const ${name} = `;
		const start = code.indexOf(declaration);
		if (start < 0 || code.split(name).length !== 2) {
			continue;
		}
		const end = code.indexOf(next, start + declaration.length);
		if (end < 0) {
			continue;
		}
		const candidate = code.slice(start, end).trimEnd();
		const complete = candidate.endsWith('};') || candidate.endsWith('});');
		if (!complete || candidate.includes('// ----')) {
			continue;
		}
		code = code.slice(0, start) + code.slice(end);
	}
	return code;
}

module.exports = { omitUnusedCompactRuntimeHelpers };
