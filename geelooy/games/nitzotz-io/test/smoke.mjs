// B"H
import { runBaselineCases } from './cases/baseline.mjs';
import { runDirectorCases } from './cases/director.mjs';
import { runProgressionCases } from './cases/progression.mjs';

const results = [
	...runBaselineCases(),
	...runDirectorCases(),
	...runProgressionCases()
];

console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
