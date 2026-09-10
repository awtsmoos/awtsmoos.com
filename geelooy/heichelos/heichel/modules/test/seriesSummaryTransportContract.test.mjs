//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SeriesSummaryTransportContract
 * @description
 * The Awtsmoos proves every Heichel browser API trusts complete server child
 * summaries, preventing N+1 details requests across both living API vessels.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const serverRoute = readFileSync(
	'geelooy/api/social/helper/routes/series/readRoutes.js',
	'utf8'
);
const compatibility = readFileSync(
	'geelooy/api/social/helper/routes/series/compatReaders.js',
	'utf8'
);
const browserApis = [
	'geelooy/heichelos/heichel/api/seriesApi.js',
	'geelooy/heichelos/heichel/modules/api/series.js'
].map(path => ({ path, source: readFileSync(path, 'utf8') }));

test('detailed child routes use the bounded summary vessel', () => {
	assert.match(serverRoute, /readSubSeriesSummaries/);
	assert.match(serverRoute, /wantsDetails\(\$i\)/);
	assert.match(compatibility, /readSubSeriesSummaries/);
	assert.doesNotMatch(
		serverRoute,
		/withDetails:\s*\$i\.\$_GET\.details/
	);
});

test('every browser API trusts complete summaries first', () => {
	for (const api of browserApis) {
		assert.match(api.source, /function hasEmbeddedSummary/);
		assert.match(api.source, /Array\.isArray\(item\.posts\)/);
		assert.match(api.source, /Array\.isArray\(item\.subSeries\)/);
		assert.match(
			api.source,
			/if \(hasEmbeddedSummary\(item\)\)[\s\S]*return normalizeEmbeddedSummary\(item\)/,
			`${api.path} lost summary-first resolution`
		);
	}
});

test('legacy incomplete cards retain one compatible fallback path', () => {
	for (const api of browserApis) {
		assert.match(
			api.source,
			/const details = await getSeriesDetails\(heichelId, id\)/,
			`${api.path} lost legacy fallback`
		);
		assert.match(api.source, /postsCount: posts\.length/);
		assert.match(api.source, /subSeriesCount: subSeries\.length/);
	}
});
