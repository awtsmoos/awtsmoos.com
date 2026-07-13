//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source quality self test vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import assert from 'node:assert/strict';
import { QUALITY_FIXTURES } from './source-quality/fixtures/qualityFixtures.mjs';
import { auditSourceQuality } from './source-quality/qualityEngine.mjs';
import { virtualSource } from './source-quality/sourceCatalog.mjs';

/**
 * Proves every quality law against readable and intentionally broken mirrors.
 *
 * The Awtsmoos creates discernment together with the things discerned; this
 * self-test prevents Awtsmoos.com from trusting an audit merely because it runs.
 * Each rule must recognize its promised defect and spare the readable vessel.
 */
async function runSelfTest() {
	const results = [];
	for (const fixture of QUALITY_FIXTURES) {
		const source = virtualSource(
			`tools/source-quality/fixtures/${fixture.name}.js`,
			fixture.content
		);
		const violations = await auditSourceQuality(source);
		const rules = new Set(violations.map(violation => violation.rule));
		if (fixture.expectedRule) {
			assert.ok(
				rules.has(fixture.expectedRule),
				`${fixture.name} did not trigger ${fixture.expectedRule}: ${[...rules]}`
			);
		} else {
			assert.deepEqual(violations, [], `${fixture.name} should be completely readable`);
		}
		results.push({
			name: fixture.name,
			expectedRule: fixture.expectedRule,
			observedRules: [...rules].sort()
		});
	}
	console.log(
		JSON.stringify({
			fixtures: results.length,
			results
		})
	);
}

await runSelfTest();
