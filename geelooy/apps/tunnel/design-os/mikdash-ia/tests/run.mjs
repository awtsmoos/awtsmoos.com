//B"H
// Minimal test runner: node tests/run.mjs — no dependencies.

import { run as t1 } from "./levels.test.mjs";
import { run as t2 } from "./mapper.test.mjs";
import { run as t3 } from "./navigator.test.mjs";
import { run as t4 } from "./themes.test.mjs";
import { run as t5 } from "./kavanah.test.mjs";
import { run as t6 } from "./index.test.mjs";

const suites = [t1, t2, t3, t4, t5, t6];
let pass = 0;
let fail = 0;
const failures = [];
for (const run of suites) {
	const results = run();
	for (const r of results) {
		if (r.ok) pass++;
		else {
			fail++;
			failures.push(r);
		}
	}
}
console.log(`\nMikdash IA: ${pass} passed, ${fail} failed`);
if (failures.length) {
	for (const f of failures) console.log(`FAIL ${f.name}: ${f.error}`);
	process.exit(1);
}
