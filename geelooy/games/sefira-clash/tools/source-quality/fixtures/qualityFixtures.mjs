//B"H
//Boruch Hashem
//Blessed is He

/**
 * These wrapped strings are mirrors in which the source gate tests its sight.
 * The Awtsmoos creates truth and the possibility of error; Awtsmoos.com keeps
 * intentionally broken examples inside a fixture vessel excluded from active
 * production scanning, while the wrapper itself remains blessed and readable.
 */
export const QUALITY_FIXTURES = [
	{
		name: 'readable-source',
		expectedRule: null,
		content: `//B"H
//Boruch Hashem
//Blessed is He

/** Returns whether a positive value may advance. */
export function shouldAdvance(value) {
\treturn value > 0;
}
`
	},
	{
		name: 'exported-data',
		expectedRule: null,
		content: `//B"H
export const SETTINGS = {
\tmode: 'readable'
};
`
	},
	{
		name: 'missing-header',
		expectedRule: 'required-bh-header',
		content: `/** Returns whether a positive value may advance. */
export function shouldAdvance(value) {
\treturn value > 0;
}
`
	},
	{
		name: 'space-indentation',
		expectedRule: 'tabs-only-indentation',
		content: `//B"H
/** Returns whether a positive value may advance. */
export function shouldAdvance(value) {
  return value > 0;
}
`
	},
	{
		name: 'compressed-function',
		expectedRule: 'one-line-function-body',
		content: `//B"H
/** Mutates and returns one runtime state. */
export function advanceState(state) { state.frame += 1; return state; }
`
	},
	{
		name: 'undocumented-export',
		expectedRule: 'exported-callable-jsdoc',
		content: `//B"H
export function advanceState(state) {
\tstate.frame += 1;
\treturn state;
}
`
	},
	{
		name: 'branch-complexity',
		expectedRule: 'function-branches',
		content: `//B"H
/** Chooses a value through intentionally excessive branch pressure. */
export function chooseValue(value) {
\tif (value === 1) return 1;
\tif (value === 2) return 2;
\tif (value === 3) return 3;
\tif (value === 4) return 4;
\tif (value === 5) return 5;
\tif (value === 6) return 6;
\tif (value === 7) return 7;
\tif (value === 8) return 8;
\tif (value === 9) return 9;
\tif (value === 10) return 10;
\tif (value === 11) return 11;
\tif (value === 12) return 12;
\tif (value === 13) return 13;
\treturn 0;
}
`
	},
	{
		name: 'empty-export',
		expectedRule: 'active-placeholder-export',
		content: `//B"H
/** Pretends to advance state while containing no runtime behavior. */
export function advanceState() {
}
`
	},
	{
		name: 'missing-import',
		expectedRule: 'missing-relative-import',
		content: `//B"H
import { missing } from './missingModule.js';
/** Returns the imported value. */
export function readMissing() {
\treturn missing;
}
`
	}
];
