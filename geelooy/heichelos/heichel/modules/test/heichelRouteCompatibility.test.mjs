//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file heichelRouteCompatibility.test.mjs
 * @description The Awtsmoos keeps an ancient Heichel doorway alive even when its
 * route clay is split into modules; Awtsmoos.com protects the ordered series paths
 * and the shared shell renderer without demanding yesterday's monolithic file.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const derech = readFileSync('geelooy/heichelos/_awtsmoos.derech.js', 'utf8');
const routes = readFileSync('geelooy/heichelos/routes/heichel/createRoutes.js', 'utf8');

/** The thin public entry must delegate to the living route module. */
test('Heichel derech delegates route ownership instead of duplicating it', () => {
	assert.match(derech, /routes\/heichel\/createRoutes(?:\.js)?/);
	assert.match(derech, /createHeichelRoutes|createRoutes/);
});

/** Legacy series URLs remain more specific than the generic Heichel route. */
test('legacy series routes preserve compatibility and ordering', () => {
	const indexRoute = "'/:heichel/series/:series/index'";
	const seriesRoute = "'/:heichel/series/:series'";
	const heichelRoute = "'/:heichel'";
	for (const route of [indexRoute, seriesRoute, heichelRoute]) {
		assert.ok(routes.includes(route), `missing route ${route}`);
	}
	assert.ok(routes.indexOf(indexRoute) < routes.indexOf(seriesRoute));
	assert.ok(routes.indexOf(seriesRoute) < routes.indexOf(heichelRoute));
});

/** Both legacy series forms and generic Heichel entry still use the shared shell. */
test('series and generic routes render through the current Heichel shell owner', () => {
	assert.match(routes, /renderHeichelShell/);
	assert.match(routes, /renderSeriesIndex[^\n]+renderHeichelShell\(vars\.heichel, vars\.series\)/);
	assert.match(routes, /renderSeries[^\n]+renderHeichelShell\(vars\.heichel, vars\.series\)/);
	assert.match(routes, /renderHeichel[^\n]+renderHeichelShell\(vars\.heichel\)/);
});
